const moment = require('moment');
const _ = require('lodash');

module.exports = {
  cron: '30 9 * * *', // once a day at 9:30 UTC
  job(client, keyv) {
    return async () => {
      const channel = client.channels.find(ch => ch.name === 'core-meta');

      const dateString = await keyv.get('date');

      const date = moment(dateString).add(5, 'days');

      const dayDiff = moment().diff(date, 'days');

      const teams = ['blog', 'cli', 'framework', 'data'];

      // eslint-disable-next-line consistent-return
      let waitingFor = await Promise.all(teams.map(async (team) => {
        const value = await keyv.get(`${team}:done`);
        if (!value) {
          return team;
        }
      }));

      waitingFor = _.compact(waitingFor);

      // more than 5 days means that it's not release week
      if (dayDiff === -11) {
        channel.send(`Release week starts next week on ${dateString} are we all prepared? :lts:`);
      } else if (dayDiff === -4) {
        channel.send(`:tada: It's release week!! :tada: To see who is done and who isn't you can say '!release done' and I'll tell you who still needs to do something!

If you know a team is done you can say '!release done <team>' where team can be blog, framework, data, or cli`);
      } else if (dayDiff === -2) {
        // eslint-disable-next-line quotes
        channel.send(`We're half way through release week! Remember: you can say '!release done' to see who still needs to release!`);
      } else if (dayDiff === 0) {
        channel.send(`Today is the last day of release week! We're still waiting on ${waitingFor.join(', ')}. Can we release today?`);
      } else if (dayDiff > 0) {
        channel.send(`We are currently :rotating_light: ${dayDiff} Days Late :rotating_light: with the release!! We are still waiting on ${waitingFor.join(', ')}`);
      }
    };
  },
};
