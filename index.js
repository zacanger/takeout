/*!
 * takeout | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/takeout
*/
'use strict';

var got = require('got');
var readFileDirectoryIndexFallback = require('readfile-directory-index-fallback');

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

  if (typeof cb !== 'function') {
    throw new TypeError('Expecting a callback function as a last argument.');
  }

  if (/^https?/.test(loc)) {
    got(loc, options, cb);
    return;
  }

  readFileDirectoryIndexFallback(loc, options, function(err, buf) {
    if (err) {
      got('http://' + loc, options, cb);
      return;
    }

    cb(err, buf);
  });
};
