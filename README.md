# takeout

[![NPM version](https://img.shields.io/npm/v/takeout.svg?style=flat)](https://www.npmjs.com/package/takeout)
[![Build Status](https://travis-ci.org/shinnn/takeout.svg?branch=master)](https://travis-ci.org/shinnn/takeout)
[![Build status](https://ci.appveyor.com/api/projects/status/jcn6afxqfy27y69r?svg=true)](https://ci.appveyor.com/project/ShinnosukeWatanabe/takeout)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/takeout.svg?style=flat)](https://coveralls.io/r/shinnn/takeout)
[![Dependency Status](https://img.shields.io/david/shinnn/takeout.svg?style=flat&label=deps)](https://david-dm.org/shinnn/takeout)
[![devDependency Status](https://img.shields.io/david/dev/shinnn/takeout.svg?style=flat&label=devDeps)](https://david-dm.org/shinnn/takeout#info=devDependencies)

A [Node] module to get the file contents, seamlessly available for both local file system and HTTP(S)

```javascript
var takeout = require('takeout');

// Reading a local file
takeout('path/to/local/file', {encoding: 'utf8'}, function(err, body) {
  if (err) {
    throw err;
  }
  
  console.log(body);
});

// GET request if the location is URL
takeout('http://nodejs.org', {encoding: 'utf8'}, function(err, body, res) {
  if (err) {
    throw err;
  }

  console.log(res.statusCode);
  console.log(body);
});
```

## Installation

[Use npm](https://docs.npmjs.com/cli/install).

```sh
npm install takeout
```

## API

```javascript
var takeout = require('takeout');
```

### takeout(*location*,[ *options*,] *callback*)

*location*: `String` (local file path or URL)  
*options*: `Object`  
*callback*: `Function`

If the *location* is a local file path, it reads the file with [fs.readFile](http://nodejs.org/api/fs.html#fs_fs_readfile_filename_options_callback). If the *locatiandon* is a URL, it makes a GET request to the URL and grabs its response, using [got](https://github.com/sindresorhus/got). 

```javascript
// `http` and `https` scheme is optional.
takeout('www.npmjs.org', function(err, body, res) {
  if (err) {
    throw err;
  }

  console.log(res.statusCode);
  console.log(body);
});
```

#### options

In addition to the following, all options for [fs.readFile](http://nodejs.org/api/fs.html#fs_fs_readfile_filename_options_callback) and [got](https://github.com/sindresorhus/got#options) are available.

##### options.encoding

Type: `String` or `null`  
Default: `null` (In other words, the content is returned as a [`Buffer`][buffer] by default.)

Directly passed to [fs.readFile](http://nodejs.org/api/fs.html#fs_fs_readfile_filename_options_callback) options or [`setEncoding`](http://nodejs.org/api/stream.html#stream_readable_setencoding_encoding) of the response data.

##### options.directoryIndex

Type: `Boolean` or `String` of filename  
Default: `index.html`

When the path indicates a local directory, it reads `index.html` or a file with the specified filename immediately under the directory.

`false` disables this feature.

```javascript
// |
// +- dist
//     +- index.html ('foo')
//     +- home.html ('bar')

takeout('dist', function(err, buf) {
  !err; //=> true
  buf.toString(); //=> 'foo'
});

takeout('dist', {directoryIndex: 'home.html'}, function(err, buf) {
  !err; //=> true
  buf.toString(); //=> 'bar'
});

takeout('dist', {directoryIndex: false}, function(err) {
  err.code; //=> 'ENOTFOUND'
});
```

#### callback(*error*, *body*, *response*)

*error*: `Error` if it fails to get the contents, otherwise `null`  
*body*: [`Buffer`][buffer] or `String` (according to [`options.encoding`](#optionsencoding))  
*response*: `Object` ([response object](http://nodejs.org/api/http.html#http_http_incomingmessage)) if the content is got via HTTP(S), otherwise `undefined`

## CLI

You can use this module as a CLI tool by installing it [globally](https://docs.npmjs.com/files/folders#global-installation).

```sh
npm install -g takeout
```

### Usage

```sh
Usage1: takeout <file path | URL> --out <dest>
Usage2: takeout <file path | URL> > <dest>

Options:
--out,      -o <file path>   Write the result to a file (stdout by default)
--encoding, -e <encoding>    Set encoding (same as Node's encoding option)
--index,    -d <filename>    Set the filename of directory index
--no-index,                  Do not care about directory index
--timeout,  -t <ms>          Set time after which the request will be aborted
--help,     -h               Print usage information
--version,  -v               Print version
```

You can do almost the same thing with [`cat`](http://tldp.org/LDP/abs/html/basic.html#CATREF) and [`curl`](http://curl.haxx.se/docs/). But this tool works on various environments, as long as they supports [Node].

## License

Copyright (c) [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT License](./LICENSE).

[buffer]: http://nodejs.org/api/buffer.html#buffer_class_buffer
[Node]: http://nodejs.org/
