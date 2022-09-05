import { ApplicationCommandPermissionData, CommandInteraction } from 'discord.js';
import { SlashCommandBuilder, roleMention } from '@discordjs/builders';
import path from 'path';
import { writeFile } from 'fs';
import { ICommand } from '../types/command';

const dirname = path.resolve();
const pathToJson = path.resolve(dirname, '../customPermissions.json');
const file = await import(pathToJson);

export const addPermissions: ICommand = {
  config: new SlashCommandBuilder()
    .setName('addpermissions')
    .setDescription('Add permissions to command')
    .setDefaultPermission(false)
    .addRoleOption((option) => option.setName('role').setDescription('The role to add permission').setRequired(true))
    .addStringOption((option) =>
      option.setName('command').setDescription('Name of the command to update permissions').setRequired(true)
    ),
  execute: async (interaction: CommandInteraction) => {
    await interaction.deferReply();
    const { guild, options } = interaction;
    const roleID = options.getRole('role').id;
    const commandName = options.getString('command');

    const writeToFile = (commandId: string, permissions: Array<ApplicationCommandPermissionData>) => {
      if (commandId in file) {
        file[commandId].permissions = file[commandId].permissions.concat(permissions);
      } else {
        file[commandId] = {
          id: commandId,
          permissions
        };
      }

      const fileString = JSON.stringify(file);
      writeFile(pathToJson, fileString, (err) => {
        if (err) {
          console.log(`Error writing to file for commandId ${commandId}: ${err}`);
        }
        console.log(`Successfully wrote to file: fileString ${fileString}, pathToJson ${pathToJson}`);
      });
    };

    const cmd = await guild.commands.fetch().then((commands) => {
      return commands.find((command) => command.name === commandName);
    });
    if (!cmd) {
      await interaction.reply({ content: `Command ${commandName} not found. <a:shookysad:949689086665437184>` });
      return;
    }

    const permissions: Array<ApplicationCommandPermissionData> = [
      {
        id: roleID,
        type: 'ROLE',
        permission: true
      }
    ];
    await cmd.permissions.add({ permissions });
    writeToFile(cmd.id, permissions);
    await interaction.reply({
      content: `You added the role ${roleMention(roleID)} to use the command ${commandName}.`
    });
  }
};
