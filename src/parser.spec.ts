import * as chai from 'chai';
chai.use(require('chai-eventemitter'));
const expect = chai.expect;

import { LanguageModelParser } from './parser';
import { Luis } from './luis-model';

describe('Language Model Converter', () => {
    it('should parse a valid yaml file', () => {
        let parser = new LanguageModelParser();
        parser.on('warning', (msg: string) => { throw new Error(`Unexpected Warning: ${msg}`); });
        let luisModel = parser.parse(['./test/fixtures/en-basic.yaml'], 'en-us');

        let expectedIntents = [
            {
                name: 'my.test.intent.1'
            },
            {
                name: 'my.test.intent.2'
            }
        ];

        expect(luisModel.intents).to.eql(expectedIntents);

        let expectedEntities = [
            {
                name: 'location',
                children: [
                    'origin',
                    'destination'
                ]
            },
            {
                name: 'country'
            }
        ];

        expect(luisModel.entities).to.eql(expectedEntities);

        let expectedUtterances = [
            {
                text: 'this is a test (utterance). entities london and madrid and spain',
                intent: 'my.test.intent.1',
                entities: [
                    {
                        entity: 'location::origin',
                        startPos: 9,
                        endPos: 9
                    },
                    {
                        entity: 'location::destination',
                        startPos: 11,
                        endPos: 11
                    },
                    {
                        entity: 'country',
                        startPos: 13,
                        endPos: 13
                    }
                ]
            },
            {
                text: 'this is a test (utterance). my entities madrid and london and uk',
                intent: 'my.test.intent.1',
                entities: [
                    {
                        entity: 'location::origin',
                        startPos: 10,
                        endPos: 10
                    },
                    {
                        entity: 'location::destination',
                        startPos: 12,
                        endPos: 12
                    },
                    {
                        entity: 'country',
                        startPos: 14,
                        endPos: 14
                    }
                ]
            },
            {
                text: 'this is a test (utterance). your other entities ny and washington and usa',
                intent: 'my.test.intent.1',
                entities: [
                    {
                        entity: 'location::origin',
                        startPos: 11,
                        endPos: 11
                    },
                    {
                        entity: 'location::destination',
                        startPos: 13,
                        endPos: 13
                    },
                    {
                        entity: 'country',
                        startPos: 15,
                        endPos: 15
                    }
                ]
            },
            {
                text: 'this is a test utterance 1',
                intent: 'my.test.intent.2',
                entities: []
            },
            {
                text: 'this is a test utterance 2',
                intent: 'my.test.intent.2',
                entities: []
            },
            {
                text: 'this is a test utterance 3',
                intent: 'my.test.intent.2',
                entities: []
            }
        ];

        expect(luisModel.utterances).to.eql(expectedUtterances);
    });

    it('should add basic model information', () => {
        let parser = new LanguageModelParser();
        parser.on('warning', (msg: string) => { throw new Error(`Unexpected Warning: ${msg}`); });
        let luisModel = parser.parse(['./test/fixtures/en-basic.yaml'], 'en-us');
        /* tslint:disable:no-unused-expression */
        expect(luisModel.luis_schema_version).to.not.be.empty;
        expect(luisModel.name).to.not.be.empty;
        expect(luisModel.desc).to.not.be.empty;
        /* tslint:enable:no-unused-expression */
        expect(luisModel.culture).to.eq('en-us');
    });

    it('should parse a valid yaml file with corner cases', () => {
        let parser = new LanguageModelParser();
        parser.on('warning', (msg: string) => { throw new Error(`Unexpected Warning: ${msg}`); });
        let luisModel = parser.parse(['./test/fixtures/en-cornercases.yaml'], 'en-us');

        let expectedUtterances = [
            {
                text: 'santiago went to the santiago bernabeu.',
                intent: 'my.test.intent.1',
                entities: [
                    {
                        entity: 'place',
                        startPos: 4,
                        endPos: 5
                    }
                ]
            },
            {
                text: 'i live in the 2ºc apartment in madrid.',
                intent: 'my.test.intent.1',
                entities: [
                    {
                        entity: 'location',
                        startPos: 7,
                        endPos: 7
                    }
                ]
            },
            {
                text: `i don't like paris`,
                intent: 'my.test.intent.1',
                entities: [
                    {
                        entity: 'location',
                        startPos: 5,
                        endPos: 5
                    }
                ]
            },
            {
                text: `i've 123 friends. in paris`,
                intent: 'my.test.intent.1',
                entities: [
                    {
                        entity: 'location',
                        startPos: 7,
                        endPos: 7
                    }
                ]
            },
            {
                text: `i'd like to go to o'brian and l.a.`,
                intent: 'my.test.intent.1',
                entities: [
                    {
                        entity: 'location',
                        startPos: 7,
                        endPos: 9
                    },
                    {
                        entity: 'location',
                        startPos: 11,
                        endPos: 14
                    }
                ]
            },
            {
                text: 'i _love_ paris and great_britain.',
                intent: 'my.test.intent.1',
                entities: [
                    {
                        entity: 'location',
                        startPos: 4,
                        endPos: 4
                    },
                    {
                        entity: 'location',
                        startPos: 6,
                        endPos: 8
                    }
                ]
            },
            {
                text: 'the best city in-the-world is new-york',
                intent: 'my.test.intent.1',
                entities: [
                    {
                        entity: 'location',
                        startPos: 9,
                        endPos: 11
                    }
                ]
            },
            {
                text: 'i love open spaces , like the one in bei jing and london',
                intent: 'my.test.intent.1',
                entities: [
                    {
                        entity: 'location',
                        startPos: 9,
                        endPos: 10
                    },
                    {
                        entity: 'location',
                        startPos: 12,
                        endPos: 12
                    }
                ]
            },
            {
                text: `symbols everywhere! ºª\\!|"@·#$%&¬/()=?¿'¡^\`<>,;.:-_¨*+ london`,
                intent: 'my.test.intent.1',
                entities: [
                    {
                        entity: 'location',
                        startPos: 36,
                        endPos: 36
                    }
                ]
            },
            {
                text: 'Çç vayÁ cÓn Úna eÑes en Éspaña no son gÜenas nÍ cigüenas en parÍs',
                intent: 'my.test.intent.1',
                entities: [
                    {
                        entity: 'location',
                        startPos: 13,
                        endPos: 13
                    }
                ]
            }
        ];

        expect(luisModel.utterances).to.eql(expectedUtterances);
    });

    it('should deal with locale specificities', function () {
        let parser = new LanguageModelParser();
        parser.on('warning', (msg: string) => { throw new Error(`Unexpected Warning: ${msg}`); });
        let luisModel = parser.parse(['./test/fixtures/es-cornercases.yaml'], 'es-es');
        let expectedUtterances = [
            {
                text: 'çç vayá cón úna eñes',
                intent: 'my.test.intent.1',
                entities: []
            },
            {
                text: 'en éspaña no son güenas',
                intent: 'my.test.intent.1',
                entities: []
            },
            {
                text: 'ní cigüenas en parís',
                intent: 'my.test.intent.1',
                entities: [
                    {
                        entity: 'location',
                        startPos: 3,
                        endPos: 3
                    }
                ]
            }
        ];
        expect(luisModel.utterances).to.eql(expectedUtterances);
    });

    it('should parse a valid yaml file with variables (lists)', () => {
        let parser = new LanguageModelParser();
        parser.on('warning', (msg: string) => { throw new Error(`Unexpected Warning: ${msg}`); });
        let luisModel = parser.parse(['./test/fixtures/en-variables.yaml'], 'en-us');

        let expectedUtterances = [
            {
                text: 'this is the other country spain',
                intent: 'my.test.intent',
                entities: [
                    {
                        entity: 'country',
                        startPos: 5,
                        endPos: 5
                    }
                ]
            },
            {
                text: 'this is the other country france',
                intent: 'my.test.intent',
                entities: [
                    {
                        entity: 'country',
                        startPos: 5,
                        endPos: 5
                    }
                ]
            },
            {
                text: 'this is the other awesome country spain',
                intent: 'my.test.intent',
                entities: [
                    {
                        entity: 'country',
                        startPos: 6,
                        endPos: 6
                    }
                ]
            },
            {
                text: 'this is the other awesome country france',
                intent: 'my.test.intent',
                entities: [
                    {
                        entity: 'country',
                        startPos: 6,
                        endPos: 6
                    }
                ]
            },
            {
                text: 'this is another country spain',
                intent: 'my.test.intent',
                entities: [
                    {
                        entity: 'country',
                        startPos: 4,
                        endPos: 4
                    }
                ]
            },
            {
                text: 'this is another country france',
                intent: 'my.test.intent',
                entities: [
                    {
                        entity: 'country',
                        startPos: 4,
                        endPos: 4
                    }
                ]
            },
            {
                text: 'this is the country spain',
                intent: 'my.test.expansion',
                entities: []
            },
            {
                text: 'this is the country france',
                intent: 'my.test.expansion',
                entities: []
            },
            {
                text: 'this is the color red',
                intent: 'my.test.expansion',
                entities: []
            },
            {
                text: 'this is the color blue',
                intent: 'my.test.expansion',
                entities: []
            },
            {
                text: 'this is the red spain',
                intent: 'my.test.expansion',
                entities: []
            },
            {
                text: 'this is the blue spain',
                intent: 'my.test.expansion',
                entities: []
            },
            {
                text: 'this is the red france',
                intent: 'my.test.expansion',
                entities: []
            },
            {
                text: 'this is the blue france',
                intent: 'my.test.expansion',
                entities: []
            },
            {
                text: 'this is the spain spain',
                intent: 'my.test.expansion',
                entities: []
            },
            {
                text: 'this is the spain france',
                intent: 'my.test.expansion',
                entities: []
            },
            {
                text: 'this is the france spain',
                intent: 'my.test.expansion',
                entities: []
            },
            {
                text: 'this is the france france',
                intent: 'my.test.expansion',
                entities: []
            },
            {
                text: 'spain',
                intent: 'my.test.expansion',
                entities: [
                    {
                        startPos: 0,
                        endPos: 0,
                        entity: 'country'
                    }
                ]
            },
            {
                text: 'france',
                intent: 'my.test.expansion',
                entities: [
                    {
                        startPos: 0,
                        endPos: 0,
                        entity: 'country'
                    }
                ]
            }
        ];

        expect(luisModel.utterances).to.eql(expectedUtterances);
    });

    it('should parse phraselists', function () {
        let parser = new LanguageModelParser();
        let yamls = [
            './test/fixtures/en-features-1.yaml',
            './test/fixtures/en-features-2.yaml'
        ];
        parser.on('warning', (msg: string) => { throw new Error(`Unexpected Warning: ${msg}`); });
        let luisModel = parser.parse(yamls, 'en-us');

        let expectedModelFeatures = [
            {
                name: 'strange',
                words: 'hola - caracola,Hola _ caracola,I \' d like,2º floor,Que tAl',
                activated: true,
                mode: true
            },
            {
                name: 'numbers',
                words: '123,123 123',
                activated: true,
                mode: true
            },
            {
                name: 'anotherlist',
                words: 'Cercei,Walder Frey,Melisandre',
                activated: true,
                mode: true
            }
        ];

        expect(luisModel.model_features).to.eql(expectedModelFeatures);
    });

    it('should parse builtin', function () {
        let parser = new LanguageModelParser();
        parser.on('warning', (msg: string) => { throw new Error(`Unexpected Warning: ${msg}`); });
        let luisModel = parser.parse(['./test/fixtures/builtin.yaml'], 'en-us');

        let expectedBingEntities = [
            'age',
            'datetime',
            'dimension',
            'encyclopedia',
            'geography',
            'money',
            'number',
            'ordinal',
            'percentage',
            'temperature'
        ];

        expect(luisModel.bing_entities).to.eql(expectedBingEntities);

    });

    it('should merge keys', function () {
        let parser = new LanguageModelParser();
        let yamls = [
            './test/fixtures/en-merge-1.yaml',
            './test/fixtures/en-merge-2.yaml'
        ];
        parser.on('warning', (msg: string) => { throw new Error(`Unexpected Warning: ${msg}`); });
        let luisModel = parser.parse(yamls, 'en-us');

        let expectedModelFeatures = [
            {
                name: 'colors',
                words: 'red,blue,white,yellow,green,black',
                activated: true,
                mode: true
            }
        ];

        expect(luisModel.model_features).to.eql(expectedModelFeatures);
    });

    it('should merge values', function () {
        let parser = new LanguageModelParser();
        let yamls = [
            './test/fixtures/en-merge-1.yaml',
            './test/fixtures/en-merge-2.yaml',
            './test/fixtures/en-merge-3.yaml'
        ];
        parser.on('warning', (msg: string) => { throw new Error(`Unexpected Warning: ${msg}`); });
        let luisModel = parser.parse(yamls, 'en-us');

        let expectedUtterances = [
            {
                text: 'this is a test utterance 1',
                intent: 'my.test.intent',
                entities: [] as Luis.EntityPosition[]
            },
            {
                text: 'this is a test utterance 2',
                intent: 'my.test.intent',
                entities: [] as Luis.EntityPosition[]
            },
            {
                text: 'this is a test utterance 3',
                intent: 'my.test.intent',
                entities: [] as Luis.EntityPosition[]
            },
            {
                text: 'this is a test utterance 4',
                intent: 'my.test.intent',
                entities: [] as Luis.EntityPosition[]
            }
        ];

        expect(luisModel.utterances).to.eql(expectedUtterances);
    });

    it('should emit a warning when there are duplicated values', function () {
        let parser = new LanguageModelParser();
        let parse = parser.parse.bind(parser, ['./test/fixtures/en-duplicated.yaml'], 'en-us');

        expect(parse).to.emitFrom(parser, 'warning');
    });

    it('should emit an error when there are missing white spaces before entity declarations is some example', function () {
        let parser = new LanguageModelParser();
        let parse = parser.parse.bind(parser, ['./test/fixtures/en-examples-missing-white-spaces.yaml'], 'en-us');

        // Needed to avoid the Error: Uncaught, unspecified "error" event.
        parser.on('error', (error: any) => { /* noop */ });

        expect(parse).to.emitFrom(parser, 'error',
            'White space missing before entity declaration in entry ' +
            '"This is a test utterance 2 with missing whitespaces[before entity declaration:entity]"' +
            ' -> "whitespaces[before entity declaration:entity]"');
    });

    it('should emit an error when there is some example assigned to more than one intent', function () {
        let parser = new LanguageModelParser();
        let parse = parser.parse.bind(parser, ['./test/fixtures/en-examples-several-intents.yaml'], 'en-us');

        // Needed to avoid the Error: Uncaught, unspecified "error" event.
        parser.on('error', (error: any) => { /* noop */ });

        expect(parse).to.emitFrom(parser, 'error');
    });

    it('should emit a warning when there is some example referencing an undeclared variable', function () {
        let parser = new LanguageModelParser();
        let parse = parser.parse.bind(parser, ['./test/fixtures/en-missed-variables.yaml'], 'en-us');

        expect(parse).to.emitFrom(parser, 'warning');
    });

    it('should emit a warning when there is some declared variable that is not used in any example', function () {
        let parser = new LanguageModelParser();
        let parse = parser.parse.bind(parser, ['./test/fixtures/en-unused-variables.yaml'], 'en-us');

        expect(parse).to.emitFrom(parser, 'warning');
    });

    it('should emit an error when there are less than 3 examples in an intent', function () {
        let parser = new LanguageModelParser();
        let parse = parser.parse.bind(parser, ['./test/fixtures/en-too-many-examples.yaml'], 'en-us');

        // Needed to avoid the Error: Uncaught, unspecified "error" event.
        parser.on('error', () => { /* noop */ });

        expect(parse).to.emitFrom(parser, 'error');
    });
});
