import { deployCommands } from '../deploy-commands';
import { IClient } from '../types/client';

export default (client: IClient): void => {
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
