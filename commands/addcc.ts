import { SlashCommandBuilder, roleMention } from '@discordjs/builders';
import { CommandInteraction, GuildBasedChannel } from 'discord.js';
import { createClass, getClassCodeByRoleID } from '../api/classApi';
import { addChannelStringOption, addClassCodeStringOption } from '../common/commandHelper';
import { addHomeworkChannel } from '../common/discordutil';
import { ICommand } from '../types/command';

const slashCommandBuilder = new SlashCommandBuilder();
slashCommandBuilder.setName('addcc').setDescription('Add a class to the db.').setDefaultPermission(false);
addClassCodeStringOption(slashCommandBuilder, true);
addChannelStringOption(slashCommandBuilder, true)
    .addRoleOption((option) => option.setName('role').setDescription('The role for the class').setRequired(true))
    .addStringOption((option) => option.setName('title').setDescription('The title for the class').setRequired(true))
    .addStringOption((option) =>
        option.setName('image_url').setDescription('The image url for the class').setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('type')
            .setDescription('The type of class')
            .addChoices(
                { name: 'Class + HW', value: 'full_class' },
                { name: 'Only meetings', value: 'vc' },
                { name: 'Only assignments (club)', value: 'hw' }
            )
            .setRequired(true)
    )
    .addIntegerOption((option) =>
        option
            .setName('number_of_assignments')
            .setDescription('The number of assignments for the class. Add 0 if there are no assignments.')
            .setRequired(false)
    );

export const addCc: ICommand = {
    config: slashCommandBuilder,
    execute: async (interaction: CommandInteraction) => {
        await interaction.deferReply();
        const { channel, options } = interaction;
        const channelIDs = options.getString('channel');
        const roleID = options.getRole('role').id;
        const classTitle = options.getString('title');
        const classCode = options.getString('class_code');
        const imageUrl = options.getString('image_url');
        const type = options.getString('type');
        const numberOfAssignments = options.getInteger('number_of_assignments') || 0;

        const validateChannel = async (hwChannel: GuildBasedChannel, channelID: string): Promise<boolean> => {
            const validChannels = {
                hw: ['GUILD_TEXT', 'GUILD_PUBLIC_THREAD', 'GUILD_PRIVATE_THREAD'],
                vc: ['GUILD_VOICE'],
                full_class: ['GUILD_VOICE']
            };
            if (!hwChannel) {
                interaction.followUp(`${channelID} is not a valid channel id`);
                return false;
            }
            if (!validChannels[type].includes(hwChannel.type)) {
                interaction.followUp(
                    `Channel type ${hwChannel.type} is not valid for ${type} format. Valid formats are: ${validChannels[
                        type
                    ].join(', ')}`
                );
                return false;
            }
            if (['hw'].includes(type)) {
                const addedChannelCorrectly = await addHomeworkChannel(hwChannel.id, interaction, classCode);
                if (!addedChannelCorrectly) {
                    return false;
                }
                channel.send(`Added channel ${hwChannel} (${hwChannel.id}) as a Homework channel`);
            }
            return true;
        };

        if (type === 'hw' && numberOfAssignments === 0) {
            await interaction.followUp(
                'For a club, the number of assignments should be greater than 0. <a:shookysad:949689086665437184>'
            );
            return;
        }

        const allChannelIDs = channelIDs.split(' ');
        const validated = await Promise.all(
            allChannelIDs.map((hwChannelID) => {
                const hwChannel = channel.guild.channels.cache.get(hwChannelID);
                return validateChannel(hwChannel, hwChannelID);
            })
        );
        if (!validated) {
            return;
        }

        const classChannel = channel.guild.channels.cache.get(allChannelIDs[0]);
        const sID = classChannel.guild.id;
        const result = await getClassCodeByRoleID(roleID);
        if (result && result.classCode !== classCode) {
            await interaction.followUp(`There's already class code ${result.classCode} with this role assigned!`);
            return;
        }

        await createClass(sID, roleID, channelIDs, classCode, classTitle, imageUrl, numberOfAssignments.toString());
        await interaction.followUp(
            `You set ${classCode} to be the class code for ${roleMention(
                roleID
            )}\n The class title is: ${classTitle}\nThe class image is: ${imageUrl}`
        );
    }
};
