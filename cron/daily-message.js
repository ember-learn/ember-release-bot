const moment = require('moment');
const _ = require('lodash');

function isReleaseInXDays(xDays, hoursUntilRelease) {
  const hourLowerBound = (24 * xDays) - 12;
  const hourUpperBound = (24 * xDays) + 12;

  return (hourLowerBound <= hoursUntilRelease) && (hoursUntilRelease <= hourUpperBound);
}

function createMessage({ dateString, waitingFor }) {
  if (!dateString) {
    return;
  }

  const lastDayOfReleaseWeek = moment.utc(dateString).add(4, 'days');
  const today = moment().utc();
  const daysUntilRelease = lastDayOfReleaseWeek.diff(today, 'days');
  const hoursUntilRelease = lastDayOfReleaseWeek.diff(today, 'hours');

  if (isReleaseInXDays(11, hoursUntilRelease)) {
    return `Release week starts next week on ${moment(dateString).format('YYYY-MM-DD')} are we all prepared? :lts:`;
  }

  if (isReleaseInXDays(4, hoursUntilRelease)) {
    return `:tada: It's release week!! :tada: To see who is done and who isn't you can say \`/release-done\` and I'll tell you who still needs to do something!

If you know a team is done you can say \`/release-done <team>\` where team can be \`blog\`, \`framework\`, \`data\` or \`cli\`.`;
  }

  if (isReleaseInXDays(2, hoursUntilRelease)) {
    if (waitingFor.length) {
      // eslint-disable-next-line quotes
      return `We're half way through release week! Remember: you can say \`/release-done\` to see who still needs to release!`;
    }

    return 'Wow! :tada: we have released everything within 3 days!? This must be some sort of record :scream: Congratulations to everyone who helped out! :tada:';
  }

  if (isReleaseInXDays(0, hoursUntilRelease)) {
    if (waitingFor.length) {
      return `Today is the last day of release week! We're still waiting on ${waitingFor.join(', ')}. Can we release today?`;
    }

    return ':tada: We have released everything on time this week :tada: This is worth a bit of a celebration! :tada: Great work team :muscle:';
  }

  if (daysUntilRelease < 0) {
    if (waitingFor.length) {
      // const daysAfterRelease = Math.round(-1 * hoursUntilRelease / 24);
      return `We are currently :rotating_light: ${Math.abs(daysUntilRelease)} Days Late :rotating_light: with the release!! We are still waiting on ${waitingFor.join(', ')}`;
    }
  }
}

module.exports = {
  cron: '00 10 * * *', // once a day at 9:30 UTC
  job(client, keyv) {
    return async () => {
      const channels = client.channels.cache.filter((ch) => ch.name === 'core-meta');

      const dateString = await keyv.get('date');

      const teams = ['blog', 'cli', 'framework', 'data'];

      // eslint-disable-next-line consistent-return
      let waitingFor = await Promise.all(teams.map(async (team) => {
        const value = await keyv.get(`${team}:done`);
        if (!value) {
          return team;
        }
      }));

      waitingFor = _.compact(waitingFor);

      let message = createMessage({ dateString, waitingFor });

      if (!message) {
        if (process.env.NODE_ENV === 'test' && waitingFor.length) {
          message = ('No message!');
        } else {
          return;
        }
      }

      channels.forEach((channel) => {
        // more than 5 days means that it's not release week
        channel.send(message);
      });
    };
  },
};
