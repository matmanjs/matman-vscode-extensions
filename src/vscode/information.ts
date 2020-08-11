import * as vscode from 'vscode';

export class Information {
  private static markdownString(info: string): string {
    const mds = new vscode.MarkdownString(info);
    return mds.value;
  }

  static showInformation(info: string): void {
    const mdsValue = Information.markdownString(info);
    vscode.window.showInformationMessage(mdsValue);
  }

  static showWarning(info: string): void {
    const mdsValue = Information.markdownString(info);
    vscode.window.showWarningMessage(mdsValue);
  }

  static showError(info: string): void {
    const mdsValue = Information.markdownString(info);
    vscode.window.showErrorMessage(mdsValue);
  }
}
