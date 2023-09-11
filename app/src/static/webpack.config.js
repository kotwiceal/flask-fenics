/**
 * @brief Configurate webpack assembling.
 */

const webpack = require('webpack')
const path = require('path')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    mode: 'development',
    entry: './src/index.jsx',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].js',
    },
    resolve: {
        alias: {
            component: path.resolve(__dirname, 'src/components')
        },
        extensions: ['.js', '.jsx']
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin(
            {
                template: path.resolve(__dirname, './src/index.html'),
                filename: 'index.html',
            }
        ),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.ProvidePlugin(
            {
                React: 'react',
                ReactDOM: 'react-dom'
            }
        ),
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(js|jsx)$/,
                exclude: '/node_modules/',
                use: ['babel-loader']
            }
        ],
    },
}