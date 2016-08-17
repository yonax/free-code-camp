export function toFahrenheit(celsius) {
  return celsius * (9/5) + 32;
}

export function oppositeUnit(unit) {
  return unit === 'celsius' ? 'fahrenheit' : 'celsius';
}
