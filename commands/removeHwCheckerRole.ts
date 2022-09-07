import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder, roleMention } from '@discordjs/builders';
import { ICommand } from '../types/command';

export const removeHwCheckerRole: ICommand = {
    config: new SlashCommandBuilder()
        .setName('removehwcheckerrole')
        .setDescription('Remove a role for being a homework checker')
        .setDefaultPermission(false)
        .addRoleOption((option) =>
            option.setName('role').setDescription('The role that checks homework').setRequired(true)
        ),
    execute: async (interaction: CommandInteraction) => {
        await interaction.deferReply();
        const { guild, options } = interaction;
        const roleID = options.getRole('role').id;
        const emoji = guild.emojis.cache.find((e) => e.name === 'purple_check_mark');
        await emoji.roles.remove(roleID);
        await interaction.reply(`You removed the role ${roleMention(roleID)} from being a homework checker.`);
    }
};
