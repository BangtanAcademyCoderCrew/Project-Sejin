import { GetCommand, GetCommandInput, PutCommand, PutCommandInput } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../lib/dynamoDocumentClient';
import IMessageChannel from '../types/messageChannel';

const TableName = 'BA-Message-Channel';

const addMessageChannel = async (id: string, channelID: string, guildID: string): Promise<boolean> => {
    const params: PutCommandInput = {
        TableName,
        Item: {
            id,
            channelID,
            guildID
        }
    };

    try {
        console.log(`Adding message channel: id ${id}, channelID ${channelID}, guildID ${guildID}`);
        const command = new PutCommand(params);
        const result = await ddbDocClient.send(command);
        console.log(`Successfully set message channel ${channelID}: ${result}`);
        return true;
    } catch (error) {
        console.log(`Error setting message channel ${channelID}: ${error}`);
        return false;
    }
};

const getMessageChannel = async (id: string): Promise<IMessageChannel> => {
    const params: GetCommandInput = {
        TableName,
        Key: { id }
    };

    try {
        console.log(`Retrieving message channel: id ${id}`);
        const command = new GetCommand(params);
        const result = await ddbDocClient.send(command);
        return result.Item as IMessageChannel;
    } catch (error) {
        console.log(`Error retrieving message channel ${id}: ${error}`);
        return error;
    }
};

export { addMessageChannel, getMessageChannel };
