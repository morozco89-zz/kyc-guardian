import https from 'https';
import EventEmitter from 'events';
import { ENGINE_READ_SCOPE, ENGINE_WRITE_SCOPE, HTTP_CLIENT_TIMEOUT, HTTP_CLIENT_DEFAULT_MAX_RETRIES } from '../fixtures';
import objectPath from 'object-path';

export const hardCode = (request) => {
    const data = JSON.stringify(request.challengeData);
    const options = {
        hostname: ENGINE_WRITE_SCOPE,
        port: 443,
        timeout: HTTP_CLIENT_TIMEOUT,
        method: 'PUT',
        path: `/kyc-engine/v1/users/${request.userID}/hardcoded-challenges/${request.challengeName}/completed`,
        headers: {
            'X-Auth-Token': request.token,
            'x-caller-scopes': 'admin',
            'x-kyc-initiative-id': request.initiativeID,
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(data, 'utf8'),
        },
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            if (res.statusCode == 202) {
                resolve({
                    challenge: request.challengeName,
                    success: true,
                    statusCode: res.statusCode,
                });
                return;
            }

            reject({
                challenge: request.challengeName,
                success: false,
                statusCode: res.statusCode,
                request: data,
            });
        });
        req.on('timeout', () => {
            req.destroy();
            reject({
                challenge: request.challengeName,
                success: false,
                message: 'timeout',
                statusCode: null,
            });
        });
        req.on('error', error => {
            reject({
                challenge: request.challengeName,
                success: false,
                message: error.message,
            });
        });
        req.write(data);
        req.end();
    });
};

export const getUserChallenges = (request) => {
    const options = {
        hostname: ENGINE_READ_SCOPE,
        port: 443,
        timeout: HTTP_CLIENT_TIMEOUT,
        method: 'GET',
        path: `/kyc-engine/v1/users/${request.userID}/user-challenges`,
        headers: {
            'X-Auth-Token': request.token,
            'x-caller-scopes': 'admin',
            'x-kyc-initiative-id': request.initiativeID,
        },
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            if (res.statusCode < 200 || res.statusCode > 299) {
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
                    resolve(body);
                } catch(e) {
                    reject({
                        success: false,
                        statusCode: res.statusCode,
                        error: e,
                    });
                }
            });
        });
        req.on('timeout', () => {
            req.destroy();
            reject({
                success: false,
                message: 'timeout',
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
};

export const getDevelop = (request) => {
    const options = {
        hostname: ENGINE_READ_SCOPE,
        port: 443,
        timeout: HTTP_CLIENT_TIMEOUT,
        method: 'GET',
        path: `/kyc-engine/v1/develop/users/${request.userID}`,
        headers: {
            'X-Auth-Token': request.token,
            'x-caller-scopes': 'admin',
            'x-kyc-initiative-id': request.initiativeID,
        },
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            if (res.statusCode < 200 || res.statusCode > 299) {
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
                    resolve(body);
                } catch(e) {
                    reject({
                        success: false,
                        statusCode: res.statusCode,
                        error: e,
                    });
                }
            });
        });
        req.on('timeout', () => {
            req.destroy();
            reject({
                success: false,
                message: 'timeout',
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
};

export class EngineClient extends EventEmitter {

    constructor(sleepTime) {
        super();
        this.sleepTime = sleepTime;
        this.maxRetries = HTTP_CLIENT_DEFAULT_MAX_RETRIES;
    }

    async getDevelop(request) {
        await this.do('develop', getDevelop, request);
    }

    async getUserChallenges(request) {
        await this.do('get-user-challenges', getUserChallenges, request);
    }

    async isCompliant(request) {
        await this.do('is-compliant', getUserChallenges, request, (response) => {
            if (objectPath.get(response, 'status', '') === 'processing') {
                throw 'engine is processing'
            }
        });
    }

    async hardcode(request) {
        await this.do('hardcode', hardCode, request);
    }

    async do(namespace, fn, request, validator = () => {}) {
        for (let i = 0; i < this.maxRetries; i++) {
            try {
                const response = await fn(request);
                validator(response)
                if (i === 0) {
                    this.emit(`${namespace}.success`, {response, request});
                } else {
                    this.emit(`${namespace}.recovered`, {response, request});
                }
                return;
            } catch (e) {
                this.emit(`${namespace}.fail`, {attempt: i + 1, error: e, request});
                await this.sleep(this.sleepTime);
            }
        }

        this.emit(`${namespace}.exhausted`, {request});
    }

    sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

}
