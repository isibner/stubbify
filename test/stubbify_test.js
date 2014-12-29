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

  after(function () {
    del.sync(destinationDir + '*');
  });

  it('is different from original file', function () {
    assert.notDeepEqual(testFileLines, stubbifiedFileLines);
  });

  it('stubs correctly', function () {
    assert.deepEqual(wantedFileLines, stubbifiedFileLines);
  });

  it('uses default regexes', function (done) {
    var defaultRegExpTestDir = './test/fixtures/tmp2';
    var defaultRegExpTestFile = './test/fixtures/tmp2/test/fixtures/example.js';
    stubbify(testFile, defaultRegExpTestDir, undefined, undefined, function (err) {
      assert.isNull(err);
      var defaultRegExpTestLines = readTestFile(defaultRegExpTestFile);
      assert.deepEqual(defaultRegExpTestLines, wantedFileLines);
      done();
    });
  });

  it('can take other regexes', function (done) {
    var beginStub = new RegExp('^.*\<\!\-*[\\s]*STUB[\\s]*\-*\>', 'i');
    var endStub = new RegExp('^.*\<\!\-*[\\s]*ENDSTUB[\\s]*\-*\>', 'i');
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
