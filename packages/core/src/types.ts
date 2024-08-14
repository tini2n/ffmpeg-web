declare global {
    interface WorkerGlobalScope {
        createFFmpegCore: FFmpegCoreModuleFactory;
    }
}

export type FFCallMain = (args: string[]) => Promise<ExitCode>;
export type FFWriteFile = (path: string, data: FileData) => Promise<OK>;
export type FFReadFile = (path: string, options: { encoding: string }) => FileData;
export type FFDeleteFile = (path: string) => Promise<OK>;
export type FFRename = (oldPath: string, newPath: string) => Promise<OK>;
export type FFCreateDir = (path: string) => Promise<OK>;
export type FFListDir = (path: string) => Promise<string[]>;
export type FFisDir = (mode: number) => boolean;
export type FFMount = (options: unknown) => void;
export type FFUnMount = (path: string) => void;

export interface FFmpegCoreModule {
    callMain: FFCallMain;
    FS: {
        writeFile: FFWriteFile;
        readFile: FFReadFile;
        unlink: FFDeleteFile;
        rename: FFRename;
        mkdir: FFCreateDir;
        readdir: FFListDir;
        isDir: FFisDir;
        stat: (path: string) => { mode: number };
        mount: FFMount;
        unmount: FFUnMount;

        filesystems: {
            MEMFS: {
                mount: FFMount;
            };
        };
    };
}

export type FFmpegCoreModuleFactory = (
    moduleOverrides?: Partial<FFmpegCoreModule>
) => Promise<FFmpegCoreModule>;

interface ImportedFFmpegCoreModuleFactory {
    default: FFmpegCoreModuleFactory;
}

export interface Callbacks {
    [id: number | string]: (data: CallbackData) => void;
}

export type LogEventCallback = (event: LogEvent) => void;
export type ProgressEventCallback = (event: ProgressEvent) => void;
export type ExitCode = number;

export interface FFMessageEventCallback {
    data: {
        id: number;
        type: string;
        data: CallbackData;
    };
}

export interface FFMessageLoadConfig {
    /**
     * `ffmpeg-core.js` URL.
     *
     * @defaultValue `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd/ffmpeg-core.js`;
     */
    coreURL?: string;
    /**
     * `ffmpeg-core.wasm` URL.
     *
     * @defaultValue `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd/ffmpeg-core.wasm`;
     */
    wasmURL?: string;
    /**
     * `ffmpeg-core.worker.js` URL. This worker is spawned when using multithread version of ffmpeg-core.
     *
     * @ref: https://ffmpegwasm.netlify.app/docs/overview#architecture
     * @defaultValue `https://unpkg.com/@ffmpeg/core-mt@${CORE_VERSION}/dist/umd/ffmpeg-core.worker.js`;
     */
    workerURL?: string;
    /**
     * `ffmpeg.worker.js` URL. This worker is spawned when FFmpeg.load() is called, it is an essential worker and usually you don't need to update this config.
     *
     * @ref: https://ffmpegwasm.netlify.app/docs/overview#architecture
     * @defaultValue `./worker.js`
     */
    classWorkerURL?: string;
}

export type CallbackData =
    | FileData
    | ExitCode
    | ErrorMessage
    | LogEvent
    | ProgressEvent
    | IsFirst
    | OK // eslint-disable-line
    | Error
    | FSNode[]
    | undefined;

export interface Message {
    type: string;
    // @ts-ignore
    data?: FFMessageData;
}

export type ErrorMessage = string;


export type FFMessageOptions = {
    signal?: AbortSignal;
};

export interface LogEvent {
    type: string;
    message: string;
}
export type IsFirst = boolean;
export type OK = boolean;


export interface FSNode {
    name: string;
    isDir: boolean;
}

export type FileData = Uint8Array | string;



export interface FFMessageExecData {
    args: string[];
    timeout?: number;
}