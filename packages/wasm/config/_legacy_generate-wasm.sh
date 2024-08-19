mkdir -p wasm/dist

INCLUDE_PATHS="-I. -I./fftools"
LIBRARY_PATHS="-Llibavdevice -Llibavcodec -Llibavfilter -Llibavformat -Llibavresample -Llibavutil -Llibswscale -Llibswresample -L$HOME/emsdk/deps/ogg/lib -L$HOME/emsdk/deps/vorbis/lib"
SOURCE_FILES="libpostproc/postprocess.c libpostproc/version.c fftools/ffmpeg_enc.c fftools/objpool.c fftools/ffmpeg_mux.c fftools/ffmpeg_mux_init.c fftools/sync_queue.c fftools/thread_queue.c fftools/ffmpeg_sched.c fftools/ffmpeg_dec.c fftools/ffmpeg_demux.c fftools/opt_common.c fftools/ffmpeg_opt.c fftools/ffmpeg_filter.c fftools/ffmpeg_hw.c fftools/cmdutils.c fftools/ffmpeg.c"
LIBRARIES="-lavdevice -lavfilter -lavformat -lavcodec -lswresample -lswscale -lavutil -lm -lvorbis -lvorbisenc -logg $HOME/emsdk/deps/x264/lib/libx264.a"

ARGS=(
  ${INCLUDE_PATHS}
  ${LIBRARY_PATHS}
  -Qunused-arguments
  -o wasm/dist/ffmpeg.js
  ${SOURCE_FILES}
  ${LIBRARIES}
#  -O3                             # Enable code optimisation
  -pthread                         # Enable pthreads support
  --pre-js pre.js
  -s PROXY_TO_PTHREAD=1
  -s EXPORTED_RUNTIME_METHODS="[callMain, FS, cwrap, setValue, writeAsciiToMemory]"
  -s EXPORTED_FUNCTIONS="[_main, _exit]"
  -s ALLOW_MEMORY_GROWTH=1        # Allow memory growth
  -s INITIAL_MEMORY=67108864      # 64 MB initial memory
)
emcc "${ARGS[@]}"