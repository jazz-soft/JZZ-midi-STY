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
      if (smf[i].type == 'CASM') {
        if (!this.casm) {
          this.casm = _splitCASM(smf[i].data);
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
  function _splitCASM(s) {
    var t, len, cseg;
    var casm = [];
    var p = 0;
    while (p < s.length) {
      t = s.substr(p, 4);
      len = (s.charCodeAt(p + 4) << 24) + (s.charCodeAt(p + 5) << 16) + (s.charCodeAt(p + 6) << 8) + s.charCodeAt(p + 7);
      p += 8;
      if (t == 'CSEG') {
        cseg = _splitCSEG(s.substr(p, len));
        if (cseg) casm.push(cseg);
      }
      p += len;
    }
    return casm;
  }
  function _splitCSEG(s) {
    var t, len;
    var cseg = {};
    var p = 0;
    while (p < s.length) {
      t = s.substr(p, 4);
      len = (s.charCodeAt(p + 4) << 24) + (s.charCodeAt(p + 5) << 16) + (s.charCodeAt(p + 6) << 8) + s.charCodeAt(p + 7);
      p += 8;
      if (t == 'Sdec') {
        cseg.sdec = s.substr(p, len);
        p += len;
        break;
      }
    } 
    return cseg;
  }

  JZZ.MIDI.STY = STY;
});
