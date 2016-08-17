import { get } from 'lodash';

const STREAMS_URL = 'https://api.twitch.tv/kraken/streams';

function prepare(name, data) {
  console.log(data);
  return {
    status: !!data.stream ? 'online' : 'offline',
    description: get(data, 'stream.channel.status'),
    logo: get(data, 'stream.channel.logo'),
    name: get(data, 'stream.channel.display_name', name),
    url: get(data, 'stream.channel.url', `https://www.twitch.tv/${name}`)
  }
}

export default function fetchStream(user) {
  return fetch(`${STREAMS_URL}/${user}`)
    .then(resp => {
      if (resp.status === 422) {
        return { status: 'closed', name: user };
      } else if (!resp.ok) {
        throw new Error(resp.statusText);
      }
      return resp.json().then(data => prepare(user, data));
    });
}
