const DiscordUtil = require('../common/discordutil.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord-api-types/v9');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addpreviewlinkchannel')
		.setDescription('Add a channel to use the preview link feature')
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

        const addedChannelCorrectly = DiscordUtil.addPreviewChannel(channelID, interaction);
        if (addedChannelCorrectly) {
            return interaction.followUp(`Added channel <#${channelID}> (${channelID}) as a Preview channel`);
        }
	}
};