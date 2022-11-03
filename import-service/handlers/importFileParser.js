'use strict';
import AWS from 'aws-sdk';
import csv from 'csv-parser';

const BUCKET = 'zooshop-import';

export const importFileParser = async (event) => {
    console.log('[Import File Parser lambda] incoming request, event:', event);

    const response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    };

    try {
        const s3 = new AWS.S3({
            region: 'us-east-1',
        });

        for (const record of event.Records) {
            const s3Stream = s3
                .getObject({
                    Bucket: BUCKET,
                    Key: record.s3.object.key,
                })
                .createReadStream();

            await new Promise((resolve, reject) => {
                s3Stream
                    .pipe(csv())
                    .on('data', (data) => {
                        console.log(
                            '[Import File Parser lambda] csv data row:',
                            data,
                        );
                    })
                    .on('error', (error) => {
                        reject(error);
                    })
                    .on('end', () => {
                        resolve();
                    });
            });

            await s3
                .copyObject({
                    Bucket: BUCKET,
                    CopySource: `${BUCKET}/${record.s3.object.key}`,
                    Key: record.s3.object.key.replace('uploaded', 'parsed'),
                })
                .promise();

            await s3
                .deleteObject({
                    Bucket: BUCKET,
                    Key: record.s3.object.key,
                })
                .promise();
        }

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
