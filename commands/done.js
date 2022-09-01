const { SlashCommandBuilder } = require('discord.js');

const teams = ['blog', 'cli', 'framework', 'data'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('release-done')
    .setDescription('Checks the status of the teams and optionally toggles them')
    .addStringOption((option) => option.setName('team')
      .setDescription(`The team (${teams.join(', ')}) to toggle`)
      .setRequired(true)),

  async execute(interaction, keyv) {
    const blog = await keyv.get('blog:done');
    const cli = await keyv.get('cli:done');
    const framework = await keyv.get('framework:done');
    const data = await keyv.get('data:done');

    const team = interaction.options.getString('team');

    if (!team) {
      return interaction.reply(`${framework ? ':white_check_mark:' : ':no_entry_sign:'} - Framework
${data ? ':white_check_mark:' : ':no_entry_sign:'} - Data
${cli ? ':white_check_mark:' : ':no_entry_sign:'} - CLI
${blog ? ':white_check_mark:' : ':no_entry_sign:'} - Blog`);
    }

    if (!teams.includes(team)) {
      return interaction.reply({ content: `Team ${team} is unknown. It has to be one of: ${teams.join(', ')}`, ephemeral: true });
    }

    await keyv.set(`${team}:done`, !await keyv.get(`${team}:done`));

    return interaction.reply(`${team} set to ${await keyv.get(`${team}:done`) ? ':white_check_mark:' : ':no_entry_sign:'}`);
  },
};
