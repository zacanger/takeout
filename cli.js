#!/usr/bin/env node

/*!
 * takeout | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/takeout
*/

'use strict';

var argv = require('minimist')(process.argv.slice(2), {
  alias: {
    o: 'out',
    e: 'encoding',
    d: 'index',
    t: 'timeout',
    h: 'help',
    v: 'version'
  },
  string: ['_', 'encoding', 'index', 'out'],
  boolean: ['help', 'version']
});

if (argv.version) {
  console.log(require('./package.json').version);

} else if (argv.help || argv._.length === 0) {
  var chalk = require('chalk');
  var cyan = chalk.cyan;
  var gray = chalk.gray;
  var yellow = chalk.yellow;

  var pkg = require('./package.json');

  console.log([
    cyan(pkg.name) + gray(' v' + pkg.version),
    gray('https://github.com/shinnn/takeout'),
    pkg.description,
    '',
    'Usage1: ' + pkg.name + ' <file path | URL> --out <dest>',
    'Usage2: ' + pkg.name + ' <file path | URL> > <dest>',
    '',
    'Options:',
    yellow('--out,      -o <file path> ') + '  Write the result to a file (stdout by default)',
    yellow('--encoding, -e <encoding>  ') + '  Set encoding (same as Node\'s encoding option)',
    yellow('--index,    -d <filename>  ') + '  Set the filename of directory index',
    yellow('--no-index,                ') + '  Do not care about directory index',
    yellow('--timeout,  -t <ms>        ') + '  Set time after which the request will be aborted',
    yellow('--help,     -h             ') + '  Print usage information',
    yellow('--version,  -v             ') + '  Print version',
    ''
  ].join('\n'));

} else {
  var options = {};

  options.encoding = argv.encoding;

  if (argv['no-index']) {
    options.directoryIndex = false;
  } else {
    options.directoryIndex = argv.index;
  }

  options.timeout = argv.timeout;

  var takeout = require('./');
  takeout(argv._[0], options, function(err, body) {
    if (!err) {
      if (argv.out) {
        var outputFileSync = require('output-file-sync');
        try {
          outputFileSync(argv.out, body);
        } catch (e) {
          err = e;
        }
      } else {
        process.stdout.write(body);
      }
    }

    if (err) {
      process.stderr.write(err.stack + '\n', function() {
        process.exit(1);
      });
    }
  });
}
