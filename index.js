/**
 * lucene-parser
 * https://github.com/brentertz/scapegoat
 *
 * Copyright (c) 2015 Mikael Hallgren
 * Licensed under the MIT license.
 */
var _ = require('lodash');

LuceneParser = function(sSearchTerm) {
    this.sOriginalSearchTerm = null;
    this.sFormattedSearchTerm = null;
    this.setSearchTerm(sSearchTerm);
    this.oLuceneTemplateCache = {};
};

/*
 * The order of the patterns are important. The match by priority because the patterns may match on similar parts of a string.
 */
LuceneParser.SanitizePatterns = {
    'LUCENE': {
        'pattern': new RegExp('(.+):(.+)'), // ex. status:closed
        'parse': function(sTerm) {
            var sRegexp = LuceneParser.SanitizePatterns['LUCENE'][
                'pattern'
            ];
            var sParsedTerm = sTerm.match(sRegexp);
            var sValue = sParsedTerm[2];
            var sKey = sParsedTerm[1];
            return sKey + ':"' + sValue + '"';
        }
    },
    'SINGLE_SPECIAL_CHAR': {
        'pattern': new RegExp('[-]', 'g'), // ex. leave hyphen alone in: cvimport.local - disk
        'parse': function(sTerm) {
            return '"' + sTerm + '"';
        }
    },
    'HYPHEN': {
        'pattern': new RegExp('.+-.+', 'g'), // ex. test-server
        'parse': function(sTerm) {
            return '"' + sTerm + '"';
        }
    },
    'PERIOD': {
        'pattern': new RegExp('[.]', 'g'), // ex. 192.168.0.1, mail@mail.com
        'parse': function(sTerm) {
            return '"' + sTerm + '"';
        }
    },
    'UNDERSCORE': {
        'pattern': new RegExp('[_]', 'g'), // ex. test_server
        'parse': function(sTerm) {
            return '"' + sTerm + '"';
        }
    },
    'PATH': {
        'pattern': new RegExp('(.+):/'), // ex. C:/Path, Http://Google.com
        'parse': function(sTerm) {
            return '"' + sTerm + '"';
        }
    },
    'OR': {
        'pattern': new RegExp('OR'),
        'parse': function(sTerm) {
            return 'OR';
        }
    },
    'AND': {
        'pattern': new RegExp('AND'),
        'parse': function(sTerm) {
            return 'AND';
        }
    },
    'TO': {
        'pattern': new RegExp('TO'),
        'parse': function(sTerm) {
            return 'TO';
        }
    }
};

LuceneParser.prototype.setSearchTerm = function(sSearchTerm) {
    this.oLuceneTemplateCache = {};
    var sTerm = sSearchTerm;
    if (!sTerm) {
        sTerm = '*';
    } else if (_.trim(sTerm).length == 0) {
        sTerm = '*';
    }
    this.sOriginalSearchTerm = sTerm;
    this.sFormattedSearchTerm = sTerm;

    /*
     * Extract valid lucene-expressions from search-string.
     * Because if they are recognized as valid there is no point running them
     * trough the sanitizer. Replacing the expression with a template-string
     * that is matched in the sanitizer and then pops the expression right back.
     */
    this._luceneTemplateSearchTerm();
    /*
     * Sanitizes the search-string to build valid lucene-expressions and format
     * the query to the needs of elastic-search.
     * The sanitizer patterns are in the LuceneParser.SanitizePatterns-enum
     */
    this._sanitizer();
};

LuceneParser.prototype.getFormattedSearchTerm = function() {
    return _.trim(this.sSanitized);
};
LuceneParser.prototype.getOriginalSearchTerm = function() {
    return this.sOriginalSearchTerm;
};

LuceneParser.prototype._luceneTemplateSearchTerm = function() {
    /*
     * The order of the patterns are important. The match by priority because the patterns may match on similar parts of a string.
     */
    var oPatterns = {
        'Brackets': /([a-zA-Z]+:)\[([^\]]+)]/g, // ex. created:[now-30d/d TO now+1d/d]
        'Lucene': /-*([\w\W]|[^\s]+):"(.*?)"/g, // ex. -symptomname:"ms serv provis"
        'Quote': /"(.*?)"/g // ex. "cv.import.local disk"
    };
    var that = this;
    var nTemplateCount = 0;

    _.forEach(oPatterns, function(rxPattern) {
        this.sFormattedSearchTerm = this.sFormattedSearchTerm.replace(
            rxPattern,
            function(sTerm) {
                that.oLuceneTemplateCache['_' + nTemplateCount] =
                    sTerm;
                return '#{{' + (nTemplateCount++) + '}}#';
            });
    }, this);
};
LuceneParser.prototype._sanitizer = function() {
    this.sSanitized = '';
    var rTerms = this.sFormattedSearchTerm.split(' ');
    var bBracket = false;
    var oMatch = null;

    _.forEach(rTerms, function(sTerm) {
        oMatch = null;
        var rTemplateMatch = sTerm.match(/#{{(\d+)}}#/); // Look if template-string match is made.
        for (var sKey in LuceneParser.SanitizePatterns) {
            var sRegexp = LuceneParser.SanitizePatterns[sKey];
            if (sTerm.match(sRegexp['pattern'])) {
                oMatch = sRegexp;
                break;
            }
        }
        if (sTerm === '*') {
            this.sSanitized += sTerm;
        } else if (rTemplateMatch) { // if a match is made to the template-string, then restore lucene-expression form cache.
            this.sSanitized += this.oLuceneTemplateCache['_' +
                rTemplateMatch[1]] + ' ';
        } else if (oMatch) {
            this.sSanitized += oMatch['parse'](sTerm) + ' ';
        } else if (sTerm !== '') {
            this.sSanitized += sTerm + '* ';
        }
    }, this);
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
