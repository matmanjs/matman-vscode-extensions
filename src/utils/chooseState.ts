import * as vscode from 'vscode';
import * as dayjs from 'dayjs';

enum State {
  init,
  config,
  default,
  noDefault,
  custom,
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
    const select = (await vscode.window.showQuickPick(['YES', 'NO'], {
      placeHolder: '是否使用默认配置',
    })) as string;

    if (select === 'YES') {
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
        placeHolder: '请输入形如: 2020-06-01 的时间格式',
      })) as string;
    }

    this.time = inputData;
    this.state = State.custom;
  }
}
