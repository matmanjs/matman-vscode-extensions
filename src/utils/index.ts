import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';

// 获取文件路径
export function getFilePath(fileName: string) {
  // 有的项目info.file会带上整个路径，加一层判断
  const {rootPath} = vscode.workspace;
  let currentPath;

  if (rootPath && fileName.includes(rootPath)) {
    currentPath = fileName.replace(rootPath, '');
  } else {
    currentPath = fileName;
  }

  return currentPath;
}

export function getLcovPath(dwtConfigPath: string) {
  const platform = os.platform();
  let lcovPath: string = '';

  if (platform === 'win32') {
    dwtConfigPath = dwtConfigPath.replace(/\//g, '\\');
    lcovPath = path.join(vscode.workspace.rootPath as string, dwtConfigPath);
  } else {
    lcovPath = path.join(vscode.workspace.rootPath as string, dwtConfigPath);
  }

  return lcovPath;
}
