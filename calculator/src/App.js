import React, { Component } from 'react';
import mathjs from 'mathjs';
import cx from 'classnames';

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      source: "",
    };
  }
  press(button) {
    if (button === '=') {
      const value = evalOrEmpty(this.state.source);
      this.setState({ source: value });
    } else {
       this.setState({ source: `${this.state.source}${button}` });
    }
  }
  reset = () => {
    this.setState({ source: '' });
  }
  render() {
    const source = prepare(this.state.source);
    const value = evalOrEmpty(this.state.source);
    const sourceClassNames = cx('source', { empty: !source });
    const valueClassNames = cx('value', { empty: !value });

    return (
      <div className="calculator">
        <div className="output">
          <div className={sourceClassNames}>
            { source || 0 }
          </div>
          <div className={valueClassNames}>
            { value || 0 }
          </div>
        </div>
        <div className="controls">
          <div className="numbers">
            <div className="row">
              <div className="button" onClick={() => this.press(7)}>
                <div>7</div>
              </div>
              <div className="button" onClick={() => this.press(8)}>
                <div>8</div>
              </div>
              <div className="button" onClick={() => this.press(9)}>
                <div>9</div>
              </div>
            </div>
            <div className="row">
              <div className="button" onClick={() => this.press(4)}>
                <div>4</div>
              </div>
              <div className="button" onClick={() => this.press(5)}>
                <div>5</div>
              </div>
              <div className="button" onClick={() => this.press(6)}>
                <div>6</div>
              </div>
            </div>
            <div className="row">
              <div className="button" onClick={() => this.press(1)}>
                <div>1</div>
              </div>
              <div className="button" onClick={() => this.press(2)}>
                <div>2</div>
              </div>
              <div className="button" onClick={() => this.press(3)}>
                <div>3</div>
              </div>
            </div>
            <div className="row">
              <div className="button" onClick={() => this.press('.')}>
                <div>.</div>
              </div>
              <div className="button" onClick={() => this.press(0)}>
                <div>0</div>
              </div>
              <div className="button" onClick={() => this.press('=')}>
                <div>=</div>
              </div>
            </div>
          </div>
          <div className="operators">
            <div className="row">
              <div className="button" onClick={this.reset}>
                <div>C</div>
              </div>
            </div>
            <div className="row">
              <div className="button" onClick={() => this.press('*')}>
                <div>&times;</div>
              </div>
            </div>
            <div className="row">
              <div className="button" onClick={() => this.press('/')}>
                <div>&divide;</div>
              </div>
            </div>
            <div className="row">
              <div className="button" onClick={() => this.press('-')}>
                <div>&minus;</div>
              </div>
            </div>
            <div className="row">
              <div className="button" onClick={() => this.press('+')}>
                <div>+</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default App;

function evalOrEmpty(expr) {
  let retVal;
  try {
    retVal = mathjs.eval(expr);
  } catch(e) {
    retVal = '';
  }
  return retVal;
}

function prepare(value) {
  return String(value)
    .replace('*', String.fromCharCode(215))
    .replace('/', String.fromCharCode(247));
}
