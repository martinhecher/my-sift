/**
 * My Sift Sift. DAG's 'Parse' node implementation
 */
'use strict';

// Javascript nodes are run in a Node.js sandbox so you can require dependencies following the node paradigm
// e.g. var moment = require('moment');

// Entry point for DAG node
module.exports = function (got) {
  // inData contains the key/value pairs that match the given query
  const inData = got['in'];

  console.log('my-sift: parse.js: running...');

  let results = [];
  inData.data.map(function (datum) {
    console.log('my-sift: parse.js: parsing: ', datum.key);
    // Parse the JMAP information for each message
    const jmapInfo = JSON.parse(datum.value);
    // Not all emails contain a textBody so we do a cascade selection
    const body = jmapInfo.textBody || jmapInfo.strippedHtmlBody || '';
    const value = { words: countWords(body) };
    // Emit into "messages" stores so count can be calculated by the "Count" node
    results.push({ name: 'messages', key: jmapInfo.id, value: value });
    // Emit information on the thread id so we can display them in the email list and detail
    results.push({ name: 'threadMessages', key: `${jmapInfo.threadId}/${jmapInfo.id}`, value: { list: value, detail: value } });
  });

  // Possible return values are: undefined, null, promises, single or an array of objects
  // return objects should have the following structure
  // {
  //   name: '<name of node output>',
  //   key: 'key1',
  //   value: '1'
  // };
  return results;
};

/**
 * Simple function to count number of words in a string
 */
function countWords(body) {
  let s = body.replace(/\n/gi, ' ');
  s = s.replace(/(^\s*)|(\s*$)/gi, '');
  s = s.replace(/[ ]{2,}/gi, '');
  return s.split(' ').length;
}
