var assert = require('assert');
var JZZ = require('jzz');
require('jzz-midi-gm')(JZZ);
require('jzz-midi-smf')(JZZ);
require('..')(JZZ);
var version = require('../package.json').version;

describe('STY', function() {
  it('version', function() {
    var sty = JZZ.MIDI.STY();
    assert.equal(sty.version(), version);
    assert.equal(JZZ.MIDI.STY.version(), version);
  });
  it('empty', function() {
    var sty = JZZ.MIDI.STY();
    var smf = JZZ.MIDI.SMF(sty.dump());
    var s = smf.toString();
    sty = JZZ.MIDI.STY(smf);
    smf = JZZ.MIDI.SMF(sty.dump());
    //console.log(smf.toString());
    assert.equal(smf.toString(), s);
  });
});
