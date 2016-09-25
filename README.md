# language-model-converter

This is a tool to convert language files defined in [language-model](../language-model) into the LUIS internal JSON representation.

## Usage examples

```sh
npm install @telefonica/language-model-converter

language-model-converter -p ../language-model -c en-us
language-model-converter -p ../language-model -c es-es
```

Notice that you can use [luis-cli](../luis-cli) to import or update the generated LUIS models.