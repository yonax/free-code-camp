import React, { PropTypes } from 'react';
import { inRange , uniqId } from '../utils';

import './NumberInput.css';

export default class NumberInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: props.value, error: false };
    this.inputId = `number-input-${uniqId()}`;
  }
  handleChange = (newValue) => {
    if (this.props.disabled) return;
    
    const { min, max, onChange } = this.props;
    if (isNaN(newValue) || !inRange(newValue, min, max)) {
      this.setState({ value: newValue, error: true });
    } else {
      this.setState({ value: newValue, error: false });
      onChange(newValue);
    }
  }
  advance = (sign) => {
    const { value } = this.state;
    const { step, min, max, onChange } = this.props;
    const newValue = sign*step + value;
    this.handleChange(newValue);
  }
  increment = () => { this.advance(+1) }
  decrement = () => { this.advance(-1) }

  render() {
    const { label, disabled } = this.props;
    const { value, error } = this.state;

    return (
      <div className={`number-input ${error ? 'has-error': ''}`}>
        <div className="field">
          <span onClick={this.decrement} className="minus btn"></span>
          <input id={this.inputId} disabled={disabled}
                 className="input" type="text" value={value}
                 onChange={(e) => this.handleChange(+e.target.value)} />
          <span onClick={this.increment} className="plus btn"></span>
        </div>
        <label htmlFor={this.inputId}>{ label }</label>
      </div>
    );
  }
}

NumberInput.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  step: PropTypes.number.isRequired
};

NumberInput.defaultProps = {
  defaultValue: 0,
  disabled: false
};
