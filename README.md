# takeout

[![Build Status](https://travis-ci.org/shinnn/takeout.svg?branch=master)](https://travis-ci.org/shinnn/takeout)
[![Build status](https://ci.appveyor.com/api/projects/status/jcn6afxqfy27y69r?svg=true)](https://ci.appveyor.com/project/ShinnosukeWatanabe/takeout)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/takeout.svg)](https://coveralls.io/r/shinnn/takeout)
[![Dependency Status](https://david-dm.org/shinnn/takeout.svg)](https://david-dm.org/shinnn/takeout)
[![devDependency Status](https://david-dm.org/shinnn/takeout/dev-status.svg)](https://david-dm.org/shinnn/takeout#info=devDependencies)

A [Node][node] module to get the file contents, seamlessly available for both local file system and HTTP(S)

```javascript
var takeout = require('takeout');

// Reaging a local file
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

[![NPM version](https://badge.fury.io/js/takeout.svg)](https://www.npmjs.org/package/takeout)

[Use npm](https://www.npmjs.org/doc/cli/npm-install.html).

```sh
npm install takeout
```

## API

```javascript
var takeout = require('takeout');
```

### takeout(*location*,[ *options*,] *callback*)

*location*: `String` (local file path or URL)  
*filePath*: `Object`  
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

In addition to the following, all options for [fs.readFile](http://nodejs.org/api/fs.html#fs_fs_readfile_filename_options_callback) and [http.request](http://nodejs.org/api/http.html#http_http_request_options_callback) are available.

##### options.encoding

Type: `String` or `null`  
Default: `null` (In other words, the content is returned as a `Buffer` by default.)

Directly passed to [fs.readFile](http://nodejs.org/api/fs.html#fs_fs_readfile_filename_options_callback) options or [`setEncoding`](http://nodejs.org/api/stream.html#stream_readable_setencoding_encoding) of the response data.

##### options.directoryIndex

Type: `Boolean` or `String` of filename  
Default: `true`

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
*body*: `Buffer` or `String` (according to [`options.encoding`](#optionsencoding))  
*response*: `Object` ([response object](http://nodejs.org/api/http.html#http_http_incomingmessage)) if the content is got via HTTP/HTTPS, otherwise `undefined`

## CLI

You can use this module as a CLI tool by installing it [globally](https://www.npmjs.org/doc/files/npm-folders.html#global-installation).

```sh
npm install -g takeout
```

### Usage

```sh
Usage1: takeout <file path | URL> --out <dest>
Usage2: takeout <file path | URL> > <dest>

Options:
--out,      -o <file path>  Write the result to a file (stdout by default)
--encoding, -e <encoding>   Set encoding (same as Node's encoding option)
--index,    -d <filename>   Set the filename of directory index
--no-index,                 Do not care about directory index
--help,     -h              Print usage information
--version,  -v              Print version
```

You can do almost the same thing with [`cat`](http://tldp.org/LDP/abs/html/basic.html#CATREF) and [`curl`](http://curl.haxx.se/docs/). But this tool works on various environments, as long as they supports [Node][node].

## License

Copyright (c) 2014 [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT License](./LICENSE).

[node]: http://nodejs.org/
