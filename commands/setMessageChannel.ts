import { CommandInteraction } from 'discord.js';
import { channelMention, SlashCommandBuilder } from '@discordjs/builders';
import { ChannelType } from 'discord-api-types/v9';
import { addMessageChannel } from '../api/messageChannelApi';
import { ICommand } from '../types/command';

export const setMessageChannel: ICommand = {
    config: new SlashCommandBuilder()
        .setName('setmessagechannel')
        .setDescription(
            'This sets the message channel. If the message channel is in another server, add the server ID.'
        )
        .setDefaultPermission(false)
        .addSubcommand((subcommand) =>
            subcommand
                .setName('regular')
                .setDescription('Set a message channel in this server')
                .addChannelOption((option) =>
                    option
                        .setName('channel')
                        .setDescription('The message channel')
                        .addChannelTypes(
                            ChannelType.GuildText,
                            ChannelType.GuildPublicThread,
                            ChannelType.GuildPrivateThread
                        )
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('cross_server')
                .setDescription('Set message channel in another server')
                .addStringOption((option) =>
                    option.setName('channel_id').setDescription('The channel ID').setRequired(true)
                )
                .addStringOption((option) =>
                    option.setName('guild_id').setDescription('The server ID').setRequired(true)
                )
        ),
    execute: async (interaction: CommandInteraction) => {
        await interaction.deferReply();
        const { channel, options } = interaction;
        let guildId;
        let messageChannelID;
        const cid = channel.id;

        if (options.getSubcommand() === 'regular') {
            guildId = channel.guild.id;
            messageChannelID = options.getChannel('channel').id;
        } else if (options.getSubcommand() === 'cross_server') {
            guildId = options.getString('guild_id');
            messageChannelID = options.getString('channel_id');
        }

        await addMessageChannel(cid, messageChannelID, guildId);
        await interaction.followUp(`You set the message channel to be: ${channelMention(messageChannelID)}.`);
    }
};
