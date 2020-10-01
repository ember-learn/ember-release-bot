const { expect } = require('chai');
const tk = require('timekeeper');

const dailyMessage = rootRequire('cron/daily-message');

async function assertMessageForDate({
  today,
  releaseDate,
  message,
  released = [],
}) {
  const now = new Date(`${today} 12:00`);
  tk.freeze(now);

  await dailyMessage.job({
    channels: [{
      name: 'core-meta',
      send(incomingMessage) {
        expect(incomingMessage).to.equal(message);
      },
    }],
  }, {
    get(key) {
      if (key === 'date') {
        return new Date(releaseDate);
      }

      const [, product] = key.match(/^(\w+):done/);

      return released.includes(product);
    },
  })();
}

describe('daily-message cron job', function () {
  afterEach(function() {
    tk.reset();
  });

  it('should send a message the Friday before release week', async function() {
    await assertMessageForDate({
      todayDate: '2020-07-13',
      releaseDate: '2020-07-20',
      message:
        'Release week starts next week on 2020-07-20 are we all prepared? :lts:',
    });
  });

  it('should send a message on the first day of release week', async function () {
    await assertMessageForDate({
      todayDate: '2020-07-20',
      releaseDate: '2020-07-20',
      message: [
        `:tada: It's release week!! :tada: To see who is done and who isn't you can say '!release done' and I'll tell you who still needs to do something!`,
        '',
        `If you know a team is done you can say '!release done <team>' where team can be blog, framework, data, or cli`
      ].join('\n'),
    });
  });

  it('should send a message on the Wednesday of release week saying were half way through', async function() {
    await assertMessageForDate({
      todayDate: '2020-07-22',
      releaseDate: '2020-07-20',
      message: `We're half way through release week! Remember: you can say '!release done' to see who still needs to release!`,
    });
  });

  it('should send a congratulations message on the Wednesday of release if all the bits are released', async function() {
    await assertMessageForDate({
      todayDate: '2020-07-22',
      releaseDate: '2020-07-20',
      message: `Wow! :tada: we have released everything within 3 days!? This must be some sort of record :scream: Congratulations to everyone who helped out! :tada:`,
      released: ['framework', 'cli', 'blog', 'data'],
    });
  });

  it('should send a message on the friday of the release week saying were on the last day', async function() {
    await assertMessageForDate({
      todayDate: '2020-07-24',
      releaseDate: '2020-07-20',
      message: `Today is the last day of release week! We're still waiting on blog, cli, framework, data. Can we release today?`,
    });
  });

  it('should send a congratulations message on the Friday of release week if all the bits are released', async function() {
    await assertMessageForDate({
      todayDate: '2020-07-24',
      releaseDate: '2020-07-20',
      message: `:tada: We have released everything on time this week :tada: This is worth a bit of a celebration! :tada: Great work team :muscle:`,
      released: ['framework', 'cli', 'blog', 'data'],
    });
  });

  it('should send a message saying were 2 days late 2 days after the end of release week', async function() {
    await assertMessageForDate({
      todayDate: '2020-07-26',
      releaseDate: '2020-07-20',
      message: `We are currently :rotating_light: 2 Days Late :rotating_light: with the release!! We are still waiting on blog, cli, framework, data`,
    });
  });

  it('should send a message saying were 3 days late 3 days after the end of release week', async function() {
    await assertMessageForDate({
      todayDate: '2020-07-27',
      releaseDate: '2020-07-20',
      message: `We are currently :rotating_light: 3 Days Late :rotating_light: with the release!! We are still waiting on blog, cli, framework, data`,
    });
  });

  it('should not send a message if we are late and all bits are released', async function() {
    const now = new Date(`2020-07-27 12:00`);
    tk.freeze(now);

    const released = ['framework', 'cli', 'blog', 'data'];

    await dailyMessage.job({
      channels: [{
        name: 'core-meta',
        send() {
          throw new Error('we should not hit this bit - no message should be sent');
        },
      }],
    }, {
      get(key) {
        if (key === 'date') {
          return new Date('2020-07-20');
        }

        const [, product] = key.match(/^(\w+):done/);

        return released.includes(product);
      },
    })();
  });
});
