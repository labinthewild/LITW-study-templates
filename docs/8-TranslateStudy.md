#How to... Translate your study?

We use [Wikimedia's JQuery i18n plugin](https://github.com/wikimedia/jquery.i18n) to write this template pages. 
So it should be very easy to translate things. You have to do two things:

1. Create a file with the translated messages in the desired language;
2. Register the new language in the study engine.

## 1. Create new language file

To facilitate translations, we have stored all the study messages in a unique file at the `src/i18n/` folder.
As this template currently only supports the English language, you will find a `en.json` file with messages like:

```
"litw-template-title": "Which Cat?",
"litw-irb-header": "Welcome to the LabintheWild 2.0 Demo Study!",
```

All messages are stored like that, in a `KEY:VALUE` structure.
To translate the study to another language, lets say to Brazilian Portuguese, you have to copy the `en.json` file to a new file, and translate each of the messages.
In this case, we have created a `pt-br.json` and changed the above messages to:

```
"litw-template-title": "Qual o seu gato?",
"litw-irb-header": "Bem vinda(o) ao estudo de demonstração do LabintheWild!",
```

OBS: Be cautious not to change the `KEY` part of the line as this is the information used at the web page to reference the messages you want to use.

That is it! When you finish translating you have to make that available to the public by registering it on your study engine.

## 2. Register the new language as available to the public

The study engine is the JavaScript code in the file `src/study.js`, and to add a language you will only have to change one line of code:

```
//...
$.i18n().load(
	{
		'en': 'src/i18n/en.json',
		'pt-BR': 'src/i18n/pt-br.json'
	}
).done(
//...)
```
As you can see, I already added the Brazilian Portuguese language using its [locale code](https://en.wikipedia.org/wiki/Language_localisation) `pt-BR` 
pointing to the file with the translated messages.

Now you can load your study in a browser set to use Brazilian Portuguese as the main language and you will see that the study title and header will be in Portuguese. =)