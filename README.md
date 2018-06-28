# Beyond-CLI
Command Line tool for Beyond App development

## Features
* Version Upgrade detection to ensure you are aware of any updates
* Development environment utilizing your Beyond credentials
* Build tools for production releases
* Unit Test runners utilizing Karma and WebPack with complete code coverage reports
* ES6 support.  All code will automatically be transpiled utilizing Webpack and Babel

## Install Beyond-CLI globally without sudo
To prevent issues, you will want to ensure that you are able to install packages globally using npm, and without having to use sudo.  If you are unable to do this, follow the link here to learn how to configure your system for this.

[npm global installs without sudo](https://github.com/sindresorhus/guides/blob/master/npm-global-without-sudo.md)

### Install
Being a CLI tool, Beyond is intended to be installed as a global node module.  You can install it easily with:

```
$ npm install -g @getbeyond/beyond-cli
```

### Update
Occasionally, we will release new features into the tool.  To make this exposure easy to see, you will receive a message when you run any Beyond command notifying you of a new release.  You can update just as easily as installing with:

```
$ npm install -g @getbeyond/beyond-cli
```

### Build
The build command will clean out your dist/ directory and rebuild all files and assets for production release.

Note: The dist/ directory is required for CDN hosting, so do not add it to your .gitignore or your app will fail to work!

```
$ beyond build
```

### Test
The test command will use your `/client/app/tests.webpack.js` file in order to compile and test your project.  The setup supports writing your unit tests in ES6, utilizing Mocha and Sinon-Chai within the Karma framework.

Refer:
* [Karma Mocha](https://github.com/karma-runner/karma-mocha)
* [Karma Sinon Chai](https://github.com/kmees/karma-sinon-chai)

```
$ beyond test
```

### Develop
The dev command will require Beyond Developer credentials in order to run.  It will gather information regarding your app from the Developer Portal registry, in order to give you the ability to test against permissions, locations, and other features

ESLint is integrated and configured by default.  To override rules, create a .eslintrc file in the root of your project and refer to the below ESLint rules documentation in the link provided.

Refer:
* [ESLint](http://eslint.org/docs/rules/)

```
$ beyond dev
```

### Serve
The serve command will require Beyond Developer credentials in order to run.  It will gather information regarding your app from the Developer Portal registry, and serve the contents of your dist/ directory onto a local Express server.  This will give you the ability to preview your fully compiled project before committing it for release.

```
$ beyond serve
```

#### Adding Pages
In order for a new page to be added to your app and to function properly against permissions, you will need to first add it to the app in the Developer Portal.  After creating the page through the UI, you can create the files and add the route with a structure similar to:

```
.when('/my-new-page', {
    name: 'My New Page',
    position: 0,
    template: require('./components/myNewPage/myNewPage.html'),
    controller: 'MyNewPageController',
    controllerAs: 'myNewPage',
    is_hidden: true | false,      // Hides the page from navigation
    is_settings_page: true | false,
    is_welcome_page: true | false
  })
```

Note: If the page is a settings page, the route must be prefixed with /settings


### About Beyond

Visit [Beyond](https://peachworks.com) for details on how to create an account and use apps.
Visit [Beyond Developer Portal](https://build.peachworks.com) for details on how to become a Beyond developer.
