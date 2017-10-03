const _ = require('lodash');
const word_db = require('./es-freq1k');

let wordsOfInterest = _.filter(word_db, (word) => ['noun','adjective','verb'].indexOf(word.type) > -1);

console.log('whatup, homey?', wordsOfInterest );