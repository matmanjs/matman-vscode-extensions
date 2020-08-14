import * as vscode from 'vscode';
import {resolve, relative} from 'path';
import {LcovParser, Locv} from 'incremental-coverage';
import {Coverage} from './index';
import {State} from '../state';
import {Information, StatusBar} from '../vscode';
import {decoration, removeDecoration} from '../decoration';

export class FullCoverage implements Coverage {
  // 格式化之后的覆盖率数据
  private data: Locv = {detail: {}};

  /**
   * 执行方法为了实现接口
   */
  async excute() {
    this.parseLcov();
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

    removeDecoration();

    await this.getParseData(State.getLcov().path);

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

    Object.keys(this.data.detail).forEach(item => {
      const temp = resolve(vscode.workspace.rootPath as string, item);
      this.data.detail[temp] = this.data.detail[item];
    });
  }

  /**
   * 判断当前选择的文件是否存在覆盖率数据
   * @param data
   * @param fileName
   */
  private chooseCorrectFile(fileName: string): boolean {
    const flag = this.data.detail[fileName];

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
    const info = this.data.detail[fileName];
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
    const currentCovRate = this.data.detail[fileName].lineRate * 100;

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
    const $ = this.data.$;
    // 全量覆盖率
    const totalCovRate = (($?.linesCovered || 0) / ($?.linesValid || 1)) * 100;
    StatusBar.setStatusBar(`全量覆盖率为: ${totalCovRate.toFixed(2)}%`);
  }
}
