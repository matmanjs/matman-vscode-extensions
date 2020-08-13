import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as dayjs from 'dayjs';
import * as glob from 'glob';
import * as md5 from 'md5';

interface LcovlistItem {
  name: string;
  path: string;
  md5: string;
}

export class State {
  /**
   * 得到 lcov.info 列表
   */
  private static initLcovlist = () => {
    const rootPath = vscode.workspace.rootPath as string;
    const tempList: LcovlistItem[] = [];

    glob
      .sync('**/lcov.info', {
        cwd: rootPath,
        dot: true,
        ignore: ['**/node_modules/**', '**/src/**', '**/DevOps/**'],
      })
      .forEach(item => {
        const temp: LcovlistItem = {name: '', path: '', md5: ''};
        temp.name = item;
        temp.path = path.resolve(rootPath, item);
        temp.md5 = md5(fs.readFileSync(temp.path));

        tempList.push(temp);
      });

    return tempList;
  };

  // 是否使用全量覆盖率染色
  private static full: boolean = false;

  // 是否使用增量覆盖率染色
  private static increase: boolean = false;

  // 增量覆盖率开始时间
  private static startTime: string = dayjs()
    .startOf('month')
    .format('YYYY-MM-DD');

  // 覆盖率文件列表
  private static lcovlist = State.initLcovlist();

  // 当前选择的文件
  private static lcovIndex = 0;

  static getFull = () => {
    return State.full;
  };

  static setFull = (full: boolean) => {
    State.full = full;
  };

  static getIncrease = () => {
    return State.increase;
  };

  static setIncrease = (increase: boolean) => {
    State.increase = increase;
  };

  static getStartTime = () => {
    return State.startTime;
  };

  static setStartTime = (time: string) => {
    State.startTime = time;
  };

  static getLcovlist = () => {
    // 文件不存在或者 md5 数值不一致则重新加载
    for (const item of State.lcovlist) {
      if (
        !fs.existsSync(item.path) ||
        md5(fs.readFileSync(item.path)) !== item.md5
      ) {
        State.lcovlist = State.initLcovlist();
        return State.lcovlist;
      }
    }

    return State.lcovlist;
  };

  static getLcov = () => {
    return State.lcovlist[State.lcovIndex];
  };

  static setLcov = (name: string) => {
    State.lcovIndex = State.lcovlist.findIndex(item => item.name === name);
  };
}
