const moment = require('moment');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('release-info')
    .setDescription('returns info about the current release'),

  async execute(interaction, keyv) {
    const version = await keyv.get('version');
    const dateString = await keyv.get('date');

    const date = moment(dateString).add(5, 'days');

    const dayDiff = moment().diff(date, 'days');

    // more than 5 days means that it's not release week
    if (dayDiff < -5) {
      interaction.reply(`The next release version is ${version} and is planned for the week starting roughly ${date.subtract(4, 'days').toNow(true)} from now`);
    } else if (dayDiff < 0) {
      interaction.reply(`The next release is ${version} and is currently being worked on this week :tada:`);
    } else {
      interaction.reply(`The next release version is ${version} and is currently :rotating_light: ${dayDiff} Days Late :rotating_light:`);
    }
  },
};
