import * as vscode from 'vscode';
import {getOS, getFileSeparator} from '../utils/os';

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
  const platform = getOS();
  let lcovPath: string = '';

  if (platform === 'MAC OS') {
    lcovPath = vscode.workspace.rootPath + getFileSeparator() + dwtConfigPath;
  } else if (platform === 'Windows') {
    dwtConfigPath = dwtConfigPath.replace(/\//g, '\\');
    lcovPath = vscode.workspace.rootPath + getFileSeparator() + dwtConfigPath;
  }

  return lcovPath;
}
