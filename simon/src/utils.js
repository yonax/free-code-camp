export function padleft(s, n, filler="0") {
  return (Array(n).fill(filler).join('') + String(s)).slice(-n);
}

export function randRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function choice(xs) {
  return xs[randRange(0, xs.length - 1)];
}
