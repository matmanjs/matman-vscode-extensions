import * as vscode from 'vscode';

const commands = [
  {
    command: 'matman.showfullcoverage',
    title: '显示全量覆盖率',
  },
  {
    command: 'matman.hidefullcoverage',
    title: '隐藏全量覆盖率',
  },
  {
    command: 'matman.showincrementcoverage',
    title: '显示增量覆盖率',
  },
  {
    command: 'matman.hideincrementcoverage',
    title: '隐藏增量覆盖率',
  },
];

export class CommandItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly command: vscode.Command,
  ) {
    super(label);
  }
}

export class MatmanConverageProvider
  implements vscode.TreeDataProvider<CommandItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    CommandItem | undefined | void
  > = new vscode.EventEmitter<CommandItem | undefined | void>();

  readonly onDidChangeTreeData: vscode.Event<
    CommandItem | undefined | void
  > = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: CommandItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: CommandItem): Thenable<CommandItem[]> {
    if (element) {
      return Promise.resolve([]);
    }

    const items: CommandItem[] = [];
    commands.forEach(command => {
      items.push(
        new CommandItem(command.title, {
          title: command.title,
          command: command.command,
        }),
      );
    });

    return Promise.resolve(items);
  }
}
