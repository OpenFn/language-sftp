Language SFTP [![Build Status](https://travis-ci.org/OpenFn/language-sftp.svg?branch=master)](https://travis-ci.org/OpenFn/language-sftp)
=============

Language Pack for building expressions and operations to work with SFTP servers.

Documentation
-------------
## Fetch

#### sample configuration
```js
{
  "username": "sftp_user",
  "password": "sftp_pass",
  "host": "191.173.xxx.yy"
}
```

#### sample getCSV expression
```js
getCSV('path/to/file.csv', 'utf8', {
  quote: 'off',
  delimiter: ';',
  noheader: true,
  filter: {
    type: 'startsWith',
    key: 'field1',
    value: 'JO',
  }
});
```

[Docs](docs/index)

Development
-----------

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.
