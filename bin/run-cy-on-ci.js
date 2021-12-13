#!/usr/bin/env node

const debug = require('debug')('run-cy-on-ci')
const triggerCircle = require('trigger-circleci-pipeline')

const arg = require('arg')
const args = arg({
  '--grep': String,
  '--tags': String,
  '--burn': Number,

  // aliases
  '-g': '--grep',
  '-b': '--burn',
  '-t': '--tags',
  '--tag': '--tags',
})
debug('arguments %o', args)

if (!args['--grep'] && args._.length === 1) {
  debug('user entered just the grep after the command')
  args['--grep'] = args._[0]
}

if (!args['--grep'] && !args['--tags']) {
  console.error('Need part of the title to grep for')
  console.error('--grep <part of title>')
  console.error('or some tags with --tag <tag>')
  process.exit(1)
}

const { getSettings } = require('as-a')
const settings = getSettings('run-cy-on-ci')
debug(
  'got settings for "run-cy-on-ci" with the following keys %o',
  Object.keys(settings),
)

const org = settings.CIRCLE_CI_ORG
const project = settings.CIRCLE_CI_PROJECT
const parameters = {
  GREP: args['--grep'],
  GREP_TAGS: args['--tags'],
  BURN: args['--burn'] || 1,
}
debug('launching %s/%s with parameters %o', org, project, parameters)

triggerCircle
  .triggerPipeline({
    org,
    project,
    parameters,
    circleApiToken: settings.CIRCLE_CI_API_TOKEN,
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
