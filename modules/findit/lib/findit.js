/* global Emitify */

(function(global) {
    'use strict';
    
    if (typeof module !== 'undefined' && module.exports)
        module.exports  = findit;
    else
        global.findit   = findit;
    
    function findit(entry) {
        var emitter = Emitify();
        
        setTimeout(function() {
            new FindIt(emitter, entry);
        }, 0);
        
        return emitter;
    }
    
    function FindIt(emitter, entry) {
        this._dirs  = 0;
        this._first = true;
        
        this._find(emitter, enry);
    }
    
    FindIt.prototype._find = function(emitter, entry) {
        var self = this;
        
        if (entry.isFile) {
            emitter.emit('file', entry.fullPath, entry);
            
            if (self._first)
                emitter.emit('end');
        } else {
            if (self._first)
                self._first = false;
            
            emitter.emit('directory', entry.fullPath, entry);
            
            ++self._dirs;
            
            entry.createReader()
                .readEntries(function(entries) {
                    [].filter.call(entries, function(entry) {
                        find(emitter, entry);
                    });
                    
                    --self._dirs;
                    
                    if (!self._dirs)
                        emitter.emit('end');
                });
            }
    }
})(this);
