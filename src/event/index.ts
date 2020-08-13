import * as vscode from 'vscode';
import {State} from '../state';
import {FullCoverage, IncrementCoverage} from '../coverage';

export function registerExtensionEvevtListener() {
  vscode.workspace.onDidOpenTextDocument(e => {
    if (State.getFull() && e.fileName.match(/.*\.git$/)) {
      new FullCoverage().excute();
    }

    if (State.getIncrease() && e.fileName.match(/.*\.git$/)) {
      new IncrementCoverage().excute();
    }
  });
}
