const { watch } = require('fs')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
    favicon: './src/assets/annotr_logo.svg',
    template: path.resolve(__dirname, 'index.html'),
    filename: 'index.html',
    inject: 'body',
})

module.exports = {
    entry: './src/app.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: { namedExport: false },
                        },
                    },
                ],
                include: /\.module\.css$/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
                exclude: /\.module\.css$/,
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                use: 'url-loader',
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loader: 'file-loader',
            },
        ],
    },
    // devtool: 'source-map',
    devtool: 'inline-source-map',

    devServer: {
        static: {
            directory: path.join(__dirname, '.'),
        },
        watchFiles: ['src//.js'],
        open: true,
        host: '127.0.0.1',
        port: 8080,
        hot: true,
        liveReload: true,
    },
    cache: false,
    resolve: {
        extensions: ['.js'],
    },
    mode: 'development',
    target: 'web',
    watch: true,
    watchOptions: {
        ignored: /node_modules/,
    },
    plugins: [HTMLWebpackPluginConfig],
}
