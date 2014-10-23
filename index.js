/*!
 * takeout | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/takeout
*/
'use strict';

var fs = require('fs');
var path = require('path');

var got = require('got');
var isFile = require('is-file');
var isHttpOrHttps = require('is-http');

module.exports = function takeout(loc, options, cb) {
  if (typeof cb !== 'function') {
    cb = options;
    options = {};
  } else if (!options) {
    options = {};
  }

  if (options.encoding === undefined) {
    options.encoding = null;
  }

  if (options.directoryIndex === undefined) {
    options.directoryIndex = true;
  }

  if (typeof cb !== 'function') {
    throw new TypeError('Expecting a callback function as the last argument.');
  }

  if (!isHttpOrHttps(loc)) {
    if (fs.existsSync(loc)) {
      if (fs.statSync(loc).isFile()) {
        fs.readFile(loc, options, cb);
        return;
      }

      if (options.directoryIndex) {
        var directoryIndex;
        if (options.directoryIndex === true) {
          directoryIndex = 'index.html';
        } else {
          directoryIndex = options.directoryIndex;
        }

        directoryIndex = path.join(loc, directoryIndex);

        if (isFile.sync(directoryIndex)) {
          fs.readFile(directoryIndex, options, cb);
          return;
        }
      }
    }

    got('http://' + loc, options, cb);
    return;
  }

  got(loc, options, cb);
};
