import { ContextMenuCommandBuilder } from '@discordjs/builders';
import { ContextMenuInteraction, MessageActionRow, MessageSelectMenu } from 'discord.js';
import { ICommand } from '../types/command';

export const addHw: ICommand = {
    config: new ContextMenuCommandBuilder().setName('add homework').setType(3).setDefaultPermission(false),
    execute: async (interaction: ContextMenuInteraction) => {
        await interaction.deferReply();
        const { targetId } = interaction;
        const options = [];

        for (let i = 0; i < 15; i++) {
            const option = {
                label: `Assignment ${i + 1}`,
                value: `${i + 1}`
            };
            options.push(option);
        }

        const row = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId(`addhw_${targetId}`)
                .setPlaceholder('Select the assignment number')
                .addOptions(options)
        );

        await interaction.followUp({ content: ' ', components: [row] });
    }
};
