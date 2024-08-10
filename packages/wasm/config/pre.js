var Module = {
  print: function(text) {
    console.log('stdout: ' + text);
  },
  printErr: function(text) {
    console.error('stderr: ' + text);
  },
  noInitialRun: true,
  onRuntimeInitialized: function() {
    console.log('Runtime initialized');
//    const ffmpeg = Module.cwrap("_emscripten_proxy_main", "number", [ "number", "number" ]);
//    const args = [ "ffmpeg", '-h' ];
//    const argsPtr = _malloc(args.length * Uint32Array.BYTES_PER_ELEMENT);
//    args.forEach((s, idx) => {
//      const buf = _malloc(s.length + 1);
//      Module.writeAsciiToMemory(s, buf);
//      Module.setValue(argsPtr + (Uint32Array.BYTES_PER_ELEMENT * idx), buf, "i32");
//    });
//    ffmpeg(args.length, argsPtr);
  }
};
