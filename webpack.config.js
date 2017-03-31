const Webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CompressionPlugin = require("compression-webpack-plugin");
process.env.NODE_ENV = (process.env.NODE_ENV || '').trim();
const _IS_PROD_ = process.env.NODE_ENV === 'production';
console.log('************' + (_IS_PROD_ ? 'PRODUCTION' : 'DEVELOPER') + '************');

const _ROOT_URL_ = '/';//(_IS_PROD_ ? '/ui' : '') + '/dvm';
const _PROJECT_TITLE_ = 'fund-app';

const _ASSET_PATH_ = _ROOT_URL_ + '/Build/'; //путь к ресурсам относительно домена (пример: http://localhost{ASSET_PATH}image.jpg)
const _ROOT_URL_API_ = _ROOT_URL_ + '/api';

module.exports = {
    entry: [
        'ozon-ui-common/lib/Bootstrap',
        './App/Index.jsx',
        //'webpack-dev-server/client?http://localhost:3000',
    ],
    output: {
        // libraryTarget: "amd",
        path: __dirname + '/Build/',
        filename: '[name].js?v=[hash]',
        publicPath: _ASSET_PATH_
    },
    watch: !_IS_PROD_,

    //devtool: IS_PROD ? null : "eval-source-map",
    devtool: _IS_PROD_ ? null : "source-map",
    //devtool: IS_PROD ? null : "cheap-inline-module-source-map",
    //devtool: IS_PROD ? null : "cheap-module-eval-source-map",

    plugins: [

        new HtmlWebpackPlugin({
            title: _PROJECT_TITLE_,
            template: __dirname + '/Templates/Index.html',
            favicon: __dirname + '/Templates/favicon.ico',
            filename: 'index.html',
        }),
        new CleanWebpackPlugin(['Build'], {
            root: __dirname,
            verbose: true,
            dry: false
        }),

        new Webpack.DefinePlugin({
            _IS_PROD_: JSON.stringify(_IS_PROD_),
            _ROOT_URL_: JSON.stringify(_ROOT_URL_),
            _ROOT_URL_API_: JSON.stringify(_ROOT_URL_API_),
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            }
        }),

        !_IS_PROD_ ? null : new Webpack.optimize.DedupePlugin(),
        !_IS_PROD_ ? null : new Webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),

        new CompressionPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: /\.js$|\.gif$/,
            threshold: 10240,
            minRatio: 0.8
        })
    ].filter(x => !!x),
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'es2015', 'stage-0'],
                    plugins: [
                        'transform-object-assign',
                        ['babel-root-import', { 'rootPathSuffix': 'App' }], //позволяет указывать абсолютные пути при импорте модулей с префиксом '~'
                        ['transform-runtime'],
                        'transform-decorators-legacy'
                    ]
                }
            },

            { test: /\.(css|scss|less)$/, loader: 'style-loader!css-loader!less-loader' },
            // { test: /\.css$/, loaders: 
            //     [
            //         "style-loader", 
            //         "css-loader?importLoaders=1", 
            //         "postcss-loader"
            //     ] 
            // },

            // { test: /\.less$/, loader: "style-loader!css-loader!less-loader" },

            { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream' },
            { test: /\.(eot|png|ico|gif)(\?v=\d+\.\d+\.\d+)?$/, loader: 'file' },
            //{ test: /\.(jpe?g|gif)$/i, loader: 'url?limit=10000!img?progressive=true' },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml' }
        ]
    }
}