const moment = require('moment');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('release-next')
    .setDescription('Sets the next date for release')
    .addStringOption((option) => option.setName('version')
      .setDescription('The next version to be released')
      .setRequired(true))
    .addStringOption((option) => option.setName('date')
      .setDescription('The date of the monday of release week')
      .setRequired(true)),

  async execute(interaction, keyv) {
    const version = interaction.options.getString('version');
    const releaseDate = interaction.options.getString('date');

    if (moment(releaseDate).day() !== 1) {
      return interaction.reply({
        content: `You tried to set the date as ${releaseDate} which is a ${moment(releaseDate).format('dddd')}. The release bot expects you to pick the **Monday** of the release week.`,
        ephemeral: true,
      });
    }

    await keyv.set('version', version);
    await keyv.set('date', releaseDate);

    // reset all product status'
    await keyv.set('blog:done', false);
    await keyv.set('cli:done', false);
    await keyv.set('framework:done', false);
    await keyv.set('data:done', false);

    return interaction.reply(`Version set to: ${version} and Date set to ${releaseDate}`);
  },
};
