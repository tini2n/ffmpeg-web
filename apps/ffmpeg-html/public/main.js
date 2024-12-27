(async () => {
    console.log('Hello from main.js. Using bundle: ', FFmpegWeb);
    const { FFmpeg } = FFmpegWeb;

    const ffmpeg = new FFmpeg();
    console.log('Loading FFmpeg module...', ffmpeg);

    await ffmpeg.load({
        coreURL: 'https://lab.geen.ee/geenee-ffmpeg/core/ffmpeg.js',
    });

    ffmpeg.on('log', (log) => {
        log && log.type === 'stdout'
            ? console.log('ffmpeg:', log.message)
            : console.error('ffmpeg:', log.message);
    });

    await ffmpeg.exec(['-version']);
    await ffmpeg.createDir('/working');

    const fileInput = document.getElementById('inputFile');
    fileInput.addEventListener('change', async (e) => {
        // Clean up previous download link
        const prevLink = document.getElementById('downloadLink');
        if (prevLink) {
            URL.revokeObjectURL(prevLink.href);
            prevLink.remove();
        }

        try {
            const file = e.target.files[0];
            const inputFileName = `/working/${file.name}`;
            const outputFileName = '/working/output.mp4';

            const fileData = await fetchFile(file);
            console.log('File read:', fileData);
            await ffmpeg.writeFile(inputFileName, fileData);
            console.log('File written to FS:', inputFileName);

            var output = await ffmpeg.readFile(`/working/${file.name}`);
            console.log('Input file size:', output);

            console.log('FS content:', await ffmpeg.listFiles('/working'));
            console.log('File exist: ', await ffmpeg.fileExists(inputFileName));

            // webm to mp4
            await ffmpeg.exec([
                '-loglevel',
                'debug',
                '-ss',
                '00:00:00.050',
                '-i',
                inputFileName,
                '-c:v',
                'libx264',
                '-c:a',
                'copy',
                '-preset',
                'ultrafast',
                '-r',
                '30',
                outputFileName,
            ]);

            // mp4 to mp4
            // await ffmpeg.exec([
            //     '-loglevel',
            //     'debug',
            //     '-nostdin',
            //     '-y',
            //     '-i',
            //     inputFileName,
            //     '-c',
            //     'copy',
            //     outputFileName,
            // ]);

            const res = await ffmpeg.listFiles('/working');
            console.log('After run: /working', res);

            if (ffmpeg.fileExists(outputFileName)) {
                console.log('Conversion finished successfully');

                // Read the output file from the FFmpeg file system
                const outputData = await ffmpeg.readFile(outputFileName);

                // Create a Blob from the output data and generate a download link
                const outputBlob = new Blob([outputData], {
                    type: 'video/mp4',
                });
                const downloadUrl = URL.createObjectURL(outputBlob);

                const downloadLink = document.createElement('a');
                downloadLink.id = 'downloadLink';
                downloadLink.href = downloadUrl;
                downloadLink.download = 'output.mp4';
                downloadLink.textContent = 'Download MP4';

                document.body.appendChild(downloadLink);
            }

            // Clean up
            await ffmpeg.deleteFile(inputFileName);
            await ffmpeg.deleteFile(outputFileName);
        } catch (error) {
            console.error('Error running FFmpeg command:', error);
        }
    });
})();

const fetchFile = async (file) => {
    let data;

    if (typeof file === 'string') {
        /* From base64 format */
        if (/data:_data\/([a-zA-Z]*);base64,([^"]*)/.test(file)) {
            data = atob(file.split(',')[1])
                .split('')
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

const readFromBlobOrFile = (blob) =>
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
                    `File could not be read! Code=${
                        event?.target?.error?.code || -1
                    }`,
                ),
            );
        };
        fileReader.readAsArrayBuffer(blob);
    });
