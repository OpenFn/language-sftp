# Language SFTP [![Build Status](https://travis-ci.org/OpenFn/language-sftp.svg?branch=master)](https://travis-ci.org/OpenFn/language-sftp)

Language Pack for building expressions and operations to work with SFTP servers.

## Documentation

### sample configuration

```js
{
  "username": "sftp_user",
  "password": "sftp_pass",
  "host": "191.173.xxx.yy",
  "port": PORT
}
```

### sample getCSV expression

```js
getCSV('path/to/file.csv', 'utf8', {
  quote: 'off',
  delimiter: ';',
  noheader: true,
  filter: {
    type: 'startsWith',
    key: 'field1',
    value: 'JO',
  },
});
```

### Get JSON from FTP server

```js
getJSON('path/to/file.json', 'utf8');
```

[Docs](docs/index)

## Development

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.

To build the docs for this repo, run
`./node_modules/.bin/jsdoc --readme ./README.md ./lib -d docs`.
