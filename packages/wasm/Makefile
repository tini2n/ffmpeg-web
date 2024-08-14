# Paths
EMSDK = /emsdk
FFMPEG_SRC = /src
BUILD_DIR = /build

# Filters, demuxers, decoders, and encoders
COMMON_FILTERS = aresample scale crop overlay hstack vstack
COMMON_DEMUXERS = matroska mov mp3 wav image2 concat
COMMON_DECODERS = vp8 h264 opus mp3 aac pcm_s16le mjpeg png
WEBM_MUXERS = webm null
WEBM_ENCODERS = libvpx_vp8 libopus
MP4_MUXERS = mp4 null
MP4_ENCODERS = libx264 aac

# Targets
all: common mp4 webm

clean:
	cd $(FFMPEG_SRC) && make clean

recorder:
	cd $(FFMPEG_SRC) && \
	EM_PKG_CONFIG_PATH=$(PKG_CONFIG_PATH) emconfigure ./configure \
		--cc=emcc \
		--cxx=em++ \
		--ar=emar \
		--ranlib=emranlib \
		--enable-cross-compile \
		--target-os=none \
		--arch=x86 \
		--disable-runtime-cpudetect \
		--disable-asm \
		--disable-fast-unaligned \
		--disable-pthreads \
		--disable-w32threads \
		--disable-os2threads \
		--disable-debug \
		--disable-stripping \
		--disable-safe-bitstream-reader \
		--disable-all \
		--enable-avcodec \
		--enable-avformat \
		--enable-avfilter \
		--enable-swresample \
		--enable-swscale \
		--enable-zlib \
		--enable-protocol=file \
		--enable-gpl \
		$(addprefix --enable-decoder=,$(COMMON_DECODERS)) \
		$(addprefix --enable-demuxer=,$(COMMON_DEMUXERS)) \
		$(addprefix --enable-filter=,$(COMMON_FILTERS))