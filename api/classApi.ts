/* eslint-disable camelcase */
import {
    GetCommand,
    GetCommandInput,
    PutCommand,
    PutCommandInput,
    QueryCommand,
    QueryCommandInput
} from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../lib/dynamoDocumentClient';
import IClass from '../types/class';

const TableName = 'BA-Class';

const createClass = async (
    serverID: string,
    roleID: string,
    channelID: string,
    classCode: string,
    title: string,
    image_url: string,
    numberOfHomeworks: string
): Promise<void> => {
    const params: PutCommandInput = {
        TableName,
        Item: {
            classCode,
            roleID,
            channelID,
            title,
            image_url,
            serverID,
            numberOfHomeworks
        }
    };

    try {
        console.log(
            `Creating class: serverID ${serverID}, roleID ${roleID}, channelID ${channelID}, classCode ${classCode}, title ${title}, image_url ${image_url} numberOfHomeworks ${numberOfHomeworks}`
        );
        const command = new PutCommand(params);
        const result = await ddbDocClient.send(command);
        console.log(`Successfully created class ${classCode}: ${result}`);
    } catch (error) {
        console.log(`Error creating class ${classCode}: ${error}`);
    }
};

const getClass = async (classCode: string): Promise<IClass> => {
    const params: GetCommandInput = {
        TableName,
        Key: { classCode }
    };

    try {
        console.log(`Retrieving class: classCode ${classCode}`);
        const command = new GetCommand(params);
        const result = await ddbDocClient.send(command);
        return result.Item as IClass;
    } catch (error) {
        console.log(`Error retrieving class ${classCode}: ${error}`);
        return error;
    }
};

const getClassCodeByRoleID = async (roleID: string): Promise<IClass> => {
    const params: QueryCommandInput = {
        TableName,
        IndexName: 'RoleIDIndex',
        KeyConditionExpression: 'roleID = :role_id',
        ExpressionAttributeValues: { ':role_id': roleID }
    };

    try {
        console.log(`Retrieving class by roleID ${roleID}`);
        const command = new QueryCommand(params);
        const result = await ddbDocClient.send(command);
        return result.Items.length > 0 ? (result.Items[0] as IClass) : ({} as IClass);
    } catch (error) {
        console.log(`Error retrieving class for roleID ${roleID}: ${error}`);
        return error;
    }
};

export { createClass, getClass, getClassCodeByRoleID };
