// import arg from 'arg';
import { chooseFlow } from './flows/flows';

function parseArguments(rawArgs) {
    /*
    const args = arg(
        {
            '--file': String,
            '-f': '--file',
        },
        {
            argv: rawArgs.slice(2),
        }
    );
    return {
        file: args['--file'] || null,
    };
    */
}

export function cli(args) {
    // const options = parseArguments(args);
    console.clear();
    chooseFlow();
}
