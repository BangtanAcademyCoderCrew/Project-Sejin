import { SlashCommandBuilder, roleMention, channelMention } from '@discordjs/builders';
import { CommandInteraction, TextChannel, VoiceBasedChannel } from 'discord.js';
import { addClassCodeStringOption } from '../common/commandHelper';
import { ICommand } from '../types/command';
import { getClass } from '../api/classApi';
import { getMessageChannel } from '../api/messageChannelApi';
import { VCLogBook } from '../common/logbook-vc';

const slashCommandBuilder = new SlashCommandBuilder();
slashCommandBuilder.setName('log').setDescription('Log a class in the message channel.').setDefaultPermission(false);
addClassCodeStringOption(slashCommandBuilder, true).addStringOption((option) =>
    option.setName('description').setDescription('The description included in the logbook message').setRequired(false)
);

export const log: ICommand = {
    config: slashCommandBuilder,
    execute: async (interaction: CommandInteraction) => {
        await interaction.deferReply();
        const { channel, client, options } = interaction;
        const classCode = options.getString('class_code');
        const desc = options.getString('description') || '';

        if (classCode.length < 6 || classCode.length > 7) {
            await interaction.followUp('Class code should have 6/7 characters.');
            return;
        }

        const foundClass = await getClass(classCode);
        if (!foundClass.classCode) {
            await interaction.followUp(`Class code ${classCode} not found. <a:shookysad:949689086665437184>`);
            return;
        }

        const { roleID, channelID, serverID } = foundClass;
        const vcServer = client.guilds.cache.get(serverID);
        const vcChannel = vcServer.channels.cache.get(channelID) as VoiceBasedChannel;

        if (vcChannel === undefined) {
            await interaction.editReply(`Can't find ${channelMention(channelID)} vc 😞`);
            return;
        }

        const vcMembers = Array.from(vcChannel.members.values());
        const memberIds = vcMembers.filter((m) => m.roles.cache.get(roleID)).map((m) => m.user.id);
        if (memberIds.length === 0) {
            await interaction.followUp(
                `There is no one on vc ${channelMention(serverID)} with role ${roleMention(
                    roleID
                )} <a:shookysad:949689086665437184>`
            );
        }

        // get LogBookChannelID and GuildID of main server
        const foundChannel = await getMessageChannel(channel.id);
        if (foundChannel) {
            const messageChannelID = foundChannel.channelID;
            const messageChannelGuildID = foundChannel.guildID;
            const guild = interaction.client.guilds.cache.get(messageChannelGuildID);
            const messageChannel = guild.channels.cache.get(messageChannelID) as TextChannel;

            const logMessage = new VCLogBook(messageChannel, foundClass, desc);
            const classSize = memberIds.length;
            if (desc.length > 0 || classSize > 0) {
                logMessage.sendLogBookMessage(memberIds, classSize);
                await interaction.followUp('Logbook posted! 🎉');
            }
        }
    }
};
