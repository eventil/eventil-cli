#!/usr/bin/env node

import meow from 'meow'
import { h, render } from 'ink'

import Eventil from './Eventil'

const cli = meow(`
   Usage
     $ eventil

   Live search for the upcoming tech events such as conferences and meetups.
   Use keyboard to search through event list.
   Use up/down to select events.
   Click enter to open the event page in the browser.
`, {
    flags: { }
  })

const main = () => {
  let unmount // eslint-disable-line prefer-const

  const onError = () => {
    unmount()
    process.exit(1)
  }

  const onExit = () => {
    unmount()
    process.exit()
  }

  const { dev } = cli.flags

  // Uses `h` instead of JSX to avoid transpiling this file
  unmount = render(h(Eventil, { dev, onError, onExit }))
}

main()
