import { toFahrenheit } from './utils';

const LOCATION_URL = 'http://freegeoip.net/json/';
const WEATHER_URL = 'http://api.openweathermap.org/data/2.5/weather?appid=c43aea5b5eb429f215dcd13e11054267&units=metric';

const getLocationInfo = () => fetch(LOCATION_URL).then(resp => resp.json());
const getWeather = ({country_code, city}) =>
  fetch(WEATHER_URL + `&q=${city},${country_code}`)
  .then(resp => resp.json());

function prepare(weatherData) {
  const round = Math.round;

  return {
    city: weatherData.name,
    country: weatherData.sys.country,
    id: weatherData.weather[0].id,
    tempCelsius: round(weatherData.main.temp),
    tempFahrenheit: round(toFahrenheit(weatherData.main.temp)),
    pressure: round(0.75 * weatherData.main.pressure),
    humidity: round(weatherData.main.humidity),
    windSpeed: weatherData.wind.speed.toFixed(1),
    windDeg: round(weatherData.wind.deg)
  };
}

export default function loadWeather() {
  return getLocationInfo()
        .then(location => getWeather(location))
        .then(prepare);
}
