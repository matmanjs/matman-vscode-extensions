# matman-vscode-plugin

本插件为 matman 自动化测试提供支持，会持续进行能力拓展。

## Features

### Step Two（已完成）

- [x] 代码片段补全增加 Mocha、Chai 的片段
- [x] 完成增量覆盖率的染色
- [x] 更换渲染逻辑，无需频繁命令启动
- [x] 增加一键执行功能

### Step One（已完成）

- [x] 代码片段补全
- [x] 覆盖率测试染色

## Known Issues

暂时没有已知问题，欢迎大家提交 [issue]()

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

-----------------------------------------------------------------------------------------------------------

## 补全列表

|         名称          |        指令        |                  描述                  |
| :-------------------: | :----------------: | :------------------------------------: |
| Matman Init Puppeteer |     matman-tpl     | 生成 matman 测试文件（基于 puppeteer） |
|   Matman Add Action   |   matman-action    |              添加 action               |
|     Matman Debug      |    matman-debug    |           生成可本地运行代码           |
|   Matman Mocha Test   | matman-mocha-debug |              生成测试文件              |
|    Matman Describe    |  matman-describe   |         生成 action 验证代码块         |

***

## 安装插件

打开vscode，点击左边栏extension项，点击边栏右上角三点，选择Install from VSIX，选择刚才下载到本地的dwt-1.0.2.vsix文件：

重新启动vscode后，若extension中有DWTHelper项，则说明安装成功：

## 覆盖率文件配置

vscode选择Settings：

在搜索框中输入dwt，配置项目中lcov.info文件路径，增量覆盖率对比分支，单元测试执行命令。lcov.info文件路径的默认值为coverage/lcov.info，增量覆盖率对比分支的默认值为master：

这里有一点需要注意：[lcov.info](http://lcov.info/)文件是在使用jest运行测试用例之后，生成的coverage文件夹内包含的文件。该文件包含了覆盖率信息。



## 使用插件

本插件提供全量覆盖率和增量覆盖率（可选分支）信息展示和代码渲染功能，辅助开发者编写测试代码。

step1: 点击vscode菜单栏view选项，选择Command Palette：

本插件提供三个指令：

1. Show FullCoverage：展示全量覆盖率信息以及渲染代码区域
2. Show IncrementCoverage：展示未commit代码的增量覆盖率信息以及渲染代码区域

step2: 选择Command Palette之后，在输入框中输入Show FullCoverage，Show IncrementCoverage：

选择Show FullCoverage，则会在ide左下角展示整个项目全量覆盖率，右下角提示信息展示当前选中文件的覆盖率，同时渲染代码区域。绿色为覆盖到的代码，红色为未覆盖到的代码：

选择Show IncrementCoverage，则会在ide左下角展示整个项目增量覆盖率，右下角提示信息展示当前选中文件的增量覆盖率，同时渲染代码区域。绿色为覆盖到的代码，红色为未覆盖到的代码：

### tips：

增量覆盖率的渲染需要执行最新编写的单测后生成lcov.info文件，这样覆盖率文件才会有增量代码的覆盖率信息，之后就可以渲染了。