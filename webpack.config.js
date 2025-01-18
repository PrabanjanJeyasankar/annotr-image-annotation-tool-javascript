const { watch } = require('fs')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
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
                test: /\.module\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: { namedExport: false },
                        },
                    },
                ],
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
