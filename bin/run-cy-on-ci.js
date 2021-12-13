#!/usr/bin/env node

const debug = require('debug')('run-cy-on-ci')
const triggerCircle = require('trigger-circleci-pipeline')

const arg = require('arg')
const args = arg({
  '--grep': String,
  '--tags': String,
  '--burn': Number,
  '--machines': Number,
  '--dry': Boolean,

  // aliases
  '-g': '--grep',
  '-b': '--burn',
  '-t': '--tags',
  '--tag': '--tags',
  '-n': '--machines',
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
// only set the parameters the user passed in
// this is useful to avoid sending parameters the target CircleCI pipeline
// does not expect (like BURN or parallelization)
const parameters = {}
if (args['--grep']) {
  parameters.GREP = args['--grep']
}
if (args['--tags']) {
  parameters.GREP_TAGS = args['--tags']
}
if (args['--burn']) {
  if (args['--burn'] < 1) {
    console.error('--burn must be >= 1')
    process.exit(1)
  }
  parameters.BURN = args['--burn']
}
if (args['--machines']) {
  if (args['--machines'] < 1) {
    console.error('--machines must be >= 1')
    process.exit(1)
  }
  parameters.MACHINES = args['--machines']
}

if (args['--dry']) {
  console.log(
    'DRY: launching %s/%s with parameters %o',
    org,
    project,
    parameters,
  )
} else {
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
}
