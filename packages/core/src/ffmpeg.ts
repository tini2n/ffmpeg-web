// @ts-nocheck

function getUniqueID() {
    return Math.random().toString(36).substr(2, 9);
}

export class FFmpeg {
    #worker = null;
    #resolves: Callbacks = {};
    #rejects: Callbacks = {};
    #logEventCallbacks = [];
    #progressEventCallbacks = [];

    constructor() {
        this.module = null;
    }

    async load() {

        if (!this.#worker) {
            // this.#worker = new Worker(/* webpackChunkName: "ffmpeg-worker" */ "./worker.js", { type: 'module' });
            this.#worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
            this.#registerHandlers();
        }

        console.log('load worker:', this.#worker);
        return await this.#send({ type: 'LOAD', data: './wasm/ffmpeg.js' });

        // (window).createFFmpegCore = ((await import(/* webpackChunkName: "ffmpeg-core" */'./wasm/ffmpeg.js'))).default;

        // this.module = await (window).createFFmpegCore();
        // console.log('FFmpeg loaded:', { module: this.module });
    }

    #registerHandlers = () => {
        if (this.#worker) {
            this.#worker.onmessage = ({ data: { id, type, data } }) => {
                if (type === 'ERROR') {
                    this.#rejects[id](data);
                } else {
                    this.#resolves[id](data);
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

    async exec(args) {
        console.log('FFmpeg command:', args);

        this.#send({ type: 'EXEC', data: args });
        // if (!this.module) {
        //     await this.load();
        // }

        // const resp = await this.module['callMain'](args);
        // console.log('FFmpeg command executed:', { args, resp });
        // this.module.exitJS(resp, true) // brokes multiple execs
        // this.module['_exit'](resp) // brokes multiple execs
        // this.module['_emscripten_exit_with_live_runtime']() // brokes multiple execs
        // console.log('Module[ret]: ', { ret: this.module['ret'] });

        // // reset module state
        // this.module['ret'] = -1;
        // this.module['timeout'] = -1;

        // return resp;
    }

    async createDir(path) {
        return this.#send({ type: 'CREATE_DIR', data: path });
    }

    async writeFile(path, data) {
        const transfer = [data.buffer];
        return this.#send({ type: 'WRITE_FILE', data: { path, data } }, transfer);
    }

    async readFile(path) {
        return this.#send({ type: 'READ_FILE', data: path });
    }

    async listFiles(path) {
        return this.#send({ type: 'LIST_DIR', data: path });
    }

    async fileExists(path) {
        return this.#send({ type: 'FILE_EXISTS', data: path });
    }

    // readFile(path) {
    //     return this.module.FS.readFile(path);
    // }

    // writeFile(path, data) {
    //     this.module.FS.writeFile(path, data);
    // }

    // createDir(path) {
    //     this.module.FS.mkdir(path);
    // }

    // deleteDir(path) {
    //     this.module.FS.rmdir(path);
    // }

    // deleteFile(path) {
    //     this.module.FS.unlink(path);
    // }

    // listFiles(path) {
    //     return this.module.FS.readdir(path);
    // }

    // fileExists(path) {
    //     try {
    //         this.module.FS.lookupPath(path);
    //         return true;
    //     } catch (e) {
    //         return false;
    //     }
    // }
}