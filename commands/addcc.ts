import { SlashCommandBuilder, roleMention } from '@discordjs/builders';
import { CommandInteraction, GuildBasedChannel } from 'discord.js';
import { createClass, getClass, getClassCodeByRoleID } from '../api/classApi';
import { addChannelStringOption, addClassCodeStringOption } from '../common/commandHelper';
import { addHomeworkChannel, hasHomeworkChannel } from '../common/discordutil';
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
        const hwChannels = options.getString('channel');
        const roleID = options.getRole('role').id;
        const classTitle = options.getString('title');
        const classCode = options.getString('class_code');
        const imageUrl = options.getString('image_url');
        const type = options.getString('type');
        const numberOfAssignments = options.getInteger('number_of_assignments') || 0;

        if (classCode.length < 6 || classCode.length > 7) {
            await interaction.editReply('Class code should have 6/7 characters.');
            return;
        }

        const addChannel = async (hwChannel: GuildBasedChannel): Promise<boolean> => {
            const channelAdded = await addHomeworkChannel(hwChannel.id, interaction, classCode);
            if (!channelAdded) {
                channel.send(`There was a problem adding channel ${hwChannel} (${hwChannel.id}) as a Homework channel`);
                return false;
            }
            channel.send(`Added channel ${hwChannel} (${hwChannel.id}) as a Homework channel`);
            return true;
        };

        const validateAndAddChannel = async (hwChannel: GuildBasedChannel, channelID: string): Promise<boolean> => {
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
                    `ChannelID: ${channelID}. The channel type ${
                        hwChannel.type
                    } is not valid for ${type} format. Valid formats are: ${validChannels[type].join(', ')}`
                );

                return false;
            }
            if (['hw'].includes(type)) {
                const channelAlreadyAddedForClass = hasHomeworkChannel(hwChannel.id, interaction, classCode);
                if (channelAlreadyAddedForClass) {
                    return true;
                }
                return addChannel(hwChannel);
            }

            return true;
        };

        const classByRoleId = await getClassCodeByRoleID(roleID);
        if (classByRoleId.classCode && classByRoleId.classCode !== classCode) {
            await interaction.followUp(
                `There's already class code ${classByRoleId.classCode} with this role assigned! `
            );
            return;
        }

        const classByClassCode = await getClass(classCode);
        if (classByClassCode.classCode && classByClassCode.roleID !== roleID) {
            const className = classByClassCode.title;
            await interaction.followUp(`There's already class code ${classCode} registered for class ${className}!`);
            return;
        }

        if (type === 'hw' && numberOfAssignments === 0) {
            await interaction.followUp('For a club, the number of assignments should be greater than 0. 😞');
            return;
        }

        // remove any channel mention syntax and trim whitespace
        const allChannelIDs = hwChannels
            .split(/(\s+)/)
            .filter((e) => e.trim().length > 0)
            .map((c) => c.replace(/\D/g, ''));
        const allChannelPromises = await Promise.all(
            allChannelIDs.map((hwChannelID) => {
                const hwChannel = channel.guild.channels.cache.get(hwChannelID);
                return validateAndAddChannel(hwChannel, hwChannelID);
            })
        );

        const areAllChannelsValid = allChannelPromises.every((v) => v === true);
        if (areAllChannelsValid) {
            const classChannel = interaction.guild.channels.cache.get(allChannelIDs[0]);
            const sID = classChannel.guild.id;

            await createClass(sID, roleID, hwChannels, classCode, classTitle, imageUrl, numberOfAssignments.toString());
            await interaction.followUp(
                `You set ${classCode} to be the class code for ${roleMention(
                    roleID
                )}\nThe class title is: ${classTitle}\nThe class image is: ${imageUrl}`
            );
        }
    }
};
