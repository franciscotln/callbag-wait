const wait = ms => source => (start, sink) => {
  if (start !== 0) return;
  let talkback;
  const ids = [];
  const unsubInterceptor = (t, d) => {
    if (t === 2 && ids.length) while (ids.length) clearTimeout(ids.shift());
    talkback(t, d);
  };

  source(start, (t, d) => {
    if (t === start) {
      talkback = d;
      sink(t, unsubInterceptor);
    } else {
      const id = setTimeout(() => {
        sink(t, d);
        ids.splice(ids.indexOf(id), 1);
      }, ms);
      ids.push(id);
      if (t === 1) talkback(t);
    }
  });
};

module.exports = wait;
