import * as vscode from 'vscode';
import {registerExtensionCommands} from './commands';
import {registerExtensionEvevtListener} from './event';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  registerExtensionCommands(context);
  registerExtensionEvevtListener();
}

// this method is called when your extension is deactivated
export function deactivate() {}
