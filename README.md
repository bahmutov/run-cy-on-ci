# run-cy-on-ci
> Launch on CI a particular Cypress test using grep or grep tags

## Uses

- [trigger-circleci-pipeline](https://github.com/bahmutov/trigger-circleci-pipeline) to trigger pipeline run on CircleCI

## Debugging

This utility uses [debug](https://www.npmjs.com/package/debug) to print verbose logs. Too see them run the tool with the environment variable

```
$ DEBUG=run-cy-on-ci ...
```
