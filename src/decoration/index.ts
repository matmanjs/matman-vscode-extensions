import * as vscode from 'vscode';

const DecorationArr: any[] = [];

function createDecorationType(
  hit: boolean,
  theme: number,
): vscode.TextEditorDecorationType {
  if (hit) {
    return vscode.window.createTextEditorDecorationType({
      backgroundColor: theme === 1 ? '#48D36D' : '#006400',
    });
  }
  return vscode.window.createTextEditorDecorationType({
    backgroundColor: theme === 1 ? '#F084C8' : '#800000',
  });
}

function setDecoration(
  editor: vscode.TextEditor,
  decorationType: vscode.TextEditorDecorationType,
  line: number,
): void {
  editor.setDecorations(decorationType, [
    new vscode.Range(line, 0, line, editor.document.lineAt(line).text.length),
  ]);
}

export function decoration(line: number, hit: number): void {
  // 获取vscode主题
  const theme: number = vscode.window.activeColorTheme.kind;

  // 设置hit到的行数的背景色
  const hitDecorationType = createDecorationType(true, theme);

  // 设置没有hit到的行数的背景色
  const unHitDecorationType = createDecorationType(false, theme);

  const editor = vscode.window.activeTextEditor;

  if (editor) {
    if (hit) {
      setDecoration(editor, hitDecorationType, line);
      DecorationArr.push(hitDecorationType);
    } else {
      setDecoration(editor, unHitDecorationType, line);
      DecorationArr.push(unHitDecorationType);
    }
  }
}

export function removeDecoration(editor: vscode.TextEditor, lineCount: number) {
  DecorationArr.forEach(obj => {
    obj.dispose();
  });
}
