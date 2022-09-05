import { Client, MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js';
import hwChannels from '../hwchannels.json';
import numberEmojis from '../emojis.json';
import { getNameOfEmoji, saveHomeworkToDB } from '../common/discordutil';

export default (client: Client): void => {
  client.on(
    'messageReactionAdd',
    async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser): Promise<void> => {
      const { emoji, message, partial } = reaction;
      if (partial) {
        try {
          await reaction.fetch();
        } catch (error) {
          console.error('Something went wrong when fetching the message: ', error);
          return;
        }
      }

      if (user.id === client.user.id) {
        return;
      }

      const channelId = message.channel.id;
      const channelType = message.channel.type;

      const isAValidHwChannel = Object.keys(hwChannels.ids).includes(channelId);
      if (!isAValidHwChannel) {
        return;
      }

      const validHWChannelTypes = ['GUILD_TEXT', 'GUILD_PUBLIC_THREAD', 'GUILD_PRIVATE_THREAD'];
      const isAValidHwChannelType = validHWChannelTypes.includes(channelType);
      if (!isAValidHwChannelType) {
        return;
      }

      const classCode = hwChannels.ids[channelId];
      const emojiName = emoji.name;
      const cleanEmojiName = emojiName.replace(/\d/g, '');

      if (cleanEmojiName === 'purple_check_mark') {
        // eslint-disable-next-line no-underscore-dangle
        const firstEmoji = message.reactions.cache.values().next().value._emoji.name;
        const assignmentNumber = getNameOfEmoji(firstEmoji);
        if (!assignmentNumber) {
          await message.react('❌');
          return;
        }
        await saveHomeworkToDB(message, assignmentNumber, classCode);
        return;
      }

      if (emojiName === '⏭️') {
        const nextEmojis = numberEmojis.emojis.slice(10, 15);
        nextEmojis.forEach((e) => {
          message.react(e);
        });
        return;
      }

      const fullEmojiId = `<:${emojiName}:${emoji.id}>`;
      const isStoredNumberEmoji = numberEmojis.emojis.includes(fullEmojiId);
      if (isStoredNumberEmoji) {
        await message.reactions.removeAll();
        await message.react(fullEmojiId);
        await saveHomeworkToDB(message, cleanEmojiName, classCode);
        return;
      }

      if (emojiName === '❗') {
        await message.reactions.removeAll();
      }
    }
  );
};
