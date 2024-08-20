#!/bin/bash -x

# Emscripten version
emcc -v

EMSDK="/Users/tini2n/emsdk" # local
$EMSDK/upstream/bin/llvm-nm --version

export PKG_CONFIG_PATH=$EMSDK/deps/ogg/lib/pkgconfig:$EMSDK/deps/vorbis/lib/pkgconfig:$EMSDK/deps/x264/lib/pkgconfig:$EMSDK/deps/x265/lib/pkgconfig:$EMSDK/upstream/emscripten/system/lib/pkgconfig

# Clean previous builds
emmake make clean

CFLAGS="-DTHREADS_DISABLED -O0" # Add "-O3" for optimisation
LDFLAGS="$CFLAGS -s INITIAL_MEMORY=67108864 -s MAXIMUM_MEMORY=134217728 -s ALLOW_MEMORY_GROWTH" # 33554432 bytes = 32 MB

# configure FFMpeg with Emscripten
CONFIG_ARGS=(
  --target-os=none             # use none to prevent any os specific configurations
  --arch=x86_32                # use x86_32 to achieve minimal architectural optimization
  --enable-cross-compile       # enable cross compile
  --enable-static              # build static library
  --disable-x86asm             # disable x86 asm
  --disable-inline-asm         # Disable inline asm

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

  --disable-all                                   # Disable all components

  --disable-stripping                             # Disable stripping (for debugging)
  --disable-programs                              # Disable programs (ffmpeg, ffplay, ffprobe)
  --disable-doc                                   # Disable documentation components

  --disable-pthreads                              # Disable pthreads (SharedArrayBuffer issue)
  --disable-w32threads
  --disable-os2threads

  --disable-network                               # Disable networking if not needed
  --disable-hwaccels                              # Disable hardware accelerations
  --disable-avdevice                              # Disable libavdevice
  --disable-postproc                              # Disable libpostproc
  
  --enable-avcodec                                # Enable core codec library (needed for libx264)
  --enable-avformat                               # Enable core format library (needed for reading and writing containers)
  --enable-avfilter                               # Enable filtering support (required for video scaling and format conversion)
  --enable-swscale                                # Enable software scaling (for resizing and pixel format conversions)

  --enable-libx264                                # Enable x264 library (H.264 video encoder)
  # --enable-protocol=file                          # Enable file protocol (needed for input/output)
  --enable-parser=opus,vp9,vp8,vorbis             # Enable Opus and VP9 parsers (for webm)

  --enable-decoder=vp9,vp8,h264,opus,vorbis,aac,pcm_s16le
  --enable-demuxer=matroska,mov
  --enable-filter=scale,fps,format,pad,transpose,null
  --enable-muxer=mp4,webm,ogg
  --enable-encoder=libx264

   # Disable CPU-specific optimizations that are irrelevant to WebAssembly
  --disable-mmx                                  # Disable MMX
  --disable-mmxext                               # Disable MMXEXT
  --disable-sse                                  # Disable SSE
  --disable-ssse3                                # Disable SSSE3
  --disable-aesni                                # Disable AESNI
  --disable-avx                                  # Disable AVX
  --disable-avx2                                 # Disable AVX2
  --disable-avx512                               # Disable AVX-512
  --disable-avx512icl                            # Disable AVX-512ICL
  --disable-xop                                  # Disable XOP
  --disable-fma3                                 # Disable FMA3
  --disable-fma4                                 # Disable FMA4
  --disable-i686                                 # Disable i686-specific optimizations

  # Other options
  --disable-safe-bitstream-reader                 # Disable safe bitstream reader
  --disable-bsfs                                  # Disable bitstream filters (if not needed)
  --disable-protocols                             # Disable all protocols
  --enable-protocol=file                          # Enable only file protocol (for input/output)

  --enable-gpl                                    # Enable GPL license (required for libx264)
)

EM_PKG_CONFIG_PATH=$PKG_CONFIG_PATH emconfigure ./configure "${CONFIG_ARGS[@]}"

# Build FFmpeg
emmake make -j4