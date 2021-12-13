#!/usr/bin/env node

const debug = require('debug')('run-cy-on-ci')
const triggerCircle = require('trigger-circleci-pipeline')

const arg = require('arg')
const args = arg({
  '--grep': String,
  '--burn': Number,

  // aliases
  '-g': '--grep',
  '-b': '--burn'
})
debug('arguments %o', args)

if (!args['--grep'] && args._.length === 1) {
  debug('user entered just the grep after the command')
  args['--grep'] = args._[0]
}

if (!args['--grep']) {
  console.error('Need part of the title to grep for')
  console.error('--grep <part of title>')
  process.exit(1)
}

const { getSettings } = require('as-a')
const settings = getSettings('.')
debug('got settings with the following keys %o', Object.keys(settings))

triggerCircle.triggerPipeline({
  org: settings.CIRCLE_CI_ORG,
  project: settings.CIRCLE_CI_PROJECT,
  parameters: {
    GREP: args['--grep'],
    BURN: args['--burn'] || 1,
  },
  circleApiToken: settings.CIRCLE_CI_API_TOKEN
}).catch(err => {
  console.error(err)
  process.exit(1)
})
