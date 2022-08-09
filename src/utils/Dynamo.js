const AWS = require('aws-sdk');
const awsCreds = require('../../creds/aws.json');

AWS.config.update({
    region: awsCreds.credentials.region,
    accessKeyId: awsCreds.credentials.accessKeyId,
    secretAccessKey: awsCreds.credentials.secretAccessKey
  });

const docClient = new AWS.DynamoDB.DocumentClient({
    region: awsCreds.credentials.region
});

async function query(tableName, key, keyValue) {
    const result = await (docClient.query({
        TableName: tableName,
        KeyConditionExpression: `${key} = :hkey`,
        ExpressionAttributeValues: {
          ':hkey': keyValue,
        }
      }).promise());

      return result.Items;
}

async function scan(tableName) {
  const result = await (docClient.scan({
      TableName: tableName,
    }).promise());

    return result.Items[0];
}

async function add(tableName, name, boolValue) {
  const result = await (docClient.put({
      TableName: tableName,
      Item: {
        streamerName: name, 
        online: boolValue
      }
    }).promise());
}

module.exports = {
    query,
    scan,
    add,
}