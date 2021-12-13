# run-cy-on-ci [![ci](https://github.com/bahmutov/run-cy-on-ci/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/bahmutov/run-cy-on-ci/actions/workflows/ci.yml)
> Launch on CI a particular Cypress test using grep or grep tags

## Install

Add this utility to your project

```
$ npm i -D run-cy-on-ci
# or if using Yarn
$ yarn add -D run-cy-on-ci
```

Put the settings into the local `.as-a.ini` file or in the `~/.as-a/.as-a.ini` file under the section `[run-cy-on-ci]`, for example

```ini
[run-cy-on-ci]
CIRCLE_CI_API_TOKEN=...
; from this folder we want to trigger CircleCI pipeline for
; https://github.com/bahmutov/chat.io
CIRCLE_CI_ORG=bahmutov
CIRCLE_CI_PROJECT=chat.io
```

Set up [cypress-grep](https://github.com/cypress-io/cypress-grep) in your target project, including CircleCI Workflows with parameters following the blog post [Burn Cypress Tests on CircleCI](https://glebbahmutov.com/blog/burn-tests-on-circle/). For example, see [chat.io config file](https://github.com/bahmutov/chat.io/blob/main/.circleci/config.yml)

```yml
# .circleci/config.yml
# if we want to run only some tests on CircleCI, we can call the workflow
# with parameters, as described in https://glebbahmutov.com/blog/burn-tests-on-circle/
parameters:
  # allow running selected tests once or multiple times
  # using the cypress-grep plugin
  # https://github.com/cypress-io/cypress-grep
  GREP:
    type: string
    default: ''
  GREP_TAGS:
    type: string
    default: ''
  BURN:
    type: integer
    default: 1

workflows:
  some-tests:
    # runs the Web tests when the user supplies a grep pattern
    when:
      or:
        - << pipeline.parameters.GREP >>
        - << pipeline.parameters.GREP_TAGS >>
    jobs:
      - cypress/run:
          name: Filtered E2E tests
          no-workspace: true
          group: 'Test grep: << pipeline.parameters.GREP >>'
          tags: << pipeline.parameters.GREP >>
          env: 'grep="<< pipeline.parameters.GREP >>",grepTags="<< pipeline.parameters.GREP_TAGS >>",grepBurn=<< pipeline.parameters.BURN >>'

  all-tests:
    unless:
      or:
        - << pipeline.parameters.GREP >>
        - << pipeline.parameters.GREP_TAGS >>
    jobs:
      # normal build and test workflow
```

## Use

Any time you want to launch a specific test by title

```shell
$ npx run-cy-on-ci "part of the test title"
# equivalent
$ npx run-cy-on-ci --grep "part of the test title"
# equivalent alias
$ npx run-cy-on-ci -g "part of the test title"
# using Yarn
$ yarn run-cy-on-ci -g "part of the test title"
```

### Tags

You can run all tests tagged `@smoke` using `--tag @smoke` argument

```shell
$ npx run-cy-on-ci --tag @smoke
# use an alias -t
$ npx run-cy-on-ci -t @smoke
```

### Burn

If you want to run that test N times (burning)

```shell
$ npx run-cy-on-ci --grep "part of the test title" --burn N
```

You can use aliases

```shell
$ npx run-cy-on-ci -g "part of the test title" -b N
```

## 3rd party libraries

- [as-a](https://github.com/bahmutov/as-a) to collect token and config vars
- [trigger-circleci-pipeline](https://github.com/bahmutov/trigger-circleci-pipeline) to trigger pipeline run on CircleCI

## Debugging

This utility uses [debug](https://www.npmjs.com/package/debug) to print verbose logs. Too see them run the tool with the environment variable

```
$ DEBUG=run-cy-on-ci ...
```

## Small print

Author: Gleb Bahmutov &lt;gleb.bahmutov@gmail.com&gt; &copy; 2021

- [@bahmutov](https://twitter.com/bahmutov)
- [glebbahmutov.com](https://glebbahmutov.com)
- [blog](https://glebbahmutov.com/blog)
- [videos](https://www.youtube.com/glebbahmutov)
- [presentations](https://slides.com/bahmutov)
- [cypress.tips](https://cypress.tips)

License: MIT - do anything with the code, but don't blame me if it does not work.

Support: if you find any problems with this module, email / tweet /
[open issue](https://github.com/bahmutov/run-cy-on-ci/issues) on Github

## MIT License

Copyright (c) 2021 Gleb Bahmutov &lt;gleb.bahmutov@gmail.com&gt;

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
