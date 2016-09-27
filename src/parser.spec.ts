import { expect } from 'chai';

import { LanguageModelParser } from './parser';

describe('Language Model Converter', () => {
    it('should parse a valid yaml file', () => {
        let parser = new LanguageModelParser();
        let luisModel = parser.parse('./test/fixtures', 'en-basic');

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
                text: 'This is a test ( utterance ) . Entities London and Madrid and Spain',
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
                text: 'This is a test utterance 1',
                intent: 'my.test.intent.2',
                entities: []
            },
            {
                text: 'This is a test utterance 2',
                intent: 'my.test.intent.2',
                entities: []
            }
        ];

        expect(luisModel.utterances).to.eql(expectedUtterances);
    });

    it('should add basic model information', () => {
        let parser = new LanguageModelParser();
        let luisModel = parser.parse('./test/fixtures', 'en-basic');
        expect(luisModel.luis_schema_version).to.not.be.empty;
        expect(luisModel.name).to.not.be.empty;
        expect(luisModel.desc).to.not.be.empty;
        expect(luisModel.culture).to.eq('en-basic');
    });

    it.skip('should parse a valid yaml file with corner cases', () => {
        let parser = new LanguageModelParser();
        let luisModel = parser.parse('./test/fixtures', 'en-cornercases');

        let expectedUtterances = [
            {
                'text': 'Santiago went to the Santiago Bernabeu .',
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
                'text': 'I live in the 2ºC apartment in Madrid .',
                'intent': 'my.test.intent.1',
                'entities': [
                    {
                        'entity': 'location',
                        'startPos': 7,
                        'endPos': 7
                    }
                ]
            }
        ];

        expect(luisModel.utterances).to.eql(expectedUtterances);
    });

    it.skip('should parse a valid yaml file with variables (phrase lists)', () => {
        let parser = new LanguageModelParser();
        let luisModel = parser.parse('./test/fixtures', 'en-variables');

        let expectedUtterances = [
            {
                'text': 'This is the country Spain',
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
                'text': 'This is the country France',
                'intent': 'my.test.intent',
                'entities': [
                    {
                        'entity': 'country',
                        'startPos': 4,
                        'endPos': 4
                    }
                ]
            }
        ];

        expect(luisModel.utterances).to.eql(expectedUtterances);
    });
});
