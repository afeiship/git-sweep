#!/usr/bin/env node
const { Command } = require('commander');
const inquirer = require('inquirer');

// next packages:
require('@feizheng/next-js-core2');
require('@feizheng/next-absolute-package');
require('@feizheng/next-git-branch');

const { version } = nx.absolutePackage();
const program = new Command();
const exec = require('child_process').execSync;
const PROTECTED_BRANCHES = [
  'master',
  'test',
  'beta',
  'staging',
  'production',
  'release',
  'dev',
  'develop'
];

program.version(version);

program
  .option('-d, --debug', 'only show cmds, but not clean.')
  .option('-l, --local', 'clean scope to local(default).')
  .option('-r, --remote', 'clean scope to remote.')
  .option('-i, --interactive', 'interactive operation cli.')
  .option(
    '-c, --clean <branches>',
    'clean the list branches, split by comma. (eg: branch1,branch2...).'
  )
  .parse(process.argv);

nx.declare({
  statics: {
    init() {
      const app = new this();
      app.start();
    }
  },
  methods: {
    init() {
      this.branches = nx.gitBranch();
    },
    start() {
      program.interactive && this.interactive();
      this.run();
    },
    run() {
      program.local && this.local();
      program.remote && this.remote();
    },
    interactive() {
      inquirer
        .prompt([
          {
            type: 'checkbox',
            message: 'Select scope?',
            name: 'scope',
            choices: ['local', 'remote']
          }
        ])
        .then(({ scope }) => {
          program.remote = scope.includes('remote');
          program.local = scope.includes('local');
          this.run();
        });
    },
    execute(inItem, inCmd) {
      if (!PROTECTED_BRANCHES.includes(inItem)) {
        if (program.debug) {
          console.log('[debug]:', inCmd);
        } else {
          exec(inCmd);
        }
      }
    },
    local() {
      const { locals } = this.branches;
      locals.forEach((item) => {
        this.execute(item, `git branch -d ${item}`);
      });
    },
    remote() {
      const { remotes } = this.branches;
      remotes.forEach((item) => {
        this.execute(item, `git push origin --delete ${item}`);
      });
    }
  }
});
