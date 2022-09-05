import { CommandInteraction, ContextMenuInteraction } from 'discord.js';
import {
  ContextMenuCommandBuilder,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder
} from '@discordjs/builders';

export interface ICommand {
  config:
    | Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'>
    | SlashCommandSubcommandsOnlyBuilder
    | ContextMenuCommandBuilder;
  execute: (interaction: CommandInteraction | ContextMenuInteraction) => Promise<void>;
}
