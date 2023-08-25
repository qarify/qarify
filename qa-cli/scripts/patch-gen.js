import { execa } from "execa";

(async (args) => {
  if (args.length !== 2) {
    console.log('\nUsage:\n patch-gen.js <package-name> <output-directory>\n');
    process.exit(1);
  }

  console.log('>>> Generate patch for ', args[0]);
  const res = await execa(
    "npx",
    ["patch-package", args[0], '--patch-dir', args[1]],
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
