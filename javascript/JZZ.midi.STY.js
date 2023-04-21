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
    var i, j, k, s, t, x;
    if (!(smf instanceof JZZ.MIDI.SMF)) smf = new JZZ.MIDI.SMF(smf);
    this.ppqn = smf.ppqn;
    for (i = 0; i < smf.length; i++) {
      if (smf[i].type == 'MTrk') {
        if (!this.mtrk) {
          x = _splitMTrk(smf[i]);
          this.mrk = [];
          this.trk = {};
          for (j = 0; j < x.length; j++) {
            t = x[j];
            s = t.title;
            if (s == '') {
              for (k = 0; k < t.length; k++) {
                if (t[k].isTempo()) {
                  this.tempo = t[k].getTempo();
                  this.bpm = Math.round(60000000 / this.tempo);
                }
                else if (t[k].isTimeSignature()) {
                  this.tsig = t[k].getTimeSignature().join('/');
                }
              }
            }
            else if (s == 'SFF1' || s == 'SFF2') {
              for (k = 0; k < t.length; k++) if (t[k].ff == 3) this.name = t[k].dd;
            }
            else this.mrk.push(s);
            this.trk[s] = t;
          }
        }
      }
    }
  }

  function _splitMTrk(trk) {
    var i, t, m;
    var ttt = [];
    var cl = 0;
    t = new JZZ.MIDI.SMF.MTrk();
    t.title = '';
    ttt.push(t);
    for (i = 0; i < trk.length; i++) {
      m = trk[i];
      if (m.ff == 6) {
        cl = m.tt;
        t = new JZZ.MIDI.SMF.MTrk();
        t.title = m.dd;
        ttt.push(t);
      }
      t.add(m.tt - cl, m);
    }
    return ttt;
  }

  JZZ.MIDI.STY = STY;
});
