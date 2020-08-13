import * as vscode from 'vscode';
import {collectCommands, Command, CommandNames} from './common';
import {State} from '../state';
import {removeDecoration} from '../decoration';

@collectCommands()
export class ShowFullCoverage extends Command {
  constructor() {
    super(CommandNames.SHOW_FULL_COVERAGE);
  }

  /**
   * 执行方法为了实现接口
   */
  async excute() {
    // 选择文件
    const list = State.getLcovlist().map(item => item.name);
    const res = (await vscode.window.showQuickPick(list, {
      placeHolder: '请选择覆盖率文件',
    })) as string;

    // 设置状态
    State.setLcov(res);
    State.setFull(true);
    State.setIncrease(false);
  }
}

@collectCommands()
export class HideFullCoverage extends Command {
  constructor() {
    super(CommandNames.HIDE_FULL_COVERAGE);
  }

  /**
   * 执行方法为了实现接口
   */
  async excute() {
    State.setFull(false);
    removeDecoration();
  }
}
