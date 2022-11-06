'use strict';
import AWS from 'aws-sdk';

import { getDBClient } from '../utils/db-client';
import { validateProduct } from '../utils/validator';

const toNumber = (value) => value ? Number(value) : 0;

export const catalogBatchProcess = async (event) => {
    console.log('[Catalog Batch Process lambda] incoming request, event:', event);

    let client;
    const response = {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    };

    try {
        client = await getDBClient();

        const sns = new AWS.SNS({
            region: 'us-east-1',
        });
        const products = [];

        await Promise.all(event.Records.map(async ({ body }) => {
            const parsedProduct = JSON.parse(body);
            const newProduct = {
                ...parsedProduct,
                price: toNumber(parsedProduct.price),
                count: toNumber(parsedProduct.count),
            };
            products.push(newProduct);
            console.log('[PRODUCT TO SAVE]', newProduct);

            try {
                await validateProduct(newProduct);
            } catch ({ errors }) {
                console.error('[VALIDATION]', JSON.stringify(errors));
                return;
            }
    
            try {
                const query = `
                    insert into products (title, description, price, image) values
                    ('${newProduct.title}', '${newProduct.description}', ${newProduct.price}, '${newProduct.image}')
                    returning id;
                `;
                const { rows } = await client.query(query);
                await client.query(`
                    insert into stocks (product_id, count) values
                    ('${rows[0].id}', ${newProduct.count});
                `);
            } catch (err) {
                console.error('[DB insert]', err);
            }
        }));

        sns.publish({
            Subject: 'Products list was updated',
            Message: JSON.stringify(products),
            TopicArn: process.env.SNS_ARN,
        }, (err, data) => {
            if (err) {
              console.log("Error while sending email:", err);
            } else {
              console.log("Email was sent for:", JSON.stringify(products));
            }
        });
    } catch (err) {
        console.error('error', err);

        response.statusCode = 500;
        response.body = JSON.stringify({
            message: 'Internal error',
        });
        
        return response;
    } finally {
        if (client) client.end();
    }

    response.body = JSON.stringify(
        {
            message: 'Batch processed',
        },
        null,
        2,
    );

    return response;
};
