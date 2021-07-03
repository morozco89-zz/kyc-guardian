import inquirer from "inquirer";
import { CLIENT_FURY_TOKEN, CLIENT_LDAP } from '../../fixtures';

export const prompt = () => {
    const questions = [];
    questions.push({
        name: 'token',
        message: 'Enter your fury token',
        default: CLIENT_FURY_TOKEN,
    });
    questions.push({
        name: 'ldap',
        message: 'Enter your ldap user',
        default: CLIENT_LDAP,
    });
    questions.push({
        name: 'initiative',
        message: 'What is the initiative?',
        default: 'cx-support',
    });
    questions.push({
        name: 'reason',
        message: 'What is the reason?',
        default: 'Pedido de réplica shield',
    });
    questions.push({
        name: 'comment',
        message: 'What is the comment?',
        default: 'Pedido de réplica shield',
    });
    questions.push({
        name: 'runner_user_id',
        message: 'Enter validated user',
        filter: parseInt,
    });
    questions.push({
        name: 'user_ids',
        message: 'Enter comma separated list of users to replicate',
        filter: raw => raw.split(',').map(i => parseInt(i)),
    });

    return inquirer.prompt(questions);
};

export const promptConfirmation = (data) => {
    const questions = [];
    questions.push({
        name: 'confirmation',
        type: 'confirm',
        message: 'Do you want to proceed?',
    });

    return inquirer.prompt(questions).then(answers => {
        if (!answers.confirmation) throw 'Good bye!';
        return data;
    });
};
