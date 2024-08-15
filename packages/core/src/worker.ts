// @ts-nocheck
console.log('Worker started');

let ffmpeg: any; // This will hold the FFmpeg module

// Function to load the FFmpeg module
const load = async (coreURL: string = './wasm/ffmpeg.js'): Promise<void> => {
    console.log('Loading FFmpeg:', coreURL);
    try {
        (self).createFFmpegCore = ((await import(/* webpackChunkName: "ffmpeg-core" */ './wasm/ffmpeg.js'))).default;

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
        ffmpeg = await (self as any).createFFmpegCore();
        console.log('FFmpeg loaded:', { ffmpeg });

        return ffmpeg;
    } catch (error) {
        console.error('Failed to load FFmpeg:', error);
        throw new Error('Failed to load FFmpeg');
    }
};

// Function to execute an FFmpeg command
const execCommand = async (args: string[]): Promise<number> => {
    console.log('Executing FFmpeg command:', { args, ffmpeg });
    if (!ffmpeg) {
        throw new Error('FFmpeg is not loaded');
    }
    return ffmpeg.callMain(args);
};

const createDir = async (path: string): Promise<void> => {
    ffmpeg.FS.mkdir(path);
};

const writeFile = async (path: string, data: Uint8Array): Promise<void> => {
    ffmpeg.FS.writeFile(path, data);
};

const readFile = async (path: string): Promise<Uint8Array> => {
    return ffmpeg.FS.readFile(path);
};

const listDir = async (path: string): Promise<string[]> => {
    return ffmpeg.FS.readdir(path);
};

const fileExists = async (path: string): Promise<boolean> => {
    try {
        ffmpeg.FS.lookupPath(path);
        return true;
    } catch {
        return false;
    }
};

// Handle messages from the main thread
self.onmessage = async (event: MessageEvent) => {
    const { id, type, data } = event.data;
    console.log('Worker received message:', { id, type, data });

    try {
        let result;
        switch (type) {
            case 'LOAD':
                result = await load(data);
                break;
            case 'CREATE_DIR':
                result = await createDir(data);
                break;
            case 'WRITE_FILE':
                result = await writeFile(data.path, data.data);
                break;
            case 'READ_FILE':
                result = await readFile(data);
                break;
            case 'LIST_DIR':
                result = await listDir(data);
                break;
            case 'FILE_EXISTS':
                result = await fileExists(data);
                break;
            case 'EXEC':
                result = await execCommand(data);
                break;
            default:
                throw new Error('Unknown command');
        }
        self.postMessage({ id, type, result });
    } catch (error) {
        self.postMessage({ id, type: 'error', error: error.message });
    }
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
