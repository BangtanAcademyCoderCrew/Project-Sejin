import AWS from 'aws-sdk';
import path from 'path';
import IMessageChannel from '../types/messageChannel';

const dirname = path.resolve();
const pathToJson = path.resolve(dirname, '../aws_config.json');
AWS.config.loadFromPath(pathToJson);
const ddb = new AWS.DynamoDB();
const TableName = 'BA-Message-Channel';

const addMessageChannel = async (id: string, channelID: string, guildID: string): Promise<void> => {
  const params = {
    TableName,
    Item: {
      id: { S: id },
      channelID: { S: channelID },
      guildID: { S: guildID }
    }
  };

  try {
    console.log(`Adding message channel: id ${id}, channelID ${channelID}, guildID ${guildID}`);
    ddb.putItem(params, (err, data) => {
      if (err) {
        console.log(`Error setting message channel ${channelID}: ${err}`);
      } else {
        console.log(`Successfully set message channel ${channelID}: ${data}`);
      }
    });
  } catch (error) {
    console.log(`Error setting message channel ${channelID}: ${error}`);
  }
};

const getMessageChannel = async (id: string): Promise<IMessageChannel> => {
  const params = {
    TableName,
    Key: {
      id: {
        S: id
      }
    }
  };

  try {
    console.log(`Retrieving message channel: id ${id}`);
    const result = await ddb.getItem(params).promise();
    return result.Item as IMessageChannel;
  } catch (error) {
    console.log(`Error retrieving message channel ${id}: ${error}`);
    return error;
  }
};

export { addMessageChannel, getMessageChannel };
