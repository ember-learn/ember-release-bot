const { expect } = require('chai');

const nextCommand = rootRequire('commands/next');

async function assertMessageForNext(args, message, keyv) {
  await nextCommand.execute({
    channel: {
      send(incomingMessage) {
        expect(incomingMessage).to.equal(message);
      },
    },
  }, args, {
    set(key, value) {
      // eslint-disable-next-line no-param-reassign
      keyv[key] = value;
    },
  });
}

describe('next command', function() {
  it('should show a warning about usage if you dont send any args', async function() {
    await assertMessageForNext([], 'You need to provide a version and a date to `next` e.g. `!next 3.20 2020-07-13`');
  });

  it('should show a warning about usage if you send 1 arg', async function() {
    await assertMessageForNext(['3.20'], 'You need to provide a version and a date to `next` e.g. `!next 3.20 2020-07-13`');
  });

  it('should show a warning if date is not a monday', async function() {
    await assertMessageForNext(['3.20', '2020-07-17'], 'You tried to set the date as 2020-07-17 which is a Friday. The release bot expects you to pick the **Monday** of the release week.');
  });

  it('it succeeds if you send the right ', async function() {
    const keyv = {};

    await assertMessageForNext(
      ['3.20', '2020-07-13'],
      'Version set to: 3.20 and Date set to 2020-07-13',
      keyv,
    );

    expect(keyv).to.have.property('version', '3.20');
    expect(keyv).to.have.property('date', '2020-07-13');
  });
});
