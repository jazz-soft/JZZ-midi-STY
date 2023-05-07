var assert = require('assert');
var JZZ = require('jzz');
require('jzz-midi-gm')(JZZ);
require('jzz-midi-smf')(JZZ);
require('..')(JZZ);
var version = require('../package.json').version;

describe('STY', function() {
});
