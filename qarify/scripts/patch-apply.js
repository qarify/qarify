import { execa } from "execa";

(async (args) => {
  if (args.length !== 1) {
    console.log('\nUsage:\n patch-apply.js <patch-directory>\n');
    process.exit(1);
  }

  console.log('>>> Apply patch(s) under', args[0]);
  const res = await execa(
    "npx",
    ["patch-package", '--patch-dir', args[0], '--error-on-fail'],
    {
      stdio: "inherit",
    }
  );
  if (res.exitCode !== 0) {
    console.error('!!! Failed with Exit Code,', res);
    process.exit(res.exitCode);
  } else {
    console.log('>>> DONE.');
  }
})(process.argv.slice(2));
