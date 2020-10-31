#!/usr/bin/env node
const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');

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

const dynamicBranches = (inItems) => {
  return inItems.map((item) => {
    return {
      name: item,
      value: item,
      disabled: PROTECTED_BRANCHES.includes(item)
    };
  });
};

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
      console.log(chalk.green('🚗 wating...'));
      exec('git checkout master 2>/dev/null && git fetch --all --prune');
      if (program.local && program.remote) {
        this.local().then(() => {
          this.remote();
        });
      } else {
        program.local && this.local();
        program.remote && this.remote();
      }
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
          console.log(chalk.green('[debug]:'), chalk.bgRed(inCmd));
        } else {
          exec(inCmd);
        }
      }
    },
    delete(inScope, inItems) {
      const scope = `${inScope}s`;
      const items = inItems || this.branches[scope];
      return new Promise((resolve) => {
        if (!inItems && program.interactive) {
          inquirer
            .prompt([
              {
                type: 'checkbox',
                message: `Select ${inScope} scope?`,
                name: scope,
                choices: dynamicBranches(this.branches[scope])
              }
            ])
            .then((res) => {
              return this[inScope](res[scope]).then(resolve);
            });
        } else {
          const cmd =
            inScope === 'local'
              ? (item) => `git branch -D ${item}`
              : (item) => `git push origin --delete ${item}`;

          items.forEach((item) => this.execute(item, cmd(item)));
          resolve();
        }
      });
    },
    local(inItems) {
      return this.delete('local', inItems);
    },
    remote(inItems) {
      return this.delete('remote', inItems);
    }
  }
});
