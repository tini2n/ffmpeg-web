mkdir -p wasm/dist

EXPORT_NAME="createFFmpegCore"

INCLUDE_PATHS="-I. -I./fftools"
LIBRARY_PATHS="-Llibavdevice -Llibavcodec -Llibavfilter -Llibavformat -Llibavresample -Llibavutil -Llibswscale -Llibswresample -L$HOME/emsdk/deps/ogg/lib -L$HOME/emsdk/deps/vorbis/lib"
SOURCE_FILES="libpostproc/postprocess.c libpostproc/version.c fftools/ffmpeg_mux.c fftools/opt_common.c fftools/ffmpeg_opt.c fftools/ffmpeg_filter.c fftools/ffmpeg_hw.c fftools/cmdutils.c fftools/ffmpeg.c"
LIBRARIES="-lavfilter -lavformat -lavcodec -lswscale -lavutil -lm -logg $HOME/emsdk/deps/x264/lib/libx264.a"

ARGS=(
  ${INCLUDE_PATHS}
  ${LIBRARY_PATHS}
  -Qunused-arguments
  -o wasm/dist/ffmpeg.js
  ${SOURCE_FILES}
  ${LIBRARIES}
  # -O3                              # Enable code optimisation
  # -pthread                         # Do not use pthread. SharedArrayBuffer issue
  -Wno-deprecated-declarations       # Suppress deprecated declarations
  -sWASM_BIGINT                      # enable big int support
  -sUSE_SDL=2                        # use emscripten SDL2 lib port
  -sMODULARIZE                       # not compatible with --proxy-to-worker
  -sEXPORT_NAME="$EXPORT_NAME"
  -sINITIAL_MEMORY=32MB              # 64 MB initial memory
  -sALLOW_MEMORY_GROWTH              # Allow memory growth

  --profiling
  -sSTACK_OVERFLOW_CHECK=2           # enable stack overflow check
  -sASSERTIONS=2                     # enable assertions (useful for debugging)
  -sSTACK_SIZE=10MB
  -sTOTAL_MEMORY=512MB
  -sPTHREAD_POOL_SIZE=1
  
  --pre-js pre.js
  -lworkerfs.js
  -s EXPORTED_FUNCTIONS="[_main, _exit, _abort, _emscripten_exit_with_live_runtime, _malloc]"
  -s EXPORTED_RUNTIME_METHODS="[callMain, FS, exitJS, setValue, stringToUTF8, lengthBytesUTF8]"
)

emcc "${ARGS[@]}"