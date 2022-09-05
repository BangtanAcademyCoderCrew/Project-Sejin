import { CommandInteraction, TextChannel } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { addLogHwOptions } from '../common/commandHelper';
import { getClass } from '../database/class-db';
import { getMessageChannel } from '../database/messageChannel-db';
import { getHomeworks } from '../database/homework-db';
import { DateValidator } from '../common/logbook-date';
import { HomeworkLogBook } from '../common/logbook-homework';
import { ICommand } from '../types/command';
import { IClassInfo } from '../types/classInfo';

const slashCommandBuilder = new SlashCommandBuilder();
slashCommandBuilder.setName('loghw').setDescription('Log a club in the message channel.').setDefaultPermission(false);
addLogHwOptions(slashCommandBuilder);

export const logHw: ICommand = {
  config: slashCommandBuilder,
  execute: async (interaction: CommandInteraction) => {
    await interaction.deferReply();
    const { channel, client, options } = interaction;
    let startDay = options.getString('start_date');
    const startTime = options.getString('start_time');
    let endDay = options.getString('end_date');
    const endTime = options.getString('end_time');
    const classCode = options.getString('class_code');
    const desc = options.getString('description') || '';
    const hwDesc = options.getString('hw_description') || 'Assignment "number"';
    const shouldNotAllowMultipleEntries = options.getBoolean('no_multiples');

    if (classCode.length >= 7) {
      await interaction.followUp('class_code should have 6 characters.');
      return;
    }

    const dateValid = new DateValidator();
    if (
      !dateValid.isValidDate(endDay) ||
      !dateValid.isValidDate(startDay) ||
      !dateValid.isValidTime(startTime) ||
      !dateValid.isValidTime(endTime)
    ) {
      await interaction.followUp('Please insert the correct format for dates and time (YYYY/MM/DD HH:MM)');
      return;
    }
    dateValid.adaptFormatOfDays(startTime, startDay, endTime, endDay);
    const periodDayTimes = dateValid.adaptFormatOfDays(startTime, startDay, endTime, endDay);
    startDay = periodDayTimes[0];
    endDay = periodDayTimes[1];

    // Get information from the class using ClassCodeID
    const foundClass = await getClass(classCode);
    if (!foundClass) {
      await interaction.followUp(`Class code ${classCode} not found. <a:shookysad:949689086665437184>`);
      return;
    }

    const classInfo: IClassInfo = {
      assignedRole: foundClass.roleID.S,
      channelID: foundClass.channelID.S,
      title: foundClass.title.S,
      img: foundClass.image_url.S,
      serverID: foundClass.serverID.S
    };

    // get LogBookChannelID and GuildID of main server
    const foundChannel = await getMessageChannel(channel.id);
    if (!foundChannel) {
      return;
    }

    const messageChannelID = foundChannel.channelID.S;
    const messageChannelGuildID = foundChannel.guildID.S;
    const guild = client.guilds.cache.get(messageChannelGuildID);
    const messageChannel = guild.channels.cache.get(messageChannelID) as TextChannel;

    // Search in the db for all the homework submitted and checked during a period of time
    const homework = await getHomeworks(classInfo.channelID, startDay, endDay, classCode);
    if (!homework || homework.length === 0) {
      return;
    }

    const studentsIdsByHomeworkNumber = new Map();
    const alreadyLoggedStudentIds = [];
    homework
      .sort()
      .reverse()
      .forEach((hw) => {
        const hwNumber = hw.type.S;
        const studentId = hw.studentID.S;
        const hasStudentAlreadyBeenLogged = alreadyLoggedStudentIds.includes(studentId);
        if (shouldNotAllowMultipleEntries && hasStudentAlreadyBeenLogged) {
          return;
        }
        if (!(hwNumber in studentsIdsByHomeworkNumber)) {
          studentsIdsByHomeworkNumber[hwNumber] = [];
        }
        studentsIdsByHomeworkNumber[hwNumber].push(studentId);
        alreadyLoggedStudentIds.push(studentId);
      });

    const totalHomeworks = Object.keys(studentsIdsByHomeworkNumber).length;
    if (totalHomeworks === 0) {
      await interaction.followUp('There was no homework submitted during this time period.');
      return;
    }
    const logMessage = new HomeworkLogBook(messageChannel, classInfo, desc, totalHomeworks, hwDesc);
    logMessage.sendLogBookMessage(studentsIdsByHomeworkNumber);
    await interaction.followUp('Logbook posted!');
  }
};
