import AWS from 'aws-sdk';
import path from 'path';
import IHomework from '../types/homework';

const dirname = path.resolve();
const pathToJson = path.resolve(dirname, '../aws_config.json');
AWS.config.loadFromPath(pathToJson);
const ddb = new AWS.DynamoDB();
const TableName = 'BA-Homework';

const getHomeworks = async (
  channelID: string,
  startDate: string,
  endDate: string,
  classCode: string
): Promise<Array<IHomework>> => {
  const params = {
    TableName,
    ExpressionAttributeValues: {
      ':s': { S: startDate },
      ':e': { S: endDate },
      ':classCode': { S: classCode }
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
    const result = await ddb.query(params).promise();
    return result.Items as Array<IHomework>;
  } catch (error) {
    console.log(`Error retrieving homework: ${error}`);
    return error;
  }
};

const addHomework = async (messageID, studentID, channelID, timestamp, type, classCode): Promise<boolean> => {
  const params = {
    TableName,
    Item: {
      messageID: { S: messageID },
      studentID: { S: studentID },
      channelID: { S: channelID },
      timestamp: { S: timestamp },
      classCode: { S: classCode },
      type: { S: type }
    }
  };

  try {
    console.log(
      `Adding homework: messageID ${messageID}, studentID ${studentID}, channelID ${channelID}, timestamp ${timestamp}, type ${type}, classCode ${classCode}`
    );
    return new Promise((resolve) => {
      ddb.putItem(params, (err, data) => {
        if (err) {
          console.log(`Error adding homework: ${err}`);
          resolve(false);
        } else {
          console.log(`Successfully added homework: ${data}`);
          resolve(true);
        }
      });
    });
  } catch (error) {
    console.log(`Error adding homework: ${error}`);
    return error;
  }
};

const removeHomework = async (messageID: string, classCode: string) => {
  const params = {
    TableName,
    Key: {
      classCode: { S: classCode },
      messageID: { S: messageID }
    }
  };

  try {
    console.log(`Removing homework: messageID ${messageID}, classCode ${classCode}`);
    return new Promise((resolve) => {
      ddb.deleteItem(params, (err, data) => {
        if (err) {
          console.log(`Error removing homework: ${err}`);
          resolve(false);
        } else {
          console.log(`Successfully removed homework: ${data}`);
          resolve(true);
        }
      });
    });
  } catch (error) {
    console.log(`Error removing homework: ${error}`);
    return error;
  }
};

export { addHomework, getHomeworks, removeHomework };
