/* eslint-disable camelcase */

import AWS, { DynamoDB } from 'aws-sdk';
import path from 'path';
import IClass from '../types/class';

const dirname = path.resolve();
const pathToJson = path.resolve(dirname, '../aws_config.json');
AWS.config.loadFromPath(pathToJson);
const ddb = new AWS.DynamoDB();
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
  const params: DynamoDB.Types.PutItemInput = {
    TableName,
    Item: {
      classCode: { S: classCode },
      roleID: { S: roleID },
      channelID: { S: channelID },
      title: { S: title },
      image_url: { S: image_url },
      serverID: { S: serverID },
      numberOfHomeworks: { S: numberOfHomeworks }
    }
  };

  try {
    console.log(
      `Creating class: serverID ${serverID}, roleID ${roleID}, channelID ${channelID}, classCode ${classCode}, title ${title}, image_url ${image_url} numberOfHomeworks ${numberOfHomeworks}`
    );
    ddb.putItem(params, (err, data) => {
      if (err) {
        console.log(`Error creating class ${classCode}: ${err}`);
      } else {
        console.log(`Successfully created class ${classCode}: ${data}`);
      }
    });
  } catch (error) {
    console.log(`Error creating class ${classCode}: ${error}`);
  }
};

const getClass = async (classCode: string): Promise<IClass> => {
  const params: DynamoDB.Types.GetItemInput = {
    Key: {
      classCode: {
        S: classCode
      }
    },
    TableName
  };

  try {
    console.log(`Retrieving class: classCode ${classCode}`);
    const result = await ddb.getItem(params).promise();
    return result.Item as IClass;
  } catch (error) {
    console.log(`Error retrieving class ${classCode}: ${error}`);
    return error;
  }
};

const getClassCodeByRoleID = async (roleID: string): Promise<IClass> => {
  const params: DynamoDB.Types.QueryInput = {
    TableName,
    IndexName: 'RoleIDIndex',
    KeyConditionExpression: 'roleID = :role_id',
    ExpressionAttributeValues: { ':role_id': { S: roleID } }
  };

  try {
    console.log(`Retrieving class by roleID ${roleID}`);
    const result = await ddb.query(params).promise();
    return result.Items[0] as IClass;
  } catch (error) {
    console.log(`Error retrieving class by roleID ${roleID}: ${error}`);
    return error;
  }
};

export { createClass, getClass, getClassCodeByRoleID };
