import * as vscode from 'vscode';
import {collectCommands, Command, CommandNames} from './common';
import {State} from '../state';
import {FullCoverage} from '../coverage';
import {removeDecoration} from '../decoration';
import {Information} from '../vscode';

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
    if (list.length === 0) {
      Information.showWarning('项目中未找到测试覆盖率 lcov.info 文件, 请先运行测试命令生成 lcov.info 文件！');
      return;
    }

    const res = (await vscode.window.showQuickPick(list, {
      placeHolder: '请选择覆盖率文件',
    })) as string;

    // 设置状态
    State.setLcov(res);
    State.setFull(true);
    State.setIncrease(false);

    // 执行渲染
    new FullCoverage().excute();
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
