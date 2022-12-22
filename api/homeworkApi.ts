import {
    DeleteCommand,
    DeleteCommandInput,
    PutCommand,
    PutCommandInput,
    QueryCommand,
    QueryCommandInput
} from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../lib/dynamoDocumentClient';
import IHomework from '../types/homework';

const TableName = 'BA-Homework';

const getHomeworks = async (
    channelID: string,
    startDate: string,
    endDate: string,
    classCode: string
): Promise<Array<IHomework>> => {
    const params: QueryCommandInput = {
        TableName,
        ExpressionAttributeValues: {
            ':s': startDate,
            ':e': endDate,
            ':classCode': classCode
        },
        KeyConditionExpression: 'classCode = :classCode',
        FilterExpression: '#timestamp BETWEEN :s and :e',
        ExpressionAttributeNames: {
            '#timestamp': 'timestamp'
        }
    };

    try {
        console.log(
            `Retrieving homework: channelID ${channelID}, startDate ${startDate}, endDate ${endDate}, classCode ${classCode}`
        );
        const command = new QueryCommand(params);
        const result = await ddbDocClient.send(command);
        return result.Items as Array<IHomework>;
    } catch (error) {
        console.log(`Error retrieving homework: ${error}`);
        return error;
    }
};

const addHomework = async (messageID, studentID, channelID, timestamp, type, classCode): Promise<boolean> => {
    const params: PutCommandInput = {
        TableName,
        Item: {
            messageID,
            studentID,
            channelID,
            timestamp,
            classCode,
            type
        }
    };

    try {
        console.log(
            `Adding homework: messageID ${messageID}, studentID ${studentID}, channelID ${channelID}, timestamp ${timestamp}, type ${type}, classCode ${classCode}`
        );
        const command = new PutCommand(params);
        const result = await ddbDocClient.send(command);
        console.log(`Successfully added homework: ${result}`);
        return true;
    } catch (error) {
        console.log(`Error adding homework: ${error}`);
        return false;
    }
};

const removeHomework = async (messageID: string, classCode: string): Promise<boolean> => {
    const params: DeleteCommandInput = {
        TableName,
        Key: {
            classCode,
            messageID
        }
    };

    try {
        console.log(`Removing homework: messageID ${messageID}, classCode ${classCode}`);
        const command = new DeleteCommand(params);
        const result = await ddbDocClient.send(command);
        console.log(`Successfully removed homework: ${JSON.stringify(result)}`);
        return true;
    } catch (error) {
        console.log(`Error removing homework: ${error}`);
        return false;
    }
};

export { addHomework, getHomeworks, removeHomework };
