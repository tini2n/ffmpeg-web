mkdir -p wasm/dist

EXPORT_NAME="createFFmpegCore"

INCLUDE_PATHS="-I. -I./fftools"
LIBRARY_PATHS="-Llibavdevice -Llibavcodec -Llibavfilter -Llibavformat -Llibavresample -Llibavutil -Llibswscale -Llibswresample -L$HOME/emsdk/deps/ogg/lib -L$HOME/emsdk/deps/vorbis/lib"
SOURCE_FILES="libpostproc/postprocess.c libpostproc/version.c fftools/ffmpeg_mux.c fftools/opt_common.c fftools/ffmpeg_opt.c fftools/ffmpeg_filter.c fftools/ffmpeg_hw.c fftools/cmdutils.c fftools/ffmpeg.c"
LIBRARIES="-lavfilter -lavformat -lavcodec -lswscale -lavutil -lm -logg $HOME/emsdk/deps/x264/lib/libx264.a"

ARGS=(
  -v
  ${INCLUDE_PATHS}
  ${LIBRARY_PATHS}
  -Qunused-arguments
  -o wasm/dist/ffmpeg.js
  ${SOURCE_FILES}
  ${LIBRARIES}
  -O0                               # Enable code optimisation
  # -pthread                          # Do not use pthread. SharedArrayBuffer issue
  -Wno-deprecated-declarations        # Suppress deprecated declarations
  -s WASM_BIGINT                      # enable big int support
  -s USE_SDL=2                        # use emscripten SDL2 lib port
  -s MODULARIZE                       # not compatible with --proxy-to-worker
  -s EXPORT_NAME="$EXPORT_NAME"
  -s INITIAL_MEMORY=67108864          # 64 MB initial memory
  -s TOTAL_MEMORY=134217728           # 128 MB total memory
  -s ALLOW_MEMORY_GROWTH              # Allow memory growth

  --profiling
  -s STACK_OVERFLOW_CHECK=2           # enable stack overflow check
  -s ASSERTIONS=2                     # enable assertions (useful for debugging)
  -s STACK_SIZE=5MB
  -s TOTAL_STACK=64MB
  -s PTHREAD_POOL_SIZE=1
  
  --pre-js pre.js
  -s EXPORTED_FUNCTIONS="[_main, _exit, _abort, _malloc]"
  -s EXPORTED_RUNTIME_METHODS="[callMain, FS, exitJS, setValue, stringToUTF8, lengthBytesUTF8]"
)

emcc "${ARGS[@]}"