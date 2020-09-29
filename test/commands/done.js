const { expect } = require('chai');

const doneCommand = rootRequire('commands/done');

async function assertMessageForDone(args, message, keyv) {
  await doneCommand.execute({
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
    get(key) {
      return keyv[key];
    },
  });
}

describe('done command', function() {
  it('shows the right information if no projects are finished', async function() {
    const keyv = {
    };

    await assertMessageForDone(
      [],
      `:no_entry_sign: - Framework
:no_entry_sign: - Data
:no_entry_sign: - CLI
:no_entry_sign: - Blog`,
      keyv,
    );
  });

  it('shows only one check mark if one project is finished', async function() {
    const keyv = {
      'framework:done': true,
    };

    await assertMessageForDone(
      [],
      `:white_check_mark: - Framework
:no_entry_sign: - Data
:no_entry_sign: - CLI
:no_entry_sign: - Blog`,
      keyv,
    );
  });
});
