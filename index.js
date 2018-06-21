const wait = ms => source => (start, sink) => {
  if (start !== 0) return;
  let talkback;
  const ids = [];
  const unsubInterceptor = (t, d) => {
    if (t === 2) while (ids.length) clearTimeout(ids.shift());
    talkback(t, d);
  };

  source(0, (t, d) => {
    if (t === 0) {
      talkback = d;
      sink(t, unsubInterceptor);
    } else {
      const id = setTimeout(() => {
        ids.splice(ids.indexOf(id), 1);
        sink(t, d);
      }, ms);
      ids.push(id);
    }
  });
};

module.exports = wait;
