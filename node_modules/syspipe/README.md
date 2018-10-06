# Syspipe
node.js module to access operating system native pipe implementation. For more info check  "man 2 pipe"

This interface simply gives you the ability to call the operating system `pipe` system call. It will return an object with the input and output file descriptors

```
$ node
> require('syspipe').pipe()
{ read: 13, write: 14 }
```

This is generally not useful for most node program, as the pipe has a limited size imposed by the os, and if you exceed that your program will block until it is read -- and since node is single threaded by nature, you will not be able to read from the pipe and you end up deadlocked.

However where this extension is useful, is if you have a native threaded extension which requires data to be read from a FD, then is a handy way of passing data from the node envirionment to the extension.


# Install
```
$ npm install syspipe
```

# Usage
```js
var fs = require('fs');
var syspipe = require('syspipe');

var buf = new Buffer(1024);
var read = 0;

var pipe = syspipe.pipe();
fs.writeSync(pipe.write, 'hello world');
read = fs.readSync(pipe.read, buf, 0, 1024, null);

console.log('Pipe read: ' + buf.slice(0, read).toString());
```

Native pipes can also be useful to interact with child processes executed from node.js in a sync manner.

Example:
```js
var proc = require('child_process');
var fs = require('fs');
var syspipe = require('syspipe');

var buf = new Buffer(1024);
var read = 0;


var pipe = syspipe.pipe();
var options = { stdio: ['pipe', pipe.write, 'pipe'] };
var ls = proc.spawn('r2', ['-q0', '/bin/ls'], options);

var OUT = pipe.read;
var IN = ls.stdin['_handle'].fd;


read = fs.readSync(OUT, buf, 0, 1024, null);
console.log('[+] read ' + read + ' bytes');

fs.writeSync(IN, 'f\n');
read = fs.readSync(OUT, buf, 0, 1024, null);
var result = buf.slice(0, read-1);

console.log(result.toString());
console.log('[+] Read: ' + read + ' bytes');

fs.writeSync(IN, 'q\n');
```
