import * as vscode from 'vscode';
import {resolve, relative} from 'path';
import {collectCommands, Command, CommandNames} from './common';
import {showInformation, showWarning} from '../information';
import {setStatusBar} from '../statusBar';
import {decoration, removeDecoration} from '../decoration';
import {Parser} from '../utils/parser';
import {Info, DetailLines, Total} from '../types/interface';

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
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      return;
    }

    const {fileName} = editor.document;
    const {lineCount} = editor.document;

    removeDecoration(editor, lineCount);

    const data = (await this.getParseData(
      resolve(vscode.workspace.rootPath as string, dwtConfigPath),
    )) as Info;

    // 判断是否选择了可以渲染覆盖率的文件
    const flag = this.chooseCorrectFile(data, fileName);

    if (!flag) {
      return;
    }

    // 渲染文件
    this.renderFile(data, fileName, lineCount);

    this.computeCurrentCovRate(data, fileName);

    this.computeTotalCovRate(data);
  }

  // 获取解析好的数据
  async getParseData(lcovPath: string) {
    return await new Parser(lcovPath).run();
  }

  // 判断是否选择了正确的文件进行渲染
  chooseCorrectFile(data: Info, fileName: string): boolean {
    const flag = data[fileName];

    if (!flag) {
      showWarning('当前文件未被覆盖！');
    }

    return !!flag;
  }

  // 渲染文件
  renderFile(data: Info, fileName: string, lineCount: number): any {
    const info = data[fileName] as DetailLines;
    const len = info.lines.length;

    // 若文件当前的行数小于lcov所能统计到的有覆盖率的最后一行
    if (lineCount && +info.lines[len - 1].number > lineCount) {
      showWarning('覆盖率文件未更新，渲染测试用例行数有误');
      return;
    }

    // 渲染文件
    info.lines.forEach((detail: any) => {
      decoration(detail.number - 1, +detail.hits);
    });
  }

  // 计算当前文件覆盖率
  computeCurrentCovRate(data: Info, fileName: string): void {
    const currentCovRate = (data[fileName] as DetailLines).lineRate * 100;

    showInformation(
      `${relative(
        vscode.workspace.rootPath as string,
        fileName,
      )} 覆盖率为: ${currentCovRate.toFixed(2)}%`,
    );
  }

  // 计算全量覆盖率
  computeTotalCovRate(data: Info): void {
    const $ = data.$ as Total;
    // 全量覆盖率
    const totalCovRate = ($.linesCovered / $.linesValid) * 100;
    setStatusBar(`全量覆盖率为: ${totalCovRate.toFixed(2)}%`);
  }

  async excute() {
    this.parseLocv();
  }
}
