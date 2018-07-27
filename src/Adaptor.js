/** @module Adaptor */
import {
  execute as commonExecute,
  composeNextState,
} from 'language-common';
import Client from 'ssh2-sftp-client';
import csv from 'csvtojson';

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

  return state =>
    commonExecute(...operations)({ ...initialState, ...state });
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
export function list(dirPath) {
  return (state) => {
    const sftp = new Client();

    // const { host, username, password, port } = state.configuration;

    return sftp.connect(state.configuration)
      .then(() => {
        process.stdout.write('Connected. ✓\n');
        return sftp.list(dirPath);
      })
      .then((files) => {
        process.stdout.write(`File list: ${JSON.stringify(files, null, 2)}\n`);
        sftp.end();
        return state;
      }).catch((e) => {
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
export function getCSV(filePath, encoding, parsingOptions) {
  return (state) => {
    const sftp = new Client();

    // const { host, username, password, port } = state.configuration;
    const { filter } = parsingOptions;

    return sftp.connect(state.configuration)
      .then(() => {
        process.stdout.write('Connected. ✓\n');
        return sftp.get(filePath, null, encoding);
      })
      .then((stream) => {
        process.stdout.write('Receiving stream.\n');
        const arr = [];
        return new Promise((resolve, reject) => {
          process.stdout.write('Parsing rows to JSON');
          return csv(parsingOptions)
            .fromStream(stream)
            .on('json', (jsonObject) => {
              const included = (
                (filter && jsonObject[filter.key].startsWith(filter.value))
                || !filter
              );

              if (included) {
                process.stdout.write('.');
                arr.push(jsonObject);
              }
            })
            .on('done', (error) => {
              if (error) {
                reject(error);
              }
              process.stdout.write('DONE. ✓\n');
              sftp.end();
              resolve(arr);
            });
        }).then(json => composeNextState(state, json));
      }).catch((e) => {
        sftp.end();
        throw e;
      });
  };
}

/**
 * Convert JSON to CSV and upload to an FTP server
 * @public
 * @example
 *  put(
 *    jsonObject,
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
 // export function putCSV(
 //   return (state) => {
 //
 //     const json2csv = require('json2csv').parse;
 //      const fields = ['field1', 'field2', 'field3'];
 //      const opts = { fields };
 //
 //      try {
 //        const csv = json2csv(myData, opts);
 //        console.log(csv);
 //      } catch (err) {
 //        console.error(err);
 //      }
 //
 //     sftp.put(localFilePath, remoteFilePath, [useCompression], [encoding], [addtionalOptions]);
 //   }
 // );

export { _ } from 'lodash';

export {
  alterState,
  dataPath,
  dataValue,
  each,
  field,
  fields,
  lastReferenceValue,
  merge,
  sourceValue,
} from 'language-common';
