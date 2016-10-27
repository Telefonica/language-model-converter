# language-model-converter

This is a tool to convert language files defined in yaml language model into the (LUIS)(http://luis.ai) internal JSON representation.

### The language model
This is a [yaml](http://www.yaml.org/) format file that is conveted to a [JSON file](https://dev.projectoxford.ai/docs/services/56d95961e597ed0f04b76e58/operations/56f8a55119845511c81de480) that LUIS can undestand

Words preceed by `#` are comments, and its purpose is to leave some insights to people that will help on understanding whats going on. These words will be removed when training luis, so feel free to add as much as you want to help next colleagues that will manage the file

```yaml

list.${example}:  # Defines a example list to make substitutions in the utterances
  - heaven
  - hell
  
tef.intent.info: # Defines a Luis Intent
  - Tell me about the purgatory # Simple utterance
  - What is ${example} # Substitution with list: Will generate for you "What is heaven" and "What is hell"

tef.intent.go: # Defines a Luis Intent
  - Go to [purgatory:tef.places] # Defines an entity "tef.places" giving "purgatory" as an example. The example is mandatory
  - Head to [${example}:tef.places] # You can make substitution in the entity examples too!

```

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

Notice that you can use [luis-cli](../luis-cli) to import or update the generated LUIS models.


