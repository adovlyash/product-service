'use strict';
import { generatePolicy } from '../utils/policy';

export const basicAuthorizer = async (event, context, callback) => {
    console.log('[Basic Authorizer lambda] incoming request, event:', event);

    try {
        const authToken = event.headers.authorization;

        const encodedCreds = authToken.split(' ')[1];
        const buff = Buffer.from(encodedCreds, 'base64');
        const decodedCreds = buff.toString('utf-8').split(':');

        const userName = decodedCreds[0];
        const password = decodedCreds[1];

        console.log(`[Basic Authorizer lambda] userName: ${userName}, password: ${password}`);

        const storedUserPassword = process.env[userName];
        const effect = !storedUserPassword || storedUserPassword !== password ? 'Deny' : 'Allow';
;
        const policy = generatePolicy(encodedCreds, event.routeArn, effect);

        callback(null, policy);
    } catch (err) {
        callback('Unauthorized');
    }
};
