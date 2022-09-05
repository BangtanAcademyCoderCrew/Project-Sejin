import { Collection, TextChannel } from 'discord.js';
import { LogBookMessage } from './logbook-message';
import { IClassInfo } from '../types/classInfo';

class HomeworkLogBook extends LogBookMessage {
  private hwNumbers: number;

  private hwDesc: string;

  constructor(
    messageChannel: TextChannel,
    classInfo: IClassInfo,
    description: string,
    hwNumbers: number,
    hwDesc: string
  ) {
    super(messageChannel, classInfo, description);
    this.hwNumbers = hwNumbers;
    this.hwDesc = hwDesc;
  }

  sendLogBookMessage = (names: Collection<string, any> | Map<string, any>): void => {
    this.sendFirstPartOfLogbookMessage();
    let fullMessage = '\n';

    for (let i = 0; i < Object.keys(names).length; i++) {
      const key = Object.keys(names)[i];
      const hwDesc = `${this.hwDesc.replace('[number]', key)} `;
      const list = this.mentionList(names[key]);
      fullMessage += `${hwDesc + list.join(' ')} \n\n`;
    }

    if (fullMessage.length > 2000) {
      const messages = this.splitMessage(fullMessage, 2000);
      messages.forEach((message) => this.messageChannel.send(message));
    } else {
      this.messageChannel.send(fullMessage);
    }

    this.messageChannel.send({ files: [this.classInfo.img] });
  };
}

export { HomeworkLogBook };
