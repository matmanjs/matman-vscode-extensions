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
3. 重新启动 VSCode 后，若 extension 中有 matman 项，则说明安装成功。

![image-20200817200814100](http://picture.wghtstudio.cn/image-20200817200814100.png)

## 使用插件

### 覆盖率查看

点击 `command(ctrl)+shift+P` 打开 VSCode 的命令面板，输入 matman，可以看到下面 4 条命令：

![image-20200817202121545](http://picture.wghtstudio.cn/image-20200817202121545.png)

选择对应的命令即可通过高亮某些行的方式，展现代码覆盖率

- 仅支持项目中存在 lcov.info 文件的项目
- 不支持多个工作区

运行之后当你打开文件时，会呈现覆盖率信息：

![image-20200817212414868](http://picture.wghtstudio.cn/image-20200817212414868.png)

### 代码运行

在 TS 或者 JS 文件中点击右键，可以看到：

<img src="http://picture.wghtstudio.cn/image-20200817212531131.png" alt="image-20200817212531131" style="zoom:33%;" />

可以方便的执行当前文件。

## 补全列表

|         名称          |        指令        |                  描述                  |
| :-------------------: | :----------------: | :------------------------------------: |
| Matman Init Puppeteer |     matman-tpl     | 生成 matman 测试文件（基于 puppeteer） |
|   Matman Add Action   |   matman-action    |              添加 action               |
|     Matman Debug      |    matman-debug    |           生成可本地运行代码           |
|   Matman Mocha Test   | matman-mocha-debug |              生成测试文件              |
|    Matman Describe    |  matman-describe   |         生成 action 验证代码块         |
