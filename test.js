const tape = require('tape');
const fromIter = require('callbag-from-iter');
const wait = require('.');

tape('It delays a pullable source', t => {
  t.plan(10);

  const sourceEmits = [
    [0, 'function'],
    [1, 'number'],
    [1, 'number'],
    [2, 'undefined']
  ];

  const sinkReceives = [];

  let talkback;

  function sink(type, data) {
    if (type === 0) talkback = data;
    if (type === 0 || type === 1) talkback(1);
    sinkReceives.push([type, data]);
  }

  wait(100)(fromIter([0, 1]))(0, sink);

  setTimeout(() => {
    while (sinkReceives.length) {
      const [type, data] = sinkReceives.shift();
      const [Type, dataType] = sourceEmits.shift();
      t.equal(type, Type, `Type is ${type}`);
      t.equal(typeof data, dataType, `Data type is ${dataType}`);
    }
    t.equal(sinkReceives.length, sourceEmits.length, 'no data left');
    t.pass('nothing else happens');
    t.end();
  }, 100);
});

tape('It delays a listenable source', t => {
  t.plan(10);

  const sourceEmits = [
    [0, 'function'],
    [1, 'number'],
    [1, 'number'],
    [2, 'undefined']
  ];

  const sinkReceives = [];

  function source(start, sink) {
    if (start !== 0) return;
    let n = 0;
    sink(0, () => { });
    const id = setInterval(() => {
      sink(1, n++);
      if (n > 1) {
        clearInterval(id);
        sink(2);
      }
    }, 1000);
  }

  function sink(type, data) {
    sinkReceives.push([type, data]);
  }

  wait(1000)(source)(0, sink);

  setTimeout(() => {
    while (sinkReceives.length) {
      const [type, data] = sinkReceives.shift();
      const [Type, dataType] = sourceEmits.shift();
      t.equal(type, Type, `Type is ${type}`);
      t.equal(typeof data, dataType, `Data type is ${dataType}`);
    }
    t.equal(sinkReceives.length, sourceEmits.length, 'no data left');
    t.pass('nothing else happens');
    t.end();
  }, 3050);
});

tape('It notifies a pullable source about unsubscription', t => {
  t.plan(4);

  const sinkReceives = [];

  let talkback;

  function sink(type, data) {
    sinkReceives.push([type, typeof data]);
    if (type === 0) {
      talkback = data;
      setTimeout(() => {
        talkback(2);
      }, 100);
    }
    if (type === 1 || type === 0) {
      talkback(1);
    }
  }

  wait(100)(fromIter([0, 1, 2]))(0, sink);

  setTimeout(() => {
    t.equal(sinkReceives.length, 1, 'the sink receives the talkback function and unsubscribes before getting data');
    t.equal(sinkReceives[0][0], 0, `Type is 0`);
    t.equal(sinkReceives[0][1], 'function', `Data type is function`);
    t.pass('nothing else happens');
    t.end();
  }, 300);
});

tape('It notifies a listenable source about unsubscription', t => {
  t.plan(9);

  const sourceEmits = [
    [0, 'function'],
    [1, 'number'],
    [1, 'number']
  ];

  const sinkReceives = [];

  let unsubscribed = false;

  function source(start, sink) {
    if (start !== 0) return;
    let n = 0;
    let id;
    sink(0, type => {
      if (type === 2) {
        unsubscribed = true;
        clearInterval(id);
      }
    });
    id = setInterval(() => {
      sink(1, n++);
    }, 100);
  }

  function sink(type, data) {
    sinkReceives.push([type, data]);
    if (type === 0) {
      setTimeout(() => {
        data(2);
      }, 400);
    }
  }

  wait(100)(source)(0, sink);

  setTimeout(() => {
    while (sinkReceives.length) {
      const [type, data] = sinkReceives.shift();
      const [Type, dataType] = sourceEmits.shift();
      t.equal(type, Type, `Type is ${type}`);
      t.equal(typeof data, dataType, `Data type is ${dataType}`);
    }
    t.equal(unsubscribed, true, 'interval is cleared');
    t.equal(sinkReceives.length, sourceEmits.length, 'no data left');
    t.pass('nothing else happens');
    t.end();
  }, 400);
});
