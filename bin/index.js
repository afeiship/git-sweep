#!/usr/bin/env node
const { Command } = require("commander");

// next packages:
require("@feizheng/next-js-core2");
require("@feizheng/next-absolute-package");
require("@feizheng/next-git-branch");

const { version } = nx.absolutePackage();
const program = new Command();

program.version(version);

program
  .option("-l, --local", "clean scope to local(default).")
  .option("-r, --remote", "clean scope to remote.")
  .option("-a, --all", "clean scope to all.")
  .option("-i, --interactive", "interactive operation cli.")
  .option("-c, --clean <branches>", "clean the list branches, split by comma. (eg: branch1,branch2...).")
  .parse(process.argv);

console.log(program.local);
console.log(program.remote);
console.log(program.all);
console.log(program.clean);

nx.declare({
  statics: {
    init() {
      console.log("start");
      console.log(nx.gitBranch());
    },
  },
});
