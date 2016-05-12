'use strict';

var spawn = require('child_process').spawn;
var http = require('http');
var path = require('path');

var readRemoveFile = require('read-remove-file');
var takeout = require('..');
var test = require('tape');

var pkg = require('../package.json');

var fixtureDir = 'test/fixtures';

test('takeout()', function(t) {
  t.plan(18);

  takeout(path.join(fixtureDir, 'fixture.jpg'), function(err, buf) {
    t.strictEqual(
      err,
      null,
      'should read a local file.'
    );
    t.ok(Buffer.isBuffer(buf), 'should pass a buffer of a file to the callback.');
  });

  takeout(fixtureDir, {encoding: 'utf8'}, function(err, body) {
    t.strictEqual(
      err,
      null,
      'should read index.html of a local directory.'
    );
    t.equal(body, 'foo\n', 'should pass a content of a local file to the callback.');
  });

  takeout(fixtureDir, {directoryIndex: 'fixture.html'}, function(err) {
    t.strictEqual(
      err,
      null,
      'should read the directory index file of a local directory, using `directoryIndex` option.'
    );
  });

  takeout('http://www.example.org/', undefined, function(err, buf, res) {
    t.strictEqual(err, null, 'should get a response of HTTP.');
    t.ok(Buffer.isBuffer(buf), 'should pass a buffer of a HTTP response to the callback.');
    t.equal(res.statusCode, 200, 'should pass a server response to the callback.');
  });

  takeout('https://www.npmjs.com/', function(err) {
    t.error(err, 'should get a response of HTTPS.');
  });

  takeout('cssnext.github.io', {encoding: 'utf8'}, function(err, body) {
    t.strictEqual(
      err,
      null,
      'should get a response of HTTP even if the URL doesn\'t have protocol.'
    );
    t.equal(typeof body, 'string', 'should pass options to the `got` module.');
  });

  var server = http.createServer(function(request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('foo');
  }).listen(34567, function() {
    takeout('localhost:34567', function(err) {
      t.strictEqual(err, null, 'should get a response of local server.');
      server.close();
    });
  });
  server.timeout = 8000;

  takeout('foo', function(err) {
    t.equal(
      err.code,
      'ENOTFOUND',
      'should pass an error to the callback when the location doesn\'t exist.'
    );
  });

  takeout('test', function(err) {
    t.equal(
      err.code,
      'ENOTFOUND',
      'should pass an error to the callback ' +
      'when the directory exists but index.html doesn\'t exist.'
    );
  });

  takeout(fixtureDir, {directoryIndex: false}, function(err) {
    t.equal(
      err.code,
      'ENOTFOUND',
      'should pass an error to the callback ' +
      'when the directory exists but `directoryIndex` option is disabled.'
    );
  });

  takeout('http://n.ot.fo/un.d', function(err) {
    t.equal(
      err.code,
      'ENOTFOUND',
      'should pass an error to the callback when the URL doesn\'t exist.'
    );
  });

  t.throws(
    takeout.bind(null, path.join(fixtureDir, 'fixture.html')),
    /TypeError.*undefined is not a function/,
    'should throw an error when it doesn\'t take a callback function.'
  );

  t.throws(
    takeout.bind(null, ['foo'], t.fail),
    /TypeError.*must be a string/,
    'should throw a type error when the first argument is not a string.'
  );
});

test('"takeout" command', function(t) {
  t.plan(17);

  var cmd = function(args) {
    var cp = spawn('node', [pkg.bin].concat(args), {
      stdio: [process.stdin, null, null]
    });
    cp.stdout.setEncoding('utf8');
    cp.stderr.setEncoding('utf8');
    return cp;
  };

  cmd([path.join(fixtureDir, 'index.html')]).stdout.on('data', function(output) {
    t.equal(output, 'foo\n', 'should read a local file.');
  });

  cmd([path.join(fixtureDir, 'index.html'), '--out', 'tmp/tmp.txt']).on('close', function() {
    readRemoveFile('tmp/tmp.txt', 'utf8', function(err, buf) {
      t.deepEqual([err, buf], [null, 'foo\n'], 'should write a file using --out flag.');
    });
  });

  cmd([path.join(fixtureDir, 'index.html'), '-o', 'tmp.txt']).on('close', function() {
    readRemoveFile('tmp.txt', 'utf8', function(err, buf) {
      t.deepEqual([err, buf], [null, 'foo\n'], 'should use -o as an alias of --out.');
    });
  });

  cmd([fixtureDir, '--encoding', 'hex']).stdout.on('data', function(output) {
    t.equal(output, '666f6f0a', 'should set encoding using --encoding flag.');
  });

  cmd([fixtureDir, '-e', 'base64']).stdout.on('data', function(output) {
    t.equal(output, 'Zm9vCg==', 'should use -e as an alias of --encoding.');
  });

  cmd([fixtureDir, '--index', 'fixture.html']).stdout.on('data', function(output) {
    t.equal(output, 'bar\n', 'should set directory index using --index flag.');
  });

  cmd([fixtureDir, '-d', 'fixture.html']).stdout.on('data', function(output) {
    t.equal(output, 'bar\n', 'should use -d as an alias of --index.');
  });

  cmd(['--help']).stdout.on('data', function(output) {
    t.ok(/Usage/.test(output), 'should print usage information using --help flag.');
  });

  cmd(['-h']).stdout.on('data', function(output) {
    t.ok(/Usage/.test(output), 'should use -h as an alias of --help.');
  });

  cmd(['--version']).stdout.on('data', function(output) {
    t.equal(output, pkg.version + '\n', 'should print version using --version flag.');
  });

  cmd(['-v']).stdout.on('data', function(output) {
    t.equal(output, pkg.version + '\n', 'should use -v as an alias of --version.');
  });

  cmd([]).stdout.on('data', function(output) {
    t.ok(/Usage/.test(output), 'should print usage information when it takes no arguments.');
  });

  var notFoundErr = '';

  cmd([fixtureDir, '--no-index'])
    .on('close', function(code) {
      t.notEqual(code, 0, 'should fail when it cannot read the file.');
      t.ok(
        /ENOTFOUND/.test(notFoundErr),
        'should disable `directoryIndex` option using --no-index flag.'
      );
    })
    .stderr.on('data', function(output) {
      notFoundErr += output;
    });

  var timeoutErr = '';

  cmd(['http://www.example.org/', '--timeout', '1'])
    .on('close', function(code) {
      t.notEqual(code, 0, 'should fail on connection timeout.');
      t.ok(
        /Connection timed out/.test(timeoutErr),
        'should set time after which the request will be aborted using --timeout option.'
      );
    })
    .stderr.on('data', function(output) {
      timeoutErr += output;
    });

  cmd(['http://www.example.org/', '-t', '1']).on('close', function(code) {
    t.notEqual(code, 0, 'should use -t as an alias of --timeput.');
  });
});
