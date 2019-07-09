const cors = require('cors');
const express = require('express');
const winston = require('winston');
const nconf = require('nconf');

const settings = require('./settings');
const appRoutes = require('./server');

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

const app = express();
if (settings.server.useCors) {
  app.use(cors());
}

// Initialisations
require('./init')(nconf).then(() => {
  appRoutes(app);

  const server = app.listen(process.env.PORT || settings.server.runPort, () => {
    winston.info('Server listening', {
      host: server.address().address,
      port: server.address().port,
    });
  });
});
