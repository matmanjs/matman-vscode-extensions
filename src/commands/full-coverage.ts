import * as vscode from 'vscode';
import {readFileSync} from 'fs';
import {resolve} from 'path';
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
        '/.dwt_output/e2e_test_report/coverage/cobertura-coverage.xml',
    );

    // 判断是否选择了可以渲染覆盖率的文件
    const flag = this.chooseCorrectFile(data, fileName);

    if (!flag) {
      return;
    }

    // 渲染文件
    this.renderFile(data, fileName, lineCount);

    // this.computeCurrentCovRate(curFile, curHit, curFound);

    // this.computeTotalCovRate(data);
  }

  // 获取解析好的数据
  async getParseData(lcovPath: string) {
    const resMap: Record<string, any> = {};
    const xml = await parseStringPromise(readFileSync(lcovPath));
    const callPath = xml.coverage.sources[0].source[0];
    const classes = xml.coverage.packages[0].package.map(
      (item: any) => item.classes[0].class,
    );

    for (const item of classes) {
      item.map((item: any) => {
        resMap[resolve(callPath, item.$.filename) as string] = {
          lineRate: item.$['line-rate'],
          lines: item.lines[0].line.map((item: any) => item.$),
        };
      });
    }

    return {total: xml.coverage.$, files: resMap};
  }

  // 判断是否选择了正确的文件进行渲染
  chooseCorrectFile(data: any, fileName: string): boolean {
    const flag = data.files[fileName];

    if (!flag) {
      showWarning('当前文件未被覆盖！');
    }

    return flag;
  }

  // 渲染文件
  renderFile(data: any, fileName: string, lineCount: number): any {
    const info = data.files[fileName];
    const len = info.lines.length;

    // 若文件当前的行数小于lcov所能统计到的有覆盖率的最后一行
    if (lineCount && info.lines[len - 1].number > lineCount) {
      showWarning('覆盖率文件未更新，渲染测试用例行数有误');
      return;
    }

    // 渲染文件
    info.lines.forEach((detail: any) => {
      decoration(detail.number - 1, +detail.hits);
    });
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
