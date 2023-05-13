import { Client } from 'discord.js';
import { ICommand } from './command';

export interface IClient extends Client {
    commands?: Map<string, ICommand>;
}
