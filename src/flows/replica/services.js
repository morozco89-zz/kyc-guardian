import chalk from 'chalk';
import objectPath from 'object-path';
import { EngineClient } from '../../clients/engine';
import { HTTP_ENGINE_SLEEP_TIME_BEFORE_RETRY } from '../../fixtures';

/**
 * Fetch /kyc-engine/v1/develop/users/{runner_user_id} endpoint
 * 
 * Example context:
 * {
 *      token: 'abc',
 *      ldap: 'micortes',
 *      initiative: 'ted',
 *      reason: 'Pedido de réplica shield',
 *      comment: 'Pedido de réplica shield',
 *      runner_user_id: 12345,
 *      user_ids: [ 111, 222, 333, 444 ]
 * }
 * @param {Object} context Context
 */
export const fetchChunks = (context) => {
    const engineClient = new EngineClient(HTTP_ENGINE_SLEEP_TIME_BEFORE_RETRY);
    const promise = new Promise((resolve, reject) => {
        engineClient.on('develop.success', ({response}) => {
            context.develop = response;
            resolve(context)
        });
        engineClient.on('develop.recovered', ({response}) => {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            context.develop = response;
            resolve(context)
        });
        engineClient.on('develop.fail', ({attempt}) => {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(`Error fetching chunks for user ${context.runner_user_id}. Attempt ${attempt} of ${engineClient.maxRetries}`);
        });
        engineClient.on('develop.exhausted', () => {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            reject('exhausted fetching chunks attempts');
        });
    });
    
    engineClient.getDevelop({
        userID: context.runner_user_id,
        token: context.token,
        initiativeID: context.initiative,
    });

    return promise;
};

/**
 * Hardcode challengeName for userID with challengeData
 * 
 * Example context:
 * {
 *      token: 'abc',
 *      ldap: 'micortes',
 *      initiative: 'ted',
 *      reason: 'Pedido de réplica shield',
 *      comment: 'Pedido de réplica shield',
 *      runner_user_id: 12345,
 *      user_ids: [ 111, 222, 333, 444 ]
 * }
 * @param {Object} context Context
 * @param {Integer} userID User id
 * @param {String} challengeName Challenge name
 * @param {Object} challengeData Challenge data
 */
export const hardCodeChallenge = (context, userID, challengeName, challengeData) => {
    const engineClient = new EngineClient(HTTP_ENGINE_SLEEP_TIME_BEFORE_RETRY);
    const promise = new Promise((resolve, reject) => {
        engineClient.on('hardcode.success', () => {
            console.log(`\t%s\t${challengeName}`, chalk.green.bold('DONE'));
            resolve(context);
        });
        engineClient.on('hardcode.recovered', () => {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            console.log(`\t%s\t${challengeName}`, chalk.green.bold('DONE'));
            resolve(context);
        });
        engineClient.on('hardcode.fail', ({attempt}) => {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(`Error hardcoding ${challengeName} for user ${userID}. Attempt ${attempt} of ${engineClient.maxRetries}`);
        });
        engineClient.on('hardcode.exhausted', () => {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            reject(`exhausted ${challengeName} attempts`);
        });
    });
    const request = {
        initiativeID: context.initiative,
        token: context.token,
        userID,
        challengeName,
        challengeData,
    };

    engineClient.hardcode(request);

    return promise;
};

/**
 * Check if userID is compliant for context.initiative
 * 
 * Example context:
 * {
 *      token: 'abc',
 *      ldap: 'micortes',
 *      initiative: 'ted',
 *      reason: 'Pedido de réplica shield',
 *      comment: 'Pedido de réplica shield',
 *      runner_user_id: 12345,
 *      user_ids: [ 111, 222, 333, 444 ],
 *      develop: {Object},
 *      hardcodes: {Object},
 *      userChallenges: {Object}
 * }
 * @param {Object} context Context
 * @param {Integer} userID User id
 */
export const isCompliant = (context, userID) => {
    const engineClient = new EngineClient(HTTP_ENGINE_SLEEP_TIME_BEFORE_RETRY);
    const promise = new Promise((resolve, reject) => {
        engineClient.on('is-compliant.success', ({request, response}) => {
            assertComplianceStatus(response, request);
            resolve(context);
        });
        engineClient.on('is-compliant.recovered', ({request, response}) => {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            assertComplianceStatus(response, request);
            resolve(context);
        });
        engineClient.on('is-compliant.fail', ({attempt, error}) => {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(`Error checking compliance status for user ${userID}. Error: ${error}.Attempt ${attempt} of ${engineClient.maxRetries}`);
        });
        engineClient.on('is-compliant.exhausted', () => {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            reject(`exhausted attempts checking compliant status for user ${userID}`);
        });
    });
    const request = {
        userID,
        token: context.token,
        initiativeID: context.initiative,
    };

    engineClient.isCompliant(request);

    return promise;
};

const assertComplianceStatus = (response, request) => {
    const complianceStatus = objectPath.get(response, 'is_initiative_compliant', false);

    if (complianceStatus) {
        console.log(`\n\t%s\t${request.userID}`, chalk.green.bold('COMPLIANT'));
        return;
    }

    console.log(`\n\t%s\t${request.userID}`, chalk.red.bold('NO COMPLIANT'));
    
    if (!response.challenges) {
        return;
    }

    response.challenges.forEach(c => {
        console.log(`\t\t- Pending %s`, chalk.bold(c.name));
    });
};

