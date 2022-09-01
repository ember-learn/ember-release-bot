const { expect } = require('chai');

const nextCommand = rootRequire('commands/next');

async function assertMessageForNext(args, message, keyv) {
  await nextCommand.execute({
    reply(incomingMessage) {
      if (incomingMessage.content) {
        return expect(incomingMessage.content).to.equal(message);
      }
      expect(incomingMessage).to.equal(message);
    },
    options: {
      getString(argName) {
        return args[argName];
      },
    },
  }, {
    set(key, value) {
      // eslint-disable-next-line no-param-reassign
      keyv[key] = value;
    },
  });
}

describe('next command', function() {
  it('should show a warning if date is not a monday', async function() {
    await assertMessageForNext({ version: '3.20', date: '2020-07-17' }, 'You tried to set the date as 2020-07-17 which is a Friday. The release bot expects you to pick the **Monday** of the release week.');
  });

  it('it succeeds if you send the right args', async function() {
    const keyv = {};

    await assertMessageForNext(
      { version: '3.20', date: '2020-07-13' },
      'Version set to: 3.20 and Date set to 2020-07-13',
      keyv,
    );

    expect(keyv).to.have.property('version', '3.20');
    expect(keyv).to.have.property('date', '2020-07-13');
  });

  it('resets the status of each product release when you successfully set new release', async function() {
    const keyv = {};

    await assertMessageForNext(
      { version: '3.20', date: '2020-07-13' },
      'Version set to: 3.20 and Date set to 2020-07-13',
      keyv,
    );

    expect(keyv).to.have.property('blog:done', false);
    expect(keyv).to.have.property('cli:done', false);
    expect(keyv).to.have.property('framework:done', false);
    expect(keyv).to.have.property('data:done', false);
  });
});
