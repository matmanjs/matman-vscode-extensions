import * as vscode from 'vscode';
import {readFileSync} from 'fs';
import {parseStringPromise} from 'xml2js';
import {collectCommands, Command, CommandNames} from './common';
import {showInformation, showWarning} from '../information';
import {setStatusBar} from '../statusBar';
import {decoration, removeDecoration} from '../decoration';
import {getFilePath, getLcovPath} from '../utils';
import {Detail, Info} from '../types/interface';

@collectCommands()
export class FullCoverage extends Command {
  constructor() {
    super(CommandNames.FULL_COVERAGE);
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

    const data = await this.getParseData(
      vscode.workspace.rootPath +
        '/.dwt_output/unit_test_report/coverage/cobertura-coverage.xml',
    );

    console.log(data);

    // // 判断是否选择了可以渲染覆盖率的文件
    // const flag = this.chooseCorrectFile(data, fileName);

    // if (!flag) {
    //   return;
    // }

    // // 渲染文件并获取当前文件的文件名，hit行数，总行数
    // const [curFile, curHit, curFound] = this.renderFile(
    //   data,
    //   fileName,
    //   lineCount,
    // );

    // this.computeCurrentCovRate(curFile, curHit, curFound);

    // this.computeTotalCovRate(data);
  }

  // 获取解析好的数据
  getParseData(lcovPath: string) {
    return parseStringPromise(readFileSync(lcovPath));
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

  // 渲染文件
  renderFile(data: any, fileName: string, lineCount: number): any {
    const arr: Array<Info> = data;
    let curFile: string = '';
    let curHit: number = 0;
    let curFound: number = 0;

    arr.forEach((info: Info) => {
      // 找到当前选中的文件
      if (
        fileName.toLocaleLowerCase().includes(info.file.toLocaleLowerCase())
      ) {
        const {lines} = info;
        const {details} = lines;
        const len = details.length;

        curFile = info.file;
        curHit = lines.hit;
        curFound = lines.found;

        // 若文件当前的行数小于lcov所能统计到的有覆盖率的最后一行
        if (lineCount && details[len - 1].line > lineCount) {
          showWarning('覆盖率文件未更新，渲染测试用例行数有误');
          return;
        }

        // 渲染文件
        details.forEach((detail: Detail) => {
          decoration(detail.line - 1, detail.hit);
        });
      }
    });

    return [curFile, curHit, curFound];
  }

  // 计算当前文件覆盖率
  computeCurrentCovRate(fileName: string, hit: number, found: number): void {
    const currentCovRate = (hit / found) * 100;
    const currentPath = getFilePath(fileName);

    showInformation(`${currentPath}覆盖率为: ${currentCovRate.toFixed(2)}%`);
  }

  // 计算全量覆盖率
  computeTotalCovRate(data: any): void {
    const arr: Array<Info> = data;

    // 统计总行数以及hit到的行数
    let totalFound = 0;
    let totalHit = 0;

    arr.forEach((info: Info) => {
      totalFound += info.lines.found;
      totalHit += info.lines.hit;
    });

    // 全量覆盖率
    const totalCovRate = (totalHit / totalFound) * 100;
    setStatusBar(`全量覆盖率为: ${totalCovRate.toFixed(2)}%`);
  }

  async excute() {
    this.parseLocv();
  }
}
