// @ts-nocheck
import { WORKER_MESSAGE_TYPES, DEFAULT_CORE_URL } from './constants';

let ffmpeg: any;

const load = async (options: {coreURL: string, wasmURL: string}, ): Promise<boolean> => {
    let { coreURL } = options;

    if (!coreURL) {
        coreURL = DEFAULT_CORE_URL;
    }

    try {
        importScripts(coreURL);
    } catch (error) {
        (self).createFFmpegCore = (
            await import(/* webpackIgnore: true */ coreURL)
        ).default;

        if (!(self as WorkerGlobalScope).createFFmpegCore) {
            console.error('[Engeenee | FFmpeg]: Error in Worker: Failed to load FFmpeg CORE:', error);
        }

        return false;
    }

    ffmpeg = await (self as any).createFFmpegCore({
        locateFile: (path: string) => {
            if (path.endsWith('.wasm')) {
                if (options.wasmURL) {
                    return options.wasmURL;
                }

                return coreURL.replace('ffmpeg.js', 'ffmpeg.wasm');
            }
            return path;
        },
    }).then((module: any) => {
        console.log('[Engeenee | FFmpeg]: FFmpeg Core module loaded:', module);
        return module;
    });

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
};

const execCommand = async (args: string[], timeout = -1): Promise<number> => {
    if (!ffmpeg) {
        throw new Error('WORKER ERROR: FFmpeg is not loaded');
    }
    ffmpeg.setTimeout(timeout);
    const ret = ffmpeg.callMain(args);
    ffmpeg.reset();
    return ret;
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
