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
    h: 'help',
    v: 'version'
  },
  string: ['_', 'encoding', 'index', 'out'],
  boolean: ['help', 'version']
});

var pkg = require('./package.json');

if (argv.version) {
  console.log(pkg.version);

} else if (argv.help || argv._.length === 0) {
  var chalk = require('chalk');

  console.log([
    chalk.cyan(pkg.name) + chalk.gray(' v' + pkg.version),
    pkg.description,
    chalk.gray('https://github.com/shinnn/takeout'),
    '',
    'Usage1: ' + pkg.name + ' <file path | URL> --out <dest>',
    'Usage2: ' + pkg.name + ' <file path | URL> > <dest>',
    '',
    'Options:',
    chalk.yellow('--out,      -o <file path>') + '  Write the result to a file (stdout by default)',
    chalk.yellow('--encoding, -e <encoding> ') + '  Set encoding (same as Node\'s encoding option)',
    chalk.yellow('--index,    -d <filename> ') + '  Set the filename of directory index',
    chalk.yellow('--no-index,               ') + '  Do not care about directory index',
    chalk.yellow('--help,     -h            ') + '  Print usage information',
    chalk.yellow('--version,  -v            ') + '  Print version',
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

  var takeout = require('./');
  takeout(argv._[0], options, function(err, body) {
    if (err) {
      throw err;
    }

    if (argv.out) {
      var outputFileSync = require('output-file-sync');
      outputFileSync(argv.out, body);
    } else {
      process.stdout.write(body);
    }
  });
}
