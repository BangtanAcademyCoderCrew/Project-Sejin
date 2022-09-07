import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { getClassCodeByRoleID } from '../api/classApi';
import { ICommand } from '../types/command';

export const findCc: ICommand = {
    config: new SlashCommandBuilder()
        .setName('findcc')
        .setDescription('Find a classcode using a role')
        .setDefaultPermission(false)
        .addRoleOption((option) => option.setName('role').setDescription('The role of the class').setRequired(true)),
    execute: async (interaction: CommandInteraction) => {
        await interaction.deferReply();
        const { options } = interaction;
        const roleId = options.getRole('role').id;

        const result = await getClassCodeByRoleID(roleId);
        if (result) {
            await interaction.followUp(`The class code is: ${result.classCode}`);
        }
    }
};
