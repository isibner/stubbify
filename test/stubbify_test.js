/*eslint-env node, mocha*/

var chai = require('chai');
var del = require('del');
var fs = require('fs');
var Parser = require('../parser.js');
var stubbify = require('../stubbify.js');

var assert = chai.assert;

describe('#stubbify', function () {
  var testFile = './test/fixtures/example.js';
  var stubbifiedFile = './test/fixtures/tmp/test/fixtures/example.js';
  var wantedFile = './test/fixtures/stubbified.js';
  var destinationDir = './test/fixtures/tmp';

  var readTestFile = function (fileToRead) {
    var data = fs.readFileSync(fileToRead);
    data = data + '';
    return data.split('\n');
  };

  var testFileLines, stubbifiedFileLines, wantedFileLines;

  before('read test, stubbified, and wanted files', function (done) {
    var beginningStub = Parser.DEFAULT_START_REGEX;
    var endingStub = Parser.DEFAULT_END_REGEX;

    stubbify(testFile, destinationDir, beginningStub, endingStub, function (err) {
      assert.isNull(err);
      testFileLines = readTestFile(testFile);
      stubbifiedFileLines = readTestFile(stubbifiedFile);
      wantedFileLines = readTestFile(wantedFile);
      done();
    });
  });

  afterEach(function () {
    del.sync(destinationDir);
  });

  it('stubs correctly', function () {
    assert.notDeepEqual(testFileLines, stubbifiedFileLines);
    assert.deepEqual(wantedFileLines, stubbifiedFileLines);
  });

  it('uses default regexes', function (done) {
    stubbify(testFile, destinationDir, undefined, undefined, function (err) {
      assert.isNull(err);
      var defaultRegExpTestLines = readTestFile(stubbifiedFile);
      assert.deepEqual(defaultRegExpTestLines, wantedFileLines);
      done();
    });
  });

  it('can take other regexes', function (done) {
    var beginStub = new RegExp('^.*\<\!\-{2}[\\s]*STUB[\\s]*\-{2}\>', 'i');
    var endStub = new RegExp('^.*\<\!\-{2}[\\s]*ENDSTUB[\\s]*\-{2}\>', 'i');
    var htmlTestFile = './test/fixtures/example.html';
    var wantedHtmlFile = './test/fixtures/stubbified.html';
    var stubbifiedHtmlTestFile = './test/fixtures/tmp/test/fixtures/example.html';
    stubbify(htmlTestFile, destinationDir, beginStub, endStub, function (err) {
      assert.isNull(err);
      var htmlTestLines = readTestFile(htmlTestFile);
      var stubbifiedHtmlTestLines = readTestFile(stubbifiedHtmlTestFile);
      var wantedHtmlLines = readTestFile(wantedHtmlFile);
      assert.notDeepEqual(htmlTestLines, stubbifiedHtmlTestLines);
      assert.deepEqual(wantedHtmlLines, stubbifiedHtmlTestLines);
      done();
    });
  });
});
