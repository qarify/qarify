import { execAsync } from "./exec-async.js";

(async (args) => {
  if (args.length !== 2) {
    console.log('\nUsage:\n patch-gen.js <package-name> <output-directory>\n');
    process.exit(1);
  }

  console.log('>>> Generate patch for ', args[0]);
  const exitCode = await execAsync(
    "npx",
    ["patch-package", args[0], '--patch-dir', args[1]],
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
