#!/bin/bash -x

# Emscripten version
emcc -v

EMSDK="/Users/tini2n/emsdk" # local
$EMSDK/upstream/bin/llvm-nm --version

export PKG_CONFIG_PATH=$EMSDK/deps/ogg/lib/pkgconfig:$EMSDK/deps/vorbis/lib/pkgconfig:$EMSDK/deps/x264/lib/pkgconfig:$EMSDK/deps/x265/lib/pkgconfig:$EMSDK/upstream/emscripten/system/lib/pkgconfig

# Clean previous builds
emmake make clean

CFLAGS="-s USE_PTHREADS" # Add "-O3" for optimisation
LDFLAGS="$CFLAGS -s INITIAL_MEMORY=67108864 -s MAXIMUM_MEMORY=134217728 -s ALLOW_MEMORY_GROWTH" # 33554432 bytes = 32 MB

# configure FFMpeg with Emscripten
CONFIG_ARGS=(
  --target-os=none             # use none to prevent any os specific configurations
  --arch=x86_32                # use x86_32 to achieve minimal architectural optimization
  --enable-cross-compile       # enable cross compile
  --enable-static              # build static library
  --disable-x86asm             # disable x86 asm
  --disable-inline-asm         # Disable inline asm
  --disable-stripping          # Disable stripping
  --disable-programs           # Disable programs
  --disable-doc                # Disable documentation components

  --disable-safe-bitstream-reader       # Disable safe bitstream reader
  --disable-fast-unaligned              # Disable fast unaligned
  --disable-postproc                    # Disable post processing

  --nm="$EMSDK/upstream/bin/llvm-nm -g"
  --ar="$EMSDK/upstream/bin/llvm-ar"
  --as="$EMSDK/upstream/bin/llvm-as"
  --ranlib="$EMSDK/upstream/bin/llvm-ranlib"

  --cc=emcc
  --cxx=em++
  --objcc=emcc
  --dep-cc=emcc

  --extra-cflags="$CFLAGS"
  --extra-cxxflags="$CFLAGS"
  --extra-ldflags="$LDFLAGS -L$HOME/emsdk/deps/ogg/lib -L$HOME/emsdk/deps/vorbis/lib -L$HOME/emsdk/deps/x264/lib"

  --disable-all                # Disable all components
  --enable-avcodec             # Enable core codec library
  --enable-avdevice            # Enable device support
  --enable-postproc            # Enable postprocessing support
  --enable-avformat            # Enable core format library
  --enable-avfilter            # Enable filtering support
  --enable-swscale             # Enable software scaling
  --enable-swresample          # Enable software resampling

  --enable-libx264
  --enable-protocol=file
  --enable-parser=opus,vp9

  --enable-decoder=vp9,h264,opus,aac,pcm_s16le,mjpeg,png
  --enable-demuxer=matroska,ogg,mov,wav,image2,concat
  # --enable-filter=aresample,scale,crop,overlay,hstack,vstack
  --enable-filters
  --enable-muxer=mp4,webm,ogg
  --enable-encoder=libx264,libvorbis,libopus,libmp3lame

  --enable-gpl                 # Enable GPL license
)

EM_PKG_CONFIG_PATH=$PKG_CONFIG_PATH emconfigure ./configure "${CONFIG_ARGS[@]}"

# Build FFmpeg
emmake make -j4