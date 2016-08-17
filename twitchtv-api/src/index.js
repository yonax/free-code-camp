import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

const initialUsers = [
  "freecodecamp",
  "storbeck",
  "terakilobyte",
  "habathcx",
  "RobotCaleb",
  "thomasballinger",
  "noobs2ninjas",
  "beohoff",
  "brunofin",
  "comster404",
  "test_channel",
  "cretetion",
  "sheevergaming",
  "TR7K",
  "OgamingSC2",
  "ESL_SC2"
];

ReactDOM.render(
  <App initialUsers={initialUsers} />,
  document.getElementById('root')
);
