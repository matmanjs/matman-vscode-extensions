import * as vscode from 'vscode';
import * as dayjs from 'dayjs';

enum State {
  init,
  config,
  default,
  noDefault,
  custom,
}

enum IncrementCoverageTypes {
  CURRENT_MONTH = '当前月份增量覆盖率',
  CUSTOM_DATE = '自定义日期增量覆盖率',
}

export class StateMachine {
  state: State;
  time: string;
  lcovList: string[];
  select: string = '';

  constructor(lcovList: string[]) {
    this.lcovList = lcovList;

    this.state = State.init;

    this.time = dayjs().startOf('month').format('YYYY-MM-DD');
  }

  async run() {
    while (this.state !== State.default && this.state !== State.custom) {
      switch (this.state) {
        case State.init: {
          await this.init();
          break;
        }
        case State.config: {
          await this.config();
          break;
        }
        case State.noDefault: {
          await this.noDefault();
          break;
        }
      }
    }

    return {path: this.select, time: this.time};
  }

  private async init() {
    this.select = (await vscode.window.showQuickPick(this.lcovList)) as string;
    this.state = State.config;
  }

  private async config() {
    // https://code.visualstudio.com/api/references/vscode-api#QuickPickItem
    const items: vscode.QuickPickItem[] = [{
      label: IncrementCoverageTypes.CURRENT_MONTH, 
      detail: '计算法方式：以当月1号的第一个 commit 记录为起始点，计算增量覆盖率',
      picked: true
    },{
      label: IncrementCoverageTypes.CUSTOM_DATE, 
      detail: '计算法方式：以指定日期的第一个 commit 记录为起始点，计算增量覆盖率'
    }];

    // https://code.visualstudio.com/api/references/vscode-api
    const select = (await vscode.window.showQuickPick(items, {
      placeHolder: '请选择增量覆盖率计算方式',
    })) as vscode.QuickPickItem;

    if (select.label === IncrementCoverageTypes.CURRENT_MONTH) {
      this.state = State.default;
      return;
    }
    this.state = State.noDefault;
  }

  private async noDefault() {
    let inputData = '';

    while (
      typeof inputData === 'string' &&
      !inputData.match(/\d{4}-\d{2}-\d{2}/)
    ) {
      inputData = (await vscode.window.showInputBox({
        value: this.time,
        prompt: '请输入计算增量覆盖率起始点日期，格式例如：2020-06-01',
      })) as string;
    }

    this.time = inputData;
    this.state = State.custom;
  }
}
