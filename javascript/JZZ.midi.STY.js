(function(global, factory) {
  /* istanbul ignore next */
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory.STY = factory;
    module.exports = factory;
  }
  else if (typeof define === 'function' && define.amd) {
    define('JZZ.gui.STY', ['JZZ', 'JZZ.midi.SMF'], factory);
  }
  else {
    factory(JZZ);
  }
})(this, function(JZZ) {

  /* istanbul ignore next */
  if (JZZ.MIDI.STY) return;

  function STY(smf) {
    var i, t;
    if (!(smf instanceof JZZ.MIDI.SMF)) smf = new JZZ.MIDI.SMF(smf);
    for (i = 0; i < smf.length; i++) {
      if (smf[i].type == 'MTrk') {
        if (!this.mtrk) {
          t = _splitMTrk(smf[i]);
          this.mtrk = t;
        }
      }
    }
  }

  function _splitMTrk(trk) {
    var i, t, m;
    var ttt = [];
    var cl = 0;
    t = new JZZ.MIDI.SMF.MTrk();
    ttt.push(t);
    for (i = 0; i < trk.length; i++) {
      m = trk[i];
      if (m.ff == 6) {
        cl = m.tt;
        t = new JZZ.MIDI.SMF.MTrk();
        ttt.push(t);
      }
      t.add(m.tt - cl, m);
    }
    return ttt;
  }

  JZZ.MIDI.STY = STY;
});
