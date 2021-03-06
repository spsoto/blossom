/**
 * Copyright (c) The Blossom GraphQL Team.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import program, { Command } from 'commander';

import generateTypes from './codegen/types';
import generateRoot from './codegen/root';
import generateSources from './codegen/sources';
import generateResolvers from './codegen/resolvers';
import generateResources from './codegen/resources';

function addCommonOptions(program: Command) {
  return program
    .option('-f, --file <file>', 'Input GraphQL SDL from file.')
    .option('--stdin', 'Input GraphQL SDL from stdin.')
    .option('--stdout', 'Output result to stdout.')
    .option('-r, --recursive', 'Build files for all involved dependencies.')
    .option(
      '-o, --output-file [file]',
      'Path to the output file. If none specified, defaults to <filename>.types.ts.',
    );
}

addCommonOptions(
  program
    .command('types')
    .alias('t')
    .description('Generates types from a GraphQL SDL.'),
).action(generateTypes);

addCommonOptions(
  program
    .command('root')
    .alias('ro')
    .description('Generates root values from a GraphQL SDL.'),
).action(generateRoot);

addCommonOptions(
  program
    .command('sources')
    .alias('s')
    .description('Generates **example** sources generators (e.g. loaders) from a GraphQL SDL.'),
).action(generateSources);

addCommonOptions(
  program
    .command('resolvers')
    .alias('re')
    .description('Generates **example** resolvers from a GraphQL SDL.'),
).action(generateResolvers);

addCommonOptions(
  program
    .command('resources')
    .alias('r')
    .description('Generates types, root, resolvers and loaders from a GraphQL SDL.'),
).action(generateResources);

program.parse(process.argv);

// Shpw help when there are no arguments
if (!program.args.length) program.help();

// Show help when command is invalid
program.on('command:*', () => {
  program.help();
  process.exit(1);
});
