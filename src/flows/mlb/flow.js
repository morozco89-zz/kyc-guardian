import chalk from 'chalk';

import parseCSV from '../../csv/parser';
import { adapt } from './adapter';
import { promptCSVPath, promptMeta, promptIV } from './prompts';
import { flatData, filterEmptyUsers, filterUsers, join } from './filters';
import {
    uploadDocFront,
    uploadProofOfLife,
    uploadDocBack,
    uploadAWPOA,
    uploadPartnershipDeed,
    getIVURLs,
    putChallenges,
    isCompliant
} from './services';

export const mlb = () => {
    promptCSVPath()
        .then(parseCSV)
        .then(adapt)
        .then(promptMeta)
        .then(flatData)
        .then(filterEmptyUsers)
        .then(filterUsers)
        .then(process)
        .then(checkCompliance)
        .catch(e => {
            console.log(e);
        });
};

const process = async (runner) => {
    let currentUserID;
    let iv = {};

    for (let row of runner.data) {
        row = join(row, runner.meta);

        if (row.meta.main_user !== currentUserID) {
            currentUserID = row.meta.main_user;
            console.log(chalk.bold(`\nComplete IV information`))
            row = await promptIV(row);
            iv = row.iv;
        } else {
            row.iv = iv;
        }

        console.log(chalk.bold(`\nUploading documentation for user ${row.meta.user_id}`))
        
        await uploadProofOfLife(row);
        await uploadDocFront(row);
        await uploadDocBack(row);
        await uploadAWPOA(row);
        await uploadPartnershipDeed(row);

        const urls = await getIVURLs(row.meta.user_id)

        if (urls != null) {
            row.challenges.hardcoded_documentation = {
                doc_front_url: urls.doc_front,
                doc_back_url: urls.doc_back,
            };
            row.challenges.hardcoded_proof_of_life = {
                selfie_url: urls.pol,
            };
        }

        await putChallenges(row);
    }

    return runner;
};

const checkCompliance = async(runner) => {
    console.log(chalk.bold(`\nChecking compliance status`));
    for (let row of runner.data) {
        row = join(row, runner.meta);
        await isCompliant(row)
    }
};
