export function formatSecondsLeft(secondsLeft) {
  const formatedMinutes = padleft(Math.floor(secondsLeft / 60), 2);
  const formatedSeconds = padleft(secondsLeft % 60, 2);
  return `${formatedMinutes}:${formatedSeconds}`;
}

export function padleft(s, n, filler='0') {
  return (Array(n).fill(filler).join('') + s).slice(-n);
}

export function inRange(value, min, max) {
  return value >= min && value <= max;
}

let UNIQ_ID = 0;
export function uniqId() {
  return ++UNIQ_ID;
}
