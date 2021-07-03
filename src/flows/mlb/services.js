import chalk from 'chalk';
import objectPath from 'object-path';
import { EngineClient } from '../../clients/engine';
import { Uploader, getInformationSummary } from '../../clients/iv';
import { HTTP_ENGINE_SLEEP_TIME_BEFORE_NEXT_REQUEST, HTTP_ENGINE_SLEEP_TIME_BEFORE_RETRY } from '../../fixtures';

export const putChallenges = async (data) => {
    const client = new EngineClient(HTTP_ENGINE_SLEEP_TIME_BEFORE_RETRY);
    const requests = Object.keys(data.challenges).map(challengeName => buildRequest(challengeName, data));

    client.on('hardcode.success', ({request}) => {
        console.log(`\t%s\t${request.challengeName}`, chalk.green.bold('DONE'));
    });
    client.on('hardcode.recovered', ({request}) => {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        console.log(`\t%s\t${request.challengeName}`, chalk.green.bold('DONE'));
    });
    client.on('hardcode.fail', ({attempt, request}) => {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`Error attempting '${request.challengeName}'. Attempt ${attempt} of ${client.maxRetries}`);
    });
    client.on('hardcode.exhausted', ({request}) => {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        console.log(`\t%s\t${request.challengeName}`, chalk.red.bold('ERROR'));
        console.log(JSON.stringify(request.challengeData));
    });

    console.log(chalk.bold(`\nHardcoding challenges for user ${data.meta.user_id}`));

    for (let j = 0; j < requests.length; j++) {
        const request = requests[j];
       
        await client.hardcode(request);
        await sleep(HTTP_ENGINE_SLEEP_TIME_BEFORE_NEXT_REQUEST);
    }
};

export const isCompliant = (data) => {
    const client = new EngineClient(HTTP_ENGINE_SLEEP_TIME_BEFORE_RETRY);
    const promise = new Promise((resolve) => {
        client.on('is-compliant.success', ({response, request}) => {
            assertComplianceStatus(response, request);
            resolve(data);
        });
        client.on('is-compliant.recovered', ({response, request}) => {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);

            assertComplianceStatus(response, request);
            resolve(data);
        });
        client.on('is-compliant.fail', ({attempt}) => {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(`Error checking compliance status. Attempt ${attempt} of ${client.maxRetries}`);
        });
        client.on('is-compliant.exhausted', ({request}) => {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            console.log(`\t%s\tchecking compliance level for user ${request.userID}`, chalk.red.bold('ERROR'));
            resolve(data);
        });
    });

    client.isCompliant({
        userID: data.meta.user_id,
        token: data.meta.token,
        initiativeID: data.meta.initiative,
    });

    return promise;
};

export const uploadProofOfLife = async (data) => {
    return uploadIV(data, 'hardcoded_proof_of_life');
};

export const uploadDocFront = async (data) => {
    return uploadIV(data, 'hardcoded_doc_front');
};

export const uploadDocBack = async (data) => {
    return uploadIV(data, 'hardcoded_doc_back');
};

export const uploadPartnershipDeed = async (data) => {
    return uploadIV(data, 'user_company_partnership_deed');
};

export const uploadAWPOA = async (data) => {
    return uploadIV(data, 'user_company_authorized_with_power_of_attorney');
};

export const getIVURLs = async (userID) => {
    try {
        const response = await getInformationSummary(userID);
        const doc_front = objectPath.get(response, 'challenges.kyc_documentation.hardcoded_doc_front.files.0.file', '');
        const doc_back = objectPath.get(response, 'challenges.kyc_documentation.hardcoded_doc_back.files.0.file', '');
        const pol = objectPath.get(response, 'challenges.kyc_documentation.hardcoded_proof_of_life.files.0.file', '');
        return {pol, doc_front, doc_back};
    } catch (e) {
        console.log(e);
    }
    return null;
};

const uploadIV = async (data, challengeName) => {
    if (data.iv[challengeName] === 'skip') {
        return;
    }

    const uploader = new Uploader(200);
    uploader.on('recovered', () => {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
    });
    uploader.on('exhausted', () => {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
    });
    uploader.on('fail', ({attempt, challengeName}) => {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`Error uploading '${challengeName}'. Attempt ${attempt} of ${uploader.maxRetries}`);
    });

    const response = await uploader.upload({
        userID: data.meta.user_id,
        path: data.iv[challengeName],
        challengeName: challengeName,
    });

    console.log(`\t%s\t${challengeName}`, response.success ? chalk.green.bold('DONE') : chalk.red.bold('ERROR'));
};

const buildRequest = (challengeName, data) => {
    return {
        challengeData: {
            ...data.challenges[challengeName],
            caller_id: data.meta.ldap,
            reason: data.meta.reason,
            comment: data.meta.comment,
        },
        userID: data.meta.user_id,
        token: data.meta.token,
        initiativeID: data.meta.initiative,
        challengeName,
    };
};

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

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
