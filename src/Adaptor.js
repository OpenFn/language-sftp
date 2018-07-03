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

    const {
      host,
      username,
      password,
      port,
    } = state.configuration;

    return sftp.connect({
      host,
      port,
      username,
      password,
    }).then(() => {
      return sftp.list(dirPath);
    }).then((files) => {
      console.log(files);
    }).catch((e) => {
      sftp.end();
      console.log(e);
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

    const {
      host,
      username,
      password,
      port,
    } = state.configuration;

    return sftp.connect({
      host,
      port,
      username,
      password,
    }).then(() => {
      return sftp.get(filePath, null, encoding);
    }).then((stream) => {
      // stream.pipe(fs.createWriteStream('tmp/file.csv'));
      const arr = [];
      return new Promise((resolve, reject) => {
        return csv(parsingOptions)
          .fromStream(stream)
          .on('json', (jsonObject) => {
            if ((parsingOptions.filter
              && jsonObject[parsingOptions.filter.key].startsWith(parsingOptions.filter.value))
              || !parsingOptions.filter) {
              arr.push(jsonObject);
            }
          })
          .on('done', (error) => {
            if (error) {
              reject(error);
            }
            sftp.end();
            resolve(arr);
          });
      }).then(json => composeNextState(state, json));
    }).catch((e) => {
      sftp.end();
      console.log(e);
    });
  };
}

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
