// @ts-nocheck
import { getUniqueID } from './utils';
import { DEFAULT_CORE_URL, ERRORS, WORKER_MESSAGE_TYPES } from './constants';

import FFmpegWorker from './ffmpeg.worker.ts';

export class FFmpeg {
    #worker: Worker = new FFmpegWorker();
    #resolves: Callbacks = {};
    #rejects: Callbacks = {};
    #logEventCallbacks = [];
    #progressEventCallbacks = [];

    public loaded = false;

    constructor() {
        this.#registerHandlers();
    }

    async load(options?: {
        coreURL?: string
        wasmURL?: string
    } = {}) {
        if (!options.coreURL) {
            // TODO: Log service
            console.warn('FFmpeg: No coreURL provided, using default');
        }

        const {
            coreURL = DEFAULT_CORE_URL,
            wasmURL,
        } = options;

        let response;

        try {

            this.#registerHandlers();
            response = await this.#send({ type: WORKER_MESSAGE_TYPES.LOAD, data: { coreURL, wasmURL } });
            this.loaded = true;
        } catch (error) {
            response = false;

            // TODO: Log service
            console.error('FFmpeg: Error loading worker', error);
        } finally {
            return response;
        }

    }

    #registerHandlers = () => {
        if (this.#worker) {
            this.#worker.onmessage = (w, ev) => {
                const { id, type, data } = w.data;

                switch (type) {
                    case WORKER_MESSAGE_TYPES.LOAD:
                        this.loaded = true;
                        this.#resolves[id](data);
                        break;
                    case WORKER_MESSAGE_TYPES.EXEC:
                    case WORKER_MESSAGE_TYPES.CREATE_DIR:
                    case WORKER_MESSAGE_TYPES.WRITE_FILE:
                    case WORKER_MESSAGE_TYPES.READ_FILE:
                    case WORKER_MESSAGE_TYPES.DELETE_FILE:
                    case WORKER_MESSAGE_TYPES.LIST_DIR:
                    case WORKER_MESSAGE_TYPES.FILE_EXISTS:
                        this.#resolves[id](data);
                        break;
                    case WORKER_MESSAGE_TYPES.ERROR:
                        this.#rejects[id](data);
                        break;
                    // todo: add log handling
                    case WORKER_MESSAGE_TYPES.LOG:
                        this.#logEventCallbacks.forEach(callback => callback(data));
                        break;
                    // todo: add progress handling
                    case WORKER_MESSAGE_TYPES.PROGRESS:
                        this.#progressEventCallbacks.forEach(callback => callback(data));
                        break;
                    default:
                        throw ERRORS.UNKNOWN_MESSAGE_TYPE, type;
                        break;
                }

                delete this.#resolves[id];
                delete this.#rejects[id];
            };
        }
    }

    #send = (
        { type, data }: Message,
        transfer?: ArrayBuffer[]
    ) => {
        if (this.#worker) {
            const id = getUniqueID();
            return new Promise((resolve, reject) => {
                this.#worker && this.#worker.postMessage({ id, type, data }, transfer);
                this.#resolves[id] = resolve;
                this.#rejects[id] = reject;
            });
        } else {
            throw new Error('ERRORS.WORKER_NOT_INITIALIZED');
        }
    }

    /**
   * Listen to log or prgress events from `ffmpeg.exec()`.
   *
   * @example
   * ```ts
   * ffmpeg.on("log", ({ type, message }) => {
   *   // ...
   * })
   * ```
   *
   * @example
   * ```ts
   * ffmpeg.on("progress", ({ progress, time }) => {
   *   // ...
   * })
   * ```
   *
   * @remarks
   * - log includes output to stdout and stderr.
   * - The progress events are accurate only when the length of
   * input and output video/audio file are the same.
   *
   * @category FFmpeg
   */
    public on(event: "log", callback: LogEventCallback): void;
    public on(event: "progress", callback: ProgressEventCallback): void;
    public on(
        event: "log" | "progress",
        callback: LogEventCallback | ProgressEventCallback
    ) {
        if (event === "log") {
            this.#logEventCallbacks.push(callback as LogEventCallback);
        } else if (event === "progress") {
            this.#progressEventCallbacks.push(callback as ProgressEventCallback);
        }
    }

    /**
     * Unlisten to log or prgress events from `ffmpeg.exec()`.
     *
     * @category FFmpeg
     */
    public off(event: "log", callback: LogEventCallback): void;
    public off(event: "progress", callback: ProgressEventCallback): void;
    public off(
        event: "log" | "progress",
        callback: LogEventCallback | ProgressEventCallback
    ) {
        if (event === "log") {
            this.#logEventCallbacks = this.#logEventCallbacks.filter(
                (f) => f !== callback
            );
        } else if (event === "progress") {
            this.#progressEventCallbacks = this.#progressEventCallbacks.filter(
                (f) => f !== callback
            );
        }
    }

    async exec(args) {
        const response = await this.#send({ type: WORKER_MESSAGE_TYPES.EXEC, data: args });
        return response;
    }

    async createDir(path) {
        return this.#send({ type: WORKER_MESSAGE_TYPES.CREATE_DIR, data: path });
    }

    async writeFile(path, data) {
        const transfer = [data.buffer];
        return this.#send({ type: WORKER_MESSAGE_TYPES.WRITE_FILE, data: { path, data } }, transfer);
    }

    async readFile(path) {
        return this.#send({ type: WORKER_MESSAGE_TYPES.READ_FILE, data: path });
    }

    async deleteFile(path) {
        return this.#send({ type: WORKER_MESSAGE_TYPES.DELETE_FILE, data: path });
    }


    async listFiles(path) {
        return this.#send({ type: WORKER_MESSAGE_TYPES.LIST_DIR, data: path });
    }

    async fileExists(path) {
        return this.#send({ type: WORKER_MESSAGE_TYPES.FILE_EXISTS, data: path });
    }

    /**
     * Terminates the worker and clears all pending promises
     * @returns void
     */
    public terminate = (): void => {
        const ids = Object.keys(this.#rejects);

        for (const id of ids) {
            this.#rejects[id](ERROR_TERMINATED);
            delete this.#rejects[id];
            delete this.#resolves[id];
        }

        if (this.#worker) {
            this.#worker.terminate();
            this.#worker = null;
            this.loaded = false;
        }
    };
}
