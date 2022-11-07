import { promises as fs } from 'fs';
import path from 'path';
import { ApplicationCommandPermissionData, BaseCommandInteraction, Message, PartialMessage } from 'discord.js';
import { addHomework } from '../api/homeworkApi';
import * as homeworkDataStore from '../hwchannels.json';
import * as permissionsDataStore from '../customPermissions.json';

const dirname = path.resolve();
const pathToHwDataStore = path.resolve(dirname, '../hwchannels.json');
const pathToPermissionsDataStore = path.resolve(dirname, '../customPermissions.json');

const getTimeForSavingHomework = (message: Message | PartialMessage) => {
    const date = new Date(message.createdTimestamp);
    const CSTDay = new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours() - 5,
        date.getUTCMinutes()
    );
    return CSTDay.toString();
};

const writeToFile = async (pathToJson, file): Promise<boolean> => {
    const fileString = JSON.stringify(file);
    try {
        console.log(`Successfully wrote to file: fileString ${fileString}, pathToJson ${pathToPermissionsDataStore}`);
        await fs.writeFile(pathToJson, JSON.stringify(file));
        return true;
    } catch (error) {
        console.log(`Error writing to file: ${error}`);
        return false;
    }
};

const addCommandPermission = async (
    commandId: string,
    permissions: Array<ApplicationCommandPermissionData>
): Promise<boolean> => {
    if (commandId in permissionsDataStore) {
        permissionsDataStore[commandId].permissions = permissionsDataStore[commandId].permissions.concat(permissions);
    } else {
        permissionsDataStore[commandId] = {
            id: commandId,
            permissions
        };
    }
    return writeToFile(pathToPermissionsDataStore, permissionsDataStore);
};

const removeCommandPermission = async (
    commandId: string,
    newPermissions: Array<ApplicationCommandPermissionData>
): Promise<boolean> => {
    if (commandId in permissionsDataStore) {
        permissionsDataStore[commandId].permissions = permissionsDataStore[commandId].permissions.filter(
            (permission) => permission.id !== newPermissions[0].id
        );
        return writeToFile(pathToPermissionsDataStore, permissionsDataStore);
    }
    return false;
};

const addHomeworkChannel = async (
    channelID: string,
    message: BaseCommandInteraction,
    classCode: string
): Promise<boolean> => {
    console.log(channelID);
    if (channelID in homeworkDataStore.ids) {
        message.followUp(
            `Channel <#${channelID}> has already been added as a Homework Channel. <a:shookysad:949689086665437184>`
        );
        return false;
    }
    homeworkDataStore.ids[channelID] = classCode;
    return writeToFile(pathToHwDataStore, homeworkDataStore);
};

const removeHomeworkChannel = async (channelID: string, message: BaseCommandInteraction): Promise<boolean> => {
    if (!(channelID in homeworkDataStore.ids)) {
        message.followUp(
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
    addCommandPermission,
    addHomeworkChannel,
    getNameOfEmoji,
    getTimeForSavingHomework,
    removeCommandPermission,
    removeHomeworkChannel,
    saveHomeworkToDB
};
