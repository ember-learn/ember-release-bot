const moment = require('moment');

module.exports = {
  async execute(message, args, keyv) {
    const version = await keyv.get('version');
    const dateString = await keyv.get('date');

    const date = moment(dateString).add(5, 'days');

    const dayDiff = moment().diff(date, 'days');

    // more than 5 days means that it's not release week
    if (dayDiff < -5) {
      message.channel.send(`The next release version is ${version} and is planned for the week starting roughly ${date.toNow(true)} from now`);
    } else if (dayDiff < 0) {
      message.channel.send(`The next release is ${version} and is currently being worked on this week :tada:`);
    } else {
      message.channel.send(`The next release version is ${version} and is currently :rotating_light: ${dayDiff} Days Late :rotating_light:`);
    }
  },
};
