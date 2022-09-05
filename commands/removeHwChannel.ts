import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { addChannelOption } from '../common/commandHelper';
import { removeHomeworkChannel } from '../common/discordutil';
import { ICommand } from '../types/command';

const slashCommandBuilder = new SlashCommandBuilder();
slashCommandBuilder.setName('removehwchannel').setDescription('Remove a homework channel').setDefaultPermission(false);
addChannelOption(slashCommandBuilder);

export const removeHwChannel: ICommand = {
  config: slashCommandBuilder,
  execute: async (interaction: CommandInteraction) => {
    await interaction.deferReply();
    const { options } = interaction;
    const channelID = options.getChannel('channel').id;
    const removedChannelCorrectly = removeHomeworkChannel(channelID, interaction);
    if (removedChannelCorrectly) {
      await interaction.followUp(`Removed channel <#${channelID}> (${channelID}) as a Homework channel`);
    }
  }
};
