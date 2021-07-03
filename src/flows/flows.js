import inquirer from 'inquirer';
import { mlb } from './mlb/flow';
import { shieldReplica } from './replica/flow';

const flows = [
    // 'hardcode',
    // 'IV',
    'CA - MLB',
    'Shield - Replica',
];

export const chooseFlow = () => {
    const questions = [];
    questions.push({
        name: 'flow',
        type: 'list',
        message: 'What would you like to do?',
        choices: flows,
    });
   
    return inquirer.prompt(questions).then(execute);
};

const execute = (options) => {
    switch (options.flow) {
        case 'CA - MLB':
            mlb();
            break;
        case 'Shield - Replica':
            shieldReplica();
            break;
        default:
            console.log('Flow not supported');
            break;
    }
};
