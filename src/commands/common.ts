import {commands, Disposable, ExtensionContext} from 'vscode';

/**
 * 命令的抽象类
 * 要求实现 excute 抽象方法
 */
export abstract class Command implements Disposable {
  private _dispose: Disposable;

  constructor(name: string) {
    this._dispose = commands.registerCommand(name, (...args: any[]) => {
      this.excute(...args);
    });
  }

  dispose() {
    if (this._dispose) {
      this._dispose.dispose();
    }
  }

  abstract excute(...args: any[]): any;
}

/**
 * Command 接口需要进行实现
 */
interface CommandConstructor {
  new (): Command;
}

/**
 * 需要注册的命令的列表
 */
const commandsConstructor: CommandConstructor[] = [];

/**
 * 收集命令
 * 作为类装饰器使用
 */
export function collectCommands(): ClassDecorator {
  return (target: any): void => {
    commandsConstructor.push(target);
  };
}

/**
 * 注册插件
 * @param context vscode 上下文
 */
export function registerExtensionCommands(context: ExtensionContext) {
  commandsConstructor.forEach(C => {
    context.subscriptions.push(new C());
  });
}

export enum CommandNames {
  FULL_COVERAGE = 'matman.fullcoverage',
  INCREMENT_COVERAGE = 'matman.incrementcoverage',
}
