import { CommandInteraction, MessageAttachment, Role, VoiceBasedChannel } from 'discord.js';
import { SlashCommandBuilder, roleMention, channelMention } from '@discordjs/builders';
import { getClass } from '../api/classApi';
import { addClassCodeStringOption } from '../common/commandHelper';
import { ICommand } from '../types/command';

const slashCommandBuilder = new SlashCommandBuilder();
slashCommandBuilder
    .setName('addalumniroles')
    .setDescription('Adds an alumni role to a class in the voice channel.')
    .setDefaultPermission(false);
addClassCodeStringOption(slashCommandBuilder, true).addRoleOption((option) =>
    option.setName('alumni_role').setDescription('The alumni role to be added to the users').setRequired(false)
);

export const addAlumniRoles: ICommand = {
    config: slashCommandBuilder,
    execute: async (interaction: CommandInteraction) => {
        await interaction.deferReply();
        const { client, options } = interaction;
        const classCode = options.getString('class_code');
        const roleToAssign = options.getRole('alumni_role');

        if (classCode.length >= 7) {
            await interaction.editReply('class_code should have 6 characters.');
            return;
        }

        const foundClass = await getClass(classCode);
        if (!foundClass) {
            await interaction.editReply(`Class code ${classCode} not found. <a:shookysad:949689086665437184>`);
            return;
        }

        const { roleID, channelID, serverID } = foundClass;
        const vcServer = client.guilds.cache.get(serverID);
        const vcChannel = vcServer.channels.cache.get(channelID) as VoiceBasedChannel;
        const vcMembers = Array.from(vcChannel.members.values());
        const members = vcMembers.filter((m) => m.roles.cache.get(roleID));
        if (members.length === 0) {
            await interaction.editReply(
                `There is no one on vc ${channelMention(channelID)} with role ${roleMention(
                    roleID
                )}> <a:shookysad:949689086665437184>`
            );
            return;
        }

        let membersWithRole = '';
        members.forEach((member) => {
            member.roles.add([roleToAssign as Role]);
            membersWithRole += `<@${member.user.id}>\n`;
        });

        const attachment = new MessageAttachment(Buffer.from(membersWithRole, 'utf-8'), 'usersID.txt');
        await interaction.editReply({
            content: `Added role ${roleToAssign} to ${roleMention(roleID)} class users in VC ${channelMention(
                channelID
            )}`,
            files: [attachment]
        });
    }
};
