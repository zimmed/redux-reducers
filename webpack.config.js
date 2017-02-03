const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const babel = (JSON).parse(fs.readFileSync('./.babelrc'));
const pkg = require('./package.json');

let thing = {
    entry: {
        app: './src/index.js',
        vendor: _.keys(pkg.dependencies)
    },
    devtool: 'source-map',
    output: {
        path: path.join(__dirname, 'build'),
        filename: `${pkg.name}.bundle.min.js`
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015']
                }
            }
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename: 'vendor.bundle.min.js'})
    ],
    resolve: {
        extensions: ['.js', '.json']
    }
};

console.log('thing', thing)

module.exports = thing;
