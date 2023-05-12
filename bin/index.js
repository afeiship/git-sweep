#!/usr/bin/env node
const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');

// next packages:
require('@jswork/next');
require('@jswork/next-absolute-package');
require('@jswork/next-git-branch');
require('@jswork/next-unique');

const { version } = nx.absolutePackage();
const program = new Command();
const exec = require('child_process').execSync;
const PROTECTED_BRANCHES = [
  'master',
  'test',
  'alpha',
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
  .option('-f, --filter <string>', 'clean by filter.(eg: -f feature/aric)')
  .option('-i, --interactive', 'interactive operation cli.')
  .option('-p, --pushed <list>', 'add protected to default.(eg: -p uat,test1).')
  .option('-k, --clean-gh', 'clean github tags+release.')
  .option(
    '-c, --created <list>',
    'use new list replace default(dangerous).(eg: -c uat,test1).'
  )
  .parse(process.argv);

nx.declare({
  statics: {
    init() {
      const app = new this();
      app.start();
    }
  },
  properties: {
    protected() {
      program.pushed &&
        program.created &&
        nx.error('Push/create only exsist one action.');

      switch (true) {
        case !!program.pushed:
          return nx.unique(
            program.pushed.split(',').concat(PROTECTED_BRANCHES)
          );
        case !!program.created:
          return nx.unique(program.created.split(','));
        default:
          return PROTECTED_BRANCHES;
      }
    }
  },
  methods: {
    init() {
      this.branches = nx.gitBranch();
    },
    start() {
      if (program.cleanGh) return this.cleanGh();
      if (program.local || program.remote) {
        program.interactive && this.interactive();
        !program.interactive && this.run();
      } else {
        console.log(chalk.green('🐶 local/remote at least has one.'));
      }
    },
    cleanGh() {
      // clean local tags
      const pipes1 = ['git tag -l', 'xargs git tag -d'];
      const pipes2 = [
        'git ls-remote --tags origin',
        'grep -v "{}"',
        "awk '{print $2}'",
        'xargs git push --delete origin'
      ];
      const pipes3 = [
        'gh release list --limit 9999',
        "awk 'NR>1 {print $2}'",
        'xargs -I {} gh release delete {} -y'
      ];

      const cmds = [pipes1, pipes2, pipes3];
      cmds.forEach((pipes) => this.execute(null, pipes.join(' | ')));
      console.log(chalk.green('🐶 clean gh done.'));
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
    dynamicBranches(inItems) {
      return inItems.map((item) => {
        return {
          name: item,
          value: item,
          disabled: this.protected.includes(item)
        };
      });
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
      const force = inItem === null;
      if (!this.protected.includes(inItem)) {
        if (force || inItem.includes(program.filter) || !program.filter) {
          if (program.debug) {
            console.log(chalk.green('[debug]:'), chalk.bgRed(inCmd));
          } else {
            exec(inCmd);
          }
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
                choices: this.dynamicBranches(this.branches[scope])
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
