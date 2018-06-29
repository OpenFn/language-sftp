/** @module Adaptor */
import {
  execute as commonExecute,
  expandReferences,
  composeNextState,
} from 'language-common';
import Client from 'ssh2-sftp-client';
import csv from 'csvtojson';
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
export function execute(...operations) {
  const initialState = {
    references: [],
    data: null,
  };

  return state =>
    commonExecute(...operations)({ ...initialState, ...state });
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
export function list(dirPath, encoding) {
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
    }).then((list) => {
      console.log(list)
      composeNextState(state, json)
    }).catch((e) => {
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
      return sftp.list('/DataExport');
    }).then((list) => {
      console.log(list);
      return sftp.get(filePath, null, encoding);
    }).then((stream) => {
      // stream.pipe(fs.createWriteStream('tmp/test.csv'));
      const arr = [];
      return new Promise((resolve, reject) => {
        return csv(parsingOptions)
          .fromStream(stream)
          .on('json', (jsonObject) => {
            arr.push(jsonObject);
          })
          .on('done', (error) => {
            if (error) {
              reject(error);
            }
            sftp.end();
            console.log(arr);
            resolve(arr);
          });
      }).then(json => composeNextState(state, json));
    }).catch((e) => {
      sftp.end();
      console.log(e);
    });
  };
}

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
