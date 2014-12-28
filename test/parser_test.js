/*eslint-env node, mocha */

var chai = require('chai');
var Transform = require('stream').Transform;
var Parser = require('../parser.js');

var assert = chai.assert;

describe('#parser', function () {
  var readable, writable;
  var parser;

  beforeEach(function () {
    parser = new Parser();
    readable = new Transform();
    writable = new Transform();
    writable.result = '';
    writable._transform = function (data, encoding, done) {
      if (data !== undefined) {
        data = data + '';
        this.result += data;
      }
      done();
    };
    readable.pipe(parser).pipe(writable);
  });

  it('takes in a normal string', function (done) {
    var testString = 'hello world';
    readable.push(testString);
    readable.end();
    writable.on('finish', function () {
      assert.strictEqual(testString + '\n', writable.result);
      done();
    });
  });

  it('does not take in beginStub', function (done) {
    var testString = '// STUB';
    readable.push(testString);
    readable.end();

    writable.on('finish', function () {
      assert.notStrictEqual(testString + '\n', writable.result);
      assert.strictEqual('', writable.result);
      done();
    });
  });

  it('is case insensitive', function (done) {
    var testString = '//stub';
    readable.push(testString);
    readable.end();

    writable.on('finish', function () {
      assert.notStrictEqual(testString + '\n', writable.result);
      assert.strictEqual('', writable.result);
      done();
    });
  });

  it('does not take in text after beginStub', function (done) {
    var testString = '//STUB';
    var testString2 = 'hello world';
    var testString3 = '//ENDSTUB';
    readable.push(testString);
    readable.push(testString2);
    readable.push(testString3);
    readable.end();

    var unparsedString = testString + '\n' +
                         testString2 + '\n' +
                         testString3 + '\n';
    writable.on('finish', function () {
      assert.notStrictEqual(unparsedString, writable.result);
      assert.strictEqual('', writable.result);
      done();
    });
  });

  it('does not take in text before beginStub in same line', function (done) {
    var testString = 'hello world//STUB';
    readable.push(testString);
    readable.end();

    writable.on('finish', function () {
      assert.notStrictEqual(testString + '\n', writable.result);
      assert.strictEqual('', writable.result);
      done();
    });
  });

  it('stubs out text directly before beginStub', function (done) {
    var testString = 'hello world //STUB';
    readable.push(testString);
    readable.end();

    writable.on('finish', function () {
      assert.notStrictEqual(testString + '\n', writable.result);
      assert.strictEqual('', writable.result);
      done();
    });
  });

  it('leaves in text above beginStub', function (done) {
    var testString = 'hello world';
    var testString2 = '//STUB';
    readable.push(testString);
    readable.push(testString2);
    readable.end();

    writable.on('finish', function () {
      assert.notStrictEqual(testString + '\n' + testString2 + '\n', writable.result);
      assert.strictEqual('hello world\n', writable.result);
      done();
    });
  });

  it('leaves in text below endStub', function (done) {
    var testString = '//STUB';
    var testString2 = '//ENDSTUB';
    var testString3 = 'hello world';
    readable.push(testString);
    readable.push(testString2);
    readable.push(testString3);
    readable.end();

    var unparsedString = testString + '\n' +
                         testString2 + '\n' +
                         testString3 + '\n';
    writable.on('finish', function () {
      assert.notStrictEqual(unparsedString, writable.result);
      assert.strictEqual('hello world\n', writable.result);
      done();
    });
  });

  it('can take in two beginStubs', function (done) {
    var testString = '//STUB';
    var testString2 = '//ENDSTUB';
    var testString3 = 'hello world';
    readable.push(testString);
    readable.push(testString);
    readable.push(testString2);
    readable.push(testString3);
    readable.end();

    var unparsedString = testString + '\n' +
                         testString + '\n' +
                         testString2 + '\n' +
                         testString3 + '\n';
    writable.on('finish', function () {
      assert.notStrictEqual(unparsedString, writable.result);
      assert.strictEqual('hello world\n', writable.result);
      done();
    });
  });

});
