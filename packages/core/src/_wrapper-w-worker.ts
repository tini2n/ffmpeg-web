// @ts-nocheck

import { getUniqueID } from './utils'
import Worker from 'worker-loader!./worker.js';

import {
    ERRORS,
    FF_MESSAGE_TYPES
} from './constants';

import { CallbackData, Callbacks, FFMessageEventCallback, FFMessageLoadConfig, FFMessageOptions, FileData, FSNode, IsFirst, LogEvent, LogEventCallback, Message, OK, ProgressEventCallback } from './types';

export class FFmpeg {
    #worker: Worker | null = null;
    #resolves: Callbacks = {};
    #rejects: Callbacks = {};

    #logEventCallbacks: LogEventCallback[] = [];
    #progressEventCallbacks: ProgressEventCallback[] = [];

    public loaded = false;

    #registerHandlers = () => {
        if (this.#worker) {
            this.#worker.onmessage = ({ data: { id, type, data } }: FFMessageEventCallback) => {
                switch (type) {
                    case FF_MESSAGE_TYPES.LOAD:
                        this.loaded = true;
                        this.#resolves[id](data);
                        break;
                    case FF_MESSAGE_TYPES.MOUNT:
                    case FF_MESSAGE_TYPES.UNMOUNT:
                    case FF_MESSAGE_TYPES.EXEC:
                    case FF_MESSAGE_TYPES.WRITE_FILE:
                    case FF_MESSAGE_TYPES.READ_FILE:
                    case FF_MESSAGE_TYPES.DELETE_FILE:
                    case FF_MESSAGE_TYPES.RENAME:
                    case FF_MESSAGE_TYPES.CREATE_DIR:
                    case FF_MESSAGE_TYPES.LIST_DIR:
                    case FF_MESSAGE_TYPES.DELETE_DIR:
                        this.#resolves[id](data);
                        break;
                    case FF_MESSAGE_TYPES.LOG:
                        this.#logEventCallbacks.forEach((f) => f(data as LogEvent));
                        break;
                    case FF_MESSAGE_TYPES.PROGRESS:
                        this.#progressEventCallbacks.forEach((f) => f(data as ProgressEvent));
                        break;
                    case FF_MESSAGE_TYPES.ERROR:
                        this.#rejects[id](data);
                        break;
                }
                delete this.#resolves[id];
                delete this.#rejects[id];
            };
        }
    };

    #send = (
        { type, data }: Message,
        trans: Transferable[] = [],
        // @ts-ignore
        { signal }: FFMessageOptions = {}
    ): Promise<CallbackData> => {
        if (!this.#worker) {
            return Promise.reject(ERRORS.NOT_LOADED);
        }

        return new Promise((resolve, reject) => {
            const id = getUniqueID();
            this.#worker && this.#worker.postMessage({ id, type, data }, trans);
            this.#resolves[id] = resolve;
            this.#rejects[id] = reject;

            // signal?.addEventListener(
            //     "abort",
            //     () => {
            //         reject(new DOMException(`Message # ${id} was aborted`, "AbortError"));
            //     },
            //     { once: true }
            // );
        });
    };

    public load = (
        { classWorkerURL, ...config }: FFMessageLoadConfig = {},
        { signal }: FFMessageOptions = {}
    ): Promise<IsFirst> => {
        if (!this.#worker) {
            //window.location.origin
            // this.#worker = new Worker(new URL("./dist/esm/worker.js", import.meta.url), { type: "module" });
            // this.#worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
            this.#worker = Worker();
            this.#registerHandlers();
            console.log('worker created', this.#worker, { Worker });
        }
        return this.#send(
            {
                type: FF_MESSAGE_TYPES.LOAD,
                data: config,
            },
            undefined,
            { signal }
        ) as Promise<IsFirst>;
    };

    public exec = (
        args: string[],
        timeout = -1,
        { signal }: FFMessageOptions = {}
    ): Promise<number> =>
        this.#send(
            {
                type: FF_MESSAGE_TYPES.EXEC,
                data: { args, timeout },
            },
            undefined,
            { signal }
        ) as Promise<number>;

    public writeFile = (
        path: string,
        data: FileData,
        { signal }: FFMessageOptions = {}
    ): Promise<OK> => {
        const trans: Transferable[] = [];
        if (data instanceof Uint8Array) {
            trans.push(data.buffer);
        }
        return this.#send(
            {
                type: FF_MESSAGE_TYPES.WRITE_FILE,
                data: { path, data },
            },
            trans,
            { signal }
        ) as Promise<OK>;
    };

    // writeFile(path, data) {
    //     this.module.FS.writeFile(path, data);
    // }

    public createDir = (
        path: string,
        { signal }: FFMessageOptions = {}
    ): Promise<OK> =>
        this.#send(
            {
                type: FF_MESSAGE_TYPES.CREATE_DIR,
                data: { path },
            },
            undefined,
            { signal }
        ) as Promise<OK>;

    // createDir(path) {
    //     this.module.FS.mkdir(path);
    // }

    public deleteDir = (
        path: string,
        { signal }: FFMessageOptions = {}
    ): Promise<OK> =>
        this.#send(
            {
                type: FF_MESSAGE_TYPES.DELETE_DIR,
                data: { path },
            },
            undefined,
            { signal }
        ) as Promise<OK>;

    // deleteDir(path) {
    //     this.module.FS.rmdir(path);
    // }


    public deleteFile = (
        path: string,
        { signal }: FFMessageOptions = {}
    ): Promise<OK> =>
        this.#send(
            {
                type: FF_MESSAGE_TYPES.DELETE_FILE,
                data: { path },
            },
            undefined,
            { signal }
        ) as Promise<OK>;

    // deleteFile(path) {
    //     this.module.FS.unlink(path);
    // }

    public readDir = (
        path: string,
        { signal }: FFMessageOptions = {}
    ): Promise<FSNode[]> =>
        this.#send(
            {
                type: FF_MESSAGE_TYPES.LIST_DIR,
                data: { path },
            },
            undefined,
            { signal }
        ) as Promise<FSNode[]>;

    // listFiles(path) {
    //     return this.module.FS.readdir(path);
    // }

    public fileExists = (
        path: string,
        { signal }: FFMessageOptions = {}
    ): Promise<FSNode[]> =>
        this.#send(
            {
                type: FF_MESSAGE_TYPES.LIST_DIR,
                data: { path },
            },
            undefined,
            { signal }
        ) as Promise<FSNode[]>;

    // fileExists(path) {
    //     try {
    //         this.module.FS.lookupPath(path);
    //         return true;
    //     } catch (e) {
    //         return false;
    //     }
    // }
}




