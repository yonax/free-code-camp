import React, { Component } from 'react';
import update from 'react/lib/update';
import cx from 'classnames';
// const d3 = require('d3');
import { padleft, choice } from './utils';

import './App.css';

const ARC = "M9.797174393178826e-15,-160A160,160,0,0,1,160,0L90,0A90,90,0,0,0,5.5109105961630896e-15,-90Z";
/*
  d3.arc()
    .innerRadius(90)
    .outerRadius(160)
    .startAngle(0)
    .endAngle(Math.PI / 2)();
*/

const audio = new (window.AudioContext || window.webkitAudioContext)();
const SOUNDS = {
  'green' : make(audio, 391.995),
  'red'   : make(audio, 329.628),
  'yellow': make(audio, 261.626),
  'blue'  : make(audio, 195.998),
  'err'   : make(audio, 44.0, 'square')
};
const STEPS_TO_WIN = 20;
const WIN_SEQ = [
  "red", "green", "yellow", "blue",
  "green", "green", "red", "green", "yellow", "blue",
  "red", "red", "green", "yellow", "blue"
];

function pause(duration) {
  return new Promise(function(resolve, _) {
    setTimeout(resolve, duration * 1000);
  });
}

function make(ctx, freq, type='sine') {
  const oscillator = ctx.createOscillator();
  oscillator.type = type;
  oscillator.frequency.value = freq;
  oscillator.start(0.0);

  const gainNode = ctx.createGain();
  oscillator.connect(gainNode);
  gainNode.gain.value = 0;
  gainNode.connect(ctx.destination);

  return {
    play: function(duration) {
      gainNode.gain.exponentialRampToValueAtTime(1,  ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration + 0.05);

      return pause(duration + 0.05);
    }
  }
}

function playTone(color, duration, cb) {
  cb && cb(color, true);
  return SOUNDS[color].play(duration).then(() => cb && cb(color, false));
}

function playSeq(seq, toneDuration, pauseDuration, cb) {
  return seq.reduce((acc, color) =>
    acc.then(() => playTone(color, toneDuration, cb))
       .then(() => pause(pauseDuration))
  , Promise.resolve());
}

function playError() {
  return playTone('err', 0.5)
}

function nextToneDuration(length) {
  if (length >= 14) {
    return 0.22;
  } else if (length >= 6) {
    return 0.32;
  }
  return 0.42;
}

class App extends Component {
  initialState = {
      played: {
        red: false,
        green: false,
        blue: false,
        yellow: false,
      },
      seq: [],
      playerInput: 0,
      strictMode: false,
      status: 'idle', // idle | playing-seq | waiting-input | bad-input
      toneDuration: 0.42, // 1-5: 0.42, 6-13: 0.32, > 14: 0.22
      won: false
  }
  constructor(props) {
    super(props);
    this.state = this.initialState;
  }
  playSeq() {
    const { seq, toneDuration } = this.state;
    this.setState({ status: 'playing-seq' });
    playSeq(seq, toneDuration, 0.1, this.setColor)
      .then(() => this.setState({ status: 'waiting-input' }));
  }
  setColor = (color, value) => {
    this.setState(update(this.state, {
      played: {
        [color]: {
          $set: value
        }
      }
    }));
  }
  playTone(color) {
    return playTone(color, this.state.toneDuration, this.setColor);
  }
  play(color) {
    const { status, seq, playerInput, strictMode, toneDuration } = this.state;
    if (status !== 'waiting-input')
      return;
    if (playerInput + 1 > seq.length)
      return;

    if (seq[playerInput] !== color) {
      this.setState({ playerInput: 0, status: 'bad-input' });
      const error = playError();

      if (strictMode) {
        error.then(() => this.startGame());
        return;
      }
      error.then(() => this.playSeq());
      return;
    }

    if (playerInput === STEPS_TO_WIN - 1) {
      this.playTone(color)
      .then(() => this.setState({ won: true, status: 'playing-seq' }))
      .then(() => pause(0.5))
      .then(() => playSeq(WIN_SEQ, 0.22, 0.05, this.setColor))
      .then(() => pause(0.5))
      .then(() => this.setState(this.initialState));

      return;
    }

    if (playerInput !== seq.length - 1) {
      this.setState(update(this.state, {
        playerInput: {
          $set: playerInput + 1
        }
      }), () => this.playTone(color));
    } else {
      this.addStep()
        .then(() => this.playTone(color))
        .then(() => pause(0.5))
        .then(() => this.playSeq());
    }
  }
  addStep() {
    const seqLength = this.state.seq.length;

    return new Promise((resolve, _) =>
      this.setState(update(this.state, {
        seq: {
          $push: [choice(['red', 'green', 'blue', 'yellow'])],
        },
        playerInput: {
          $set: 0
        },
        toneDuration: {
          $set: nextToneDuration(seqLength + 1) 
        }
      }), () => resolve())
    );
  }
  startGame() {
    this.setState(update(this.state, {
      status: {
        $set: 'playing-seq'
      },
      playerInput: {
        $set: 0
      },
      seq: {
        $set: [choice(['red', 'green', 'blue', 'yellow'])],
      }
    }), () => this.playSeq());
  }
  render() {
    const { won, played, status, seq, strictMode } = this.state;
    const seqLength = seq.length;

    return (
      <div className="app">
        <svg viewBox="0 0 400 400">
          <g transform="translate(200, 200)">
            <circle r={180} fill="#333" />
            <path onClick={this.play.bind(this, 'red')}
                  className={cx("btn red-btn", {active: played.red})}
                  d={ARC} />
            <path onClick={this.play.bind(this, 'blue')}
                  className={cx("btn blue-btn", {active: played.blue })}
                  d={ARC} transform="rotate(90)" />
            <path onClick={this.play.bind(this, 'yellow')}
                  className={cx("btn yellow-btn", {active: played.yellow })}
                  d={ARC} transform="rotate(180)" />
            <path onClick={this.play.bind(this, 'green')}
                  className={cx("btn green-btn", {active: played.green })}
                  d={ARC} transform="rotate(270)" />
            <path d="M0,-180 L0,180 M-180,0 L180,0"
                  stroke="#333" strokeWidth={20} />
            <circle r={80} fill="#ECE7EE" onClick={this.playSeq.bind(this)}/>
            <g className="controls">
              <text className="logo" y={-40} x={-47} fontSize={34}>simon</text>
              { won && <text y={-20} x={-30} fill="orange">You won!</text>}
              <g className="count-display" transform="translate(-65, 20)">
                <text fontSize="32">
                  { padleft(seqLength, 2) }
                </text>
                <text y={15} fontSize="12">Count</text>
              </g>
              <g className={cx("btn start-btn", {active: status !== 'idle' })}
                 onClick={this.startGame.bind(this)}
                 transform="translate(0, 20)">
                <circle cy={-11} r={11} fill="silver" />
                <text x={-12} y={15} fontSize="12">Start</text>
              </g>
              <g className={cx("btn strict-btn", {active: strictMode})}
                 onClick={() => this.setState({ strictMode: !strictMode })}
                 transform="translate(50, 20)">
                <circle cy={-11} r={11} fill="silver" />
                <text x={-12} y={15} fontSize="12">Strict</text>
              </g>
            </g>
          </g>
        </svg>
      </div>
    );
  }
}

export default App;
