// @ts-check

/**
 * @file Creates CJS files from each JS file in the directories.
 */

// @ts-expect-error
import * as nodeFs from 'node:fs';
// @ts-expect-error
import * as nodePath from 'node:path';

/** @type {{argv: string[]}} */
// @ts-expect-error
const nodeJsProcess = process;

/**
 * @type {{
 *   readdirSync: (path: string, options?: {recursive?: boolean}) => readonly string[]
 *   readFileSync: (path: string, options: {encoding: 'utf8'}) => string
 *   writeFileSync: (path: string, data: string) => void
 * }}
 */
const {readFileSync, readdirSync, writeFileSync} = nodeFs;
/**
 * @type {{
 *   join: (...paths: readonly string[]) => string
 * }}
 */
const {join} = nodePath;

const paths = nodeJsProcess.argv.slice(2);

for (const path of paths) {
  const fileNames = readdirSync(path, {recursive: true});

  for (const fileName of fileNames) {
    if (!fileName.endsWith('.js')) {
      continue;
    }

    const filePath = join(path, fileName);
    let fileContent = readFileSync(filePath, {encoding: 'utf8'});

    fileContent = fileContent.replace(
      /^import {([^}]+)} from ([^;]*);/gim,
      (_match, names, modulePath) =>
        `const {${names.replaceAll(' as ', ': ')}} = require(${modulePath.replace('.js', '.cjs')});`,
    );

    fileContent = fileContent.replace(
      /^export {([^}]+)} from ([^;]*);/gim,
      (_match, names, modulePath) =>
        `{\nconst {${names}} = require(${modulePath.replace('.js', '.cjs')});\nObject.assign(exports, {${names}});\n};`,
    );

    fileContent = fileContent.replace(
      /^export const ([^ ]+) /gim,
      (_match, name) => `const ${name} = exports.${name} `,
    );

    fileContent = `'use strict';\n${fileContent}`;

    const newFilePath = `${filePath.slice(0, -3)}.cjs`;

    writeFileSync(newFilePath, fileContent);
  }
}
