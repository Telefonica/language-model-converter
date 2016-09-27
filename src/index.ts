import * as commander from 'commander';
import * as path from 'path';
import * as glob from 'glob';


import { LanguageModelParser } from './parser';

interface InterfaceCLI extends commander.ICommand {
    culture?: string;
    files?: string[];
}

const cli: InterfaceCLI = commander
    .description('Convert language files defined to LUIS format')
    .usage('[options] <files>')
    .option('-c, --culture <culture>', 'Culture code this files belongs to (ex. "en-us")');

commander.on('--help', function(){
    console.log(`  Examples:
  
    Convert all files in 'models' and its subfolders, starting with 'en',
    setting the locale to en-us
      $ language-model-converter ./models/**/en*.yaml -c en-us
`);
});

commander.parse(process.argv);

cli.files = cli.args
    .map(pattern => glob.sync(pattern))
    .reduce((a, b) => a.concat(b), []) ;

let parser = new LanguageModelParser();
let luisModel = parser.parse(cli.files, cli.culture);

console.log(JSON.stringify(luisModel, null, 2));
