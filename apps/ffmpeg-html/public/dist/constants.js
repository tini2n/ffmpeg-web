export var FF_MESSAGE_TYPES;
(function (FF_MESSAGE_TYPES) {
    FF_MESSAGE_TYPES["LOAD"] = "LOAD";
    FF_MESSAGE_TYPES["EXEC"] = "EXEC";
    FF_MESSAGE_TYPES["WRITE_FILE"] = "WRITE_FILE";
    FF_MESSAGE_TYPES["READ_FILE"] = "READ_FILE";
    FF_MESSAGE_TYPES["DELETE_FILE"] = "DELETE_FILE";
    FF_MESSAGE_TYPES["RENAME"] = "RENAME";
    FF_MESSAGE_TYPES["CREATE_DIR"] = "CREATE_DIR";
    FF_MESSAGE_TYPES["LIST_DIR"] = "LIST_DIR";
    FF_MESSAGE_TYPES["DELETE_DIR"] = "DELETE_DIR";
    FF_MESSAGE_TYPES["ERROR"] = "ERROR";
    FF_MESSAGE_TYPES["DOWNLOAD"] = "DOWNLOAD";
    FF_MESSAGE_TYPES["PROGRESS"] = "PROGRESS";
    FF_MESSAGE_TYPES["LOG"] = "LOG";
    FF_MESSAGE_TYPES["MOUNT"] = "MOUNT";
    FF_MESSAGE_TYPES["UNMOUNT"] = "UNMOUNT";
    FF_MESSAGE_TYPES["FILE_EXISTS"] = "FILE_EXISTS";
})(FF_MESSAGE_TYPES || (FF_MESSAGE_TYPES = {}));
export var ERRORS = {
    NOT_LOADED: new Error("ffmpeg is not loaded, call `await ffmpeg.load()` first"),
    IMPORT_FAILURE: new Error("Failed to import core FFmpeg module, check the console for more information"),
    UNKNOWN_TYPE: new Error("Unknown message type"),
};
