import * as vscode from 'vscode';
import {exec} from 'child_process';
import {collectCommands, Command, CommandNames} from './common';
import gitDiffParser, {File} from 'gitdiff-parser';
import {showInformation, showWarning} from '../information';
import {setStatusBar} from '../statusBar';
import {decoration, removeDecoration} from '../decoration';
import {getFilePath, getLcovPath} from '../utils';
import {Detail, Info} from '../types/interface';
import {getOS} from '../utils/os';
// const parse = require('lcov-parse');

@collectCommands()
export class IncrementCoverage extends Command {
  constructor() {
    super(CommandNames.INCREMENT_COVERAGE);
  }
  async parseLocv() {
    const dwtConfigPath = vscode.workspace
      .getConfiguration()
      .get('dwt.coverage.lcovpath', vscode.ConfigurationTarget.Global)
      .toString();
    const lcovPath = getLcovPath(dwtConfigPath);
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      return;
    }

    const {fileName} = editor.document;
    const {lineCount} = editor.document;

    removeDecoration(editor, lineCount);

    // 获取lcov覆盖率数据
    const data = await this.getParseData(lcovPath);

    // 判断是否选择了可以计算增量覆盖率的文件
    const flag = this.chooseCorrectFile(data, fileName);

    if (!flag) {
      return;
    }

    exec(
      'git diff -U0',
      {cwd: vscode.workspace.rootPath},
      (err: any, stdout: any, stderr: any) => {
        if (err) {
          console.log(err);
          return;
        }

        // 获取git diff数据
        const diffData = gitDiffParser.parse(stdout);

        // 判断是否选择了有变动代码的文件
        const diff = this.chooseDiffFile(diffData, fileName);

        if (!diff) {
          return;
        }

        this.computeIncrementCovRate(data, diffData, fileName);
      },
    );
  }

  // 获取解析好的数据
  getParseData(lcovPath: string) {
    return Promise.resolve();
  }

  // 判断是否选择了正确的文件进行渲染
  chooseCorrectFile(data: any, fileName: string): boolean {
    const arr: Array<Info> = data;
    let flag = false;

    arr.forEach((info: Info) => {
      if (
        fileName.toLocaleLowerCase().includes(info.file.toLocaleLowerCase())
      ) {
        flag = true;
      }
    });

    if (!flag) {
      showWarning('当前文件未被覆盖！');
    }

    return flag;
  }

  // 判断选中的文件是否有增量代码
  chooseDiffFile(diffData: File[], fileName: string): boolean {
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
      showWarning('该文件没有增量代码');
    }

    return diff;
  }

  // 计算增量覆盖率
  computeIncrementCovRate(data: any, diffData: File[], fileName: string): void {
    const arr: Array<Info> = data;
    let totalIncreLine: number = 0;
    let covIncreLine: number = 0;

    arr.forEach((info: Info) => {
      diffData.forEach((diffItem: File) => {
        const lcovFilePath: string = info.file;
        const diffFilePath: string = diffItem.newPath;

        if (lcovFilePath === diffFilePath) {
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
          const {details} = info.lines;

          details.forEach((detail: Detail) => {
            const {hit} = detail;
            const {line} = detail;

            lcovLineHit.set(line, hit);
            lcovLineArr.push(line);
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
            fileName.includes(lcovFilePath) &&
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
    });

    if (totalIncreLine) {
      const totalIncreCovRate = (covIncreLine / totalIncreLine) * 100;
      setStatusBar(`增量覆盖率为: ${totalIncreCovRate.toFixed(2)}%`);
    }
  }

  // 计算当前文件增量覆盖率
  computeCurIncrementRate(
    fileName: string,
    curCovIncreLine: number,
    curTotalIncreLine: number,
  ) {
    const curIncreCovRate = (curCovIncreLine / curTotalIncreLine) * 100;
    const currentPath = getFilePath(fileName);

    showInformation(
      `${currentPath}的增量覆盖率为: ${curIncreCovRate.toFixed(2)}%`,
    );
  }

  // 渲染文件
  renderFile(intersectArr: Array<number>, lcovLineHit: any) {
    intersectArr.forEach((line: number) => {
      const hit = lcovLineHit.get(line);
      decoration(line - 1, hit);
    });
  }

  async excute() {
    await this.parseLocv();
  }
}
