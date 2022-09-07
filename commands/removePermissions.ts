import { ApplicationCommand, ApplicationCommandPermissionData, Collection, CommandInteraction } from 'discord.js';
import { SlashCommandBuilder, roleMention } from '@discordjs/builders';
import { ICommand } from '../types/command';
import { removeCommandPermission } from '../common/discordutil';

export const removePermissions: ICommand = {
    config: new SlashCommandBuilder()
        .setName('removepermissions')
        .setDescription('Remove permissions to command')
        .setDefaultPermission(false)
        .addRoleOption((option) =>
            option.setName('role').setDescription('The role to remove permission').setRequired(true)
        )
        .addStringOption((option) =>
            option.setName('command').setDescription('Name of the command to update permissions').setRequired(true)
        ),
    execute: async (interaction: CommandInteraction) => {
        await interaction.deferReply();
        const { guild, options } = interaction;
        const roleID = options.getRole('role').id;
        const commandName = options.getString('command');

        let commands = new Collection<string, ApplicationCommand>();
        try {
            commands = await guild.commands.fetch();
        } catch (error) {
            console.error('Something went wrong when fetching guild commands: ', error);
            await interaction.reply({ content: `Unable to fetch guild commands. <a:shookysad:949689086665437184>` });
            return;
        }

        const command = commands.find((c) => c.name === commandName);
        if (!command) {
            await interaction.reply({ content: `Command ${commandName} not found. <a:shookysad:949689086665437184>` });
            return;
        }

        const permissions: Array<ApplicationCommandPermissionData> = [
            {
                id: roleID,
                type: 'ROLE',
                permission: false
            }
        ];

        await command.permissions.add({ permissions });
        const result = await removeCommandPermission(command.id, permissions);
        if (result) {
            await interaction.reply({
                content: `You removed the role ${roleMention(roleID)} to use the command ${commandName}.`
            });
        } else {
            await interaction.reply({
                content: `Something went wrong when removing the role ${roleMention(
                    roleID
                )} to use the command ${commandName}.`
            });
        }
    }
};
