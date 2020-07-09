import * as vscode from 'vscode';

export function setStatusBar(info: string): void {
  vscode.window.setStatusBarMessage(info);
}
