import { writeFile } from 'fs';
import path from 'path';
import { BaseCommandInteraction, Message, PartialMessage } from 'discord.js';
import { addHomework } from '../database/homework-db';

const dirname = path.resolve();
const pathToJson = path.resolve(dirname, '../hwchannels.json');
const file = await import(pathToJson);

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

const writeToFile = (): void => {
  writeFile(pathToJson, JSON.stringify(file), (error) => {
    if (error) {
      console.log(`Error writing to file: ${error}`);
      return;
    }
    console.log(JSON.stringify(file));
    console.log(`writing to ${pathToJson}`);
  });
};

const addHomeworkChannel = (channelID: string, message: BaseCommandInteraction, classCode: string): boolean => {
  console.log(channelID);
  if (channelID in file.ids) {
    message.followUp(
      `Channel <#${channelID}> has already been added as a Homework Channel. <a:shookysad:949689086665437184>`
    );
    return false;
  }
  file.ids[channelID] = classCode;
  writeToFile();
  return true;
};

const removeHomeworkChannel = (channelID: string, message: BaseCommandInteraction): boolean => {
  if (!(channelID in file.ids)) {
    message.followUp(
      `Channel <#${channelID}> has not been added as a Homework Channel. <a:shookysad:949689086665437184>`
    );
    return false;
  }
  console.log('SAVING NEW CHANNEL');

  delete file.ids[channelID];
  writeToFile();
  return true;
};

const saveHomeworkToDB = async (
  message: Message | PartialMessage,
  assignmentNumber: string,
  classCode: string
): Promise<boolean> => {
  const { author, channel, id } = message;
  const timestamp = getTimeForSavingHomework(message);

  const result = await addHomework(id, author.id, channel.id, timestamp, assignmentNumber, classCode);
  if (result === true) {
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

export { addHomeworkChannel, getNameOfEmoji, getTimeForSavingHomework, removeHomeworkChannel, saveHomeworkToDB };
