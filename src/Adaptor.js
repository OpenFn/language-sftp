/** @module Adaptor */
import {
  execute as commonExecute,
  composeNextState,
} from '@openfn/language-common';
import Client from 'ssh2-sftp-client';
// import csv from 'csvtojson';
import JSONStream from 'JSONStream';
import csv from 'csv-parser';

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
export function execute(...operations) {
  const initialState = {
    references: [],
    data: null,
  };

  return state => commonExecute(...operations)({ ...initialState, ...state });
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
export function list(dirPath) {
  return state => {
    const sftp = new Client();

    return sftp
      .connect(state.configuration)
      .then(() => {
        process.stdout.write('Connected. ✓\n');
        return sftp.list(dirPath);
      })
      .then(files => {
        // process.stdout.write(`File list: ${JSON.stringify(files, null, 2)}\n`);
        const nextState = composeNextState(state, files);
        sftp.end();
        return nextState;
      })
      .catch(e => {
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
 *   "/some/path/to_file.csv"
 * );
 * @constructor
 * @param {string} filePath - Path to resource
 * @returns {Operation}
 */
export function getCSV(filePath) {
  return state => {
    const sftp = new Client();

    return sftp
      .connect(state.configuration)
      .then(() => {
        process.stdout.write('Connected. ✓\n');
        return sftp.get(filePath);
      })
      .then(stream => {
        process.stdout.write('Parsing rows to JSON.\n');
        let results = [];
        stream.pipe(csv());

        return new Promise((resolve, reject) => {
          stream
            .on('readable', jsonObject => {
              // while (null !== (jsonObject = stream.read())) {
              //   results.push(jsonObject);
              // }
              stream.read();
            })
            .on('data', data => {
              results.push(data);
            })
            .on('end', () => {
              resolve(results.join('').split('\r\n'));
            });
        }).then(json => {
          const nextState = composeNextState(state, json);
          return nextState;
        });
      })
      .then(state => {
        console.log('Stream finished.');
        sftp.end();
        return state;
      })
      .catch(e => {
        sftp.end();
        throw e;
      });
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
export function putCSV(filePath, encoding, parsingOptions) {
  return state => {
    const json2csv = require('json2csv').parse;
    const fields = ['field1', 'field2', 'field3'];
    const opts = { fields };

    try {
      const csv = json2csv(myData, opts);
      console.log(csv);
    } catch (err) {
      console.error(err);
    }

    sftp.put(
      localFilePath,
      remoteFilePath,
      [useCompression],
      [encoding],
      [addtionalOptions]
    );
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
export function getJSON(filePath, encoding) {
  return state => {
    const sftp = new Client();

    /* const outStream = new Writable({
      write: (chunk, encoding, callback) => {
        // console.log(chunk.toString());
        callback();
      },
    }); */

    return sftp
      .connect(state.configuration)
      .then(() => {
        process.stdout.write('Connected. ✓\n');
        return sftp.get(filePath);
      })
      .then(stream => {
        // stream.pipe(outStream);
        stream.pipe(JSONStream.parse());
        let arr = [];
        process.stdout.write('Receiving stream.\n');

        return new Promise((resolve, reject) => {
          console.log(`Reading file ${filePath}...`);
          stream
            .on('readable', jsonObject => {
              while (null !== (jsonObject = stream.read())) {
                arr.push(jsonObject);
              }
            })
            .on('data', jsonObject => {
              // console.log(`chunk length is: ${jsonObject.length}`);
            })
            .on('end', error => {
              if (error) reject(error);
              resolve(arr.join(''));
            });
        }).then(json => {
          const nextState = composeNextState(state, json);
          return nextState;
        });
      })
      .then(state => {
        console.log('Stream finished.');
        sftp.end();
        return state;
      })
      .catch(e => {
        throw e;
      });
  };
}

export { _ } from 'lodash';

export {
  alterState,
  fn,
  dataPath,
  dataValue,
  each,
  field,
  fields,
  http,
  lastReferenceValue,
  merge,
  sourceValue,
} from '@openfn/language-common';
