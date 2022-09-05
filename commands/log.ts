import { SlashCommandBuilder, roleMention, channelMention } from '@discordjs/builders';
import { CommandInteraction, TextChannel, VoiceBasedChannel } from 'discord.js';
import { addClassCodeStringOption } from '../common/commandHelper';
import { IClassInfo } from '../types/classInfo';
import { ICommand } from '../types/command';
import { getClass } from '../database/class-db';
import { getMessageChannel } from '../database/messageChannel-db';
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

    if (classCode.length >= 7) {
      await interaction.followUp('Class Code should have 6 characters.');
      return;
    }

    const foundClass = await getClass(classCode);
    if (!foundClass) {
      await interaction.followUp(`Class code ${classCode} not found. <a:shookysad:949689086665437184>`);
      return;
    }

    const classInfo: IClassInfo = {
      assignedRole: foundClass.roleID.S,
      channelID: foundClass.channelID.S,
      title: foundClass.title.S,
      img: foundClass.image_url.S,
      serverID: foundClass.serverID.S
    };

    const { assignedRole, channelID, serverID } = classInfo;
    const vcServer = client.guilds.cache.get(serverID);
    const vcChannel = vcServer.channels.cache.get(channelID) as VoiceBasedChannel;
    const vcMembers = Array.from(vcChannel.members.values());
    const memberIds = vcMembers.filter((m) => m.roles.cache.get(assignedRole)).map((m) => m.user.id);
    console.log(memberIds);
    if (memberIds.length === 0) {
      await interaction.followUp(
        `There is no one on vc ${channelMention(serverID)} with role ${roleMention(
          assignedRole
        )} <a:shookysad:949689086665437184>`
      );
    }

    // get LogBookChannel ID and GuildID of main server
    const foundChannel = await getMessageChannel(channel.id);
    if (foundChannel) {
      const messageChannelID = foundChannel.channelID.S;
      const messageChannelGuildID = foundChannel.guildID.S;
      const guild = interaction.client.guilds.cache.get(messageChannelGuildID);
      const messageChannel = guild.channels.cache.get(messageChannelID) as TextChannel;

      const logMessage = new VCLogBook(messageChannel, classInfo, desc);
      const classSize = memberIds.length;
      if (desc.length > 0 || classSize > 0) {
        logMessage.sendLogBookMessage(memberIds, classSize);
        await interaction.followUp('Logbook posted!');
      }
    }
  }
};
