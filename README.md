# deno bump version

Version bump tool for deno that matches `npm version` relatively closely.

Notably, this script includes support for prereleases and `--preid`.

Since there is no `package.json`, this tool is concerned with git and expects git tags of the form `v0.0.0` as source of truth.

Also supports `undo`, which soft resets to the previous commit and removes the associated tag (iff it is a version bump). 
Useful when messing up a tag.

## usage

It can be used via command line or as a module. 

To use via **command line**, first install the script 

```sh
deno install --allow-run=git https://deno.land/x/bump_version/bump.ts
```

then run, e.g.

```sh
bump prerelease --preid=beta --sign-git-tag
```

To change the executable name, use `-n`/`--name`:

```sh
deno install --allow-run=git -n version https://deno.land/x/bump_version/bump.ts
```

For more on `deno install`, see [here](https://deno.land/manual@v1.21.0/tools/script_installer).

Usage as **module** expects arguments similar as those provided by `Deno.args`, e.g.: 

```ts
import { bump } from 'https://deno.land/x/bump_version/bump.ts'
await bump('prerelease', '--preid=beta', '--sign-git-tag') 
```
