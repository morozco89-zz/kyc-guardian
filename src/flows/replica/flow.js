import { prompt, promptConfirmation } from './prompt';
import { fetchChunks } from './services';
import { buildHardcodes, log, putHardcodes, buildUserChallenges, validateCompliance } from './processors';

export const shieldReplica = () => {
    prompt()
        .then(log)
        .then(promptConfirmation)
        .then(fetchChunks)
        .then(buildHardcodes)
        .then(buildUserChallenges)
        .then(putHardcodes)
        .then(validateCompliance)
        .catch(console.log);
};
