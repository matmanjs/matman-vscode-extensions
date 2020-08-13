import {collectCommands, Command, CommandNames} from './common';
import {State} from '../state';
import {IncrementCoverage} from '../coverage';
import {removeDecoration} from '../decoration';
import {Information} from '../vscode';
import {StateMachine} from '../utils/chooseState';

@collectCommands()
export class ShowIncrementCoverage extends Command {
  constructor() {
    super(CommandNames.SHOW_INCREMENT_COVERAGE);
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

    const {path, time} = await new StateMachine(list).run();

    // 设置状态
    State.setLcov(path);
    State.setStartTime(time);
    State.setIncrease(true);
    State.setFull(false);

    // 执行渲染
    new IncrementCoverage().excute();
  }
}

@collectCommands()
export class HideIncrementCoverage extends Command {
  constructor() {
    super(CommandNames.HIDE_INCREMENT_COVERAGE);
  }

  /**
   * 执行方法为了实现接口
   */
  async excute() {
    State.setIncrease(false);
    removeDecoration();
  }
}
