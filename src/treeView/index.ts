import * as vscode from 'vscode';
import {MatmanConverageProvider} from './converageView';

export function registerExtensionTreeView() {
  const nodeDependenciesProvider = new MatmanConverageProvider();

  vscode.window.registerTreeDataProvider(
    'matman.treeView',
    nodeDependenciesProvider,
  );
}
