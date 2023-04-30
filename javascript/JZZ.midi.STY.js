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
          this.mtrk = [];
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
            else this.mtrk.push(s);
            this.trk[s] = t;
          }
        }
      }
      if (smf[i].type == 'CASM') {
        if (!this.casm) {
          this.casm = _splitCASM(smf[i].data);
        }
      }
      if (smf[i].type == 'OTSc') {
        if (!this.otsc) {
          this.otsc = _splitOTSc(smf[i].data);
        }
      }
      if (smf[i].type == 'FNRc') {
        if (!this.fnrc) {
          this.fnrc = _splitFNRc(smf[i].data);
        }
      }
      if (smf[i].type == 'MHhd') this.mhhd = true;
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
    var t, len, x;
    var cseg = {};
    var p = 0;
    while (p < s.length) {
      t = s.substr(p, 4);
      len = (s.charCodeAt(p + 4) << 24) + (s.charCodeAt(p + 5) << 16) + (s.charCodeAt(p + 6) << 8) + s.charCodeAt(p + 7);
      p += 8;
      if (t == 'Sdec') {
        if (!cseg.sdec) cseg.sdec = s.substr(p, len);
      }
      if (t == 'Ctab') {
        if (!cseg.ctab) cseg.ctab = [];
        x = _splitCtab(s.substr(p, len));
        if (x) cseg.ctab.push(x);
      }
      if (t == 'Ctb2') {
        if (!cseg.ctb2) cseg.ctb2 = [];
        x = _splitCtb2(s.substr(p, len));
        if (x) cseg.ctb2.push(x);
      }
      if (t == 'Cntt') {
        if (!cseg.cntt) cseg.cntt = [];
        x = _splitCntt(s.substr(p, len));
        if (x) cseg.cntt.push(x);
      }
      p += len;
    }
    return cseg;
  }
  function _splitCtb(s) {
    var ctb = {};
    ctb.src = s.charCodeAt(0);
    ctb.name = s.substr(1, 8).trim();
    ctb.dest = s.charCodeAt(9);
    ctb.editable = s.charCodeAt(10);
    ctb.notes = s.charCodeAt(11) * 0x100 + s.charCodeAt(12);
    ctb.chords = s.charCodeAt(13) * 0x100000000 + s.charCodeAt(14) * 0x1000000 + s.charCodeAt(15) * 0x10000 + s.charCodeAt(16) * 0x100 + s.charCodeAt(17);
    //console.log(ctb);
    return ctb;
  }
  function _splitCtab(s) {
    var ctb = _splitCtb(s);
    return ctb;
  }
  function _splitCtb2(s) {
    var ctb = _splitCtb(s);
    return ctb;
  }
  function _splitCntt(s) {
    var cntt = {};
    return cntt;
  }
  function _splitOTSc(s) {
    var t, len, trk;
    var otsc = [];
    var p = 0;
    while (p < s.length) {
      t = s.substr(p, 4);
      len = (s.charCodeAt(p + 4) << 24) + (s.charCodeAt(p + 5) << 16) + (s.charCodeAt(p + 6) << 8) + s.charCodeAt(p + 7);
      p += 8;
      if (t == 'MTrk') {
        trk = new JZZ.MIDI.SMF.MTrk(s.substr(p, len), 0);
        if (trk) otsc.push(trk);
      }
      p += len;
    }
    return otsc;
  }
  function _splitFNRc(s) {
    var t, len, fnrp;
    var fnrc = [];
    var p = 0;
    while (p < s.length) {
      t = s.substr(p, 4);
      len = (s.charCodeAt(p + 4) << 24) + (s.charCodeAt(p + 5) << 16) + (s.charCodeAt(p + 6) << 8) + s.charCodeAt(p + 7);
      p += 8;
      if (t == 'FNRP') {
        fnrp = _splitFNRP(s.substr(p, len));
        if (fnrp) fnrc.push(fnrp);
      }
      p += len;
    }
    return fnrc;
  }
  function _splitFNRP(s) {
    var t, len;
    var fnrp = {};
    var p = 0;
    fnrp.tempo = (s.charCodeAt(p) << 16) + (s.charCodeAt(p + 1) << 8) + s.charCodeAt(p + 2);
    fnrp.bpm = Math.round(60000000 / fnrp.tempo);
    p += 3;
    fnrp.tsig = [s.charCodeAt(p), s.charCodeAt(p + 1)];
    p += 2;
    while (p < s.length) {
      t = s.substr(p, 4);
      len = (s.charCodeAt(p + 4) << 24) + (s.charCodeAt(p + 5) << 16) + (s.charCodeAt(p + 6) << 8) + s.charCodeAt(p + 7);
      p += 8;
      if (t == 'Mnam') {
        fnrp.name = s.substr(p, len);
      }
      else if (t == 'Gnam') {
        fnrp.genre = s.substr(p, len);
      }
      else if (t == 'Kwd1') {
        fnrp.kwd1 = s.substr(p, len);
      }
      else if (t == 'Kwd2') {
        fnrp.kwd2 = s.substr(p, len);
      }
      p += len;
    }
    return fnrp;
  }

  function chordName(n) {
    return [
      'Maj', 'Maj6', 'Maj7', 'Maj7#11', 'Maj(9)', 'Maj7(9)', 'Maj6(9)', 'aug',
      'min', 'min6', 'min7', 'min7b5', 'min(9)', 'min7(9)', 'min7(11)', 'minMaj7', 'minMaj7(9)',
      'dim', 'dim7', '7', '7sus4', '7b5', '7(9)', '7#11', '7(13)', '7(b9)', '7(b13)', '7(#9)',
      'Maj7aug', '7aug', '1+8', '1+5', 'sus4', '1+2+5', 'cancel'
    ][n];
  }

  STY.chordName = chordName;
  STY.prototype.chordName = chordName;

  JZZ.MIDI.STY = STY;
});
