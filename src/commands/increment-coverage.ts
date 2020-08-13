import * as vscode from 'vscode';
import * as glob from 'glob';
import {resolve} from 'path';
import {getIncrease, FormatData} from 'incremental-coverage';
import {collectCommands, Command, CommandNames} from './common';
import {Information, StatusBar} from '../vscode';
import {decoration, removeDecoration} from '../decoration';
import {StateMachine} from '../utils/chooseState';

@collectCommands()
export class IncrementCoverage extends Command {
  // 嗅探到的覆盖率文件列表
  private lcovList: string[] = [];

  // 用户选择的覆盖率文件路径
  private selectPath = '';

  // 开始计算增量的日期
  private time = '';

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
    const {path, time} = await new StateMachine(this.lcovList).run();

    this.selectPath = path;
    this.time = time;
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
    await this.getParseData(
      resolve(this.dwtConfigPath, this.selectPath),
      fileName,
    );

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
      since: this.time,
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
