import { Client } from 'discord.js';
import { deployCommands } from '../deploy-commands';

export default (client: Client): void => {
  client.on('ready', async () => {
    const { application, user } = client;
    if (!user || !application) {
      return;
    }

    console.log(`${user.username} is online`);
    deployCommands();
    user.setActivity('Proof', { type: 'LISTENING' });
  });
};
