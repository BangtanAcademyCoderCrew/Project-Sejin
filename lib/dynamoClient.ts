import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import config from '../aws_config.json';

export const ddbClient = new DynamoDBClient({
    region: config.region,
    credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
    }
});
