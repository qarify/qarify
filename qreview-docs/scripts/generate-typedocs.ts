import fs from 'fs/promises';
import path from 'path';
import jsonschema2mk from 'jsonschema2mk';
import { exec } from 'child_process';

const schemasDir = path.resolve(process.cwd(), '../../packages/types/schemas');
const outputDir = path.resolve(process.cwd(), 'docs/reference/types');

async function listSchemaFiles(dir: string): Promise<string[]> {
  const files = await fs.readdir(dir);
  return files.filter((file) => file.endsWith('.schema.json'));
}

async function generate() {
  try {
    const schemaFiles = await listSchemaFiles(schemasDir);
    for (const schemaFile of schemaFiles) {
      const cliPath = getDependencyPackageDir('jsonschema2mk');
      if (!cliPath) {
        throw new Error('jsonschema2mk not found in node_modules');
      }
      const cmd = `${cliPath}/cli.js --schema ${path.join(schemasDir, schemaFile)}`;

      await new Promise<void>((resolve, reject) => {
        console.log(`Converting ${schemaFile} to ${schemaFile.replace('.schema.json', '.md')}`);

        exec(`node ${cmd}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing cli.js: ${error}`);
            reject(error);
            return;
          }
          // console.log('stdout:', stdout);
          // console.log('stderr:', stderr);
          resolve();
        });
      });
    }

    // await fs.mkdir(outputDir, { recursive: true });
    // const files = await fs.readdir(schemasDir);

    // for (const file of files) {
    //   if (file.endsWith('.schema.json')) {
    //     const schemaPath = path.join(schemasDir, file);
    //     console.log(`Converting ${file} to ${file.replace('.schema.json', '.md')}`);

    //     const schemaContent = await fs.readFile(schemaPath, 'utf-8');
    //     const schema = JSON.parse(schemaContent);
    //     console.log('>>>>>>>>>>>>>>> schema:', schema);

    //     const jsm = jsonschema2mk({
    //       level: 0,
    //     });
    //     const markdown = jsm.convert(schema);
    //     console.log('>>>>>>>>>>>>>>> markdown:', markdown);

    //     const outputFileName = file.replace('.schema.json', '.md');
    //     const outputPath = path.join(outputDir, outputFileName);

    //     await fs.writeFile(outputPath, markdown.markdown, 'utf-8');
    //     console.log(`Generated: ${outputFileName}`);
    //   }
    // }
    console.log('Type definitions documentation generated successfully.');
  } catch (error) {
    console.error('Error generating type definitions documentation:', error);
    process.exit(1);
  }
}

function getDependencyPackageDir(packageName: string): string | null {
  try {
    // Resolve the path to the package's package.json.
    // The `require.resolve` function follows the standard Node.js module resolution
    // algorithm to find the location of the file. By appending '/package.json',
    // we ensure we're targeting the package's main manifest file.
    const packageJsonPath = require.resolve(`${packageName}/package.json`);

    // The directory containing package.json is the package's root directory.
    const packageDir = path.dirname(packageJsonPath);

    return packageDir;
  } catch (error) {
    // require.resolve throws an error if the module can't be found.
    // We catch it and return null to indicate failure.
    console.error(`Could not find package "${packageName}". Is it installed in your node_modules?`);
    return null;
  }
}

// run
generate().catch(console.error);
