#!/usr/bin/env node

const debug = require('debug')('run-cy-on-ci')

const arg = require('arg')
const args = arg({
  '--grep': String,

  // aliases
  '-g': '--grep',
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
console.log(settings)
