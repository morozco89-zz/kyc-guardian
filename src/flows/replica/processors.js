import chalk from 'chalk';
import { hardCodeChallenge, isCompliant, putUserChallenge, putBackofficeChallenge } from './services';

export const log = (data) => {
    console.log(data);
    return data;
};

/**
 * Puts all context.hardcodes for all context.user_ids. Example context:
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
 * @return {Object}
 */
export const processHardcodeChallenges = async (context) => {
    for (const userID of context.user_ids) {
        console.log(chalk.bold(`\nPutting hardcode challenges for user ${userID}\n`));
        for (const challengeName in context.hardcodes) {
            try {
                await hardCodeChallenge(context, userID, challengeName, context.hardcodes[challengeName]);
            } catch (e) {
                console.log(`\t%s\t${e}`, chalk.red.bold('ERROR'));
                console.log(JSON.stringify(context.hardcodes[challengeName]));
            }
        }
    }
    return context;
};

/**
 * Puts all context.userChallenges for all context.user_ids. Example context:
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
 * @return {Object}
 */
export const processUserChallenges = async (context) => {
    for (const userID of context.user_ids) {
        console.log(chalk.bold(`\nPutting user challenges for user ${userID}\n`));
        for (const challengeName in context.userChallenges) {
            try {
                await putUserChallenge(context, userID, challengeName, context.userChallenges[challengeName]);
            } catch (e) {
                console.log(`\t%s\t${e}`, chalk.red.bold('ERROR'));
                console.log(JSON.stringify(context.userChallenges[challengeName]));
            }
        }
    }
    return context;
};

/**
 * Puts all context.backofficeChallenges for all context.user_ids. Example context:
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
 * @return {Object}
 */
export const processBackofficeChallenges = async (context) => {
    for (const userID of context.user_ids) {
        console.log(chalk.bold(`\nPutting backoffice challenges for user ${userID}\n`));
        for (const challengeName in context.backofficeChallenges) {
            const challengeRequest = {...context.backofficeChallenges[challengeName]};
            challengeRequest.user_id = userID;
            try {
                await putBackofficeChallenge(context, userID, challengeName, challengeRequest);
            } catch (e) {
                console.log(`\t%s\t${e}`, chalk.red.bold('ERROR'));
                console.log(JSON.stringify(challengeRequest));
            }
        }
    }
    return context;
};

/**
 * Checks compliance status for all users in context.user_ids list. Example context:
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
 * @return {Object}
 */
export const validateCompliance = async (context) => {
    for (const userID of context.user_ids) {
        console.log(chalk.bold(`\nChecking compliance status for user ${userID} on initiative ${context.initiative}\n`));
        try {
            await isCompliant(context, userID);
        } catch (e) {
            console.log(`\t%s\t${e}`, chalk.red.bold('ERROR'));
        }
    }
    return context;
};
