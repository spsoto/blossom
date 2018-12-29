/**
 * Copyright (c) The Blossom GraphQL Team.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

import * as ts from 'typescript';
import { DocumentNode, parse } from 'graphql';
import cosmiconfig from 'cosmiconfig';
import prettier from 'prettier';

import { parseDocumentNode } from '../../lib/parsing';
import { generateTypeAlias } from '../../lib/codegen';

import { appPath } from '../../lib/paths';
import VERSION from '../../version';

function getDocument(file: string): DocumentNode | undefined {
  try {
    return parse(readFileSync(file).toString('utf-8'));
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('Was an error with the syntax.');
      return undefined;
    } else {
      throw error;
    }
  }
}

function defaultOutputFile(originalFilePath: string): string {
  const parsedPath = path.parse(originalFilePath);
  const baseFileName = parsedPath.name.split('.')[0];

  return path.join(parsedPath.dir, `${baseFileName}.types.ts`);
}

export default async function generateTypes(options: {
  file?: string;
  stdin?: boolean;
  stdout?: boolean;
  outputFile?: string | boolean;
}) {
  let fullInputFilePath: string = path.join(process.cwd(), 'schema.gql');

  // Parse document
  let document: DocumentNode | undefined;

  if (options.stdin) {
    throw new Error('Implement me.');
  } else if (options.file) {
    fullInputFilePath = appPath(options.file);
    document = getDocument(appPath(options.file));
  } else {
    throw new Error('An input for the SDL must be specified.');
  }

  if (!document) {
    throw new Error('No valid document. Aborting.');
  }

  const parsing = parseDocumentNode(document);

  const resultFile = ts.createSourceFile(
    'test.ts',
    '',
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS,
  );

  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
  });

  const autoGeneratedComment = `/**
 * Autogenerated with Blossom Toolbelt v${VERSION}.
 *
 * DO NOT MODIFY UNLESS YOU KNOW WHAT YOU ARE DOING.
 */

import { GraphQLResolveInfo } from 'graphql';
import { Maybe } from '@blossom-gql/core';
`;

  const printedNodes: string[] = [...parsing.objects, ...parsing.inputs].map(
    object =>
      printer.printNode(
        ts.EmitHint.Unspecified,
        generateTypeAlias(object),
        resultFile,
      ),
  );

  const generatedFile = [autoGeneratedComment, ...printedNodes].join('\n\n');

  // Use prettier! Retrieve config first
  const prettierConfigExplorer = cosmiconfig('prettier');

  let prettierConfig: any = {};

  try {
    const result = await prettierConfigExplorer.search();

    if (result && !result.isEmpty) {
      prettierConfig = result.config;
    }
  } catch (error) {
    // Prettier settings not found
    // TODO: Logging.
  }

  const formattedFile = prettier.format(generatedFile, {
    parser: 'babylon',
    ...prettierConfig,
  });

  if (options.stdout) {
    console.log(formattedFile);
  } else {
    writeFileSync(defaultOutputFile(fullInputFilePath), formattedFile);
  }
}
