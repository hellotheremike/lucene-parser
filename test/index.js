var should = require('chai').should(),
    lucene_parser = require('../index');

describe('Lucene parser should', function() {
  it('convert hello:there into hello:"there"', function() {
    lucene_parser.setSearchTerm('hello:there');
    var lucene = lucene_parser.getFormattedSearchTerm();
    lucene.should.equal('hello:"there"');
  });
  it('not touch hello:"there"', function() {
    lucene_parser.setSearchTerm('hello:"there"');
    var lucene = lucene_parser.getFormattedSearchTerm();
    lucene.should.equal('hello:"there"');
  });

  it('handle ip adresses', function() {
    lucene_parser.setSearchTerm('192.168.0.1');
    var lucene = lucene_parser.getFormattedSearchTerm();
    lucene.should.equal('"192.168.0.1"');
  });

  it('handle email adresses', function() {
    lucene_parser.setSearchTerm('test.mail@test.com');
    var lucene = lucene_parser.getFormattedSearchTerm();
    lucene.should.equal('"test.mail@test.com"');
  });

  it('add wildcard to unregisred query-pattern', function() {
    lucene_parser.setSearchTerm('test string');
    var lucene = lucene_parser.getFormattedSearchTerm();
    lucene.should.equal('test* string*');
  });

  it('convert query into qurey with wildcard', function() {
    lucene_parser.setSearchTerm('test string');
    var lucene = lucene_parser.getFormattedSearchTerm();
    lucene.should.equal('test* string*');
  });

  it('handle underscores', function() {
    lucene_parser.setSearchTerm('test_string');
    var lucene = lucene_parser.getFormattedSearchTerm();
    lucene.should.equal('"test_string"');
  });

  it('handle hyphens', function() {
    lucene_parser.setSearchTerm('test-string');
    var lucene = lucene_parser.getFormattedSearchTerm();
    lucene.should.equal('"test-string"');
  });

  it('handle AND & OR with wildcard', function() {
    lucene_parser.setSearchTerm('this AND that OR them');
    var lucene = lucene_parser.getFormattedSearchTerm();
    lucene.should.equal('this* AND that* OR them*');
  });

  it('handle AND & OR without wildcard', function() {
    lucene_parser.setSearchTerm('"this" AND "that" OR "them"');
    var lucene = lucene_parser.getFormattedSearchTerm();
    lucene.should.equal('"this" AND "that" OR "them"');
  });

  it('handle parse full lucne-searchterm', function() {
    lucene_parser.setSearchTerm('this is-a test_with alot@mail.com 192.168.0.1 AND "this" OR that makes:no_sense at:"all in this life"');
    var lucene = lucene_parser.getFormattedSearchTerm();
    lucene.should.equal('this* "is-a" "test_with" "alot@mail.com" "192.168.0.1" AND "this" OR that* makes:"no_sense" at:"all in this life"');
  });

});