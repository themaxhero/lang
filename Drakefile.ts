import {
  desc,
  task,
  run,
  glob,
  quote,
  env,
  sh,
} from "https://deno.land/x/drake@v1.2.5/mod.ts";

const srcs = ["Drakefile.ts", ...glob("src/**/*.ts")];
const tests = srcs.filter((a) => a.endsWith("_test.ts"));

desc("Run unit tests");
task("test", [], async () => sh("deno test -A --unstable"));

for (const file of tests) {
  desc(`Run unit tests for ${file}`);
  task(`test:${file}`, [], async () => sh(`deno test -A --unstable ${file}`));
}

desc("Lint scripts source files");
task("lint", [], async () => sh(`deno lint --unstable ${quote(srcs)}`));

desc("Format scripts source files");
task("fmt", [], async () => sh(`deno fmt ${quote(srcs)}`));

desc("Install pre-commit hook");
task("hook", [".git/hooks/pre-commit"], async () => null);

env("--default-task", "test");
run();
