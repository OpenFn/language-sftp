"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.execute = execute;
exports.list = list;
exports.getCSV = getCSV;
exports.putCSV = putCSV;
exports.getJSON = getJSON;
Object.defineProperty(exports, "alterState", {
  enumerable: true,
  get: function () {
    return _languageCommon.alterState;
  }
});
Object.defineProperty(exports, "dataPath", {
  enumerable: true,
  get: function () {
    return _languageCommon.dataPath;
  }
});
Object.defineProperty(exports, "dataValue", {
  enumerable: true,
  get: function () {
    return _languageCommon.dataValue;
  }
});
Object.defineProperty(exports, "each", {
  enumerable: true,
  get: function () {
    return _languageCommon.each;
  }
});
Object.defineProperty(exports, "field", {
  enumerable: true,
  get: function () {
    return _languageCommon.field;
  }
});
Object.defineProperty(exports, "fields", {
  enumerable: true,
  get: function () {
    return _languageCommon.fields;
  }
});
Object.defineProperty(exports, "http", {
  enumerable: true,
  get: function () {
    return _languageCommon.http;
  }
});
Object.defineProperty(exports, "lastReferenceValue", {
  enumerable: true,
  get: function () {
    return _languageCommon.lastReferenceValue;
  }
});
Object.defineProperty(exports, "merge", {
  enumerable: true,
  get: function () {
    return _languageCommon.merge;
  }
});
Object.defineProperty(exports, "sourceValue", {
  enumerable: true,
  get: function () {
    return _languageCommon.sourceValue;
  }
});
Object.defineProperty(exports, "_", {
  enumerable: true,
  get: function () {
    return _lodash._;
  }
});

var _languageCommon = require("@openfn/language-common");

var _ssh2SftpClient = _interopRequireDefault(require("ssh2-sftp-client"));

var _csvtojson = _interopRequireDefault(require("csvtojson"));

var _JSONStream = _interopRequireDefault(require("JSONStream"));

var _lodash = require("lodash");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @module Adaptor */

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
function execute(...operations) {
  const initialState = {
    references: [],
    data: null
  };
  return state => (0, _languageCommon.execute)(...operations)({ ...initialState,
    ...state
  });
}
/**
 * List files present in a directory
 * @public
 * @example
 * list("/some/path/")
 * @constructor
 * @param {string} dirPath - Path to resource
 * @returns {Operation}
 */


function list(dirPath) {
  return state => {
    const sftp = new _ssh2SftpClient.default(); // const { host, username, password, port } = state.configuration;
    // this.ftpClient['client'].on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => { finish([this.ftpConfig.connection.password]); })

    return sftp.connect(state.configuration).then(() => {
      process.stdout.write('Connected. ✓\n');
      return sftp.list(dirPath);
    }).then(files => {
      process.stdout.write(`File list: ${JSON.stringify(files, null, 2)}\n`);
      const nextState = (0, _languageCommon.composeNextState)(state, files);
      sftp.end();
      return nextState;
    }).catch(e => {
      sftp.end();
      console.log(e);
    });
  };
}
/**
 * Get a CSV and convert it to JSON
 * @public
 * @example
 * getCSV(
 *   "/some/path/to_file.csv",
 *   'utf8',
 *   { delimiter: ';', noheader: true }
 * );
 * @constructor
 * @param {string} filePath - Path to resource
 * @param {string} encoding - Character encoding for the csv
 * @param {string} parsingOptions - Options passed to csvtojson parser
 * @returns {Operation}
 */


function getCSV(filePath, encoding, parsingOptions) {
  return state => {
    const sftp = new _ssh2SftpClient.default(); // const { host, username, password, port } = state.configuration;

    const {
      filter
    } = parsingOptions;
    return sftp.connect(state.configuration).then(() => {
      process.stdout.write('Connected. ✓\n');
      return sftp.get(filePath);
    }).then(data => {
      process.stdout.write('Parsing rows to JSON');
      stream.pipe(_JSONStream.default.parse());
      return new Promise((resolve, reject) => {
        return (0, _csvtojson.default)().fromStream(data) // changed this from  .fromStream(data)
        .subscribe(function (jsonObj) {
          //single json object will be emitted for each csv line
          // parse each json asynchronously
          resolve();
          console.log(jsonObj);
        });
      }).then(json => {
        const nextState = (0, _languageCommon.composeNextState)(state, json);
        return nextState;
      });
    }).catch(e => {
      sftp.end();
      throw e;
    }); // .then(stream => {
    //   process.stdout.write('Receiving stream.\n');
    //   const arr = [];
    //   return new Promise((resolve, reject) => {
    //     process.stdout.write('Parsing rows to JSON');
    //     console.log('stream');
    //     console.log(stream);
    //     return csv(/* parsingOptions */)
    //       .fromStream(stream)
    //       .subscribe(
    //         json => {
    //           return new Promise((resolve, reject) => {
    //             // long operation for each json e.g. transform / write into database.
    //             console.log(json);
    //           });
    //         },
    //         error => {
    //           console.log('error', error);
    //         },
    //         success => {
    //           console.log('success', success);
    //         }
    //       );
    //   }).then(json => composeNextState(state, json));
    // })
  };
}
/**
 * Convert JSON to CSV and upload to an FTP server
 * @public
 * @example
 * putCSV(
 *   "/some/path/to_file.csv",
 *   'utf8',
 *   { delimiter: ';', noheader: true }
 * );
 * @constructor
 * @param {string} filePath - Path to resource
 * @param {string} encoding - Character encoding for the csv
 * @param {string} parsingOptions - Options passed to csvtojson parser
 * @returns {Operation}
 */


function putCSV(filePath, encoding, parsingOptions) {
  return state => {
    const json2csv = require('json2csv').parse;

    const fields = ['field1', 'field2', 'field3'];
    const opts = {
      fields
    };

    try {
      const csv = json2csv(myData, opts);
      console.log(csv);
    } catch (err) {
      console.error(err);
    }

    sftp.put(localFilePath, remoteFilePath, [useCompression], [encoding], [addtionalOptions]);
  };
}
/**
 * Fetch a json file from an FTP server
 * @public
 * @example
 * getJSON(
 *   '/path/To/File',
 *   'utf8',
 * );
 * @constructor
 * @param {string} filePath - Path to resource
 * @param {string} encoding - Character encoding for the json
 * @returns {Operation}
 */


function getJSON(filePath, encoding) {
  return state => {
    const sftp = new _ssh2SftpClient.default();
    /* const outStream = new Writable({
      write: (chunk, encoding, callback) => {
        // console.log(chunk.toString());
        callback();
      },
    }); */

    return sftp.connect(state.configuration).then(() => {
      process.stdout.write('Connected. ✓\n');
      return sftp.get(filePath);
    }).then(stream => {
      // stream.pipe(outStream);
      stream.pipe(_JSONStream.default.parse());
      let arr = [];
      process.stdout.write('Receiving stream.\n');
      return new Promise((resolve, reject) => {
        console.log(`Reading file ${filePath}...`);
        stream.on('readable', jsonObject => {
          while (null !== (jsonObject = stream.read())) {
            arr.push(jsonObject);
          }
        }).on('data', jsonObject => {// console.log(`chunk length is: ${jsonObject.length}`);
        }).on('end', error => {
          if (error) reject(error);
          resolve(arr.join(''));
        });
      }).then(json => {
        const nextState = (0, _languageCommon.composeNextState)(state, json);
        return nextState;
      });
    }).then(state => {
      console.log('Stream finished.');
      sftp.end();
      return state;
    }).catch(e => {
      throw e;
    });
  };
}
