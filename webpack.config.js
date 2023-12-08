'use strict';

const path = require('path');
const dir = './lib';

const dist = path.resolve(__dirname, 'dist');
const devtool = 'source-map';

const rules = [{
    test: /\.js$/,
    exclude: /node_modules/,
    loader: 'babel-loader',
}];

const filename = `[name].min.js`;

module.exports = {
    devtool,
    entry: {
        philip: `${dir}/philip.js`,
    },
    output: {
        library: 'philip',
        filename,
        path: dist,
        pathinfo: true,
        libraryTarget: 'var',
        devtoolModuleFilenameTemplate,
    },
    externals: [externals],
    module: {
        rules,
    },
};

function externals({request}, fn) {
    const list = [];
    
    if (list.includes(request))
        return fn(null, request);
    
    fn();
}

function devtoolModuleFilenameTemplate(info) {
    const resource = info.absoluteResourcePath.replace(__dirname + path.sep, '');
    return `file://philip/${resource}`;
}
