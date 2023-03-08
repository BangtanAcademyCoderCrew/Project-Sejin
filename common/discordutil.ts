import { promises as fs } from 'fs';
import path from 'path';
import { BaseCommandInteraction, Message, PartialMessage } from 'discord.js';
import { addHomework } from '../api/homeworkApi';
import * as homeworkDataStore from '../hwchannels.json';

const pathToHwDataStore = path.resolve('hwchannels.json');

const getTimeForSavingHomework = (message: Message | PartialMessage) => {
    const date = new Date(message.createdTimestamp);
    const CSTDay = new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours() - 5,
        date.getUTCMinutes()
    );
    return Date.parse(CSTDay.toString()).toString();
};

const writeToFile = async (pathToJson, file): Promise<boolean> => {
    const fileString = JSON.stringify(file);
    try {
        console.log(`Successfully wrote to file: fileString ${fileString}, pathToJson ${pathToJson}`);
        await fs.writeFile(pathToJson, fileString);
        return true;
    } catch (error) {
        console.log(`Error writing to file: ${error}`);
        return false;
    }
};

const hasHomeworkChannel = (channelID: string, interaction: BaseCommandInteraction, classCode: string): boolean => {
    return channelID in homeworkDataStore.ids && homeworkDataStore.ids[channelID] === classCode;
};

const addHomeworkChannel = async (
    channelID: string,
    interaction: BaseCommandInteraction,
    classCode: string
): Promise<boolean> => {
    console.log(channelID);
    if (channelID in homeworkDataStore.ids) {
        interaction.followUp(
            `Channel <#${channelID}> has already been added as a Homework Channel for class code ${classCode}. <a:shookysad:949689086665437184>`
        );
        return false;
    }
    homeworkDataStore.ids[channelID] = classCode;
    return writeToFile(pathToHwDataStore, homeworkDataStore);
};

const removeHomeworkChannel = async (channelID: string, interaction: BaseCommandInteraction): Promise<boolean> => {
    if (!(channelID in homeworkDataStore.ids)) {
        interaction.followUp(
            `Channel <#${channelID}> has not been added as a Homework Channel. <a:shookysad:949689086665437184>`
        );
        return false;
    }
    delete homeworkDataStore.ids[channelID];
    return writeToFile(pathToHwDataStore, homeworkDataStore);
};

const saveHomeworkToDB = async (
    message: Message | PartialMessage,
    assignmentNumber: string,
    classCode: string
): Promise<boolean> => {
    const { author, channel, id } = message;
    const timestamp = getTimeForSavingHomework(message);

    const result = await addHomework(id, author.id, channel.id, timestamp, assignmentNumber, classCode);
    if (result) {
        await message.react('👍');
    } else {
        await message.react('❌');
    }
    return result;
};

const getNameOfEmoji = (emoji): string | null => {
    switch (emoji) {
        case '1️⃣':
            return '1';
        case '2️⃣':
            return '2';
        case '3️⃣':
            return '3';
        case '4️⃣':
            return '4';
        case '5️⃣':
            return '5';
        case '6️⃣':
            return '6';
        case '7️⃣':
            return '7';
        case '8️⃣':
            return '8';
        case '9️⃣':
            return '9';
        case '🔟':
            return '10';
        default:
            return null;
    }
};

export {
    addHomeworkChannel,
    getNameOfEmoji,
    getTimeForSavingHomework,
    hasHomeworkChannel,
    removeHomeworkChannel,
    saveHomeworkToDB
};
