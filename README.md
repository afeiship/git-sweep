# git-sweep
> Git branch sweep cli.

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
