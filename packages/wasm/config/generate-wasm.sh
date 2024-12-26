mkdir -p wasm/dist

EXPORT_NAME="createFFmpegCore"

INCLUDE_PATHS="-I. -I./fftools"
LIBRARY_PATHS="-Llibavdevice -Llibavcodec -Llibavfilter -Llibavformat -Llibavresample -Llibavutil -Llibswscale -Llibswresample -L$HOME/emsdk/deps/ogg/lib -L$HOME/emsdk/deps/vorbis/lib"
SOURCE_FILES="libpostproc/postprocess.c libpostproc/version.c fftools/ffmpeg_mux.c fftools/opt_common.c fftools/ffmpeg_opt.c fftools/ffmpeg_filter.c fftools/ffmpeg_hw.c fftools/cmdutils.c fftools/ffmpeg.c"
LIBRARIES="-lavfilter -lavformat -lavcodec -lswscale -lavutil -lm -logg -lvorbis -lvorbisenc $HOME/emsdk/deps/x264/lib/libx264.a"

ARGS=(
  -v
  ${INCLUDE_PATHS}
  ${LIBRARY_PATHS}
  -Qunused-arguments
  -o wasm/dist/ffmpeg.js
  ${SOURCE_FILES}
  ${LIBRARIES}
  -O3                               # Enable code optimisation
  # -pthread                          # Do not use pthread. SharedArrayBuffer issue
  -Wno-deprecated-declarations        # Suppress deprecated declarations
  -sWASM_BIGINT                      # enable big int support
  -sUSE_SDL=2                        # use emscripten SDL2 lib port
  -sMODULARIZE                       # not compatible with --proxy-to-worker
  -sEXPORT_NAME="$EXPORT_NAME"
  -sINITIAL_MEMORY=134217728         # 128 MB initial memory
  -sTOTAL_MEMORY=536870912           # 512 MB total memory
  -sALLOW_MEMORY_GROWTH              # Allow memory growth

  -sEXIT_RUNTIME=0                   # exit runtime after main
  -sINVOKE_RUN=0                     # do not run main automatically

  --profiling
  -sSTACK_OVERFLOW_CHECK=2           # enable stack overflow check
  -sASSERTIONS=2                     # enable assertions (useful for debugging)
  -sSTACK_SIZE=21MB
  -sTOTAL_STACK=82MB
  -sPTHREAD_POOL_SIZE=1
  
  --pre-js pre.js
  -lworkerfs.js
  -sEXPORTED_FUNCTIONS="[_main, _abort, _malloc, _free, _exit]"
  -sEXPORTED_RUNTIME_METHODS="[callMain, FS, setValue, getValue, stringToUTF8, UTF8ToString, lengthBytesUTF8]"
)

emcc "${ARGS[@]}"