# callbag-wait

Callbag operator that delays the emission of items from the source Callbag by a given timeout. Works for both listenable and pullable sources.

`npm install callbag-wait`

## Examples

### Iterable Source

```js
const forEach = require('callbag-for-each');
const fromIter = require('callbag-from-iter');
const pipe = require('callbag-pipe');
const wait = require('callbag-wait');

pipe(
  fromIter([0, 1, 2, 3]),
  wait(2000),
  forEach(v => console.log(v)) // => ----(0,1,2,3)|
);
```

### Listenable Source

```js
const forEach = require('callbag-for-each');
const interval = require('callbag-interval');
const pipe = require('callbag-pipe');
const take = require('callbag-take');
const wait = require('callbag-wait');

pipe(
  interval(1000),
  wait(2000),
  take(4),
  forEach(v => console.log(v)) // => ----0--1--2--3|
);
```