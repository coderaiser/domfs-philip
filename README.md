# Philip

[Dom File System](https://developer.mozilla.org/en-US/docs/Web/API/FileSystem "Dom File System") processing library

## Install

```
npm i philip
```

## How to use?

```html
<script src="dist/philip.js"></script>
```

When used with `webpack`:

```js
import philip from 'philip';
```

```js
window.addEventListener('drop', (e) => {
    e.preventDefault();
    
    const [item] = e.dataTransfer.items;
    const entry = item.webkitGetAsEntry();
    
    const upload = philip(entry, (type, name, data /*, i, n,*/, callback) => {
        const error = null;
        
        switch(type) {
        case 'file':
            console.log('file', name, data);
            break;
        
        case 'directory':
            console.log('directory', name);
            break;
        }
        
        callback();
    });
    
    upload.on('error', (error) => {
        upload.abort();
        console.error(error);
    });
    
    upload.on('progress', (count) => {
        console.log(count);
    });
    
    upload.on('end', () => {
        console.log('done');
    });
});

window.addEventListener('dragover', (e) => {
    e.preventDefault();
});
```

## License

MIT
