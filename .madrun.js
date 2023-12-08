'use strict';

const {run} = require('madrun');

module.exports = {
    'lint': () => 'putout .',
    'fix:lint': () => run('lint', '--fix'),
    'build': () => run('build:*'),
    'build:client': () => 'webpack --progress --mode production',
    'watch:client': () => run('build:client', '--watch'),
    'wisdom': () => run('build'),
};
