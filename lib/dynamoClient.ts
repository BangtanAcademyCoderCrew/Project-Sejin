import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import config from '../aws_config.json';

export const ddbClient = new DynamoDBClient({ region: config.REGION });
