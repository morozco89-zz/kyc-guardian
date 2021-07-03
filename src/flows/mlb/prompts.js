import inquirer from 'inquirer';
import { CLIENT_FURY_TOKEN, CLIENT_LDAP } from '../../fixtures';

export const promptMeta = (data) => {
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
        default: 'ted',
    });
    questions.push({
        name: 'reason',
        message: 'What is the reason?',
        default: 'Pedido de CA',
    });
    questions.push({
        name: 'comment',
        message: 'What is the comment?',
        default: 'Pedido de CA',
    });
    questions.push({
        name: 'only_user',
        message: 'Which user to hard code?',
    });
   
    return inquirer.prompt(questions)
        .then(answers => {
            data.meta = answers;
            return data;
        });
};

export const promptIV = (data) => {
    const questions = [];
    questions.push({
        name: 'hardcoded_proof_of_life',
        message: 'Enter path for proof of life document',
        default: `./pol.jpg`,
    });
    questions.push({
        name: 'hardcoded_doc_front',
        message: 'Enter path for document front image',
        default: `./front.jpg`,
    });
    questions.push({
        name: 'hardcoded_doc_back',
        message: 'Enter path for document back image',
        default: `./back.jpg`,
    });
    questions.push({
        name: 'user_company_partnership_deed',
        message: 'Enter path for partnership deed document',
        default: `./partnership.pdf`,
    });
    questions.push({
        name: 'user_company_authorized_with_power_of_attorney',
        message: 'Enter path for power of attorney document',
        default: `./awpoa.pdf`,
    });
   
    return inquirer.prompt(questions).then(answers => {
        data.iv = answers;
        return data;
    });
}

export const promptCSVPath = () => {
    const questions = [];

    questions.push({
        name: 'path',
        message: 'Enter csv path',
        default: './data.csv',
    });

    return inquirer.prompt(questions).then(o => o.path);
}
