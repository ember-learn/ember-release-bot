const winston = require('winston');
const nconf = require('nconf');
const Discord = require('discord.js');
const _ = require('lodash');
const { CronJob } = require('cron');
const Keyv = require('keyv');

const keyv = new Keyv(`sqlite://${__dirname}/database.sqlite`);

const { prefix } = require('./settings');

const winstonOptions = {
  colorize: true,
  timestamp: true,
  handleExceptions: true,
  prettyPrint: true,
  format: winston.format.simple(),
};

if (process.env.LOG_LEVEL) {
  winstonOptions.level = process.env.LOG_LEVEL;
} else if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  winstonOptions.level = 'debug';
} else {
  winstonOptions.level = 'info';
}

winston.add(new winston.transports.Console(winstonOptions));

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commands = require('./commands');

_.each(commands, (command, commandName) => {
  client.commands.set(commandName, command);
});

client.once('ready', async () => {
  winston.info('Ready!');

  const version = await keyv.get('version');

  if (!version) {
    const channel = client.channels.find(ch => ch.name === 'core-meta');
    channel.send('Oh no! I\'ve forgotten everything :see_no_evil: please tell me what the next release is with !release next <number> <date>');
  }
});

client.on('message', (message) => {
  const commandPrefix = `${prefix} `;
  if (!message.content.startsWith(commandPrefix) || message.author.bot) return;

  const args = message.content.slice(commandPrefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  if (!client.commands.has(command)) return;

  try {
    client.commands.get(command).execute(message, args, keyv);
  } catch (error) {
    winston.error('Errororror', error);
    message.reply('there was an error trying to execute that command!');
  }
});

const cronJobs = require('./cron');

_.each(cronJobs, (cronJob) => {
  // eslint-disable-next-line no-new
  new CronJob(cronJob.cron, cronJob.job(client, keyv), null, true, 'UTC');
});

client.login(nconf.get('token'));
