import * as vscode from 'vscode';
import {State} from '../state';
import {FullCoverage} from '../coverage';

export function registerExtensionEvevtListener() {
  vscode.workspace.onDidOpenTextDocument(e => {
    if (State.getFull() && e.fileName.match(/.*\.git$/)) {
      console.log(e.fileName);

      new FullCoverage().excute();
    }
  });
}
