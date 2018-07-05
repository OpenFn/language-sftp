'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sourceValue = exports.merge = exports.lastReferenceValue = exports.fields = exports.field = exports.each = exports.dataValue = exports.dataPath = exports.alterState = exports._ = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /** @module Adaptor */


exports.execute = execute;
exports.list = list;
exports.getCSV = getCSV;

var _lodash = require('lodash');

Object.defineProperty(exports, '_', {
  enumerable: true,
  get: function get() {
    return _lodash._;
  }
});

var _languageCommon = require('language-common');

Object.defineProperty(exports, 'alterState', {
  enumerable: true,
  get: function get() {
    return _languageCommon.alterState;
  }
});
Object.defineProperty(exports, 'dataPath', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataPath;
  }
});
Object.defineProperty(exports, 'dataValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataValue;
  }
});
Object.defineProperty(exports, 'each', {
  enumerable: true,
  get: function get() {
    return _languageCommon.each;
  }
});
Object.defineProperty(exports, 'field', {
  enumerable: true,
  get: function get() {
    return _languageCommon.field;
  }
});
Object.defineProperty(exports, 'fields', {
  enumerable: true,
  get: function get() {
    return _languageCommon.fields;
  }
});
Object.defineProperty(exports, 'lastReferenceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.lastReferenceValue;
  }
});
Object.defineProperty(exports, 'merge', {
  enumerable: true,
  get: function get() {
    return _languageCommon.merge;
  }
});
Object.defineProperty(exports, 'sourceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.sourceValue;
  }
});

var _ssh2SftpClient = require('ssh2-sftp-client');

var _ssh2SftpClient2 = _interopRequireDefault(_ssh2SftpClient);

var _csvtojson = require('csvtojson');

var _csvtojson2 = _interopRequireDefault(_csvtojson);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Execute a sequence of operations.
 * Wraps `language-common/execute`, and prepends initial state for http.
 * @example
 * execute(
 *   create('foo'),
 *   delete('bar')
 * )(state)
 * @function
 * @param {Operations} operations - Operations to be performed.
 * @returns {Operation}
 */
function execute() {
  for (var _len = arguments.length, operations = Array(_len), _key = 0; _key < _len; _key++) {
    operations[_key] = arguments[_key];
  }

  var initialState = {
    references: [],
    data: null
  };

  return function (state) {
    return _languageCommon.execute.apply(undefined, operations)(_extends({}, initialState, state));
  };
}

/**
 * List files present in a directory
 * @public
 * @example
 *  list("/some/path/")
 * @function
 * @param {string} dirPath - Path to resource
 * @returns {Operation}
 */
function list(dirPath) {
  return function (state) {
    var sftp = new _ssh2SftpClient2.default();

    // const { host, username, password, port } = state.configuration;

    return sftp.connect(state.configuration).then(function () {
      process.stdout.write('Connected. ✓\n');
      return sftp.list(dirPath);
    }).then(function (files) {
      process.stdout.write('File list: ' + JSON.stringify(files, null, 2) + '\n');
      sftp.end();
      return state;
    }).catch(function (e) {
      sftp.end();
      process.stderr.write(e);
    });
  };
}

/**
 * Get a CSV and convert it to JSON
 * @public
 * @example
 *  get(
 *    "/some/path/to_file.csv",
 *    'utf8',
 *    { delimiter: ';', noheader: true }
 *  );
 * @function
 * @param {string} filePath - Path to resource
 * @param {string} encoding - Character encoding for the csv
 * @param {string} parsingOptions - Options passed to csvtojson parser
 * @returns {Operation}
 */
function getCSV(filePath, encoding, parsingOptions) {
  return function (state) {
    var sftp = new _ssh2SftpClient2.default();

    // const { host, username, password, port } = state.configuration;
    var filter = parsingOptions.filter;


    return sftp.connect(state.configuration).then(function () {
      process.stdout.write('Connected. ✓\n');
      return sftp.get(filePath, null, encoding);
    }).then(function (stream) {
      process.stdout.write('Receiving stream.\n');
      var arr = [];
      return new Promise(function (resolve, reject) {
        process.stdout.write('Parsing rows to JSON');
        return (0, _csvtojson2.default)(parsingOptions).fromStream(stream).on('json', function (jsonObject) {
          var included = filter && jsonObject[filter.key].startsWith(filter.value) || !filter;

          if (included) {
            process.stdout.write('.');
            arr.push(jsonObject);
          }
        }).on('done', function (error) {
          if (error) {
            reject(error);
          }
          process.stdout.write('DONE. ✓\n');
          sftp.end();
          resolve(arr);
        });
      }).then(function (json) {
        return (0, _languageCommon.composeNextState)(state, json);
      });
    }).catch(function (e) {
      sftp.end();
      throw e;
    });
  };
}
