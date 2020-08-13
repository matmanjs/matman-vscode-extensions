import * as vscode from 'vscode';
import {resolve} from 'path';
import {getIncrease, FormatData} from 'incremental-coverage';
import {Coverage} from './index';
import {State} from '../state';
import {Information, StatusBar} from '../vscode';
import {decoration, removeDecoration} from '../decoration';

export class IncrementCoverage implements Coverage {
  // 格式化之后的覆盖率数据
  private data: FormatData | undefined;

  // 选择的文件的信息
  private file:
    | {
        name: string;
        increLine?: number | undefined;
        covLine?: number | undefined;
        increRate?: string | undefined;
        detail?:
          | {
              number: number;
              hits: number;
            }[]
          | undefined;
      }
    | undefined;

  /**
   * 执行方法为了实现接口
   */
  async excute() {
    this.parseLcov();
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
    removeDecoration();

    // 获取lcov覆盖率数据
    await this.getParseData(State.getLcov().path, fileName);

    // 判断是否选择了可以计算增量覆盖率的文件
    if (!this.chooseCorrectFile()) {
      return;
    }

    this.computeIncrementCovRate(fileName);
  }

  /**
   * 获取解析好的数据
   * @param lcovPath 覆盖率文件路径
   */
  private async getParseData(
    lcovPath: string,
    fileName: string,
  ): Promise<void> {
    this.data = (await getIncrease(lcovPath, {
      output: false,
      stream: {},
      since: State.getStartTime(),
      cwd: vscode.workspace.rootPath,
    }).catch(e => {
      Information.showError(e);
    })) as FormatData | undefined;

    this.data?.files.forEach(item => {
      const temp = resolve(vscode.workspace.rootPath as string, item.name);
      item.name = temp;

      if (item.name.toLowerCase().includes(fileName.toLowerCase())) {
        this.file = item;
      }
    });
  }

  /**
   * 判断是否选择了正确的文件进行渲染
   * @param fileName
   */
  private chooseCorrectFile(): boolean {
    const flag = this.file;

    if (!flag) {
      Information.showWarning('当前文件未被覆盖！');
    }

    return !!flag;
  }

  /**
   * 计算增量覆盖率
   * @param diffData
   * @param fileName
   */
  private computeIncrementCovRate(fileName: string): void {
    if (fileName && this.file?.increLine) {
      this.computeCurIncrementRate(fileName);

      this.renderFile();
    }

    if (this.data?.total.increLine) {
      StatusBar.setStatusBar(`增量覆盖率为: ${this.data.total.increRate}`);
    }
  }

  /**
   * 计算当前文件增量覆盖率
   * @param fileName
   * @param curCovIncreLine
   * @param curTotalIncreLine
   */
  private computeCurIncrementRate(fileName: string) {
    Information.showInformation(
      `${fileName}的增量覆盖率为: ${this.file?.increRate}`,
    );
  }

  /**
   * 渲染文件
   * @param intersectArr
   * @param lcovLineHit
   */
  private renderFile() {
    this.file?.detail?.forEach(item => {
      decoration(item.number - 1, item.hits);
    });
  }
}
