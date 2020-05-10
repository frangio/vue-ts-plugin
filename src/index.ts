import { parse as sfcParse } from '@vue/compiler-sfc';
import path from 'path';
import fs from 'fs';

function isVue(filename: string): boolean {
  return path.extname(filename) === '.vue';
}

function parse(text: string) {
  const output = sfcParse(text, { pad: "space" });
  return output.descriptor.script?.content ?? '';
}

function parseScriptSnapshot(orig: ts.IScriptSnapshot): ts.IScriptSnapshot {
  const parsed: ts.IScriptSnapshot = Object.create(orig);
  parsed.getText = (start, end) => parse(orig.getText(0, orig.getLength())).slice(start, end);
  return parsed;
}

function init({ typescript: ts } : { typescript: typeof import('typescript/lib/tsserverlibrary') }): ts.server.PluginModule {
  const clssf = ts.createLanguageServiceSourceFile;
  const ulssf = ts.updateLanguageServiceSourceFile;

  Object.assign(ts, { createLanguageServiceSourceFile, updateLanguageServiceSourceFile });

  return { create, getExternalFiles };

  function create(info: ts.server.PluginCreateInfo) {
    return info.languageService;
  }

  function getExternalFiles(project: ts.server.ConfiguredProject): string[] {
    const result: string[] = [];
    project.projectService.openFiles.forEach((_, filename) => {
      if (isVue(filename)) {
        result.push(filename);
      }
    });
    return result;
  }

  function createLanguageServiceSourceFile(fileName: string, scriptSnapshot: ts.IScriptSnapshot, scriptTarget: ts.ScriptTarget, version: string, setNodeParents: boolean, scriptKind?: ts.ScriptKind, cheat?: string): ts.SourceFile {
    if (isVue(fileName)) {
      scriptSnapshot = parseScriptSnapshot(scriptSnapshot);
    }
    return clssf(fileName, scriptSnapshot, scriptTarget, version, setNodeParents, scriptKind);
  }

  function updateLanguageServiceSourceFile(sourceFile: ts.SourceFile, scriptSnapshot: ts.IScriptSnapshot, version: string, textChangeRange?: ts.TextChangeRange, aggressiveChecks?: boolean, cheat?: string): ts.SourceFile {
    if (isVue(sourceFile.fileName)) {
      scriptSnapshot = parseScriptSnapshot(scriptSnapshot);
    }
    return ulssf(sourceFile, scriptSnapshot, version, textChangeRange, aggressiveChecks);
  }
}

export = init;
