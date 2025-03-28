
// @ts-ignore
export const readFromBlobOrFile = (blob) =>
    new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = () => {
            const { result } = fileReader;
            if (result instanceof ArrayBuffer) {
                resolve(new Uint8Array(result));
            } else {
                resolve(new Uint8Array());
            }
        };
        fileReader.onerror = (event) => {
            reject(
                Error(
                    `File could not be read! Code=${event?.target?.error?.code || -1}`
                )
            );
        };
        fileReader.readAsArrayBuffer(blob);
    });

// @ts-ignore
export const fetchFile = async (file) => {
    let data;

    if (typeof file === "string") {
        /* From base64 format */
        if (/data:_data\/([a-zA-Z]*);base64,([^"]*)/.test(file)) {
            data = atob(file.split(",")[1])
                .split("")
                .map((c) => c.charCodeAt(0));
            /* From remote server/URL */
        } else {
            data = await (await fetch(file)).arrayBuffer();
        }
    } else if (file instanceof URL) {
        data = await (await fetch(file)).arrayBuffer();
    } else if (file instanceof File || file instanceof Blob) {
        data = await readFromBlobOrFile(file);
    } else {
        return new Uint8Array();
    }

    // @ts-ignore
    return new Uint8Array(data);
};

export const importScript = async (url: string) =>
    new Promise((resolve) => {
        const script = document.createElement("script");
        const eventHandler = () => {
            script.removeEventListener("load", eventHandler);

            // @ts-ignore
            resolve();
        };
        script.src = url;
        script.type = "text/javascript";
        script.addEventListener("load", eventHandler);
        document.getElementsByTagName("head")[0].appendChild(script);
    });

// @ts-ignore
export const downloadWithProgress = async (url, cb) => {
    const resp = await fetch(url);
    let buf;

    try {
        // Set total to -1 to indicate that there is not Content-Type Header.
        const total = parseInt(resp.headers.get('Content-Length') || "-1");

        const reader = resp.body?.getReader();
        if (!reader) throw 'ERROR_RESPONSE_BODY_READER';

        const chunks = [];
        let received = 0;
        for (; ;) {
            const { done, value } = await reader.read();
            const delta = value ? value.length : 0;

            if (done) {
                if (total != -1 && total !== received) throw 'ERROR_INCOMPLETED_DOWNLOAD';
                cb && cb({ url, total, received, delta, done });
                break;
            }

            chunks.push(value);
            received += delta;
            cb && cb({ url, total, received, delta, done });
        }

        const data = new Uint8Array(received);
        let position = 0;
        for (const chunk of chunks) {
            data.set(chunk, position);
            position += chunk.length;
        }

        buf = data.buffer;
    } catch (e) {
        console.log(`failed to send download progress event: `, e);
        // Fetch arrayBuffer directly when it is not possible to get progress.
        buf = await resp.arrayBuffer();
        cb &&
            cb({
                url,
                total: buf.byteLength,
                received: buf.byteLength,
                delta: 0,
                done: true,
            });
    }

    return buf;
};

// @ts-ignore
export const toBlobURL = async (url, mimeType, progress = false, cb) => {
    const buf = progress
        ? await downloadWithProgress(url, cb)
        : await (await fetch(url)).arrayBuffer();
    const blob = new Blob([buf], { type: mimeType });
    return URL.createObjectURL(blob);
};

export function getUniqueID() {
    return Math.random().toString(36).substr(2, 9);
}