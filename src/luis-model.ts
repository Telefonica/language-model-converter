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
        model_features: ModelFeature[];
        regex_features: any[];
        utterances: Utterance[];
    };

    export interface Utterance {
        text: string;
        intent: string;
        entities: EntityPosition[];
    };

    export interface ModelFeature {
        name: string;
        mode: boolean;
        words: string;
        activated: boolean;
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
