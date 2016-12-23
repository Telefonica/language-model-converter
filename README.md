# language-model-converter

This is a tool to convert language files defined in yaml language model into the [LUIS](http://luis.ai) internal JSON representation.

### The language model
This is a [yaml](http://www.yaml.org/) format file that is conveted to a [JSON file](https://dev.projectoxford.ai/docs/services/56d95961e597ed0f04b76e58/operations/56f8a55119845511c81de480) that LUIS can undestand

Words preceed by `#` are comments, and its purpose is to leave some insights to people that will help on understanding whats going on. These words will be removed when training luis, so feel free to add as much as you want to help next colleagues that will manage the file

```yaml

list.${examples}:  # Defines a example list to make substitutions in the utterances
  - heaven
  - hell
  
tef.intent.info: # Defines a Luis Intent
  - Tell me about the purgatory # Simple utterance
  - What is ${examples} # Substitution with list: Will generate for you "What is heaven" and "What is hell"

tef.intent.go: # Defines a Luis Intent
  - Go to [purgatory:tef.places] # Defines an entity "tef.places" giving "purgatory" as an example. The example is mandatory
  - Head to [${examples}:tef.places] # You can make substitution in the entity examples too!
  - We will go to [hell:tef.places] from [january 1:tef.date::start] until [december 31:tef.date::enf] # Hierarchical Entities are supported also 
  
phraselist:
  aksforinfo: # ex: How to ask for something synonims: 
    words: 
      - Tell me about
      - What is

  tef.places: # ex: Place examples here for training entities
    words: 
      - heaven
      - hell
      - purgatory
      - home
  # if you want no have a not-exangeable phraselist, add the property `mode: false` to it. Example:
  # tef.relations
  #   mode: false
  #   words:
  #     - leader
  #     - area
  # more info: https://github.com/Microsoft/Cognitive-Documentation/issues/97#issuecomment-265738124
  
builtin: # LUIS builtin entities that should be used
  - age
  - datetime
  - dimension
  - encyclopedia
  - geography
  - money
  - number
  - ordinal
  - percentage
  - temperature
```

The list of **builtin** entities can be found in the [LUIS Help](https://www.luis.ai/Help#PreBuiltEntities) and/or the [Cognitive Services Help](https://www.microsoft.com/cognitive-services/en-us/luis-api/documentation/pre-builtentities) 
Please, read carefully about what entities are available for the target language you are writting utterances to, as 
> Unless otherwise noted, each pre-built entity is available in all LUIS application locales (cultures).

_Note: maybe the doc page [is not actualized with all the entities](https://github.com/Microsoft/Cognitive-Documentation/issues/96)_ 

You dont need to declare with brackets the builtin entities. They are recognized by default on LUIS. I.E:
```yaml
# DONT DO THIS
tef.intent.money:
  - It's worth [$30:builtin.money]
  
# DO THIS
builtin:
  - money

tef.intent.money:
  - It's worth $30
```

### Limitations
As of writing this doc, the following limitations apply in LUIS Service
 * Max of 40 intents (`tef.intent.info` + `tef.intent.go` = 2)
 * Max of 50 chars for the intent name (`tef.intent.info` = 15)
 * Max of 10 phraselists (`askforinfo` + `tef.places` = 2)
 * Max of 10 entities ([something:`tef.places`]) _You can provide as much examples as you want for the entities_
 * Max of 10 children entities per parent ([something:`tef.date::start`])

## Usage examples

```sh
npm install -g @telefonica/language-model-converter
language-model-converter --help 

  Usage: language-model-converter [options] <files>                                                                                                                                       
                                                                                                                                                                                          
  Convert language files defined to LUIS format                                                                                                                                           
                                                                                                                                                                                          
  Options:                                                                                                                                                                                
                                                                                                                                                                                          
    -h, --help               output usage information                                                                                                                                     
    -c, --culture <culture>  Culture code this files belongs to (ex. "en-us")                                                                                                             
                                                                                                                                                                                          
  Examples:                                                                                                                                                                               
                                                                                                                                                                                          
    Convert all files in 'models' and its subfolders, starting with 'en',                                                                                                                 
    setting the locale to en-us                                                                                                                                                           
      $ language-model-converter ./models/**/en*.yaml -c en-us   
```

Notice that you can use [luis-cli](https://github.com/Telefonica/luis-cli) to import or update the generated LUIS models.

## LICENSE

Copyright 2016 [Telefónica I+D](http://www.tid.es)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
