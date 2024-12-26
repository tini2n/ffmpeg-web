recorder:
	@echo 'Installing dependencies...'
	git clone https://code.videolan.org/videolan/x264.git $(INSTALL_DIR)/x264
	cp $(FFMPEG_DIR)/deps/x264.sh $(INSTALL_DIR)/x264/build.sh
	cd $(INSTALL_DIR)/x264 && ./build.sh

	cd $(FFMPEG_DIR)
	@echo 'Configure FFmpeg for recorder...'
	./config-n-build.sh

	@echo 'Configured. Building wasm...'
	./generate-wasm.sh