// @ts-nocheck
console.log('worker.ts');

import { ERRORS, FF_MESSAGE_TYPES } from "./constants";
import { fetchFile, importScript } from './utils'
import type {
    FFCallMain,
    ExitCode,
    FFMessageExecData,
    FFMessageLoadConfig,
    FFmpegCoreModule,
    IsFirst,
    OK,
    FFWriteFile,
    FFReadFile,
    FFDeleteFile,
    FFRename,
    FFCreateDir,
    FFListDir,
    FFMount,
    FFUnMount,
    CallbackData
} from "./types";

let ffmpeg: FFmpegCoreModule;

const load = async ({
    // coreURL = '../../../wasm/dist/ffmpeg.js',
    // coreURL = 'http://127.0.0.1:8080/ffmpeg.js',
    coreURL = './ffmpeg.js',
    // coreURL = './dist/umd/ffmpeg.js',
    // coreURL = '../wasm/ffmpeg.js',
    wasmURL,
    workerURL,
    // @ts-ignore
}: FFMessageLoadConfig): Promise<IsFirst> => {
    // const first = !ffmpeg;
    console.log('load from worker');

    try {
        // await importScript(coreURL);
        importScripts(coreURL);
        console.log('scripts imported:', { self });

        // // @ts-ignore
        // (self as WorkerGlobalScope).createFFmpegCore = (
        //     // @ts-ignore
        //     (await import(fullPath)) as ImportedFFmpegCoreModuleFactory
        // ).default;

        // @ts-ignore
        ffmpeg = await (self as WorkerGlobalScope).createFFmpegCore('./ffmpeg.wasm');
        console.log('ffmpeg:', { ffmpeg });

        // ffmpeg = await (self as unknown as WorkerGlobalScope).createFFmpegCore();
    } catch (e) {
        console.error('error', e);

        if (!(self as unknown as WorkerGlobalScope).createFFmpegCore) {
            throw ERRORS.IMPORT_FAILURE;
        }
    }

    // return first;
};

const exec: FFCallMain = async (args) => {
    const resp = await ffmpeg['callMain'](args)
    return resp;
};

const writeFile: FFWriteFile = async (path, data) => {
    ffmpeg.FS.writeFile(path, data);
    return true;
};

const readFile: FFReadFile = (path, options) =>
    ffmpeg.FS.readFile(path, { encoding: options.encoding });

const deleteFile: FFDeleteFile = async (path) => {
    ffmpeg.FS.unlink(path);
    return true;
};

const rename: FFRename = async (oldPath, newPath) => {
    ffmpeg.FS.rename(oldPath, newPath);
    return true;
};

const createDir: FFCreateDir = async (path) => {
    ffmpeg.FS.mkdir(path);
    return true;
};

const listDir: FFListDir = async (path) => {
    return await ffmpeg.FS.readdir(path);
};

// @ts-ignore
const mount: any = ({ fsType, options, mountPoint }) => {
    const filesystem = ffmpeg.FS.filesystems[fsType as keyof typeof ffmpeg.FS.filesystems];
    if (!filesystem) return false;

    //@ts-ignore
    ffmpeg.FS.mount(filesystem, options, mountPoint);
    return true;
};

const unmount: FFUnMount = (mountPoint) => {
    ffmpeg.FS.unmount(mountPoint);
};

self.onmessage = async ({
    data: { id, type, data: _data },
}: MessageEvent): Promise<void> => {
    const trans: Transferable[] = [];
    let data: CallbackData;
    try {
        if (type !== FF_MESSAGE_TYPES.LOAD && !ffmpeg) throw ERRORS.NOT_LOADED;

        switch (type) {
            case FF_MESSAGE_TYPES.LOAD:
                data = await load(_data as FFMessageLoadConfig);
                break;
            case FF_MESSAGE_TYPES.EXEC:
                data = await exec(_data as string[]);
                break;
            case FF_MESSAGE_TYPES.WRITE_FILE:
                // @ts-ignore
                data = writeFile(..._data as Parameters<FFWriteFile>);
                break;
            case FF_MESSAGE_TYPES.READ_FILE:
                data = readFile(..._data as Parameters<FFReadFile>);
                if (data instanceof Uint8Array) {
                    trans.push(data.buffer);
                }
                break;
            case FF_MESSAGE_TYPES.DELETE_FILE:
                // @ts-ignore
                data = deleteFile(..._data as Parameters<FFDeleteFile>);
                break;
            case FF_MESSAGE_TYPES.RENAME:
                // @ts-ignore
                data = rename(..._data as Parameters<FFRename>);
                break;
            case FF_MESSAGE_TYPES.CREATE_DIR:
                // @ts-ignore
                data = createDir(..._data as Parameters<FFCreateDir>);
                break;
            case FF_MESSAGE_TYPES.LIST_DIR:
                // @ts-ignore
                data = listDir(..._data as Parameters<FFListDir>);
                break;
            case FF_MESSAGE_TYPES.DELETE_DIR:
                // @ts-ignore
                data = deleteFile(...data as Parameters<FFDeleteFile>);
                break;
            case FF_MESSAGE_TYPES.MOUNT:
                data = mount(..._data as Parameters<FFMount>);
                break;
            case FF_MESSAGE_TYPES.UNMOUNT:
                // @ts-ignore
                data = unmount(_data as FFMessageUnmountData);
                break;
            default:
                throw ERRORS.UNKNOWN_TYPE;
        }
    } catch (e) {
        self.postMessage({
            id,
            type: FF_MESSAGE_TYPES.ERROR,
            data: (e as Error).toString(),
        });
        return;
    }

    // @ts-ignore
    self.postMessage({ id, type, data }, trans);
};
