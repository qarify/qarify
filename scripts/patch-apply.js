import { execAsync } from "./exec-async.js";

(async (args) => {
  if (args.length !== 1) {
    console.log('\nUsage:\n patch-apply.js <patch-directory>\n');
    process.exit(1);
  }

  console.log('>>> Apply patch(s) under', args[0]);
  const exitCode = await execAsync(
    "npx",
    ["patch-package", '--patch-dir', args[0], '--error-on-fail'],
    {
      stdio: "inherit",
    }
  );
  if (exitCode !== 0) {
    console.error('!!! Failed with Exit Code,', exitCode);
    process.exit(typeof exitCode === 'string' ? 1 : exitCode);
  } else {
    console.log('>>> DONE.');
  }
})(process.argv.slice(2));
