# run-cy-on-ci
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
  BURN:
    type: integer
    default: 1

workflows:
  some-tests:
    # runs the Web tests when the user supplies a grep pattern
    when: << pipeline.parameters.GREP >>
    jobs:
      - cypress/run:
          name: Filtered E2E tests
          no-workspace: true
          group: 'Test grep: << pipeline.parameters.GREP >>'
          tags: << pipeline.parameters.GREP >>
          env: 'grep="<< pipeline.parameters.GREP >>",grepBurn=<< pipeline.parameters.BURN >>'

  all-tests:
    unless: << pipeline.parameters.GREP >>
    jobs:
      # normal build and test workflow
```

## Use

Any time you want to launch a specific test by title

```shell
$ npx run-cy-on-ci "part of the test title"
```

If you want to run that test N times

```shell
$ npx run-cy-on-ci "part of the test title" --burn N
```

## 3rd party libraries

- [as-a](https://github.com/bahmutov/as-a) to collect token and config vars
- [trigger-circleci-pipeline](https://github.com/bahmutov/trigger-circleci-pipeline) to trigger pipeline run on CircleCI

## Debugging

This utility uses [debug](https://www.npmjs.com/package/debug) to print verbose logs. Too see them run the tool with the environment variable

```
$ DEBUG=run-cy-on-ci ...
```
