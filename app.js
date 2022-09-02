const winston = require('winston');
const nconf = require('nconf');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const _ = require('lodash');
const { CronJob } = require('cron');
const Keyv = require('keyv');
const express = require('express');

const { useSqlite } = require('./settings');

let keyv;

if (useSqlite) {
  keyv = new Keyv('sqlite://database.sqlite');
} else {
  keyv = new Keyv(process.env.DATABASE_URL, {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  });
}

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

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commands = require('./commands');

_.each(commands, (command) => {
  client.commands.set(command.data.name, command);
});

client.once('ready', async () => {
  winston.info('Ready!');

  const version = await keyv.get('version');

  if (!version) {
    const channels = client.channels.cache.filter((channel) => channel.name === 'core-meta');

    channels.forEach((channel) => {
      channel.send('Oh no! I\'ve forgotten everything :see_no_evil: please tell me what the next release is with !release next <number> <date>');
    });
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction, keyv);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

const cronJobs = require('./cron');

_.each(cronJobs, (cronJob) => {
  // eslint-disable-next-line no-new
  new CronJob(cronJob.cron, cronJob.job(client, keyv), null, true, 'UTC');
});

client.login(nconf.get('token'));

const app = express();

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(process.env.PORT, () => console.log(`Example app listening at http://localhost:${process.env.PORT}`));
