# git-sweep
> Git branch sweep cli.

[![version][version-image]][version-url]
[![license][license-image]][license-url]
[![size][size-image]][size-url]
[![download][download-image]][download-url]

![snapshot](https://tva1.sinaimg.cn/large/0081Kckwgy1gk7gn80s4dj30vm0hm7wh.jpg)

## usage
```shell
# debug
git clone git@github.com:afeiship/git-sweep.git
npm link

# production
npm install -g git-sweep
```

~~~
Usage: git-sweep [options]

Options:
  -V, --version      output the version number
  -d, --debug        only show cmds, but not clean.
  -l, --local        clean scope to local(default).
  -r, --remote       clean scope to remote.
  -i, --interactive  interactive operation cli.
  -h, --help         display help for command
~~~

## resources
- https://github.com/eridem/cli-tutorial


## license
Code released under [the MIT license](https://github.com/afeiship/git-sweep/blob/master/LICENSE.txt).

[version-image]: https://img.shields.io/npm/v/@feizheng/git-sweep
[version-url]: https://npmjs.org/package/@feizheng/git-sweep

[license-image]: https://img.shields.io/npm/l/@feizheng/git-sweep
[license-url]: https://github.com/afeiship/git-sweep/blob/master/LICENSE.txt

[size-image]: https://img.shields.io/bundlephobia/minzip/@feizheng/git-sweep
[size-url]: https://github.com/afeiship/git-sweep/blob/master/dist/git-sweep.min.js

[download-image]: https://img.shields.io/npm/dm/@feizheng/git-sweep
[download-url]: https://www.npmjs.com/package/@feizheng/git-sweep
