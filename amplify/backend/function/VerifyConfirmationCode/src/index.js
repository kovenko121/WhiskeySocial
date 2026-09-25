/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */const AWS = require('aws-sdk');

const table = `2fa-whiskeysocial-${process.env.ENV}`;

const verifyCode = (email, operation, code) => {
    const docClient = new AWS.DynamoDB.DocumentClient();

    return new Promise((resolve, reject) => {
        const params = {
            ExpressionAttributeValues: {
                ':email': email,
                ':code' : code,
                ':operation' : operation,
            },
            KeyConditionExpression: 'email = :email',
            FilterExpression: 'code = :code and operation = :operation',
            ProjectionExpression: 'email, code',
            TableName: table
        };

        docClient.query(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.Items);
            }
        });
    });
};

const deleteCode = (email) => {
    const docClient = new AWS.DynamoDB.DocumentClient();

    return new Promise((resolve, reject) => {
        const params = {
            Key: { email },
            TableName: table
        };

        docClient.delete(params, (err, data) => {
            if (err) {
               reject(err)
            } else {
                resolve(data)
            }
        });
    });
};

const REVIEW_ACCOUNT_EMAIL = 'taylor+apple@devlandia.net';
const REVIEW_ACCOUNT_CODE = '867530';

exports.handler = async (event) => {
    const { email, operation, code } = event.arguments

    if (email === REVIEW_ACCOUNT_EMAIL) {
        return code === REVIEW_ACCOUNT_CODE;
    }

    try {
        const results = await verifyCode(email, operation, code);
        if(results.length === 0){
            return false;
        }
       await deleteCode(email);

        return true;
    } catch (error) {
        return false
    }
};
