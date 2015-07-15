/* global Emitify */
/* global findit */

(function(global) {
    'use strict';
    
    if (typeof module !== 'undefined' && module.exports)
        module.exports  = Philip;
    else
        global.philip   = Philip;
    
    function Philip(entries, processingFn) {
        var array,
            self,
            emitter;
        
        if (!(this instanceof Philip))
            return new Philip(entries, processingFn);
        
        if (typeof processingFn !== 'function')
            throw Error('processingFn should be function!');
        
        if (Array.isArray(entries))
            array = entries;
        else
            array = [entries];
        
        emitter = Emitify();
        self    = this;
        
        this._i             = 0;
        this._n             = 0;
        this._emitter       = emitter;
        this._processingFn  = processingFn;
        
        this._find(array, function(files, dirs) {
            self._files = files;
            self._dirs  = dirs;
            self._n     = files.length + dirs.length;
            self._data  = {};
            
            self._getFiles(files, self._data, function() {
                self._process();
            });
        });
        
        return emitter;
    }
    
    Philip.prototype._process    = function() {
        var el,
            data,
            self    = this,
            name    = self._dirs.shift(),
            type    = 'directory';
        
        if (!name) {
            type    = 'file';
            el      = self._files.shift();
            
            if (el) {
                name    = el.fullPath;
                data    = self._data[name];
            }
        }
        
        if (!name) {
            self._emitter.emit('end');
        } else {
            self._processingFn(type, name, data, function(error) {
                ++self._i;
                
                if (error)
                    self._emitter.emit('error', error);
                else
                    self._process();
                
                self._progress();
            });
        }
    };
    
    Philip.prototype._progress = function() {
        var value = Math.round(this._i * 100 / this._n);
        
        this._emitter.emit('progress', value);
    };
    
    Philip.prototype._getFiles = function(files, obj, callback) {
        var current,
            self    = this;
        
        files   = files.slice();
        current = files.shift();
        
        if (!obj)
            obj = {};
        
        if (!current)
            callback(null, obj);
        else
            current.file(function(file) {
                var name    = current.fullPath;
                
                obj[name]   = file;
                
                self._getFiles(files, obj, callback);
            });
    };
    
    Philip.prototype._find = function(entries, fn) {
        [].forEach.call(entries, function(entry) {
            var files       = [],
                dirs        = [],
                finder      = findit(entry);
            
            finder.on('directory', function(name) {
                dirs.push(name);
            });
            
            finder.on('file', function(name, current) {
                files.push(current);
            });
            
            finder.on('end', function() {
                fn(files, dirs);
            });
        });
    };
})(this);
