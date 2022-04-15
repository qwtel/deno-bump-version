# deno bump version

Version bump tool for deno that matches npm version closesly.


Notably, this script includes support for prereleases and `--preid`.

Unlike npm version, also supports `undo`, which soft resets to the previous commit and removes the associated tag (iff it is a version bump). 
Useful when messing up the arguments.

Since there is no `package.json`, this tool is concerend with git and expects git tags of the form `v0.0.0` as source of truth.

It can be used via command line or as a module. Usage as module expects argumenst similar to `Deno.args`, e.g.: 

```ts
import { bump } from 'https://ghuc.cc/qwtel/deno-bump-version/bump.ts'
await bump('prerelease', '--preid=beta', '--sign-git-tag')
```

To use via command line, first install

```sh
curl -L 'https://ghuc.cc/qwtel/deno-bump-version/bump.ts' > /usr/local/bin/bump.ts
```

then run, e.g.

```sh
bump.ts --help
```
