const path = require('path')
const slsw = require('serverless-webpack')

module.exports = {
    entry: slsw.lib.entries,
    target: 'node',
    stats: 'minimal',
    mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
    resolve: {
        extensions: ['.js'],
    },
    output: {
        library: {
            type: 'commonjs2',
        },
        path: path.join(__dirname, '.webpack'),
        filename: '[name].js',
    },
}
