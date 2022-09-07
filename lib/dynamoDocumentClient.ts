import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { ddbClient } from './dynamoClient';

const marshallOptions = {
    convertEmptyValues: false,
    removeUndefinedValues: false,
    convertClassInstanceToMap: false
};

const unmarshallOptions = {
    wrapNumbers: false
};

const translateConfig = { marshallOptions, unmarshallOptions };

const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, translateConfig);

export { ddbDocClient };
