const nconf = require('nconf');
const _ = require('lodash');

// initialise nconf
require('./settings');

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');

const token = nconf.get('token');
const clientId = nconf.get('clientId');

const slashCommands = require('./commands');

const commands = [];

_.each(slashCommands, (command) => {
  commands.push(command.data.toJSON());
});

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationCommands(clientId), { body: commands })
  .then((data) => console.log(`Successfully registered ${data.length} application commands.`))
  .catch(console.error);
