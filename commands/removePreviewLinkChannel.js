const DiscordUtil = require('../common/discordutil.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord-api-types/v9');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removepreviewlinkchannel')
		.setDescription('Remove a channel to use the preview link feature')
        .setDefaultPermission(false)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel')
                .addChannelTypes([ChannelType.GuildText, ChannelType.GuildPublicThread, ChannelType.GuildPrivateThread])
                .setRequired(true)),
	async execute(interaction) {
        const options = interaction.options;
        const channelID = options.getChannel('channel').id;

        await interaction.deferReply();

        const removedChannelCorrectly = DiscordUtil.removePreviewChannel(channelID, interaction);
        if (removedChannelCorrectly) {
            return interaction.followUp(`Removed channel <#${channelID}> (${channelID}) as a Preview channel.`);
        }
	}
};