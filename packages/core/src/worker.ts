// @ts-nocheck
import { WORKER_MESSAGE_TYPES } from './constants';

console.log('Worker imported');

let ffmpeg: any;

const load = async (coreURL: string = './wasm/ffmpeg.js'): Promise<boolean> => {
    try {
        (self).createFFmpegCore = ((await import(/* webpackChunkName: "ffmpeg-core" */ './wasm/ffmpeg.js'))).default;

        // todo: move locate wasm file from pre.js
        ffmpeg = await (self as any).createFFmpegCore();
        console.log('WORKER: FFmpeg loaded:', { ffmpeg });

        ffmpeg.setLogger((data) =>
            self.postMessage({ type: WORKER_MESSAGE_TYPES.LOG, data })
        );
        ffmpeg.setProgress((data) =>
            self.postMessage({
                type: WORKER_MESSAGE_TYPES.PROGRESS,
                data,
            })
        );

        return true;

        // ffmpeg = await (self as any).createFFmpegCore({
        //     mainScriptUrlOrBlob: './wasm/ffmpeg.js',
        //     locateFile: (file: string) => {
        //         console.log('Locating file:', file);
        //         if (file.endsWith('.wasm')) {
        //             return './ffmpeg.wasm';
        //         }
        //         return file;
        //     }
        // });
    } catch (error) {
        console.error('WORKER ERROR: Failed to load FFmpeg:', error);

        return false;
    }
};

const execCommand = async (args: string[], timeout = -1): Promise<number> => {
    if (!ffmpeg) {
        throw new Error('WORKER ERROR: FFmpeg is not loaded');
    }
    ffmpeg.setTimeout(timeout);
    const ret = ffmpeg.callMain(args);
    ffmpeg.reset();
    return ret;

    // ffmpeg.setTimeout(timeout);
    // ffmpeg.exec(...args);
    // const ret = ffmpeg.ret;
    // ffmpeg.reset();
    // return ret;
};

const createDir = async (path: string): Promise<void> => {
    try {
        ffmpeg.FS.mkdir(path);
        return true;
    } catch (error) {
        return false;
    }
};

const writeFile = async (path: string, data: Uint8Array): Promise<boolean> => {
    try {
        ffmpeg.FS.writeFile(path, data);
        return true;
    } catch (error) {
        return false;
    }
};

const readFile = async (path: string): Promise<Uint8Array> => {
    const res = await ffmpeg.FS.readFile(path);
    return res;
};

const deleteFile = async (path: string): Promise<boolean> => {
    try {
        ffmpeg.FS.unlink(path);
        return true;
    } catch (error) {
        console.error('WORKER ERROR: Failed to delete file:', error);
        return false;
    }
}

const listDir = async (path: string): Promise<string[]> => {
    return ffmpeg.FS.readdir(path);
};

const fileExists = async (path: string): Promise<boolean> => await !!ffmpeg.FS.lookupPath(path);

self.onmessage = async (event: MessageEvent) => {
    const trans = [];
    let result;
    const { id, type, data } = event.data;
    console.log('WORKER on message:', { id, type, data });

    try {
        switch (type) {
            case WORKER_MESSAGE_TYPES.LOAD:
                result = await load(data);
                break;
            case WORKER_MESSAGE_TYPES.CREATE_DIR:
                result = await createDir(data);
                break;
            case WORKER_MESSAGE_TYPES.WRITE_FILE:
                result = await writeFile(data.path, data.data);
                break;
            case WORKER_MESSAGE_TYPES.READ_FILE:
                result = await readFile(data);
                break;
            case WORKER_MESSAGE_TYPES.DELETE_FILE:
                result = await deleteFile(data);
                break;
            case WORKER_MESSAGE_TYPES.LIST_DIR:
                result = await listDir(data);
                break;
            case WORKER_MESSAGE_TYPES.FILE_EXISTS:
                result = await fileExists(data);
                break;
            case WORKER_MESSAGE_TYPES.EXEC:
                result = await execCommand(data);
                break;
            default:
                throw new Error(`WORKER ERROR: Unknown command type: ${type}`);
        }
    } catch (error) {
        console.error('WORKER ERROR:', error);
        self.postMessage({ id, type: WORKER_MESSAGE_TYPES.ERROR, data: error.message });
    }

    if (result instanceof Uint8Array) {
        trans.push(result.buffer);
    }

    self.postMessage({ id, type, data: result }, trans);
};

// console.log('worker.ts');
// import { ERRORS, FF_MESSAGE_TYPES } from "./constants";
// import { fetchFile, importScript } from './utils'
// import type {
//     FFCallMain,
//     ExitCode,
//     FFMessageExecData,
//     FFMessageLoadConfig,
//     FFmpegCoreModule,
//     IsFirst,
//     OK,
//     FFWriteFile,
//     FFReadFile,
//     FFDeleteFile,
//     FFRename,
//     FFCreateDir,
//     FFListDir,
//     FFMount,
//     FFUnMount,
//     CallbackData
// } from "./types";

// let ffmpeg: FFmpegCoreModule;

// const load = async ({
//     // coreURL = '../../../wasm/dist/ffmpeg.js',
//     // coreURL = 'http://127.0.0.1:8080/ffmpeg.js',
//     coreURL = './ffmpeg.js',
//     // coreURL = './dist/umd/ffmpeg.js',
//     // coreURL = '../wasm/ffmpeg.js',
//     wasmURL,
//     workerURL,
//     // @ts-ignore
// }: FFMessageLoadConfig): Promise<IsFirst> => {
//     // const first = !ffmpeg;
//     console.log('load from worker');

//     try {
//         // await importScript(coreURL);
//         importScripts(coreURL);
//         console.log('scripts imported:', { self });

//         // // @ts-ignore
//         // (self as WorkerGlobalScope).createFFmpegCore = (
//         //     // @ts-ignore
//         //     (await import(fullPath)) as ImportedFFmpegCoreModuleFactory
//         // ).default;

//         // @ts-ignore
//         ffmpeg = await (self as WorkerGlobalScope).createFFmpegCore('./ffmpeg.wasm');
//         console.log('ffmpeg:', { ffmpeg });

//         // ffmpeg = await (self as unknown as WorkerGlobalScope).createFFmpegCore();
//     } catch (e) {
//         console.error('error', e);

//         if (!(self as unknown as WorkerGlobalScope).createFFmpegCore) {
//             throw ERRORS.IMPORT_FAILURE;
//         }
//     }

//     // return first;
// };

// const exec: FFCallMain = async (args) => {
//     const resp = await ffmpeg['callMain'](args)
//     return resp;
// };

// const writeFile: FFWriteFile = async (path, data) => {
//     ffmpeg.FS.writeFile(path, data);
//     return true;
// };

// const readFile: FFReadFile = (path, options) =>
//     ffmpeg.FS.readFile(path, { encoding: options.encoding });

// const deleteFile: FFDeleteFile = async (path) => {
//     ffmpeg.FS.unlink(path);
//     return true;
// };

// const rename: FFRename = async (oldPath, newPath) => {
//     ffmpeg.FS.rename(oldPath, newPath);
//     return true;
// };

// const createDir: FFCreateDir = async (path) => {
//     ffmpeg.FS.mkdir(path);
//     return true;
// };

// const listDir: FFListDir = async (path) => {
//     return await ffmpeg.FS.readdir(path);
// };

// // @ts-ignore
// const mount: any = ({ fsType, options, mountPoint }) => {
//     const filesystem = ffmpeg.FS.filesystems[fsType as keyof typeof ffmpeg.FS.filesystems];
//     if (!filesystem) return false;

//     //@ts-ignore
//     ffmpeg.FS.mount(filesystem, options, mountPoint);
//     return true;
// };

// const unmount: FFUnMount = (mountPoint) => {
//     ffmpeg.FS.unmount(mountPoint);
// };

// self.onmessage = async ({
//     data: { id, type, data: _data },
// }: MessageEvent): Promise<void> => {
//     const trans: Transferable[] = [];
//     let data: CallbackData;
//     try {
//         if (type !== FF_MESSAGE_TYPES.LOAD && !ffmpeg) throw ERRORS.NOT_LOADED;

//         switch (type) {
//             case FF_MESSAGE_TYPES.LOAD:
//                 data = await load(_data as FFMessageLoadConfig);
//                 break;
//             case FF_MESSAGE_TYPES.EXEC:
//                 data = await exec(_data as string[]);
//                 break;
//             case FF_MESSAGE_TYPES.WRITE_FILE:
//                 // @ts-ignore
//                 data = writeFile(..._data as Parameters<FFWriteFile>);
//                 break;
//             case FF_MESSAGE_TYPES.READ_FILE:
//                 data = readFile(..._data as Parameters<FFReadFile>);
//                 if (data instanceof Uint8Array) {
//                     trans.push(data.buffer);
//                 }
//                 break;
//             case FF_MESSAGE_TYPES.DELETE_FILE:
//                 // @ts-ignore
//                 data = deleteFile(..._data as Parameters<FFDeleteFile>);
//                 break;
//             case FF_MESSAGE_TYPES.RENAME:
//                 // @ts-ignore
//                 data = rename(..._data as Parameters<FFRename>);
//                 break;
//             case FF_MESSAGE_TYPES.CREATE_DIR:
//                 // @ts-ignore
//                 data = createDir(..._data as Parameters<FFCreateDir>);
//                 break;
//             case FF_MESSAGE_TYPES.LIST_DIR:
//                 // @ts-ignore
//                 data = listDir(..._data as Parameters<FFListDir>);
//                 break;
//             case FF_MESSAGE_TYPES.DELETE_DIR:
//                 // @ts-ignore
//                 data = deleteFile(...data as Parameters<FFDeleteFile>);
//                 break;
//             case FF_MESSAGE_TYPES.MOUNT:
//                 data = mount(..._data as Parameters<FFMount>);
//                 break;
//             case FF_MESSAGE_TYPES.UNMOUNT:
//                 // @ts-ignore
//                 data = unmount(_data as FFMessageUnmountData);
//                 break;
//             default:
//                 throw ERRORS.UNKNOWN_TYPE;
//         }
//     } catch (e) {
//         self.postMessage({
//             id,
//             type: FF_MESSAGE_TYPES.ERROR,
//             data: (e as Error).toString(),
//         });
//         return;
//     }

//     // @ts-ignore
//     self.postMessage({ id, type, data }, trans);
// };
