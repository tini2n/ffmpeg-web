// @ts-nocheck

export class FFmpeg {
    constructor() {
        this.module = null;
    }

    async load() {
        const resp = await import(/* webpackChunkName: "ffmpeg-core" */ './wasm/ffmpeg.js');
        (window).createFFmpegCore = ((await import('./wasm/ffmpeg.js'))).default;

        this.module = await (window).createFFmpegCore();
        //        this.module = await Module();
        // return new Promise((resolve, reject) => {
        //     Module.onRuntimeInitialized = () => {
        //         console.log('Runtime initialized WRAPPER');
        //         this.module = Module;
        //         resolve();
        //     };
        // });
    }

    async exec(args) {
        if (!this.module) {
            await this.load();
        }

        return await this.module['callMain'](args);
    }

    // File system methods
    readFile(path) {
        return this.module.FS.readFile(path);
    }

    writeFile(path, data) {
        this.module.FS.writeFile(path, data);
    }

    createDir(path) {
        this.module.FS.mkdir(path);
    }

    deleteDir(path) {
        this.module.FS.rmdir(path);
    }

    deleteFile(path) {
        this.module.FS.unlink(path);
    }

    listFiles(path) {
        return this.module.FS.readdir(path);
    }

    fileExists(path) {
        try {
            this.module.FS.lookupPath(path);
            return true;
        } catch (e) {
            return false;
        }
    }
}