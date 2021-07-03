import https from 'https';
import { createReadStream } from 'fs';
import FormData from 'form-data';
import { INTERNAL_API_ML, HTTP_CLIENT_TIMEOUT, HTTP_CLIENT_DEFAULT_MAX_RETRIES, IV_CLIENT_ID } from '../fixtures';
import EventEmitter from 'events';

export const getInformationSummary = (userID) => {
    const headers = {
        'x-client-id': IV_CLIENT_ID,
    };

    const options = {
        hostname: INTERNAL_API_ML,
        port: 443,
        timeout: HTTP_CLIENT_TIMEOUT,
        method: 'GET',
        path: `/internal/auth/identity/user/${userID}/information_summary`,
        headers: headers,
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            if (res.statusCode != 200) {
                return reject({
                    success: false,
                    statusCode: res.statusCode,
                });
            }

            let body = [];
            res.on('data', function(chunk) {
                body.push(chunk);
            });
            res.on('end', function() {
                try {
                    body = JSON.parse(Buffer.concat(body).toString());
                } catch(e) {
                    reject({
                        success: false,
                        statusCode: res.statusCode,
                        error: e,
                    });
                }
                resolve(body);
            });
        });
        req.on('timeout', (error) => {
            req.destroy();
            reject({
                success: false,
                message: error.message,
                statusCode: null,
            });
        });
        req.on('error', error => {
            reject({
                success: false,
                message: error.message,
            });
        });

        req.end();
    });
}

export const upload = (request) => {
    const readStream = createReadStream(request.path);
    const form = new FormData();
    form.append('files', readStream);

    const headers = {
        ...form.getHeaders(),
        'X-Caller-Scopes': 'admin',
        'X-Client-Id': 'curl',
        'cache-control': 'no-cache',
        'X-Api-Scope': 'read-uds',
    };

    const options = {
        hostname: INTERNAL_API_ML,
        port: 443,
        timeout: HTTP_CLIENT_TIMEOUT,
        method: 'POST',
        path: `/internal/auth/identity/user/${request.userID}/kyc_documentation/${request.challengeName}`,
        headers: headers,
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, res => { 
            res.on('data', () => {
                resolve({
                    challenge: request.challengeName,
                    success: true,
                });
            });
        });
        req.on('timeout', () => {
            req.destroy();
            reject({
                challenge: request.challengeName,
                success: false,
                message: 'timeout',
            });
        });
        req.on('error', error => {
            reject({
                challenge: request.challengeName,
                success: false,
                message: error.message,
            });
        });

        form.pipe(req);
    });
};

export class Uploader extends EventEmitter{

    constructor(sleepTime) {
        super();
        this.sleepTime = sleepTime;
        this.maxRetries = HTTP_CLIENT_DEFAULT_MAX_RETRIES;
    }

    async upload(request) {
        for (let i = 0; i < this.maxRetries; i++) {
            try {
                const response = await upload(request);
                if (i === 0) {
                    this.emit('success');
                } else {
                    this.emit('recovered');
                }
                return response;
            } catch (e) {
                this.emit('fail', {attempt: i + 1, error: e, challengeName: request.challengeName});
                await sleep(this.sleepTime);
            }
        }

        this.emit('exhausted');

        return {
            challenge: request.challengeName,
            success: false,
            message: 'exhausted upload attempts',
        }; 
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
