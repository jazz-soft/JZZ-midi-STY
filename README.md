# JZZ-midi-STY
coming soon...

[![npm](https://img.shields.io/npm/v/jzz-midi-sty.svg)](https://www.npmjs.com/package/jzz-midi-sty)
[![npm](https://img.shields.io/npm/dt/jzz-midi-sty.svg)](https://www.npmjs.com/package/jzz-midi-sty)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/jzz-midi-sty/badge)](https://www.jsdelivr.com/package/npm/jzz-midi-sty)
[![build](https://github.com/jazz-soft/JZZ-midi-STY/actions/workflows/build.yml/badge.svg)](https://github.com/jazz-soft/JZZ-midi-STY/actions)
[![Coverage Status](https://coveralls.io/repos/github/jazz-soft/JZZ-midi-STY/badge.svg?branch=main)](https://coveralls.io/github/jazz-soft/JZZ-midi-STY?branch=main)

[Work-in-progress demo](https://jazz-soft.github.io/modules/sty/index.html)

## Install

`npm install jzz-midi-sty --save`  
or `yarn add jzz-midi-sty`  
or get the full development version and minified scripts from [**GitHub**](https://github.com/jazz-soft/JZZ-midi-STY)

## Usage

##### Plain HTML

```html
<script src="JZZ.js"></script>
<script src="JZZ.midi.SMF.js"></script>
<script src="JZZ.midi.STY.js"></script>
//...
```

##### CDN (jsdelivr)

```html
<script src="https://cdn.jsdelivr.net/npm/jzz"></script>
<script src="https://cdn.jsdelivr.net/npm/jzz-midi-smf"></script>
<script src="https://cdn.jsdelivr.net/npm/jzz-midi-sty"></script>
//...
```

##### CDN (unpkg)

```html
<script src="https://unpkg.com/jzz"></script>
<script src="https://unpkg.com/jzz-midi-smf"></script>
<script src="https://unpkg.com/jzz-midi-sty"></script>
//...
```

##### CommonJS

```js
var JZZ = require('jzz');
require('jzz-midi-smf')(JZZ);
require('jzz-midi-sty')(JZZ);
//...
```

##### TypeScript / ES6

```ts
import { JZZ } from 'jzz';
import { SMF } from 'jzz-midi-smf';
import { STY } from 'jzz-midi-sty';
SMF(JZZ);
STY(JZZ);
//...
```

##### AMD

```js
require(['JZZ', 'JZZ.midi.SMF', 'JZZ.midi.STY'], function(JZZ, dummy1, dummy2) {
  // ...
});
```

## Style files

##### Reading file

```js
var fs = require('fs');
var data = fs.readFileSync('my-style.sty', 'binary');
// data can be String, Buffer, ArrayBuffer, Uint8Array, Int8Array,
// or a JZZ.MIDI.SMF object
var sty = new JZZ.MIDI.STY(data);
```

##### Extracting MIDI tracks

```js
console.log('All style tracks:', sty.tracks());
// additional track names not reported by tracks() can be:
// '', 'SFF1', 'SFF2', 'OTSc1', 'OTSc2', 'OTSc3', 'OTSc4' (if present)
var smf = sty.export('Intro A'); // see JZZ.MIDI.SMF
fs.writeFileSync('intro-a.mid', smf.dump(), 'binary');
fs.writeFileSync('otsc1.mid', sty.export('OTSc1').dump(), 'binary');
```

## Some useful Style links
* http://wierzba.homepage.t-online.de/stylefiles_v101.pdf
* http://www.jososoft.dk/yamaha/articles/keyboard_and_style.pdf
