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

## List the content of a directory

```js
alterState(state => {
  return list('/path/To/Directory')(state).then(response => {
    console.log(`There are ${response.data.length} files.`);
    return response;
  });
});
```

## sample getCSV expression

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

## sample putCSV expression

This function converts JSON to CSV and post to a server

```js
putCSV('/some/path/to_file.csv', 'utf8', { delimiter: ';', noheader: true });
```

### Get JSON from FTP server

```js
getJSON('path/to/file.json', 'utf8');
```

### Custom request to an http endpoint

This adaptor exports `http` from `language-common`. Here, we outline the usage
in order to make custom requests to an endpoint. It returns a promise

```js
alterState(state => {
  return http
    .post({ url: 'yourURL', data: { name: 'Mamadou' } })(state)
    .then(response => {
      // do something with response;
      return response;
    });
});
```

[Docs](docs/index)

## Development

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.

To build the docs for this repo, run
`./node_modules/.bin/jsdoc --readme ./README.md ./lib -d docs`.
