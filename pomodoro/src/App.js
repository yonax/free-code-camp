import React, { Component } from 'react';
import { Motion, spring } from 'react-motion';
import NumberInput from './components/NumberInput';
import { formatSecondsLeft } from './utils';

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phase: 'session',
      active: false,
      secondsLeft:  props.sessionSeconds || 25*60,
      sessionSeconds: props.sessionSeconds || 25*60,
      breakSeconds: props.breakSeconds || 5*60
    };
  }
  toggle = () => {
    const active = !this.state.active;
    this.setState({ active });
    if (active) { this.startTicker(); }
    else { this.stopTicker(); }
  }
  reset = () => {
    this.setState({
      active: false,
      phase: 'session',
      secondsLeft: this.state.sessionSeconds
    });
    this.stopTicker();
  }
  startTicker = () => {
    this.interval = setInterval(this.tick, 1000);
  }
  stopTicker = () => {
    clearInterval(this.interval);
  }
  componentWillUnmount() {
    this.stopTicker();
  }
  tick = () => {
    if (!this.state.active) return;
    const secondsLeft = this.state.secondsLeft - 1;

    if (secondsLeft <= 0) {
      const { phase, sessionSeconds, breakSeconds } = this.state;

      const nextPhase = phase === 'session' ? 'break' : 'session';
      const nextSeconds = nextPhase === 'session' ? sessionSeconds : breakSeconds;

      this.setState({
        phase: nextPhase,
        secondsLeft: nextSeconds
      });
    } else {
      this.setState({ secondsLeft });
    }
  }
  handleSessionChange = (sessionMinutes) => {
    const sessionSeconds = sessionMinutes * 60;
    this.setState({ sessionSeconds, secondsLeft: sessionSeconds });
  }
  handleBreakChange = (breakMinutes) => {
    const breakSeconds = breakMinutes * 60;
    this.setState({ breakSeconds });
  }
  render() {
    const { active, phase, secondsLeft, sessionSeconds, breakSeconds } = this.state;
    const phaseSeconds = phase === 'session' ? sessionSeconds : breakSeconds;
    const outerR = active ? 100 : 20;
    const opacity = active ? 1 : 0;

    return (
      <div className="pomodoro-app">
        <h2>{ phase }</h2>
        <svg viewBox="0 0 220 220" className="indicator">
          <g transform="translate(110 110)">
            <circle r={outerR} opacity={opacity} stroke="#cecece" strokeWidth={5} fill="none" />
            <circle className="circle-ind"
                    r={outerR} fill="none" stroke="#fc6e6d" opacity={opacity}
                    transform="rotate(-90)"
                    strokeDasharray={2*Math.PI*100}
                    strokeDashoffset={(2*Math.PI*100)*(secondsLeft / phaseSeconds)} />
            <text x={-21} y={-30}>{formatSecondsLeft(secondsLeft)}</text>
            <g onClick={this.toggle} className="btn">
              <circle r={20} fill="transparent" />
              <path d={ active ? "M-5,-10 L-5,10 M5,-10 L5,10" : "M11,0 L-8,-8 L-8,8 Z"} />
            </g>
          </g>
        </svg>
        <div className={`inputs ${active && 'hidden'}`}>
          <a href="#" onClick={(e) => { e.preventDefault(); this.reset() }} className="btn-reset">Reset</a>
          <NumberInput label="Session minutes"
                       min={1} max={60} step={1}
                       disabled={active}
                       value={sessionSeconds / 60}
                       onChange={this.handleSessionChange} />

          <NumberInput label="Break minutes"
                       min={1} max={60} step={1}
                       disabled={active}
                       value={breakSeconds / 60}
                       onChange={this.handleBreakChange} />
        </div>
      </div>
    );
  }
}

export default App;
