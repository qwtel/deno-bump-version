#!/usr/bin/env -S deno run --allow-run=git

import * as flags from "https://deno.land/std@0.134.0/flags/mod.ts";
import { valid, inc, ReleaseType } from 'https://deno.land/x/semver@v1.4.0/mod.ts'

async function run(cmd: string[]) {
  const p = Deno.run({ 
    cmd, 
    stdout: 'null'
  });
  if (!(await p.status()).success) throw Error(`Couldn't run '${cmd.join(' ')}'`);
}

async function runWithOutput(cmd: string[]) {
  const p = Deno.run({ 
    cmd, 
    stdout: 'piped',
  });
  if (!(await p.status()).success) throw Error(`Couldn't run '${cmd.join(' ')}'`);
  return new TextDecoder().decode(await p.output()).trim()
}

export async function getTags() {
  return (await runWithOutput(['git', 'tags'])).split('\n')
}

export async function getLatestVersion() {
  return (await runWithOutput(['git', 'describe', '--tags', '--abbrev=0']))
    .trim()?.replace(/^v/, '') ?? '0.0.0'
}

export const TYPES: string[] = ["major", "minor", "patch", "premajor", "preminor", "prepatch", "prerelease", "pre"]
export const isReleaseType = (s: string | number): s is ReleaseType => TYPES.includes(s.toString())

export async function bump(...denoArgs: string[]) {
  const { 
    _: args, 
    preid, 
    message, 
    force, 
    help, 
    ['sign-git-tag']: signGitTag,
    ['commit-hooks']: commitHooks = true,
  } = flags.parse(denoArgs, {
    string: ['preid', 'message'],
    boolean: ['force', 'help', 'sign-git-tag', 'allow-same-version'],
    alias: {
      message: ['m'],
      force: ['f'],
    }
  });

  if (help) {
    console.log(`bump.ts

Bump a repo version

Usage:
./bump.ts [major | minor | patch | premajor | preminor | prepatch | prerelease | pre | undo]

Options:
[--no-commit-hooks] [--preid prerelease-id] [--sign-git-tag]
`);
    Deno.exit(0);
  }

  const av = await getLatestVersion();

  if (!valid(av)) throw Error(`Latest git tag (v${av}) not a valid semver version`)

  if (args.length !== 1) throw Error('Provided incorrect number of arguments. Must be 1')

  if (args[0] === 'undo') {
    const head = await runWithOutput(['git', 'describe', 'HEAD'])
    if (head !== `v${av}`) throw Error('Can only undo version if no additional commits have been added')
    await run(['git', 'reset', '--soft', 'HEAD^1'])
    await run(['git', 'tag', '--delete', `v${av}`])
    return `v${await getLatestVersion()}`
  }

  if (!isReleaseType(args[0])) throw Error('First argument must be one of: ' + TYPES.join(', '))
  const release = args[0];

  const next = inc(av, release, {}, preid)

  const changes = await runWithOutput(['git', 'status', '--short'])
  if (!force && changes !== '') throw Error('Working directory not clean. Stash/commit changes or run with --force')

  const gitMsg = message?.replace('%s', next) ?? next;
  await run(['git', 'commit', `-m ${gitMsg}`, '--allow-empty', ...commitHooks ? [] : ['--no-verify']]);
  await run(['git', 'tag', ...signGitTag ? ['-s'] : [], `-m ${gitMsg}`, `v${next}`]);

  return `v${next}`
}

if (import.meta.main) {
  try {
    console.log(await bump(...Deno.args))
    Deno.exit()
  } catch (err) {
    console.error('Error:', err instanceof Error ? err.message : err)
    Deno.exit(1)
  }
}
