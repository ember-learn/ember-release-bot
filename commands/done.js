module.exports = {
  async execute(message, args, keyv) {
    const blog = await keyv.get('blog:done');
    const cli = await keyv.get('cli:done');
    const framework = await keyv.get('framework:done');
    const data = await keyv.get('data:done');

    if (args.length === 0) {
      return message.channel.send(`${framework ? ':white_check_mark:' : ':no_entry_sign:'} - Framework
${data ? ':white_check_mark:' : ':no_entry_sign:'} - Data
${cli ? ':white_check_mark:' : ':no_entry_sign:'} - CLI
${blog ? ':white_check_mark:' : ':no_entry_sign:'} - Blog`);
    }

    const teams = ['blog', 'cli', 'framework', 'data'];
    const team = args[0];

    if (!teams.includes(team)) {
      return message.channel.send(`Team ${team} is unknown. It has to be one of: ${teams.join(', ')}`);
    }

    await keyv.set(`${team}:done`, !await keyv.get(`${team}:done`));

    return message.channel.send(`${team} set to ${await keyv.get(`${team}:done`) ? ':white_check_mark:' : ':no_entry_sign:'}`);
  },
};
