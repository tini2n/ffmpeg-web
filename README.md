# ffmpeg-web

`ffmpeg-web` is a **browser-friendly** wrapper around an FFmpeg **WebAssembly** build. It manages loading FFmpeg into the browser at runtime, providing a convenient interface to run FFmpeg commands, handle progress events, and interact with the virtual filesystem (FS).

> **Status**: *Alpha / WIP* – This library is under active development. Expect potential changes to APIs or build scripts.
> Inspired by [ffmpeg.wasm ](https://github.com/ffmpegwasm/ffmpeg.wasm)

---

## Features

- **Dynamic Loading**: Load FFmpeg lazily by inserting a `<script>` tag or using a known CDN URL.
- **Progress & Logging Hooks**: Listen for FFmpeg progress updates (`progress`, `time`) and logging (`stdout`/`stderr`) in real time.
- **FS Operations**: Create directories, read/write files, check file existence, etc., within FFmpeg’s virtual filesystem.
- **Worker-Based**: Internally uses a web worker to offload FFmpeg operations from the main thread.
- **Customizable**: Provide your own `.wasm` and `.js` build if needed.

---

## Installation

*(TBD: Provide instructions if/when you publish on npm or require local usage. For now, you can include it via script tag from a static server or local build.)*

### Via Script Tag

```html
<script src="https://lab.geen.ee/geenee-ffmpeg/index.js"></script>
<script>
  // After the script loads, window.FFmpegWeb.FFmpeg is available
  const { FFmpeg } = window.FFmpegWeb;
  const ffmpeg = new FFmpeg();
  // ...
</script>
```

### Local Usage
```html
# Clone or download this repo
# Build / compile

# Serve the dist and reference index.js from your local server
<script src="http://localhost:3000/dist/index.js"></script>
```
---
## Quick Start

Below is a minimal snippet showing how to initialize FFmpeg in the browser and run a command:

```javascript
// 1) Dynamically load the ffmpeg-web script
await loadScript('https://lab.geen.ee/geenee-ffmpeg/index.js');
// => This sets window.FFmpegWeb

// 2) Create FFmpeg instance
const { FFmpeg } = window.FFmpegWeb;
const ffmpeg = new FFmpeg();

// 3) Load the core
await ffmpeg.load();

// 4) Listen to progress or log events if desired
ffmpeg.on('progress', ({ progress, time }) => {
  console.log('FFmpeg progress:', progress, time);
});
ffmpeg.on('log', ({ type, message }) => {
  console.log(`[FFmpeg ${type}]`, message);
});

// 5) Run a command – e.g. check version
const result = await ffmpeg.exec(['-version']);
console.log('FFmpeg version output:', result);

```

This approach:

1. Loads the ffmpeg-web script from a CDN.
2. Instantiates the FFmpeg class.
3. Calls .load() to initialize the worker & WASM core.
4. Executes commands like exec(['-i', 'file', ...]).

### Example: Using With a Custom Build

If you have your own .wasm or .js build (e.g., from the Docker scripts or custom config), you can specify those URLs:

```javascript
// ...
await loadScript('https://example.com/my-ffmpeg-build/index.js');

const { FFmpeg } = window.FFmpegWeb;
const ffmpeg = new FFmpeg();

await ffmpeg.load({
  coreURL: 'https://example.com/my-ffmpeg-build/core.js',
  wasmURL: 'https://example.com/my-ffmpeg-build/ffmpeg.wasm',
});
```

## API

### `new FFmpeg()`

Creates an instance of the FFmpeg wrapper.

### `ffmpeg.load([options])`

Initializes the internal worker and loads the FFmpeg core. Returns a promise that resolves to a boolean indicating success.

- **`options.coreURL`**: (string) URL to the FFmpeg `.js` core (if needed).
- **`options.wasmURL`**: (string) URL to the `.wasm` binary.

```ts
async load(options?: { coreURL?: string; wasmURL?: string }): Promise<boolean>
```

### `ffmpeg.exec(args: string[])`

Runs an FFmpeg command with the provided arguments (e.g., `['-version']`, `['-i', 'input.mp4', 'output.webm']`). Returns a promise with any stdout/stderr output aggregated (if available).

```ts
async exec(args: string[]): Promise<any>
```

---

## File System Helpers

- `createDir(path: string)`
- `writeFile(path: string, data: Uint8Array)`
- `readFile(path: string): Uint8Array`
- `deleteFile(path: string)`
- `listFiles(path: string): string[]`
- `fileExists(path: string): boolean`

These methods let you manipulate the in-memory filesystem:

```ts
await ffmpeg.createDir('/working');
await ffmpeg.writeFile('/working/sample.txt', myData);
const result = await ffmpeg.readFile('/working/sample.txt');
console.log(new TextDecoder().decode(result));
```

---

## Event Hooks

`ffmpeg.on(event, callback)`  
`ffmpeg.off(event, callback)`

- **`log`**: Receives object `{ type, message }` describing FFmpeg’s stdout/stderr logs.
- **`progress`**: Receives object `{ progress, time }`, typically from internal FFmpeg progress logs.

```ts
ffmpeg.on('log', ({ type, message }) => {
  console.log(`[${type}]`, message);
});
ffmpeg.on('progress', ({ progress, time }) => {
  console.log('Progress update:', progress, time);
});
```

---

## Building & Contributing

### Repository Structure

```bash
.
├── apps
│   └── ffmpeg-html        # Example app to test FFmpeg in browser
├── packages
│   ├── core               # The main "ffmpeg-web" wrapper code
│   └── wasm               # Scripts & Dockerfiles for building custom WASM
├── package.json
├── tsconfig.json
└── ...
```

### WASM Build Scripts

Inside `packages/wasm/config`, you’ll find scripts like `config-n-build.sh` and `generate-wasm.sh` which:

1. Configure FFmpeg for Emscripten.
2. Compile to `.wasm` + `.js` with the needed flags.

To run:

```bash
cd packages/wasm/config
./config-n-build.sh
./generate-wasm.sh
```

*(Requires Emscripten toolchain, Docker usage optional.)*

### Local Development

1. **Clone** this repository.
2. **Install** dependencies: `npm install` or `yarn`.
3. **Build**: Check the build steps in `core/webpack.config.js` or your bundler config.
4. **Run**: There may be an example under `apps/ffmpeg-html` you can serve with `node server.js`.

---

## Roadmap

- **Add Docker Workflow**: Provide a single `docker run ...` that outputs `.wasm` + `.js`.
- **Publish on npm**: So developers can import `ffmpeg-web` as a regular npm package.
- **Improve TS Declarations**: Provide `.d.ts` for advanced usage.

---


## Acknowledgments

- [FFmpeg](https://ffmpeg.org/) for the underlying technology.
- [Emscripten](https://emscripten.org/) for compiling C/C++ to WebAssembly.
- All external libraries and resources used in building this project.
