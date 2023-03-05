import { ApplicationCommand, ApplicationCommandPermissionData, Collection, CommandInteraction } from 'discord.js';
import { SlashCommandBuilder, roleMention } from '@discordjs/builders';
import { ICommand } from '../types/command';
import { addCommandPermission } from '../common/discordutil';

export const addPermissions: ICommand = {
    config: new SlashCommandBuilder()
        .setName('addpermissions')
        .setDescription('Add permissions to command')
        .setDefaultPermission(false)
        .addRoleOption((option) =>
            option.setName('role').setDescription('The role to add permission').setRequired(true)
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
            console.error('Something went wrong when fetching guild commands: ', JSON.stringify(error));
            await interaction.reply({ content: `Unable to fetch guild commands. 😞` });
            return;
        }

        const command = commands.find((c) => c.name === commandName);
        if (!command) {
            await interaction.reply({ content: `Command ${commandName} not found. 😞` });
            return;
        }

        const permissions: Array<ApplicationCommandPermissionData> = [
            {
                id: roleID,
                type: 'ROLE',
                permission: true
            }
        ];
        await command.permissions.add({ permissions });
        const result = await addCommandPermission(command.id, permissions);
        if (result) {
            await interaction.reply({
                content: `You added the role ${roleMention(roleID)} to use the command ${commandName}.`
            });
        } else {
            await interaction.reply({
                content: `Something went wrong when adding the role ${roleMention(
                    roleID
                )} to use the command ${commandName}.`
            });
        }
    }
};
