Lucene-parser
=========

A minimal node module providing utility methods to `parse` an `fetextquery` to `lucene syntax`.

## Installation

```shell
  npm install lucene-parser --save
```

## Usage

```js
  var lucene_parser = require('lucene-parser')
  lucene_parser.setSearchTerm("hello:there i am a-test-string that.should.become lucne_friendly");

  console.log(lucene_parser.getOriginalSearchTerm());
  // hello:there i am a-test-string that.should.become lucne_friendly
  console.log(lucene_parser.getFormattedSearchTerm());
  // hello:"there" i* am* "a-test-string" "that.should.become" "lucne_friendly"
```

## Tests

```shell
   npm test
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Feedback

Feel free to drop me a line or a shoutout on [Twitter](https://twitter.com/mikael_hallgren), it would be cool to know if you find it useful and use it in any of your projects.
And feel free to write me an issues if there is some functionality you miss.

## Release History

* 0.1.0 Initial release
