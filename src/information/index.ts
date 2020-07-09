import * as vscode from 'vscode';

function markdownString(info: string): string {
  const mds = new vscode.MarkdownString(info);
  return mds.value;
}

export function showInformation(info: string): void {
  const mdsValue = markdownString(info);
  vscode.window.showInformationMessage(mdsValue);
}

export function showWarning(info: string): void {
  const mdsValue = markdownString(info);
  vscode.window.showWarningMessage(mdsValue);
}

export function showError(info: string): void {
  const mdsValue = markdownString(info);
  vscode.window.showErrorMessage(mdsValue);
}
