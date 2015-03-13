Lucene-parser
=========

A minimal node module providing utility methods to `parse` an `search query` to lucene syntax.

## Installation

```shell
  npm install lucene-parser --save
```

## Usage

```js
  var lucene_parser = require('lucene-parser')
  lucene_parser.setSearchTerm("hello:there i am a-test-string that.should.become lucne_firendly");

  console.log(lucene_parser.getOriginalSearchTerm());
  console.log(lucene_parser.getFormattedSearchTerm());
```

## Tests

```shell
   npm test
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Release History

* 0.1.0 Initial release
