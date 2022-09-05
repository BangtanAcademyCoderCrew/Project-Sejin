import { ContextMenuCommandBuilder } from '@discordjs/builders';
import { ContextMenuInteraction, TextChannel, ThreadChannel } from 'discord.js';
import hwChannels from '../hwchannels.json';
import { removeHomework } from '../database/homework-db';
import { ICommand } from '../types/command';

export const removeHw: ICommand = {
  config: new ContextMenuCommandBuilder().setName('remove homework').setType(3).setDefaultPermission(false),
  execute: async (interaction: ContextMenuInteraction) => {
    await interaction.deferReply();
    const { channelId, client, guildId, targetId } = interaction;
    const guild = client.guilds.cache.get(guildId);
    const channel = guild.channels.cache.get(channelId) as TextChannel | ThreadChannel;
    const classCode = hwChannels.ids[channelId];

    channel.messages
      .fetch(targetId)
      .then((message) => {
        message.reactions.removeAll();
      })
      .catch((error) => {
        console.log(`Error fetching messages from channel ${targetId}: ${error}`);
      });

    await removeHomework(targetId, classCode);
    await interaction.followUp({
      content: `The homework with messageId ${targetId} has been removed 👍`,
      ephemeral: true
    });
  }
};
