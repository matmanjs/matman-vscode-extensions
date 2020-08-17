# matman-vscode-plugin

本插件为 matman 自动化测试提供支持，会 `持续` 进行能力拓展。

## Features

### Step Two（已完成）

- [x] 代码片段补全增加 Mocha、Chai 的片段
- [x] 完成增量覆盖率的染色
- [x] 更换渲染逻辑，无需频繁命令启动
- [x] 增加 `一键执行功能`

### Step One（已完成）

- [x] 代码片段补全
- [x] 覆盖率测试染色

## Known Issues

暂时没有已知问题，欢迎大家提交 [issue](https://github.com/matmanjs/vscode-plugin/issues/new)

## Release Notes

### 0.2.1

- 增加一键执行功能


### 0.2.0

- 代码片段补全增加 Mocha、Chai 的片段
- 完成增量覆盖率的染色
- 更换渲染逻辑，无需频繁命令启动

### 0.0.2

- 提供覆盖率测试染色

### 0.0.1

- 提供代码补全功能

***

## 补全列表

|         名称          |        指令        |                  描述                  |
| :-------------------: | :----------------: | :------------------------------------: |
| Matman Init Puppeteer |     matman-tpl     | 生成 matman 测试文件（基于 puppeteer） |
|   Matman Add Action   |   matman-action    |              添加 action               |
|     Matman Debug      |    matman-debug    |           生成可本地运行代码           |
|   Matman Mocha Test   | matman-mocha-debug |              生成测试文件              |
|    Matman Describe    |  matman-describe   |         生成 action 验证代码块         |

## 安装插件

### 直接安装

> 暂时未上架

### 编译安装

1. 克隆本仓库，运行下面的命令，得到 `matman-0.2.1.vsix` 文件：

```bash
$ npm install

$ npm run package
```

2. 打开 VSCode，点击左边栏 `extension` 项，点击边栏右上角三点，选择 `Install from VSIX`，选择刚才编译好的 `matman-0.2.1.vsix` 文件。
3. 重新启动 VSCode 后，若 extension 中有 matman 项，则说明安装成功。