import fs from 'fs';
import path from 'path';
import prompts from 'prompts';
import chalk from 'chalk';
import * as yargs from 'yargs';

export const command = 'add <package>';

export const desc = 'Add new package to oratrix config';

export const builder = (args: any): void => {
  args.positional('package', {
    describe: 'The name of the new package that will be added',
    type: 'string',
  });
};

export const handler = async (args: yargs.Arguments): Promise<void> => {
  const configPath = path.resolve('.oratrixrc.json');
  // check if a config exists
  const configExists = fs.existsSync(configPath);
  if (!configExists) {
    // config contents as js-object
    const initConfig = {
      version: 1,
      required: [],
      allowed: {},
      packages: [],
    };
    fs.writeFileSync(configPath, JSON.stringify(initConfig, null, 2), {
      encoding: 'utf-8',
    });
    console.log('✨ Config file successfully initialized.');
  } else {
    console.log('✅ Oratrix config found.');
  }

  // load config from disk
  const configJSON = fs.readFileSync(configPath, 'utf-8');
  const config = JSON.parse(configJSON);

  const packageName = args.package;

  // check if package already exists in the config
  const packageExists = config.packages.find(
    (element: any) => element.name === packageName
  );

  if (packageExists) {
    console.log(`❗️ Package '${packageName}' already exists in the config.`);
    return;
  }

  const { category } = await prompts({
    type: 'text',
    name: 'category',
    message: `Category for the '${packageName}' package?`,
  });

  const { npm } = await prompts({
    type: 'text',
    name: 'npm',
    message: `NPM link for the '${packageName}' package?`,
  });

  const packageData = {
    name: packageName,
    category,
    npm,
  };

  // insert package to config
  config.packages.push(packageData);
  console.log(
    `✅ Adding new package ${chalk.bold.green(packageName)} to config.`
  );

  // save updated config to disk
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), {
    encoding: 'utf-8',
  });
  console.log('🎉 Updating config successfully.');
};