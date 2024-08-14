# Use an official emscripten image as the base image
FROM emscripten/emsdk:3.1.64

# Set environment variables
ENV EMSDK /emsdk
ENV PATH $PATH:/emsdk:/emsdk/upstream/emscripten
ENV EMCC_WASM_BACKEND 1

# Install dependencies
RUN apt-get update && \
    apt-get install -y git build-essential automake libtool pkg-config zlib1g-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN git clone https://git.ffmpeg.org/ffmpeg.git /src


RUN ls -la

# Create and set the working directory
WORKDIR /src

# Copy the Makefile and other necessary files
COPY Makefile .

# Run the Emscripten environment
# RUN source /emsdk/emsdk_env.sh

# Build FFmpeg
RUN make
