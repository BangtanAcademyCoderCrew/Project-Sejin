import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder, roleMention } from '@discordjs/builders';
import { ICommand } from '../types/command';

export const addHwCheckerRole: ICommand = {
    config: new SlashCommandBuilder()
        .setName('addhwcheckerrole')
        .setDescription('Add a role for being a homework checker')
        .setDefaultPermission(false)
        .addRoleOption((option) =>
            option.setName('role').setDescription('The role that checks homework').setRequired(true)
        ),
    execute: async (interaction: CommandInteraction) => {
        await interaction.deferReply();
        const { guild, options } = interaction;
        const roleID = options.getRole('role').id;
        const emoji = guild.emojis.cache.find((e) => e.name === 'purple_check_mark');
        await emoji.roles.add([roleID]);
        await interaction.reply(`You set the role ${roleMention(roleID)} to be a homework checker.`);
    }
};
