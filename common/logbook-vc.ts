import { Collection, TextChannel } from 'discord.js';
import { LogBookMessage } from './logbook-message';
import { IClassInfo } from '../types/classInfo';

class VCLogBook extends LogBookMessage {
    private extra: string;

    constructor(messageChannel: TextChannel, classInfo: IClassInfo, description: string) {
        super(messageChannel, classInfo, description);
        this.extra = '출석자 Attendees: ';
    }

    sendLogBookMessage = (names: Collection<string, string> | Array<string>, classSize: number): void => {
        this.sendFirstPartOfLogbookMessage();
        const list = this.mentionList(names);
        if (list.length > 0) {
            this.sendStudentsUsernamesByGroup(list, this.messageChannel, classSize);
        }
        this.messageChannel.send({ files: [this.classInfo.image_url] });
    };
}

export { VCLogBook };
