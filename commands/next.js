module.exports = {
  description: 'Ping!',
  async execute(message, args, keyv) {
    if (args.length !== 2) {
      message.channel.set('You need to provide a version and a date to `next`');
    }

    await keyv.set('version', args[0]);
    await keyv.set('date', args[1]);

    message.channel.send(`Version set to: ${args[0]} and Date set to ${args[1]}`);
  },
};
