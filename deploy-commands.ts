import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { clientId, guildId, token } from './config.json';
import { Commands } from './commands';

const deployCommands = async (): Promise<void> => {
  const commands = Commands.map((command) => command.config.toJSON());
  const rest = new REST({ version: '9' }).setToken(token);
  try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    console.log('Successfully registered application commands.');
  } catch (error) {
    console.error(`Error registering application commands: ${error}`);
  }
};

export { deployCommands };
