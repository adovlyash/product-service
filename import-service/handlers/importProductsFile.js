'use strict';
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
    region: 'us-east-1',
});

export const importProductsFile = async (event) => {
    console.log(
        '[Import Products File lambda] incoming request, event:',
        event,
    );

    const response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    };

    try {
        const fileName = event?.queryStringParameters?.name;
        const filePath = `uploaded/${fileName}`;

        const params = {
            Bucket: 'zooshop-import',
            Key: filePath,
            Expires: 60,
            ContentType: 'text/csv',
        };

        const signedUrl = await s3.getSignedUrlPromise('putObject', params);
        response.body = signedUrl;

        return response;
    } catch (err) {
        console.error('error', err);

        response.statusCode = 500;
        response.body = JSON.stringify({
            message: 'Internal error',
        });

        return response;
    }
};
