import { expect } from 'chai';

import { LanguageModelParser } from './parser';

describe('Language Model Converter', () => {
    it('should parse a valid yaml file', () => {
        let parser = new LanguageModelParser();
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
                text: 'this is a test utterance 1',
                intent: 'my.test.intent.2',
                entities: []
            },
            {
                text: 'this is a test utterance 2',
                intent: 'my.test.intent.2',
                entities: []
            }
        ];

        expect(luisModel.utterances).to.eql(expectedUtterances);
    });

    it('should add basic model information', () => {
        let parser = new LanguageModelParser();
        let luisModel = parser.parse(['./test/fixtures/en-basic.yaml'], 'en-us');
        expect(luisModel.luis_schema_version).to.not.be.empty;
        expect(luisModel.name).to.not.be.empty;
        expect(luisModel.desc).to.not.be.empty;
        expect(luisModel.culture).to.eq('en-us');
    });

    it('should parse a valid yaml file with corner cases', () => {
        let parser = new LanguageModelParser();
        let luisModel = parser.parse(['./test/fixtures/en-cornercases.yaml'], 'en-us');

        let expectedUtterances = [
            {
                'text': 'santiago went to the santiago bernabeu.',
                'intent': 'my.test.intent.1',
                'entities': [
                    {
                        'entity': 'place',
                        'startPos': 4,
                        'endPos': 5
                    }
                ]
            },
            {
                'text': 'i live in the 2ºc apartment in madrid.',
                'intent': 'my.test.intent.1',
                'entities': [
                    {
                        'entity': 'location',
                        'startPos': 7,
                        'endPos': 7
                    }
                ]
            },
            {
                'text': `i don't like paris`,
                'intent': 'my.test.intent.1',
                'entities': [
                    {
                        'entity': 'location',
                        'startPos': 5,
                        'endPos': 5
                    }
                ]
            },
            {
                'text': `i've 123 friends. in paris`,
                'intent': 'my.test.intent.1',
                'entities': [
                    {
                        'entity': 'location',
                        'startPos': 7,
                        'endPos': 7
                    }
                ]
            },
            {
                'text': `i'd like to go to o'brian and l.a.`,
                'intent': 'my.test.intent.1',
                'entities': [
                    {
                        'entity': 'location',
                        'startPos': 7,
                        'endPos': 9
                    },
                    {
                        'entity': 'location',
                        'startPos': 11,
                        'endPos': 14
                    }
                ]
            },
            {
                'text': 'i _love_ paris and great_britain.',
                'intent': 'my.test.intent.1',
                'entities': [
                    {
                        'entity': 'location',
                        'startPos': 4,
                        'endPos': 4
                    },
                    {
                        'entity': 'location',
                        'startPos': 6,
                        'endPos': 8
                    }
                ]
            },
            {
                'text': 'the best city in-the-world is new-york',
                'intent': 'my.test.intent.1',
                'entities': [
                    {
                        'entity': 'location',
                        'startPos': 9,
                        'endPos': 11
                    }
                ]
            },
            {
                'text': 'i love open spaces , like the one in bei jing and london',
                'intent': 'my.test.intent.1',
                'entities': [
                    {
                        'entity': 'location',
                        'startPos': 9,
                        'endPos': 10
                    },
                    {
                        'entity': 'location',
                        'startPos': 12,
                        'endPos': 12
                    }
                ]
            },
            {
                'text': `symbols everywhere! ºª\\!|"@·#$%&¬/()=?¿'¡^\`<>,;.:-_¨*+ london`,
                'intent': 'my.test.intent.1',
                'entities': [
                    {
                        'entity': 'location',
                        'startPos': 36,
                        'endPos': 36
                    }
                ]
            },
            {
                'text': 'Çç vayÁ cÓn Úna eÑes en Éspaña no son gÜenas nÍ cigüenas en parÍs',
                'intent': 'my.test.intent.1',
                'entities': [
                    {
                        'entity': 'location',
                        'startPos': 13,
                        'endPos': 13
                    }
                ]
            }
        ];

        expect(luisModel.utterances).to.eql(expectedUtterances);
    });

    it('should deal with locale specifities', function() {
        let parser = new LanguageModelParser();
        let luisModel = parser.parse(['./test/fixtures/es-cornercases.yaml'], 'es-es');
        let expectedUtterances = [
            {
                'text': 'çç vayá cón úna eñes en éspaña no son güenas ní cigüenas en parís',
                'intent': 'my.test.intent.1',
                'entities': [
                    {
                        'entity': 'location',
                        'startPos': 13,
                        'endPos': 13
                    }
                ]
            }
        ];
        expect(luisModel.utterances).to.eql(expectedUtterances);
    });

    it('should parse a valid yaml file with variables (lists)', () => {
        let parser = new LanguageModelParser();
        let luisModel = parser.parse(['./test/fixtures/en-variables.yaml'], 'en-us');

        let expectedUtterances = [
            {
                'text': 'this is the country spain',
                'intent': 'my.test.intent',
                'entities': [
                    {
                        'entity': 'country',
                        'startPos': 4,
                        'endPos': 4
                    }
                ]
            },
            {
                'text': 'this is the country france',
                'intent': 'my.test.intent',
                'entities': [
                    {
                        'entity': 'country',
                        'startPos': 4,
                        'endPos': 4
                    }
                ]
            },
            {
                'text': 'this is the country spain',
                'intent': 'my.test.expansion',
                'entities': [ ]
            },
            {
                'text': 'this is the country france',
                'intent': 'my.test.expansion',
                'entities': [ ]
            },
            {
                'text': 'this is the color red',
                'intent': 'my.test.expansion',
                'entities': [ ]
            },
            {
                'text': 'this is the color blue',
                'intent': 'my.test.expansion',
                'entities': [ ]
            },
            {
                'text': 'this is the red spain',
                'intent': 'my.test.expansion',
                'entities': [ ]
            },
            {
                'text': 'this is the blue spain',
                'intent': 'my.test.expansion',
                'entities': [ ]
            },
            {
                'text': 'this is the red france',
                'intent': 'my.test.expansion',
                'entities': [ ]
            },
            {
                'text': 'this is the blue france',
                'intent': 'my.test.expansion',
                'entities': [ ]
            },
            {
                'text': 'this is the spain spain',
                'intent': 'my.test.expansion',
                'entities': [ ]
            },
            {
                'text': 'this is the spain france',
                'intent': 'my.test.expansion',
                'entities': [ ]
            },
            {
                'text': 'this is the france spain',
                'intent': 'my.test.expansion',
                'entities': [ ]
            },
            {
                'text': 'this is the france france',
                'intent': 'my.test.expansion',
                'entities': [ ]
            }
        ];

        expect(luisModel.utterances).to.eql(expectedUtterances);
    });

    it('should parse phraselists', function() {
        let parser = new LanguageModelParser();
        let luisModel = parser.parse(['./test/fixtures/en-features.yaml'], 'en-us');

        let expectedModelFeatures = [
            {
                name: 'strange',
                words: `hola - caracola,Hola _ caracola,I ' d like,2º floor,Que tAl`,
                activated: true,
                mode: true
            },
            {
                name: 'numbers',
                words: `123,123 123`,
                activated: true,
                mode: true
            }
        ]

        expect(luisModel.model_features).to.eql(expectedModelFeatures);

    });
});
