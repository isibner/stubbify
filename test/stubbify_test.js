var fs = require('fs');
var should = require('should');
var parser = require('../parser.js');
var stubbify = require('../stubbify.js');

describe('stubbify', function() {
  var testFile = './test/fixtures/example.js';
  var stubbifiedFile = './stubbified/test/fixtures/example.js';
  var destination = './stubbified';
  var found = 'was not found';
  var beginningStub = parser.DEFAULT_START_REGEX;
  var endingStub = parser.DEFAULT_END_REGEX;

  beforeEach(function() {
    found = 'was not found';
  });

  before(function() {
    readTestFile(testFile);
  });

  describe('there are no false positives', function() {
    it('there are stubs to begin with', function(done) {
      found.should.equal('was found');
      done();
    });
  });

  before(function() {
    stubbify(testFile, destination, beginningStub, endingStub);
    readTestFile(stubbifiedFile);
  });

  describe('stubs correctly', function() {
    it('stubs correctly', function(done) {
      found.should.equal('was not found');
      done();
    });
  });

  var readTestFile = function(fileToRead) {
    fs.readFile(fileToRead, function(err, data) {
      if(err) throw err;

      data = data + '';
      var lines = data.split('\n');
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if(beginningStub.test(line) || endingStub.test(line)) {
          found = 'was found';
        }
      }
    });
  };

});
