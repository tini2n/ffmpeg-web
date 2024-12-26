FROM emscripten/emsdk:3.1.64 AS emsdk-base

# Default arguments
ARG TARGET=recorder
ARG EMSCRIPTEN_VERSION=3.1.64
ARG FFMPEG_VERSION=n5.1.4

RUN echo "Building for TARGET=${TARGET}"
RUN echo "Using EMSCRIPTEN_VERSION=${EMSCRIPTEN_VERSION}"
RUN echo "Using FFMPEG_VERSION=${FFMPEG_VERSION}"

ENV INSTALL_DIR=/opt
ENV FFMPEG_DIR=/src/ffmpeg

ENV CFLAGS="-I$INSTALL_DIR/include $CFLAGS"
ENV CXXFLAGS="$CFLAGS"
ENV EM_PKG_CONFIG_PATH=$EM_PKG_CONFIG_PATH:$INSTALL_DIR/lib/pkgconfig:/emsdk/upstream/emscripten/system/lib/pkgconfig
ENV PKG_CONFIG_PATH=$PKG_CONFIG_PATH:$EM_PKG_CONFIG_PATH

# Install dependencies
RUN apt-get update && \
    apt-get install -y git build-essential automake libtool pkg-config zlib1g-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN ls -la
RUN pwd
RUN which emcc
RUN emcc --version
RUN which pkg-config
RUN pkg-config --version
RUN bash

RUN git clone https://git.ffmpeg.org/ffmpeg.git ffmpeg && \
    cd ffmpeg && \
    git checkout ${FFMPEG_VERSION}

WORKDIR /opt
RUN ls -la

WORKDIR /src/ffmpeg

RUN ls -la

COPY ./builds/Makefile configs.mk
COPY ./builds/${TARGET}/** ./
COPY ./builds/deps/** ./deps/

RUN ls -la

RUN make -f configs.mk ${TARGET}