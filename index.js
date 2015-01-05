/*!
 * takeout | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/takeout
*/
'use strict';

var got = require('got');
var readFileDirectoryIndexFallback = require('readfile-directory-index-fallback');

function get(url, options, cb) {
  if (options.encoding === undefined) {
    options.encoding = null;
  }

  got(url, options, cb);
}

module.exports = function takeout(loc, options, cb) {
  if (typeof cb !== 'function') {
    cb = options;
    options = {};
  } else if (!options) {
    options = {};
  }

  if (typeof cb !== 'function') {
    throw new TypeError(
      cb +
      ' is not a function. The last argument to takeout must be a function.'
    );
  }

  if (/^https?/.test(loc)) {
    get(loc, options, cb);
    return;
  }

  readFileDirectoryIndexFallback(loc, options, function(err, buf) {
    if (err) {
      get(loc, options, cb);
      return;
    }

    cb(null, buf);
  });
};
