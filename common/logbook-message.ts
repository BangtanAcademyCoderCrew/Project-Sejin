/* eslint-disable class-methods-use-this */
import { Collection, TextChannel } from 'discord.js';
import { IClassInfo } from '../types/classInfo';

class LogBookMessage {
    public messageChannel: TextChannel;

    public classInfo: IClassInfo;

    public desc: string;

    constructor(messageChannel: TextChannel, classInfo: IClassInfo, description: string) {
        this.messageChannel = messageChannel;
        this.classInfo = classInfo;
        this.desc = description;
    }

    getDateMessage = () => {
        let date = new Date();
        const engDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const korDays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
        const monNum = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
        const months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];

        // DST fix
        date = new Date(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours() - 5,
            date.getUTCMinutes()
        );
        const monthNum = monNum[date.getMonth()];
        const monthName = months[date.getMonth()];
        const engDay = engDays[date.getDay()];
        const korDay = korDays[date.getDay()];
        return `${engDay}, ${date.getDate()} ${monthName} ${date.getFullYear()}\n${date.getFullYear()}년 ${monthNum}월 ${date.getDate()}일 ${korDay}`;
    };

    mentionList = (mentions: Collection<string, string> | Array<string>): Array<string> => {
        const values = Array.from(mentions.values());
        for (let i = 0; i < values.length; i++) {
            values[i] = `<@${values[i]}>`;
        }
        return values;
    };

    splitMessage = (fullMessage: string, max: number): Array<string> => {
        const suffix = ' cont.';
        const numberOfMessages = Math.ceil(fullMessage.length / max);
        const messages = [];
        let start = 0;
        for (let i = 0; i < numberOfMessages; i++) {
            let message;
            if (i === numberOfMessages - 1) {
                message = `${fullMessage.substring(start)}\n`;
            } else {
                const end = start + fullMessage.substring(start, max - suffix.length).lastIndexOf(' ');
                message = `${fullMessage.slice(start, end)}\n${suffix}`;
                start = end + 1;
            }
            messages.push(message);
        }
        return messages;
    };

    sendStudentsUsernamesByGroup = (list: Array<string>, messageChannel: TextChannel, classSize: number): void => {
        for (let i = 0; i <= Math.ceil(classSize / 50); i++) {
            const List = list.slice(i * 50, i * 50 + 50).join(' ');
            if (i < 1) {
                messageChannel.send(List);
            } else if (List.length > 0) {
                messageChannel.send(`cont.\n${List}`);
            }
        }
    };

    sendFirstPartOfLogbookMessage = (): void => {
        const dateMessage = this.getDateMessage();
        let tagRole = '';
        const { roleID, title } = this.classInfo;
        if (this.messageChannel.guild.roles.cache.get(roleID) !== undefined) {
            tagRole = `<@&${roleID}>`;
        }
        this.messageChannel.send(`LOGBOOK: ${title}\n ${tagRole}\n${dateMessage}\n\n${this.desc}\n`);
    };
}

export { LogBookMessage };
