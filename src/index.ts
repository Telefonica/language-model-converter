/**
* @license
* Copyright 2016 Telefónica I+D
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import * as commander from 'commander';
import * as glob from 'glob';

import { LanguageModelParser, culture } from './parser';

const cli = commander
    .description('Convert language files defined to LUIS format')
    .usage('[options] <files>')
    .option('-c, --culture <culture>', 'Culture code this files belongs to (ex. "en-us")')
    .option('-n, --ner', 'Generate a model compatible with NER');

commander.on('--help', function () {
    console.log(`  Examples:

    Convert all files in 'models' and its subfolders, starting with 'en',
    setting the locale to en-us
      $ language-model-converter ./models/**/en*.yaml -c en-us
`);
});

commander.parse(process.argv);

cli.files = cli.args
    .map(pattern => glob.sync(pattern))
    .reduce((a, b) => a.concat(b), []);

if (cli.files.length === 0) {
    console.error(`No files found`);
    process.exit(1);
}

let parser = new LanguageModelParser();
try {
    parser.on('warning', (msg: string) => {
        console.error(`WARNING: ${msg}`);
    });
    parser.on('error', (msg: string) => {
        console.error(`ERROR: ${msg}`);
        process.exit(1);
    });

    let luisModel = parser.parse(cli.files, cli.culture as culture, cli.ner);
    console.log(JSON.stringify(luisModel, null, 2));
} catch (err) {
    console.error(err);
    process.exit(1);
}
