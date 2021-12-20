# run-cy-on-ci [![ci](https://github.com/bahmutov/run-cy-on-ci/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/bahmutov/run-cy-on-ci/actions/workflows/ci.yml)

> Launch on CI a particular Cypress test using grep or grep tags

Watch the video [Run Cypress On CircleCI From Your Terminal](https://youtu.be/fBcoMmNBY5w)

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
; CircleCI token to use, grab it at
; https://app.circleci.com/settings/user/tokens
CIRCLE_CI_API_TOKEN=...
; from this folder we want to trigger CircleCI pipeline for
; https://github.com/bahmutov/chat.io
CIRCLE_CI_ORG=bahmutov
CIRCLE_CI_PROJECT=chat.io
```

Where `CIRCLE_CI_API_TOKEN` is your personal CircleCI token you can create at [app.circleci.com/settings/user/tokens](https://app.circleci.com/settings/user/tokens).

### CircleCI API token

You can keep the `CIRCLE_CI_API_TOKEN` in the local `.as-a.ini` file, or pass it as an environment variable.

```ini
# local .as-a.ini file
[run-cy-on-ci]
CIRCLE_CI_ORG=bahmutov
CIRCLE_CI_PROJECT=chat.io
```

```shell
$ CIRCLE_CI_API_TOKEN=... npx run-cy-on-ci "part of the test title"
```

You can also use [as-a](https://github.com/bahmutov/as-a) to set the environment variable during the execution of the command. Place the `CIRCLE_CI_API_TOKEN` in the `~/.as-a/.as-a.ini` file under some section name:

```ini
# ~/.as-a/.as-a.ini file
[circleci-user]
CIRCLE_CI_API_TOKEN=...

# local .as-a.ini file
[run-cy-on-ci]
CIRCLE_CI_ORG=bahmutov
CIRCLE_CI_PROJECT=chat.io
```

```shell
$ as-a circleci-user npx run-cy-on-ci "part of the test title"
```

**Important:** never check in or share the `.as-a.ini` files. Git ignore it as soon as possible.

### CircleCI workflow setup

In your target project, set up [cypress-grep](https://github.com/cypress-io/cypress-grep) in your target project, including CircleCI Workflows with parameters following the blog post [Burn Cypress Tests on CircleCI](https://glebbahmutov.com/blog/burn-tests-on-circle/). For example, see [chat.io config file](https://github.com/bahmutov/chat.io/blob/main/.circleci/config.yml)

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
  # optional spec pattern to pass via "--spec <pattern>"
  SPEC:
    type: string
    default: ''

workflows:
  some-tests:
    # runs the Web tests when the user supplies a grep pattern
    when:
      or:
        - << pipeline.parameters.GREP >>
        - << pipeline.parameters.GREP_TAGS >>
        - << pipeline.parameters.SPEC >>
    jobs:
      - cypress/run:
          name: Filtered E2E tests
          no-workspace: true
          group: 'Test grep: << pipeline.parameters.GREP >>'
          tags: << pipeline.parameters.GREP >>
          spec: '<< pipeline.parameters.SPEC >>'
          env: 'grep="<< pipeline.parameters.GREP >>",grepTags="<< pipeline.parameters.GREP_TAGS >>",grepBurn=<< pipeline.parameters.BURN >>'

  all-tests:
    unless:
      or:
        - << pipeline.parameters.GREP >>
        - << pipeline.parameters.GREP_TAGS >>
        - << pipeline.parameters.SPEC >>
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

After starting the pipeline successfully, it should print the workflows and their URLs

```text
CircleCI pipeline number 130
trigger pipeline successfully
waiting for pipeline to start running...
1 workflow(s) for pipeline 9cb047b5-...
some-tests running https://app.circleci.com/pipelines/.../workflows/2e7f6643-...
```

### Tags

You can run all tests tagged `@smoke` using `--tag @smoke` argument

```shell
$ npx run-cy-on-ci --tag @smoke
# use an alias -t
$ npx run-cy-on-ci -t @smoke
```

### Spec

You can pass the `--spec <pattern>` argument to run one or multiple specs (or use its alias `-s`). **Important:** try the pattern in the target project using the `--spec` CLI arguments. It requires `cypress/integration/...` prefix.

```shell
$ npx run-cy-on-ci --spec cypress/integration/spec1.js
```

To run all spec files in a folder, use wildcard - make sure to quote it to avoid your shell expanding the wildcards to random filenames.

```shell
$ npx run-cy-on-ci --spec 'cypress/integration/featureA/**/*.js'
```

You can also use wildcards in the folders, like this

```shell
$ npx run-cy-on-ci --spec '**/featureB/**/*.js'
```

#### Spec helpers

If there are no `/` or `*` characters in your `--spec` pattern, this utility automatically adds them for friendlier execution.

```
# same as --spec '**/demo.js'
$ npx run-cy-on-ci --spec 'demo.js'
# same as --spec '**/featureA/**/*.*'
$ npx run-cy-on-ci --spec featureA
# run all integration tests, assuming they are in "cypress/integration" folder
$ npx run-cy-on-ci --spec integration
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

### Machines

If your workflow accepts the `MACHINES` parameter for running tests in parallel, you can use the `--machines | -n` parameter

```shell
# run all tests tagged @regression on five machines
$ npx run-cy-on-ci --tag @regression --machines 5
```

### Branch name

You can trigger the workflow on a specific branch (with the fallback to the default branch, if the given branch is not found) using the `--branch` command line argument

```shell
$ npx run-cy-on-ci --grep "my new test" --branch featureA
```

**Tip:** you can get the current branch name using Git v2.22+ like

```shell
$ npx run-cy-on-ci --grep "my new test" --branch $(git branch --show-current)
```

## Additional parameters

You can pass additional parameters to the workflow you are triggering by putting them into `.as-a.ini` file. For example, if your pipeline has the `MESSAGE` parameter, set its value in the file like this:

```init
[run-cy-on-ci]
; CircleCI token to use, grab it at
; https://app.circleci.com/settings/user/tokens
CIRCLE_CI_API_TOKEN=...
; from this folder we want to trigger CircleCI pipeline for
; https://github.com/bahmutov/chat.io
CIRCLE_CI_ORG=bahmutov
CIRCLE_CI_PROJECT=chat.io
; any other parameters to pass to the pipeline
MESSAGE=My friend
```

Note: I have opened an issue [#9](https://github.com/bahmutov/run-cy-on-ci/issues/9) to pass any additional parameters via command line argument `--params`.

## Dry run

You can check if the options are set correctly by using `--dry` argument

```shell
$ npx run-cy-on-ci --tag @demo -n 3 --dry
DRY: launching bahmutov/chat.io with parameters { GREP_TAGS: '@demo', MACHINES: 3 }
```

## 3rd party libraries

- [as-a](https://github.com/bahmutov/as-a) to collect token and config vars
- [trigger-circleci-pipeline](https://github.com/bahmutov/trigger-circleci-pipeline) to trigger pipeline run on CircleCI

## Debugging

This utility uses [debug](https://www.npmjs.com/package/debug) to print verbose logs. Too see them run the tool with the environment variable

```
$ DEBUG=run-cy-on-ci ...
```

If the launched workflow shows `Build Error` then it might be because the target pipeline does not accept the parameters you are sending to it. Check the target CircleCI config file.

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
