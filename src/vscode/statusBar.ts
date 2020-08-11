import * as vscode from 'vscode';

export class StatusBar {
  static setStatusBar(info: string): void {
    vscode.window.setStatusBarMessage(info);
  }
}
