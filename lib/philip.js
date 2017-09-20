'use strict';

const findit = require('domfs-findit');
const Emitify = require('emitify/legacy');
const itchy = require('itchy/legacy');
const inherits = require('inherits');

module.exports = Philip;

inherits(Philip, Emitify);

function Philip(entries, processingFn) {
    if (!(this instanceof Philip))
        return new Philip(entries, processingFn);
    
    if (typeof processingFn !== 'function')
        throw Error('processingFn should be function!');
    
    Emitify.call(this);
    
    const array = Array.isArray(entries) ? entries : [entries];
    
    this._i             = 0;
    this._n             = 0;
    this._processingFn  = processingFn;
    this._pause         = false;
    this._prev          = 0;
    
    this._find(array, (files, dirs) => {
        this._files = files;
        this._dirs  = dirs;
        this._n     = files.length + dirs.length;
        this._data  = {};
        
        this._getFiles(files, this._data, () => {
            this._process();
        });
    });
}

Philip.prototype._process    = () => {
    const argsLength = this._processingFn.length;
    const fn = (error) => {
        ++this._i;
        
        if (error) {
            this.emit('error', error);
            this.pause();
        }
        
        this._process();
        this._progress();
    };
    
    let data;
    let name = this._dirs.shift();
    let type = 'directory';
    
    if (!name) {
        type    = 'file';
        const el = this._files.shift();
        
        if (el) {
            name    = el.fullPath;
            data    = this._data[name];
        }
    }
    
    if (!name)
        return this.emit('end');
    
    let args;
    if (!this._pause) {
        switch(argsLength) {
        default:
            args = [type, name, data];
            break;
        
        case 6:
            args = [type, name, data, this._i, this._n];
            break;
        }
        
        args.push(fn);
        
        this._processingFn(...args);
    }
};

Philip.prototype.pause = function() {
    this._pause = true;
};

Philip.prototype.continue = function() {
    if (this._pause) {
        this._pause = false;
        this._process();
    }
};

Philip.prototype.abort = function() {
    this._files = [];
    this._dirs  = [];
    
    this._process();
};

Philip.prototype._progress = function() {
    const value = Math.round(this._i * 100 / this._n);
    
    if (value !== this._prev) {
        this._prev = value;
        this.emit('progress', value);
    }
};

Philip.prototype._getFiles = function(files, obj, callback) {
    const filesList = files.slice();
    const current = filesList.shift();
    
    if (!current)
        return callback(null, obj);
    
    current.file((file) => {
        const name = current.fullPath;
        
        obj[name] = file;
        
        this._getFiles(filesList, obj, callback);
    });
};

Philip.prototype._find = function(entries, fn) {
    const files = [];
    const dirs = [];
    
    itchy(entries, (entry, callback) => {
        const finder  = findit(entry);
        
        finder.on('directory', (name) => {
            dirs.push(name);
        });
        
        finder.on('file', (name, current) => {
            files.push(current);
        });
        
        finder.on('end', () => {
            callback();
        });
    }, () => {
        fn(files, dirs);
    });
};

