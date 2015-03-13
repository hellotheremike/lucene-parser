/**
 * lucene-parser
 * https://github.com/brentertz/scapegoat
 *
 * Copyright (c) 2014 Brent Ertz
 * Licensed under the MIT license.
 */
var _ = require('lodash');

LuceneParser = function(sSearchTerm) {
    this.sOriginalSearchTerm = null;
    this.sFormattedSearchTerm = null;
    this.setSearchTerm( sSearchTerm );
};

LuceneParser.Patterns = {
    'HYPHEN': {
        'pattern': new RegExp( '.+-.+', 'g' ),
        'parse': function(sTerm) {
            return '"' + sTerm + '"';
        }
    },
    'PERIOD': {
        'pattern': new RegExp( '[.]', 'g' ),
        'parse': function(sTerm) {
            return '"' + sTerm + '"';
        }
    },
    'UNDERSCORE': {
        'pattern': new RegExp( '[_]', 'g' ),
        'parse': function(sTerm) {
            return '"' + sTerm + '"';
        }
    },
    'LUCENE': {
        'pattern': new RegExp( '(.+):(.+)' ),
        'parse': function(sTerm) {
            var sRegexp = LuceneParser.Patterns['LUCENE']['pattern'];
            var sParsedTerm = sTerm.match( sRegexp );
            var sValue = sParsedTerm[2];
            var sKey = sParsedTerm[1];

            if(sValue.charAt(sValue.lenght) === '"' && sValue.charAt(0) === '"'){
                return sKey + ':' + sValue + '';
            } else {
                return sKey + ':"' + sValue + '"';
            }
        }
    },
    'PATH': {
        'pattern': new RegExp( '(.+):/(.+)' ),
        'parse': function(sTerm) {
            return '"' + sTerm + '"';
        }
    },
    'OR': {
        'pattern': new RegExp( 'OR' ),
        'parse': function(sTerm) {
            return 'OR';
        }
    },
    'AND': {
        'pattern': new RegExp( 'AND' ),
        'parse': function(sTerm) {
            return 'AND';
        }
    }
};

LuceneParser.prototype.setSearchTerm = function(sSearchTerm) {
    var sTerm = sSearchTerm;
    if (!sTerm) {
        sTerm = '*';
    } else if (_.trim( sTerm ).length == 0) {
        sTerm = '*';
    }
    this.sOriginalSearchTerm = sTerm;
    this._parse();
};

LuceneParser.prototype.getFormattedSearchTerm = function() {
    return _.trim(this.sFormattedSearchTerm);
};
LuceneParser.prototype.getOriginalSearchTerm = function() {
    return this.sOriginalSearchTerm;
};

LuceneParser.prototype._parse = function() {
    this.sFormattedSearchTerm = '';
    var rTerms = this.sOriginalSearchTerm.split( ' ' );
    var oMatch = null;
    _.forEach( rTerms, function(sTerm) {
        oMatch = null;
        _.forEach( LuceneParser.Patterns, function(sRegexp, sKey) {
            if (sTerm.match( sRegexp['pattern'] )) {
                oMatch = sRegexp;
            }
        }, this );

        if (sTerm === '*') {
            this.sFormattedSearchTerm += sTerm;
        } else if (oMatch) {
            this.sFormattedSearchTerm += oMatch['parse']( sTerm ) + ' ';
        } else if(sTerm !== "") {
            this.sFormattedSearchTerm += sTerm + '* ';
        }
    }, this );
};

var parser = new LuceneParser();
module.exports = {
  setSearchTerm: function(query) {
    parser.setSearchTerm(query);
  },
  getFormattedSearchTerm: function() {
    return parser.getFormattedSearchTerm();
  },
  getOriginalSearchTerm: function() {
    return parser.getOriginalSearchTerm();
  }
};
