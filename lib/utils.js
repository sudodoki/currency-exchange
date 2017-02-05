const times = (n, fn) => Array.from({ length: n }, (_, i) => fn(i));
const zeroPad = (length) => (n) => {
  const str = '' + n;
  return str.length < length ? '0'.repeat(length - str.length) + n : n;
}
module.exports = { times, zeroPad }
