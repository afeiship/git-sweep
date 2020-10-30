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
  'development',
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
      !program.interactive && this.run();
    },
    run() {
      exec('git checkout master && git fetch --all --prune');
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
    delete(inScope, inItems) {
      const scope = `${inScope}s`;
      const items = inItems || this.branches[scope];
      if (!inItems && program.interactive) {
        inquirer
          .prompt([
            {
              type: 'checkbox',
              message: 'Select scope?',
              name: scope,
              choices: this.branches[scope]
            }
          ])
          .then((res) => {
            this[inScope](res[scope]);
          });
      } else {
        const cmd =
          inScope === 'local'
            ? (item) => `git branch -D ${item}`
            : (item) => `git push origin --delete ${item}`;

        items.forEach((item) => this.execute(item, cmd(item)));
      }
    },
    local(inItems) {
      this.delete('local', inItems);
    },
    remote(inItems) {
      this.delete('remote', inItems);
    }
  }
});
