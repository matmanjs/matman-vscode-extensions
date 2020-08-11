import * as vscode from 'vscode';
import {resolve} from 'path';
import {exec} from 'child_process';
import * as glob from 'glob';
import * as dayjs from 'dayjs';
import {gitlogPromise} from 'gitlog';
import {File} from 'gitdiff-parser';
import {collectCommands, Command, CommandNames} from './common';
import {Information, StatusBar} from '../vscode';
import {decoration, removeDecoration} from '../decoration';
import {getFilePath} from '../utils';
import {LcovParser} from '../utils/lcovParser';
import {Info, DetailLines} from '../types';
import {getOS} from '../utils/os';

import gitdiffParser = require('gitdiff-parser');

@collectCommands()
export class IncrementCoverage extends Command {
  // 嗅探到的覆盖率文件列表
  private lcovList: string[] = [];

  // 用户选择的覆盖率文件路径
  private selectPath = '';

  // 格式化之后的覆盖率数据
  private data: Info = {};

  // DWT 产物文件夹
  dwtConfigPath: string;

  constructor() {
    super(CommandNames.INCREMENT_COVERAGE);

    this.dwtConfigPath = vscode.workspace
      .getConfiguration()
      .get('dwt.coverage.lcovpath', vscode.ConfigurationTarget.Global)
      .toString();

    this.dwtConfigPath = resolve(
      vscode.workspace.rootPath as string,
      this.dwtConfigPath,
    );
  }

  /**
   * 执行方法为了实现接口
   */
  async excute() {
    this.getAllLcov();

    if (this.lcovList.length === 0) {
      Information.showWarning('没有任何测试覆盖率文件, 请先运行测试');
      return;
    }

    await this.showQuickPick();

    this.parseLcov();
  }

  /**
   * 得到所有的覆盖率文件路径
   */
  private getAllLcov() {
    this.lcovList = glob.sync('./**/lcov.info', {
      cwd: this.dwtConfigPath,
    });
  }

  /**
   * 展示提示面板
   */
  async showQuickPick() {
    this.selectPath = (await vscode.window.showQuickPick(
      this.lcovList,
    )) as string;
  }

  /**
   * 组装逻辑
   */
  private async parseLcov() {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      return;
    }

    const {fileName, lineCount} = editor.document;
    removeDecoration(editor, lineCount);

    // 获取lcov覆盖率数据
    await this.getParseData(resolve(this.dwtConfigPath, this.selectPath));

    // 判断是否选择了可以计算增量覆盖率的文件
    if (!this.chooseCorrectFile(fileName)) {
      return;
    }

    // 得到指定的 hash 值
    const hash = await this.getGitHash();

    const res: string = await new Promise((resolve, reject) => {
      exec(
        `git diff ${hash}`,
        {cwd: vscode.workspace.rootPath},
        (err, stdout) => {
          if (err) {
            console.log(err);
            reject(err);
          }
          resolve(stdout);
        },
      );
    });

    // 获取git diff数据
    // @ts-ignore
    const diffData: File[] = gitdiffParser.parse(res);

    // 判断是否选择了有变动代码的文件
    if (!this.chooseDiffFile(diffData, fileName)) {
      return;
    }

    this.computeIncrementCovRate(diffData, fileName);
  }

  /**
   * 获取解析好的数据
   * @param lcovPath 覆盖率文件路径
   */
  private async getParseData(lcovPath: string): Promise<void> {
    this.data = await new LcovParser(lcovPath).run();
  }

  /**
   * 判断是否选择了正确的文件进行渲染
   * @param fileName
   */
  private chooseCorrectFile(fileName: string): boolean {
    const flag = this.data[fileName];

    if (!flag) {
      Information.showWarning('当前文件未被覆盖！');
    }

    return !!flag;
  }

  /**
   * 得到 EPC 要求的 git hash
   */
  private async getGitHash() {
    const startDay = dayjs().startOf('month').format('YYYY-MM-DD');

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      Information.showWarning('Please Open Folders');
      return '';
    }

    const log = await gitlogPromise({
      repo: workspaceFolders[0].uri.path,
      since: startDay,
      number: 10000,
    });

    return log[log.length - 1].hash;
  }

  /**
   * 判断选中的文件是否有增量代码
   * @param diffData
   * @param fileName
   */
  private chooseDiffFile(diffData: File[], fileName: string): boolean {
    let diff = false;

    diffData.forEach((diffItem: File) => {
      const platform = getOS();
      if (platform === 'Windows') {
        diffItem.newPath = diffItem.newPath.replace(/\//g, '\\');
      }
      if (
        fileName
          .toLocaleLowerCase()
          .includes(diffItem.newPath.toLocaleLowerCase())
      ) {
        diff = true;
      }
    });

    if (!diff) {
      Information.showWarning('该文件没有增量代码');
    }

    return diff;
  }

  /**
   * 计算增量覆盖率
   * @param diffData
   * @param fileName
   */
  private computeIncrementCovRate(diffData: File[], fileName: string): void {
    let totalIncreLine: number = 0;
    let covIncreLine: number = 0;

    diffData.forEach(diffItem => {
      const diffFilePath: string = diffItem.newPath;

      if (
        fileName
          .toLocaleLowerCase()
          .includes(diffItem.newPath.toLocaleLowerCase())
      ) {
        console.log(diffItem);
        const info = this.data[fileName] as DetailLines;

        let curTotalIncreLine: number = 0;
        let curCovIncreLine: number = 0;

        // 统计变换了的行号
        const diffLineArr: Array<number> = [];

        diffItem.hunks.forEach(hunk => {
          hunk.changes.forEach(change => {
            if (change.type === 'insert' && change.lineNumber) {
              diffLineArr.push(change.lineNumber);
            }
          });
        });

        // 统计每行对应的hit数
        const lcovLineHit = new Map();

        // 统计lcov中有记录的行
        const lcovLineArr: Array<number> = [];
        const details = info.lines;

        details.forEach(detail => {
          const {hits} = detail;
          const {number} = detail;

          lcovLineHit.set(number, hits);
          lcovLineArr.push(parseInt(number));
        });

        // 求lcov与diff的交集
        const diffLineArrSet = new Set(diffLineArr);
        const intersectArr = lcovLineArr.filter(x => diffLineArrSet.has(x));

        intersectArr.forEach((line: number) => {
          covIncreLine += lcovLineHit.get(line) > 0 ? 1 : 0;
          curCovIncreLine += lcovLineHit.get(line) > 0 ? 1 : 0;
        });

        totalIncreLine += intersectArr.length;
        curTotalIncreLine += intersectArr.length;

        if (
          fileName.includes(fileName) &&
          fileName.includes(diffFilePath) &&
          intersectArr.length
        ) {
          this.computeCurIncrementRate(
            fileName,
            curCovIncreLine,
            curTotalIncreLine,
          );
          this.renderFile(intersectArr, lcovLineHit);
        }
      }
    });

    if (totalIncreLine) {
      const totalIncreCovRate = (covIncreLine / totalIncreLine) * 100;
      StatusBar.setStatusBar(`增量覆盖率为: ${totalIncreCovRate.toFixed(2)}%`);
    }
  }

  /**
   * 计算当前文件增量覆盖率
   * @param fileName
   * @param curCovIncreLine
   * @param curTotalIncreLine
   */
  private computeCurIncrementRate(
    fileName: string,
    curCovIncreLine: number,
    curTotalIncreLine: number,
  ) {
    const curIncreCovRate = (curCovIncreLine / curTotalIncreLine) * 100;
    const currentPath = getFilePath(fileName);

    Information.showInformation(
      `${currentPath}的增量覆盖率为: ${curIncreCovRate.toFixed(2)}%`,
    );
  }

  /**
   * 渲染文件
   * @param intersectArr
   * @param lcovLineHit
   */
  private renderFile(intersectArr: Array<number>, lcovLineHit: any) {
    intersectArr.forEach((line: number) => {
      const hit = lcovLineHit.get(line);
      decoration(line - 1, hit);
    });
  }
}
