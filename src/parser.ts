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

import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as _ from 'lodash';
import { EventEmitter } from 'events';

import { Luis } from './luis-model';

interface Token {
    token: string;
    startChar: number;
    endChar: number;
}

const MIN_EXAMPLES_PER_INTENT = 3;

export type culture = 'en-us' | 'es-es';

export class LanguageModelParser extends EventEmitter {
    private doc: any = {};
    public culture: culture;

    parse(files: string[], culture: culture): Luis.Model {
        files.forEach(file => {
            // XXX Conflicting keys not supported. Multiple files could be merged together.
            try {
                let yamlFileContents = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
                // Look for repeated elements in lists for each file and warn about it.
                // Note that when merging, new duplicates could appear but those will be
                // silently removed. The goal is to only warn at a file level.
                this.warnAboutDuplicates(yamlFileContents);

                mergeDeep(this.doc, yamlFileContents);
            } catch (err) {
                let e = `File "${file}": ${err.message}`;
                this.emitError(e);
            }
        });

        this.culture = culture;

        let luisModel: Luis.Model = {
            luis_schema_version: '1.3.0',
            name: 'tef',
            desc: 'Bot Model ' + new Date(),
            culture: culture,
            intents: [],
            entities: [],
            composites: [],
            bing_entities: [],
            actions: [],
            model_features: [],
            regex_features: [],
            utterances: []
        };

        let keys = Object.keys(this.doc);

        let replacements = new Map<string, string[]>();
        keys.filter(listKey => listKey.startsWith('list.'))
            .forEach(listKey => {
                replacements.set(
                    listKey.slice('list.${'.length, -1),
                    this.doc[listKey]
                );
            });

        let usedReplacements = new Set<string>();
        let missedReplacements = new Set<string>();
        let entitiesMap = new Map<string, Luis.Entity>();
        let utterancesMap = new Map<string, Luis.Utterance>();

        let intentNames = this.doc.intents ?
            Object.keys(this.doc.intents)
                .map(intentName => {
                    if (intentName.length > 50) {
                        let err = `Intent "${intentName}" should be less than 50 characters. was ${intentName.length}`;
                        this.emitError(err);
                    }
                    return intentName;
                }) :
            [];

        intentNames.forEach(intent => {
            let sentences = this.doc.intents[intent];

            sentences
                .map((sentence: string) => {
                    let match = sentence.match(/\w+\[.*\]/);
                    if (match) {
                        let err = `White space missing before entity declaration in entry "${sentence}" -> "${match[0]}"`;
                        this.emitError(err);
                    }
                    return sentence;
                })
                .map((sentence: string) => this.searchMissedVariables(sentence, replacements, missedReplacements))
                .map((sentence: string) => this.expandVariables(sentence, replacements, usedReplacements))
                .reduce((a: string[], b: string[]) => a.concat(b)) // flatten arrays
                .forEach((sentence: string) => {
                    let utterance = this.buildUtterance(sentence, intent);
                    utterance.entities.forEach(entity => this.registerEntity(entity, entitiesMap));
                    if (utterancesMap.has(utterance.text)) {
                        let err = `Utterance "${utterance.text}" is assigned to ` +
                            `both "${utterancesMap.get(utterance.text).intent}" and "${utterance.intent}" intents`;
                        this.emitError(err);
                    }
                    utterancesMap.set(utterance.text, utterance);
                });
        });

        let utterances = Array.from(utterancesMap.values());

        // Look for intents with too many examples
        let examplesPerIntent = _.countBy(utterances, 'intent');
        let intentsWithTooManyExamples = _.pickBy(examplesPerIntent, (counter: number) => counter < MIN_EXAMPLES_PER_INTENT);
        if (!_.isEmpty(intentsWithTooManyExamples)) {
            let err = `The following intents have less than ${MIN_EXAMPLES_PER_INTENT} examples:\n` +
                _.keys(intentsWithTooManyExamples).map(intent => `  - ${intent}`).join('\n');
            this.emitError(err);
        }

        // Print warnings about unused lists
        if (usedReplacements.size < replacements.size) {
            replacements.forEach((values, key) => {
                if (!usedReplacements.has(key)) {
                    this.emitWarning(`The list "list.$\{${key}\}" has not been used in any sentence.`);
                }
            });
        }

        // Print warnings about sentences with list placeholders that points to an non-existent list
        if (missedReplacements.size > 0) {
            missedReplacements.forEach(value => {
                this.emitWarning(`The list "list.$\{${value}\}" is being used from some sentences but it has not been declared.`);
            });
        }

        let features = _.toPairs(this.doc.phraselist)
            .map((value: any) => {
                let name = String(value[0]);
                let activated = value[1].activated == null ? true : value[1].activated;
                let mode = value[1].mode == null ? true : value[1].mode;
                let words = (value[1].words || [])
                    .map((word: any) => {
                        let strword = String(word);
                        if (strword.indexOf(',') !== -1) {
                            let err = `Phrase list "${name}" can not contain commas ('${strword}')`;
                            this.emitError(err);
                        }
                        return LanguageModelParser.tokenize(strword).join(' ');
                    })
                    .join(',');

                return {
                    activated,
                    mode,
                    name,
                    words
                } as Luis.ModelFeature;
            });

        let bingEntities = this.doc.builtin || [];

        luisModel.utterances = utterances;
        luisModel.entities = Array.from(entitiesMap.values());
        luisModel.intents = intentNames.map(intent => <Luis.Intent>{ name: intent });
        luisModel.model_features = features;
        luisModel.bing_entities = bingEntities;

        return luisModel;
    }

    private searchMissedVariables(sentence: string, variables: Map<string, string[]>, missedVariables: Set<string>): string {
        let match = sentence.match(/\${(.+?)}/);
        if (match) {
            for (let i = 1; i < match.length; i++) {
                if (!variables.has(match[i])) {
                    missedVariables.add(match[i]);
                }
            }
        }
        return sentence;
    }
    private expandVariables(sentence: string, variables: Map<string, string[]>, usedVariables: Set<string>): string[] {
        let expandedSentences = new Set([sentence]);
        expandedSentences.forEach(sentence => {
            variables.forEach((values, key) => {
                values.forEach(value => {
                    let search = '${' + key + '}';
                    if (sentence.indexOf(search) !== -1) {
                        usedVariables.add(key);
                        let newSentence = sentence.replace(search, value);
                        if (newSentence !== sentence) {
                            expandedSentences.add(newSentence);
                            expandedSentences.delete(sentence);
                        } else {
                            expandedSentences.add(sentence);
                        }
                    }
                });
            });
        });

        return Array.from(expandedSentences);
    }

    private extractEntities(sentence: string): any[] {
        let regexEntity = /\[(.+?):(.+?)\]/g; // entities are tagged as [entityValue:entityType], ex. [Burgos:city]

        let entities: any[] = [];
        let match: RegExpExecArray;

        while (match = regexEntity.exec(sentence)) {
            let entityValue = match[1];
            let entityType = match[2];

            entities.push({
                entityValue,
                entityType
            });
        }

        return entities;
    }

    private registerEntity(entity: any, entitiesMap: Map<string, Luis.Entity>): void {
        let entityType: string = entity.entity;
        let entitySubtype: string;

        let composedEntitySeparatorPosition = entityType.indexOf('::');
        if (composedEntitySeparatorPosition !== -1) {
            entitySubtype = entityType.substring(composedEntitySeparatorPosition + '::'.length);
            entityType = entityType.substring(0, composedEntitySeparatorPosition);
        }

        let luisEntity = entitiesMap.get(entityType);
        luisEntity = luisEntity || { name: entityType };

        if (entitySubtype) {
            luisEntity.children = luisEntity.children || [];
            if (luisEntity.children.indexOf(entitySubtype) === -1) {
                luisEntity.children.push(entitySubtype);
            }
        }

        entitiesMap.set(entityType, luisEntity);
    }

    private normalizeSentence(sentence: string): string {
        let normalized = sentence
            // replace multiple spaces with a single one
            .replace(/\s\s+/g, ' ')
            .trim();

        switch (this.culture) {
            case 'en-us':
                // in an en-us luis app, nothing but ASCII 7 chars are lowercased
                // see test/fixtures/{en-es}-cornercases.yaml
                normalized = normalized.replace(/[A-Z]/g, capture => capture.toLowerCase());
                break;
            default:
                normalized = normalized.toLocaleLowerCase();
        }

        return normalized;
    }

    private static wordCount(sentence: string): number {
        return LanguageModelParser.tokenize(sentence).length;
    }

    /**
     * Tokenize a sentence following the LUIS rules returning the tokens and delimiters.
     * TODO: Memoize this function.
     */
    private static splitSentenceByTokens(sentence: string): Token[] {
        if (!sentence || sentence.trim().length === 0) {
            return [];
        }
        sentence = sentence.replace(/[\s\uFEFF\xA0]+$/g, '');  // Right trim

        // The following is a RegExp that contains the UTF-8 characters (http://www.utf8-chartable.de/unicode-utf8-table.pl)
        // that are understood by LUIS as part of a word. Chars not included here
        // are considered as separated words by LUIS and so as independent tokens
        const WORD_CHARS =
            '0-9A-Za-z' +  // Numbers and English letters
            'ªº' +  // Ordinal indicators
            '\u00B5' +  // Micro sign
            '\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02AF' +  // Non-english latin letters (accents and others)
            '\u02B0-\u02C1' +  // Modifier letters
            '\u0370-\u0374\u0376-\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03FF' + // Greek and Coptic alphabets
            '\u0400-\u0481\u048A-\u0523'  // Cyrillic alphabet
            // Leaving the remaining alphabets for another brave person
            ;
        // A word is any number > 0 of WORD_CHARS
        const WORD = new RegExp(`^[${WORD_CHARS}]+`);
        // A non-word is any character not in WORD_CHARS and not a space
        const NON_WORD = new RegExp(`^[^\s${WORD_CHARS}]`);

        let tokens: Token[] = [];

        // Walk through the sentence consuming chunks that matches WORD or NON_WORD
        let sentenceIndex = 0;
        while (sentence.length) {
            // Ignore spaces at the beginning of the remaining sentence
            let leadingSpaces = sentence.match(/^\s*/)[0].length;
            // Consume the spaces
            sentenceIndex += leadingSpaces;
            sentence = sentence.slice(leadingSpaces);

            // Try a word
            let tokenRegExpRes = sentence.match(WORD);
            if (!tokenRegExpRes) {
                // If not a word, try a non-word
                tokenRegExpRes = sentence.match(NON_WORD);
            }
            if (!tokenRegExpRes) {
                // If not word nor non-word... It should be impossible
                throw new Error(`The sentence ${sentence} cannot be classified as word or non-word`);
            }

            let token = tokenRegExpRes[0];
            tokens.push({
                token: token,
                startChar: sentenceIndex,
                endChar: sentenceIndex + token.length - 1
            });
            // Consume the recognized token
            sentenceIndex += token.length;
            sentence = sentence.slice(token.length);
        }

        return tokens;
    }

    /**
     * Tokenize a sentence following the LUIS rules and return an array of strings
     */
    private static tokenize(sentence: string): string[] {
        return LanguageModelParser.splitSentenceByTokens(sentence).map(token => token.token);
    }

    private buildUtterance(sentence: string, intent: string) {
        let entities: any[] = [];
        let parts = '';

        sentence
            .trim()
            // split by entities:
            // "Santiago Bernabeu went to [Santiago Bernabeu:place]." will split in
            // [ "Santiago Bernabeu went to ", "[Santiago Bernabeu:place]", "." ]
            .split(/(\[.+?:.+?\])/g)
            .forEach(part => {
                let extractedEntities = this.extractEntities(part);
                if (extractedEntities.length) {
                    extractedEntities.forEach(entity => {
                        let startPos = LanguageModelParser.wordCount(parts);
                        parts += entity.entityValue;
                        let endPos = LanguageModelParser.wordCount(parts) - 1;
                        entities.push({
                            entity: entity.entityType,
                            startPos,
                            endPos
                        });
                    });
                } else {
                    parts += part;
                }
            });

        let utterance: Luis.Utterance = {
            text: this.normalizeSentence(parts),
            intent,
            entities
        };

        return utterance;
    }

    private warnAboutDuplicates(obj: any, prefix: string[] = []) {
        const duplicates = (array: any[]) => _.uniq(_.filter(array, (v, i, col) => _.includes(col, v, i + 1)));

        _.forEach(obj, (value, key) => {
            if (value && Array.isArray(value)) {
                let duplicatedValues = duplicates(value);
                if (duplicatedValues.length) {
                    let breadcrumb = prefix.concat(key).join(' -> ');
                    this.emitWarning(`The key "${breadcrumb}" has the following duplicated values: ${duplicatedValues.join(', ')}`);
                }
            } else if (isObject(value)) {
                this.warnAboutDuplicates(value, prefix.concat(key));
            }
        });
    }

    private emitWarning(msg: string) {
        this.emit('warning', msg);
    }

    private emitError(msg: string) {
        this.emit('error', msg);
    }
}

/**
 * http://stackoverflow.com/a/34749873/12388
 * Simple is object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item: any) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * http://stackoverflow.com/a/34749873/12388
 * Deep merge two objects.
 * @param target
 * @param source
 */
function mergeDeep(target: any, source: any) {
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (!source[key]) {
                // Ignore empty values such as an intent key without examples
                continue;
            } else if (isObject(source[key])) {
                if (!target[key]) {
                    Object.assign(target, { [key]: {} });
                }
                if (!isObject(target[key])) {
                    throw new Error(`Property ${key} already exist in target but it is not an object`);
                }
                mergeDeep(target[key], source[key]);
            } else if (Array.isArray(source[key])) {
                if (!target[key]) {
                    Object.assign(target, { [key]: [] });
                }
                if (!Array.isArray(target[key])) {
                    throw new Error(`Property ${key} already exist in target but it is not an array`);
                }
                target[key] = _.uniq(target[key].concat(source[key]));
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    return target;
}
