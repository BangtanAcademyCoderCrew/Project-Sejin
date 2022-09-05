import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { getClass } from '../database/class-db';
import { addChannelOption, addClassCodeStringOption } from '../common/commandHelper';
import { addHomeworkChannel } from '../common/discordutil';
import { ICommand } from '../types/command';

const slashCommandBuilder = new SlashCommandBuilder();
slashCommandBuilder
  .setName('addhwchannel')
  .setDescription('Add a homework channel to a class')
  .setDefaultPermission(false);
addClassCodeStringOption(slashCommandBuilder, true);
addChannelOption(slashCommandBuilder, true);

export const addHwChannel: ICommand = {
  config: slashCommandBuilder,
  execute: async (interaction: CommandInteraction) => {
    await interaction.deferReply();
    const { options } = interaction;
    const channelID = options.getChannel('channel').id;
    const classCode = options.getString('class_code');

    const foundClass = await getClass(classCode);
    if (!foundClass) {
      await interaction.followUp({ content: `Class code ${classCode} not found. <a:shookysad:949689086665437184>` });
      return;
    }

    const addedChannelCorrectly = addHomeworkChannel(channelID, interaction, classCode);
    if (addedChannelCorrectly) {
      await interaction.followUp(`Added channel <#${channelID}> (${channelID}) as a Homework channel`);
    }
  }
};
