import * as commander from 'commander';
import * as path from 'path';

import { LanguageModelParser } from './parser';

interface InterfaceCLI extends commander.ICommand {
    path?: string;
    culture?: string;
}

const cli: InterfaceCLI = commander.option('-p, --path <path>', 'Path to the folder containing language models')
                                   .option('-c, --culture <culture>', 'Culture code (ex. "en-us")')
                                   .parse(process.argv);

let parser = new LanguageModelParser();
let luisModel = parser.parse(cli.path, cli.culture);

console.log(JSON.stringify(luisModel, null, 2));
