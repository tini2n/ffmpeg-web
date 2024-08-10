const ffmpeg = new FFmpegWrapper();

console.log('Loading FFmpeg module...', Module);

ffmpeg
    .loadModule()
    .then(() => {
        console.log('Module loaded', ffmpeg.module);

        ffmpeg.createDir('/working');
        ffmpeg.module.FS.mount(
            ffmpeg.module.FS.filesystems.MEMFS,
            { root: '.' },
            '/working',
        );

        ffmpeg.runCommand(['-nostdin', '-y', '-filters']);
    })
    .then(() => {
        console.log('Conversion finished successfully');
    })
    .catch((err) => {
        console.error('Error running FFmpeg command:', err);
    });

const fileInput = document.getElementById('inputFile');
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    const inputFileName = `/working/${file.name}`;
    const outputFileName = '/working/output.mp4';

    const fileData = await fetchFile(file);
    console.log('File read:', fileData);
    ffmpeg.writeFile(inputFileName, fileData);
    console.log('File written to FS:', inputFileName);

    var output = ffmpeg.module.FS.readFile(`/working/${file.name}`);
    console.log('Input file size:', output.length);

    console.log('FS content:', ffmpeg.listFiles('/working'));
    console.log('File exist: ', ffmpeg.fileExists(inputFileName));

    try {
        const intervalID = setInterval(() => {
            console.log('After run: /working', ffmpeg.listFiles('/working'));

            if (ffmpeg.fileExists(outputFileName)) {
                console.log('Conversion finished successfully');

                // Read the output file from the FFmpeg file system
                const outputData = ffmpeg.readFile(outputFileName);

                // Create a Blob from the output data and generate a download link
                const outputBlob = new Blob([outputData], {
                    type: 'video/mp4',
                });
                const downloadUrl = URL.createObjectURL(outputBlob);

                const downloadLink = document.createElement('a');
                downloadLink.href = downloadUrl;
                downloadLink.download = 'output.mp4';
                downloadLink.textContent = 'Download MP4';

                document.body.appendChild(downloadLink);

                clearInterval(intervalID);
            }
        }, 5000);

        // await ffmpeg.runCommand([
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

        await ffmpeg.runCommand([
            '-loglevel',
            'debug',
            '-nostdin',
            '-y',
            '-i',
            inputFileName,
            '-c:v',
            'libx264',
            '-c:a',
            'copy',
            outputFileName,
        ]);
    } catch (error) {
        console.error('Error running FFmpeg command:', error);
    }
});

// try {
//     const ff = ffmpeg.module.cwrap('_emscripten_proxy_main', 'number', [
//         'number',
//         'number',
//     ]);
//     const args = [
//         'ffmpeg',
//         '-i',
//         inputFileName,
//         '-c',
//         '-copy',
//         outputFileName,
//     ];
//     const argsPtr = _malloc(args.length * Uint32Array.BYTES_PER_ELEMENT);
//     args.forEach((s, idx) => {
//         const buf = _malloc(s.length + 1);
//         ffmpeg.module.writeAsciiToMemory(s, buf);
//         ffmpeg.module.setValue(
//             argsPtr + Uint32Array.BYTES_PER_ELEMENT * idx,
//             buf,
//             'i32',
//         );
//     });
//     ff(args.length, argsPtr);
//     setInterval(() => {
//         console.log('After run: /working', ffmpeg.listFiles('/working'));
//     }, 1000);
// } catch (error) {
//     console.error('Error running FFmpeg _malloc:', error);
// }
