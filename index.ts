import { Client, Intents } from 'discord.js';
import { token } from './config.json';
import ready from './listeners/ready';
import interactionCreate from './listeners/interactionCreate';
import messageReactionAdd from './listeners/messageReactionAdd';
import { IClient } from './types/client';
import { Commands } from './commands';

(async () => {
    const client: IClient = new Client({
        partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_PRESENCES,
            Intents.FLAGS.GUILD_MEMBERS,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
            Intents.FLAGS.GUILD_VOICE_STATES,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS
        ]
    });

    // set client commands
    client.commands = new Map();
    for (const cmd of Commands) {
        client.commands.set(cmd.config.name, cmd);
    }

    // set client listeners
    ready(client);
    interactionCreate(client);
    messageReactionAdd(client);

    await client.login(token);
})();
