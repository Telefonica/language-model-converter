# language-model-converter

This is a tool to convert language files defined in [language-model](../language-model) into the LUIS internal JSON representation.

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