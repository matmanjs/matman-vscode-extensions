import * as vscode from 'vscode';
import * as glob from 'glob';
import {resolve, relative} from 'path';
import {collectCommands, Command, CommandNames} from './common';
import {Information, StatusBar} from '../vscode';
import {decoration, removeDecoration} from '../decoration';
import {LcovParser} from 'incremental-coverage';
import {Info, DetailLines, Total} from '../types';

@collectCommands()
export class FullCoverage extends Command {
  // 嗅探到的覆盖率文件列表
  private lcovList: string[] = [];

  // 用户选择的覆盖率文件路径
  private selectPath = '';

  // 格式化之后的覆盖率数据
  private data: Info = {};

  // DWT 产物文件夹
  private dwtConfigPath: string;

  constructor() {
    super(CommandNames.FULL_COVERAGE);

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
   * 进行覆盖率数据染色的组装逻辑
   */
  private async parseLcov() {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      return;
    }

    const {fileName, lineCount} = editor.document;

    removeDecoration(editor, lineCount);

    await this.getParseData(resolve(this.dwtConfigPath, this.selectPath));

    // 判断是否选择了可以渲染覆盖率的文件
    if (!this.chooseCorrectFile(fileName)) {
      return;
    }

    // 渲染文件
    this.renderFile(fileName, lineCount);

    this.computeCurrentCovRate(fileName);

    this.computeTotalCovRate();
  }

  /**
   * 获取覆盖率数据
   * @param lcovPath 覆盖率文件路径
   */
  private async getParseData(lcovPath: string): Promise<void> {
    this.data = await new LcovParser(lcovPath).run();
  }

  /**
   * 判断当前选择的文件是否存在覆盖率数据
   * @param data
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
   * 渲染文件
   * @param data 覆盖率数据
   * @param fileName 文件名
   * @param lineCount 文件行数
   */
  private renderFile(fileName: string, lineCount: number): any {
    const info = this.data[fileName] as DetailLines;
    const len = info.lines.length;

    // 若文件当前的行数小于lcov所能统计到的有覆盖率的最后一行
    if (lineCount && +info.lines[len - 1].number > lineCount) {
      Information.showWarning('覆盖率文件未更新，渲染测试用例行数有误');
      return;
    }

    // 渲染文件
    info.lines.forEach((detail: any) => {
      decoration(detail.number - 1, +detail.hits);
    });
  }

  /**
   * 计算当前文件覆盖率
   * @param data 覆盖率数据
   * @param fileName 文件名
   */
  private computeCurrentCovRate(fileName: string): void {
    const currentCovRate = (this.data[fileName] as DetailLines).lineRate * 100;

    Information.showInformation(
      `${relative(
        vscode.workspace.rootPath as string,
        fileName,
      )} 覆盖率为: ${currentCovRate.toFixed(2)}%`,
    );
  }

  /**
   * 计算并展示全量覆盖率
   * @param data 覆盖率数据
   */
  private computeTotalCovRate(): void {
    const $ = this.data.$ as Total;
    // 全量覆盖率
    const totalCovRate = ($.linesCovered / $.linesValid) * 100;
    StatusBar.setStatusBar(`全量覆盖率为: ${totalCovRate.toFixed(2)}%`);
  }
}
