import React, { Component } from 'react';
import fetchStream from './api';
import update from 'react/lib/update';
import { sortBy } from 'lodash';

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: props.initialUsers,
      streamByUser: {},
      loading: props.initialUsers.length > 0
    };
  }
  componentDidMount() {
    const { users } = this.state;
    let pendingRequest = 0;

    users.forEach(user => {
      pendingRequest++;
      fetchStream(user).then(stream => {
        pendingRequest--;
        this.setState(update(this.state, {
          streamByUser: {
            [user]: {
              $set: stream
            }
          },
          loading: {
            $set: pendingRequest !== 0
          }
        }))
      })
    });
  }
  render() {
    const { users, streamByUser } = this.state;
    const key = ({status}) => ({'online': 0, 'offline': 1, 'closed': 2}[status]);
    const sortedUsers = sortBy(users, user =>
      streamByUser[user] ? key(streamByUser[user]) : -1);

    return (
      <div className="list">
        {sortedUsers.map(user =>
          <Stream key={user} {...streamByUser[user]} />
        )}
      </div>
    );
  }
}
function Stream({ name, status, description, logo, url}) {
  return (
    <div className={`item ${status}`}>
      <div className="col logo">
        <img src={logo || 'http://dummyimage.com/64x64/fff/000.png?text=0x3F'}
             alt={name}  />
      </div>
      <div className="col name">
        { status !== 'closed' && <a href={url} target="_blank">{ name }</a> }
        { status === 'closed' && name }
      </div>
      <div className="col description">
        { description || status }
      </div>
    </div>
  );
}
export default App;
