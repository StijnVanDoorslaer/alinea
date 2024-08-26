import {createId} from 'alinea/core/Id'
import fs from 'node:fs/promises'
import path from 'node:path'
import {writeFileIfContentsDiffer} from '../util/FS.js'
import {GenerateContext} from './GenerateContext.js'

const packageJson = {
  private: true,
  version: '0.0.0',
  name: '@alinea/generated',
  type: 'module',
  sideEffects: false
}

export async function copyStaticFiles({outDir}: GenerateContext) {
  await fs.mkdir(outDir, {recursive: true}).catch(console.log)

  await fs.writeFile(
    path.join(outDir, 'release.js'),
    `export const release = ${JSON.stringify(createId())}`
  )
  await fs.writeFile(
    path.join(outDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  )
  await writeFileIfContentsDiffer(path.join(outDir, 'config.css'), ``)
  // await writeFileIfContentsDiffer(path.join(outDir, '.gitignore'), `*\n!.keep`)*/
  await writeFileIfContentsDiffer(
    path.join(outDir, '.keep'),
    '# Contents of this folder are autogenerated by alinea'
  )
}
