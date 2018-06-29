'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sourceValue = exports.merge = exports.lastReferenceValue = exports.fields = exports.field = exports.each = exports.dataValue = exports.dataPath = exports.alterState = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /** @module Adaptor */


exports.execute = execute;
exports.list = list;
exports.getCSV = getCSV;

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

var fs = require('fs');

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
 * Get a file from a filepath
 * @public
 * @example
 *  get("/some/path/to_file.csv")
 * @function
 * @param {string} path - Path to resource
 * @returns {Operation}
 */
function list(dirPath, encoding) {
  return function (state) {
    var sftp = new _ssh2SftpClient2.default();

    var _state$configuration = state.configuration,
        host = _state$configuration.host,
        username = _state$configuration.username,
        password = _state$configuration.password,
        port = _state$configuration.port;


    return sftp.connect({
      host: host,
      port: port,
      username: username,
      password: password
    }).then(function () {
      return sftp.list(dirPath);
    }).then(function (list) {
      console.log(list);
      (0, _languageCommon.composeNextState)(state, json);
    }).catch(function (e) {
      sftp.end();
      console.log(e);
    });
  };
}

/**
 * Get a file from a filepath
 * @public
 * @example
 *  get("/some/path/to_file.csv")
 * @function
 * @param {string} path - Path to resource
 * @returns {Operation}
 */
function getCSV(filePath, encoding, parsingOptions) {
  return function (state) {
    var sftp = new _ssh2SftpClient2.default();

    var _state$configuration2 = state.configuration,
        host = _state$configuration2.host,
        username = _state$configuration2.username,
        password = _state$configuration2.password,
        port = _state$configuration2.port;


    return sftp.connect({
      host: host,
      port: port,
      username: username,
      password: password
    }).then(function () {
      return sftp.list('/DataExport');
    }).then(function (list) {
      console.log(list);
      return sftp.get(filePath, null, encoding);
    }).then(function (stream) {
      // stream.pipe(fs.createWriteStream('tmp/test.csv'));
      var arr = [];
      return new Promise(function (resolve, reject) {
        return (0, _csvtojson2.default)(parsingOptions).fromStream(stream).on('json', function (jsonObject) {
          arr.push(jsonObject);
        }).on('done', function (error) {
          if (error) {
            reject(error);
          }
          sftp.end();
          console.log(arr);
          resolve(arr);
        });
      }).then(function (json) {
        return (0, _languageCommon.composeNextState)(state, json);
      });
    }).catch(function (e) {
      sftp.end();
      console.log(e);
    });
  };
}
