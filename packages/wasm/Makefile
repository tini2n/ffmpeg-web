DIST_DIR := ../dist

clean:
	@echo "Cleaning dist directory..."
	rm -rf $(DIST_DIR)
	@echo "Cleaned dist directory."

build-recorder: 
	make clean
	@echo "Building ffmpeg.wasm for recorder..."
	docker buildx build \
		--build-arg TARGET=recorder \
		--build-arg EMSCRIPTEN_VERSION=3.1.64 \
		--build-arg FFMPEG_VERSION=n5.1.4 \
		-o $(DIST_DIR) \
		--progress=plain \
		.

	@echo "Build completed. Check the dist directory for output."