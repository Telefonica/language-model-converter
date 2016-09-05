export namespace Luis {
    export interface Model {
        luis_schema_version: string;
        name: string;
        desc: string;
        culture: string;
        intents: Intent[];
        entities: Entity[];
        composites: any[];
        bing_entities: any[];
        actions: any[];
        model_features: any[];
        regex_features: any[];
        utterances: Utterance[];
    };

    export interface Utterance {
        text: string;
        intent: string;
        entities: EntityPosition[];
    };

    export interface EntityPosition {
        entity: string;
        startPos: number;
        endPos: number;
    }

    export interface Entity {
        name: string;
        children?: string[];
    }

    export interface Intent {
        name: string;
    }
}
