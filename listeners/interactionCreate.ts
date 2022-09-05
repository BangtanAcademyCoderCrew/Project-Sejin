import { BaseCommandInteraction, Client, Interaction, SelectMenuInteraction } from 'discord.js';
import { setTimeout } from 'timers/promises';
import * as hwChannels from '../hwchannels.json';
import * as numberEmojis from '../emojis.json';
import { saveHomeworkToDB } from '../common/discordutil';
import { IClient } from '../types/client';

const handleSlashCommand = async (client: IClient, interaction: BaseCommandInteraction): Promise<void> => {
  const command = client.commands.get(interaction.commandName);
  if (!command) {
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing command: ${error}`);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
};

const handleContextMenu = async (client: Client, interaction: BaseCommandInteraction): Promise<void> => {
  await interaction.deferReply({ ephemeral: true });
  await handleSlashCommand(client, interaction);
};

const handleSelectMenu = async (client: Client, interaction: SelectMenuInteraction): Promise<void> => {
  await interaction.deferUpdate();
  await setTimeout(4000);
  const { channel, channelId, customId, values } = interaction;
  const selectMenuName = customId.split('_')[0];
  const messageId = customId.split('_')[1];
  if (selectMenuName === 'addhw') {
    const classCode = hwChannels.ids[channelId];
    const hwNumber = values[0];
    const msg = await channel.messages.fetch(messageId);
    await msg.react(numberEmojis.emojis[parseInt(hwNumber, 10) - 1]);
    const result = await saveHomeworkToDB(msg, hwNumber, classCode);
    if (result) {
      await interaction.editReply({
        content: `The homework has been registered as assignment number ${values.join(
          ', '
        )}! <a:btshooky_thumbsup:854135650294169610> `,
        components: []
      });
    } else {
      await interaction.editReply({
        content: 'Oops! There was a problem registering this assignment. <a:btshooksad:802306534721191956>',
        components: []
      });
    }
  }
};

export default (client: Client): void => {
  client.on('interactionCreate', async (interaction: Interaction) => {
    if (interaction.isCommand()) {
      await handleSlashCommand(client, interaction);
    }
    if (interaction.isContextMenu()) {
      await handleContextMenu(client, interaction);
    }
    if (interaction.isSelectMenu()) {
      await handleSelectMenu(client, interaction);
    }
  });
};
