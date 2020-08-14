import * as vscode from 'vscode';
import {collectCommands, Command, CommandNames} from './common';
import {worker} from 'cluster';

@collectCommands()
export class ExecJavascript extends Command {
  constructor() {
    super(CommandNames.EXEC_JAVASCRIPT);
  }

  /**
   * 执行方法为了实现接口
   */
  async excute() {
    await vscode.workspace.saveAll();

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const {fileName} = editor.document;
    let terminal = vscode.window.activeTerminal;
    if (!terminal) {
      terminal = vscode.window.createTerminal();
    }

    terminal.show();
    terminal.sendText(`node ${fileName}`, true);
  }
}
