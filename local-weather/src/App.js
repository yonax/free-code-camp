import React, { Component } from 'react';
import loadWeather from './api';
import { oppositeUnit } from './utils';
import './App.css';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = { unit: 'celsius', loading: true };
  }
  componentDidMount() {
    this.load();
    this.interval = setInterval(this.update.bind(this), 3600*1000);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  load() {
    return loadWeather()
           .then(weather => this.setState({ weather, loading: false }));
  }
  update() {
    if (this.state.updating) return;

    this.setState({ updating: true });
    this.load().then(() => this.setState({ updating: false }));
  }
  toggleUnit() {
    const { unit } = this.state;
    this.setState({ unit: oppositeUnit(unit) });
  }
  render() {
    const { loading, unit, updating, weather } = this.state;
    return (
      <div>
        { loading
          ? <div style={{height: '100vh', fontSize: '10vh'}} className="weather">Loading...</div>
          : <div>
              <WeatherInfo unit={unit} weather={weather} />
              <Controls unit={unit} updating={updating}
                        update={this.update.bind(this)}
                        toggleUnit={this.toggleUnit.bind(this)} />
            </div>
        }
      </div>
    );
  }
}

function WeatherInfo({ unit, weather }) {
  const temperature = weather[unit === 'celsius' ? 'tempCelsius' : 'tempFahrenheit'];
  const joinedLocation = `${weather.city}, ${weather.country}`;

  return (
    <div className="weather">
      <div className="icon">
        <i className={`wi wi-owm-${weather.id}`}></i>
      </div>
      <div className="temp">
        {temperature}<i className={`wi wi-${unit}`}></i>
      </div>
      <div className="location">
        {joinedLocation}
      </div>
      <div className="detail">
        <div>
          <i className="wi wi-barometer"></i>&nbsp;{weather.pressure}
        </div>
        <div>
          <i className="wi wi-humidity"></i>&nbsp;{weather.humidity}%
        </div>
        <div>
          <i className={`wi wi-wind towards-${weather.windDeg}-deg`}></i>&nbsp;{weather.windSpeed}&nbsp;m/s
        </div>
      </div>
    </div>
  );
}

function Controls({ unit, update, updating, toggleUnit }) {
  return (
    <div className="controls">
      <div onClick={update}>
        <i className="wi wi-refresh"></i>&nbsp;{ updating ? "Updating..." : "Update"}
      </div>
      <div onClick={toggleUnit} style={{textTransform: 'capitalize'}}>
        {oppositeUnit(unit)}
      </div>
    </div>
  );
}
