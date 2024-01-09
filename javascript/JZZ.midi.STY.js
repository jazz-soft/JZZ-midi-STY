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

  var _ver = '0.1.0';
  var _now = JZZ.lib.now;

  function STY(smf) {
    var self = this;
    if (!(self instanceof STY)) {
      self = new STY();
    }
    self.tsig = [4, 4];
    self.ppqn = 96;
    self.tempo = 500000; // 120 BPM
    self.bpm = 120;
    self.name = 'Untitled';
    self.mtrk = [];
    self.trk = {};
    if (smf) self.load(smf);
    return self;
  }

  STY.prototype.load = function(smf) {
    var i, j, k, s, t, x;
    if (!(smf instanceof JZZ.MIDI.SMF)) smf = new JZZ.MIDI.SMF(smf);
    this.ppqn = smf.ppqn;
    this.mtrk = [];
    this.trk = {};
    for (i = 0; i < smf.length; i++) {
      if (smf[i].type == 'MTrk') {
        if (!this.mtrk.length) {
          x = _splitMTrk(smf[i]);
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
                  this.tsig = t[k].getTimeSignature4();
                }
                else if (t[k].isCopyright()) {
                  this.copyright = t[k].getText();
                }
              }
            }
            else if (s == 'SFF1' || s == 'SFF2') {
              for (k = 0; k < t.length; k++) if (t[k].isSeqName()) this.name = t[k].getText();
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
      if (smf[i].type == 'MHhd') this.mhhd = smf[i].data;
    }
  };
  STY.version = function() { return _ver; };
  STY.prototype.version = STY.version;

  STY.prototype.dump = function() {
    var smf = new JZZ.MIDI.SMF(0, this.ppqn);
    var trk = new JZZ.MIDI.SMF.MTrk();
    smf.push(trk);
    var i, j, t, tt, m;
    var tr = this.trk[''];
    if (!tr) {
      tr = new JZZ.MIDI.SMF.MTrk();
      tr.smfTimeSignature(1, 1);
      tr.smfTempo(this.tempo);
      if (this.copyright) tr.smfCopyright(this.copyright);
    }
    for (i = 0; i < tr.length; i++) {
      m = tr[i];
      if (m.isCopyright()) { if (this.copyright) trk.smfCopyright(this.copyright); }
      else if (m.isTempo()) trk.smfTempo(this.tempo);
      else if (m.isTimeSignature()) trk.smfTimeSignature(this.tsig[0], this.tsig[1], this.tsig[2], this.tsig[3]);
      else trk.add(0, m);
    }
    tr = this.trk.SFF1 || this.trk.SFF2;
    if (!tr) {
      tr = new JZZ.MIDI.SMF.MTrk();
      tr.smfMarker('SFF1');
      tr.smfSeqName(this.name);
      tr.send([0xf0, 0x43, 0x76, 0x1a, 0x10, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0xf7]);
      tr.send([0xf0, 0x43, 0x73, 0x39, 0x11, 0x00, 0x46, 0x00, 0xf7]);
      tr.send([0xf0, 0x43, 0x73, 0x01, 0x51, 0x05, 0x00, 0x01, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xf7]);
      tr.send([0xf0, 0x43, 0x73, 0x01, 0x51, 0x05, 0x00, 0x02, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xf7]);
    }
    for (i = 0; i < tr.length; i++) {
      m = tr[i];
      if (m.isSeqName()) trk.smfSeqName(this.name);
      else trk.add(0, m);
    }
    t = 0;
    for (i = 0; i < this.mtrk.length; i++) {
      tr = this.trk[this.mtrk[i]];
      for (j = 0; j < tr.length; j++) {
        m = tr[j];
        tt = m.tt + t;
        trk.add(tt, m);
      }
      t = tt;
    }
    if (this.casm) smf.push(new JZZ.MIDI.SMF.Chunk('CASM', _dumpCASM(this.casm)));
    if (this.otsc) smf.push(new JZZ.MIDI.SMF.Chunk('OTSc', _dumpOTSc(this.otsc)));
    if (this.fnrc) smf.push(new JZZ.MIDI.SMF.Chunk('FNRc', _dumpFNRc(this.fnrc)));
    if (this.mhhd) smf.push(new JZZ.MIDI.SMF.Chunk('MHhd', this.mhhd));
    return smf.dump();
  };

  function _splitMTrk(trk) {
    var i, k, t, m;
    var ttt = [];
    t = new JZZ.MIDI.SMF.MTrk();
    t.title = '';
    k = 0;
    ttt.push(t);
    for (i = 0; i < trk.length; i++) {
      m = trk[i];
      if (m.isMarker()) {
        t.add(m.tt - k, JZZ.MIDI.smfEndOfTrack());
        t = new JZZ.MIDI.SMF.MTrk();
        k = m.tt;
        t.title = m.dd;
        ttt.push(t);
      }
      t.add(m.tt - k, m);
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
  function _dumpCASM(casm) {
    var i, j, s, x;
    var dump = '';
    for (i = 0; i < casm.length; i++) {
      x = casm[i];
      s = _pack('Sdec', x.sdec);
      if (x.ctab) for (j = 0; j < x.ctab.length; j++) s += _pack('Ctab', _dumpCtab(x.ctab[j]));
      if (x.ctb2) for (j = 0; j < x.ctb2.length; j++) s += _pack('Ctb2', _dumpCtb2(x.ctb2[j]));
      dump += _pack('CSEG', s);
    }
    return dump;
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
    ctb.chord = [s.charCodeAt(18), s.charCodeAt(19)];
    return ctb;
  }
  function _dumpCtb(ctb) {
    return [
      String.fromCharCode(ctb.src),
      (ctb.name + '\x00\x00\x00\x00\x00\x00\x00\x00').substr(0, 8),
      String.fromCharCode(ctb.dest),
      ctb.editable ? '\x01' : '\x00',
      String.fromCharCode(ctb.notes >> 8), String.fromCharCode(ctb.notes & 255),
      String.fromCharCode((ctb.chords >> 32) & 255), String.fromCharCode((ctb.chords >> 24) & 255),
      String.fromCharCode((ctb.chords >> 16) & 255), String.fromCharCode((ctb.chords >> 8) & 255),
      String.fromCharCode(ctb.chords & 255),
      String.fromCharCode(ctb.chord[0] & 255),
      String.fromCharCode(ctb.chord[1] & 255)
    ].join('');
  }
  function _splitCtab(s) {
    var ctb = _splitCtb(s);
    ctb.ctab = true;
    ctb.ntr = s.charCodeAt(20);
    ctb.ntt = s.charCodeAt(21);
    ctb.hikey = s.charCodeAt(22);
    ctb.lolim = s.charCodeAt(23);
    ctb.hilim = s.charCodeAt(24);
    ctb.rtr = s.charCodeAt(25);
    if (s.charCodeAt(26)) {
      ctb.extra = [];
      for (var i = 26; i < s.length; i++) ctb.extra.push(s.charCodeAt(i));
    }
    return ctb;
  }
  function _dumpCtab(ctb) {
    var dump = [
      _dumpCtb(ctb),
      String.fromCharCode(ctb.ntr),
      String.fromCharCode(ctb.ntt),
      String.fromCharCode(ctb.hikey),
      String.fromCharCode(ctb.lolim),
      String.fromCharCode(ctb.hilim),
      String.fromCharCode(ctb.rtr)
    ];
    if (ctb.extra) for (var i = 0; i < ctb.extra.length; i++) dump.push(String.fromCharCode(ctb.extra[i]));
    return dump.join('');
  }
  function _splitCtb2(s) {
    var ctb = _splitCtb(s);
    ctb.ctb2 = true;
    ctb.lomid = s.charCodeAt(20);
    ctb.himid = s.charCodeAt(21);
    ctb.ntrlo = s.charCodeAt(22);
    ctb.nttlo = s.charCodeAt(23);
    ctb.hikeylo = s.charCodeAt(24);
    ctb.lolimlo = s.charCodeAt(25);
    ctb.hilimlo = s.charCodeAt(26);
    ctb.rtrlo = s.charCodeAt(27);
    ctb.ntr = s.charCodeAt(28);
    ctb.ntt = s.charCodeAt(29);
    ctb.hikey = s.charCodeAt(30);
    ctb.lolim = s.charCodeAt(31);
    ctb.hilim = s.charCodeAt(32);
    ctb.rtr = s.charCodeAt(33);
    ctb.ntrhi = s.charCodeAt(34);
    ctb.ntthi = s.charCodeAt(35);
    ctb.hikeyhi = s.charCodeAt(36);
    ctb.lolimhi = s.charCodeAt(37);
    ctb.hilimhi = s.charCodeAt(38);
    ctb.rtrhi = s.charCodeAt(39);
    ctb.extra = [];
    for (var i = 40; i < s.length; i++) ctb.extra.push(s.charCodeAt(i));
    return ctb;
  }
  function _dumpCtb2(ctb) {
    var dump = [
      _dumpCtb(ctb),
      String.fromCharCode(ctb.lomid),
      String.fromCharCode(ctb.himid),
      String.fromCharCode(ctb.ntrlo),
      String.fromCharCode(ctb.nttlo),
      String.fromCharCode(ctb.hikeylo),
      String.fromCharCode(ctb.lolimlo),
      String.fromCharCode(ctb.hilimlo),
      String.fromCharCode(ctb.rtrlo),
      String.fromCharCode(ctb.ntr),
      String.fromCharCode(ctb.ntt),
      String.fromCharCode(ctb.hikey),
      String.fromCharCode(ctb.lolim),
      String.fromCharCode(ctb.hilim),
      String.fromCharCode(ctb.rtr),
      String.fromCharCode(ctb.ntrhi),
      String.fromCharCode(ctb.ntthi),
      String.fromCharCode(ctb.hikeyhi),
      String.fromCharCode(ctb.lolimhi),
      String.fromCharCode(ctb.hilimhi),
      String.fromCharCode(ctb.rtrhi)
    ];
    if (ctb.extra) for (var i = 0; i < ctb.extra.length; i++) dump.push(String.fromCharCode(ctb.extra[i]));
    return dump.join('');
  }
  function _splitCntt(s) {
    var cntt = {};
    cntt.src = s.charCodeAt(0);
    cntt.ntt = s.charCodeAt(1);
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
  function _dumpOTSc(otsc) {
    var dump = '';
    for (var i = 0; i < otsc.length; i++) dump += otsc[i].dump();
    return dump;
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
  function _pack(t, s) {
    s = s || '';
    return t + JZZ.MIDI.SMF.num4(s.length) + s;
  }
  function _dumpFNRc(frnc) {
    var i, f, s;
    var dump = '';
    for (i = 0; i < frnc.length; i++) {
      f = frnc[i];
      s = [
        JZZ.MIDI.SMF.num4(f.tempo).substr(1),
        String.fromCharCode(f.tsig[0]), String.fromCharCode(f.tsig[1]),
        _pack('Mnam', f.name), _pack('Gnam', f.genre),
        _pack('Kwd1', f.kwd1), _pack('Kwd2', f.kwd2)
      ].join('');
      dump += _pack('FNRP', s);
    }
    return dump;
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

  function noteName(n) { return ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'][n]; }
  function chordName(n) {
    return [
      'Maj', 'Maj6', 'Maj7', 'Maj7#11', 'Maj(9)', 'Maj7(9)', 'Maj6(9)', 'aug',
      'min', 'min6', 'min7', 'min7b5', 'min(9)', 'min7(9)', 'min7(11)', 'minMaj7', 'minMaj7(9)',
      'dim', 'dim7', '7', '7sus4', '7b5', '7(9)', '7#11', '7(13)', '7(b9)', '7(b13)', '7(#9)',
      'Maj7aug', '7aug', '1+8', '1+5', 'sus4', '1+2+5', 'cancel'
    ][n];
  }
  function ntrName(n) { return ['Transposition', 'Fixed', 'Guitar'][n]; }
  function nttName(n, m) {
    if (!m) return ['Bypass', 'Melody', 'Chord', 'Bass', 'Melodic Minor', 'Harmonic Minor'][n];
    var ntt = m == 'g' ? ['All-Purpose', 'Stroke', 'Arpeggio'] :
      ['Bypass', 'Melody', 'Chord', 'Melodic minor', 'Melodic minor V', 'Harmonic minor', 'Harmonic minor V', 'Natural minor', 'Natural minor V', 'Dorian', 'Dorian V'];
    return ntt[n & 0x7f] + ((n & 0x80) ? ' / Bass' : '');
}
  function rtrName(n) { return ['Stop', 'Pitch shift', 'Pitch shift to root', 'Retrigger', 'Retrigger to root', 'Note generator'][n]; }
  function partName(n) { return { 8: 'sub rhythm', 9: 'rhythm', 10: 'bass', 11: 'chord 1', 12: 'chord 2', 13: 'pad', 14: 'phrase 1', 15: 'phrase 2' }[n] || n; }

  STY.noteName = noteName;
  STY.prototype.noteName = noteName;
  STY.chordName = chordName;
  STY.prototype.chordName = chordName;
  STY.ntrName = ntrName;
  STY.prototype.ntrName = ntrName;
  STY.nttName = nttName;
  STY.prototype.nttName = nttName;
  STY.rtrName = rtrName;
  STY.prototype.rtrName = rtrName;
  STY.partName = partName;
  STY.prototype.partName = partName;

  STY.prototype.tracks = function() { return this.mtrk ? this.mtrk.slice() : []; };

  STY.prototype.track = function(s) {
    var trk, t, i, k;
    if (s.substr(0, 4) == 'OTSc') {
      s = s.substr(4).trim();
      k = parseInt(s);
      if (k == s && this.otsc) t = this.otsc[k - 1];
      if (t) trk = new JZZ.MIDI.SMF.MTrk();
    }
    else {
      t = this.trk[s];
      if (t) trk = new JZZ.MIDI.SMF.MTrk();
      if (s != '' && s != 'SFF1' && s != 'SFF2') trk.add(0, JZZ.MIDI.smfTempo(this.tempo));
    }
    if (!trk) return;
    if (t.length) {
      for (i = 0; i < t.length; i++) trk.add(t[i].tt, t[i]);
    }
    return trk;
  };

  STY.prototype.export = function(s) {
    var trk = this.track(s);
    if (trk) {
      var smf = new JZZ.MIDI.SMF(0, this.ppqn);
      smf.push(trk);
      return smf;
    }
  };

  STY.prototype.player = function() {
    var pl = new Player();
    pl._tr = {};
    var i, k, t, tr;
    var keys = Object.keys(this.trk);
    for (k = 0; k < keys.length; k++) {
      t = this.trk[keys[k]];
      tr = [];
      for (i = 0; i < t.length; i++) tr.push(JZZ.MIDI(t[i]));
      pl.trk[k] = tr;
    }
    return pl;
  };

  function Player() {
    var self = new JZZ.Widget();
    self._info.name = 'STYLE Player';
    self._info.manufacturer = 'Jazz-Soft';
    self._info.version = _ver;
    self.playing = false;
    self.trk = {};
    self._pos = 0;
    self._tick = (function(x) { return function(){ x.tick(); }; })(self);
    for (var k in Player.prototype) if (Player.prototype.hasOwnProperty(k)) self[k] = Player.prototype[k];
    return self;
  }
  Player.prototype.play = function() {
    this.event = undefined;
    this.playing = true;
    this.paused = false;
    this._ptr = 0;
    this._pos = 0;
    this._p0 = 0;
    this._t0 = _now();
    this.tick();
  };
  Player.prototype.stop = function() {
    this._pos = 0;
    this.playing = false;
    this.event = 'stop';
    this.paused = undefined;
  };
  Player.prototype.pause = function() {
    this.event = 'pause';
  };
  Player.prototype.resume = function() {
    if (this.playing) return;
    if (this.paused) {
      this.event = undefined;
      this._t0 = _now();
      this.playing = true;
      this.paused = false;
      this.tick();
    }
    else this.play();
  };
  Player.prototype.schedule = function(s) {
    if (this.trk[s]) {
      this.next = s;
    }
  };
  function _filter(e) { this._receive(e); }
  Player.prototype._filter = _filter;
  Player.prototype.filter = function(f) {
    this._filter = f instanceof Function ? f : _filter;
  };
  function _div(s) { return (s.charCodeAt(0) << 16) + (s.charCodeAt(1) << 8) + s.charCodeAt(2); }
  Player.prototype._receive = function(e) {
    if (e.ff == 0x51 && this.ppqn) {
      this._mul = this.ppqn * 1000.0 / _div(e.dd);
      this.mul = this._mul * this._speed;
      this._t0 = _now();
      this._p0 = this._pos;
    }
    this._emit(e);
  };
  Player.prototype.tick = function() {
    var t = _now();
    var e;
    this._pos = this._p0 + (t - this._t0) * this.mul;
    for(; this._ptr < this._data.length; this._ptr++) {
      e = this._data[this._ptr];
      if (e.tt > this._pos) break;
      this._filter(e);
    }
    if (this._ptr >= this._data.length) {
      if (this._loop && this._loop != -1) this._loop--;
      if (this._loop) {
        this._ptr = 0;
        this._p0 = 0;
        this._t0 = t;
      }
      else this.stop();
      this.onEnd();
    }
    if (this.event == 'stop') {
      this.playing = false;
      this.paused = false;
      this._pos = 0;
      this._ptr = 0;
      this.sndOff();
      this.event = undefined;
    }
    if (this.event == 'pause') {
      this.playing = false;
      this.paused = true;
      if (this._pos >= this._duration) this._pos = this._duration - 1;
      this._p0 = this._pos;
      this.sndOff();
      this.event = undefined;
    }
    if (this.playing) JZZ.lib.schedule(this._tick);
  };

  JZZ.MIDI.STY = STY;
});
