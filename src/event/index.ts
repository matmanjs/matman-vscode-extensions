import * as vscode from 'vscode';

export function registerExtensionEvevtListener() {
  vscode.workspace.onDidOpenTextDocument(e => {
    console.log(e.fileName);
  });
}
