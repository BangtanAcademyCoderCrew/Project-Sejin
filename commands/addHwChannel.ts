import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { getClass } from '../api/classApi';
import { addChannelOption, addClassCodeStringOption } from '../common/commandHelper';
import { addHomeworkChannel, hasHomeworkChannel } from '../common/discordutil';
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
            await interaction.followUp({
                content: `Class code ${classCode} not found. 😞`
            });
            return;
        }

        const channelAlreadyAddedForClass = hasHomeworkChannel(channelID, interaction, classCode);
        if (channelAlreadyAddedForClass) {
            await interaction.followUp(
                `Channel <#${channelID}> has already been added as a Homework Channel for this class.`
            );
            return;
        }

        const channelAdded = await addHomeworkChannel(channelID, interaction, classCode);
        if (channelAdded) {
            await interaction.followUp(`Added channel <#${channelID}> (${channelID}) as a Homework channel.`);
        }
    }
};
