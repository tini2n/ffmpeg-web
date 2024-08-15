const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/index.ts',
    output: {
        filename: '[name].js',
        chunkFilename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        library: 'FFmpegWeb',
        libraryTarget: 'umd',
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.wasm$/,
                type: 'asset/resource',
            },
            {
                test: /\.worker\.ts$/,
                use: {
                    loader: 'worker-loader',
                    options: {
                        filename: '[name].[hash].js',
                    },
                },
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
            crypto: false,
            path: false,
            fs: false,
            os: false,
            worker_threads: false,
            perf_hooks: false,
        },
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [{ from: 'src/wasm/ffmpeg.wasm', to: './' }],
        }),
    ],
    experiments: {
        asyncWebAssembly: true,
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 3001,
    },
};
