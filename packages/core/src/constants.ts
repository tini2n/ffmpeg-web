export enum WORKER_MESSAGE_TYPES {
    LOAD = "LOAD",
    EXEC = "EXEC",
    WRITE_FILE = "WRITE_FILE",
    READ_FILE = "READ_FILE",
    DELETE_FILE = "DELETE_FILE",
    RENAME = "RENAME",
    CREATE_DIR = "CREATE_DIR",
    LIST_DIR = "LIST_DIR",
    DELETE_DIR = "DELETE_DIR",
    ERROR = "ERROR",
    DOWNLOAD = "DOWNLOAD",
    PROGRESS = "PROGRESS",
    LOG = "LOG",
    MOUNT = "MOUNT",
    UNMOUNT = "UNMOUNT",
    FILE_EXISTS = "FILE_EXISTS",
}

export const CORE_URL = 'https://lab.geen.ee/geenee-ffmpeg/wasm/ffmpeg.js';

export const ERRORS = {
    NOT_LOADED: new Error(
        "ffmpeg is not loaded, call `await ffmpeg.load()` first"
    ),
    IMPORT_FAILURE: new Error(
        "Failed to import core FFmpeg module, check the console for more information"
    ),
    UNKNOWN_MESSAGE_TYPE: new Error("Unknown message type"),
}