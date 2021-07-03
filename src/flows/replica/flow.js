import { prompt, promptConfirmation } from './prompt';
import { fetchChunks } from './services';
import { buildHardcodes, buildUserChallenges, buildBackofficeChallenges } from './builders';
import { log, processHardcodeChallenges, processUserChallenges, processBackofficeChallenges, validateCompliance } from './processors';

export const shieldReplica = () => {
    prompt()
        .then(log)
        .then(promptConfirmation)
        .then(fetchChunks)
        .then(buildHardcodes)
        .then(buildUserChallenges)
        .then(buildBackofficeChallenges)
        .then(processHardcodeChallenges)
        .then(processUserChallenges)
        .then(processBackofficeChallenges)
        .then(validateCompliance)
        .catch(log);
};
