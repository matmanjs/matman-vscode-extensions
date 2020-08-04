# matman-snippets

本插件为 matman 自动化测试提供支持，会持续进行能力拓展。

## Features

### Step One（已完成）

- [x] 代码片段补全
- [x] 覆盖率测试染色

### Step Two

- [ ] ...

## Extension Settings

- dwt.coverage.lcovpath：产物所在的文件夹

## Known Issues

暂时仅仅提供代码片段

## Release Notes

### 0.0.2

提供覆盖率测试染色

### 0.0.1

提供代码补全功能

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

![img](https://iwiki.oa.tencent.com/download/attachments/227945054/%E6%88%AA%E5%B1%8F2020-07-04%20%E4%B8%8B%E5%8D%882.47.12.png?version=1&modificationDate=1593845300000&api=v2)



重新启动vscode后，若extension中有DWTHelper项，则说明安装成功：

![img](https://iwiki.oa.tencent.com/download/attachments/227945054/%E6%88%AA%E5%B1%8F2020-07-04%20%E4%B8%8B%E5%8D%882.49.43.png?version=1&modificationDate=1593845558000&api=v2)

## 覆盖率文件配置

vscode选择Settings：

![img](https://iwiki.oa.tencent.com/download/attachments/227945054/%E6%88%AA%E5%B1%8F2020-07-04%20%E4%B8%8B%E5%8D%883.33.46.png?version=1&modificationDate=1593848076000&api=v2)



在搜索框中输入dwt，配置项目中lcov.info文件路径，增量覆盖率对比分支，单元测试执行命令。lcov.info文件路径的默认值为coverage/lcov.info，增量覆盖率对比分支的默认值为master：

![img](https://iwiki.oa.tencent.com/download/attachments/227945054/%E6%88%AA%E5%B1%8F2020-07-09%20%E4%B8%8B%E5%8D%887.16.21.png?version=1&modificationDate=1594293417000&api=v2)

这里有一点需要注意：[lcov.info](http://lcov.info/)文件是在使用jest运行测试用例之后，生成的coverage文件夹内包含的文件。该文件包含了覆盖率信息。



## 使用插件

本插件提供全量覆盖率和增量覆盖率（可选分支）信息展示和代码渲染功能，辅助开发者编写测试代码。



step1: 点击vscode菜单栏view选项，选择Command Palette：

![img](https://iwiki.oa.tencent.com/download/attachments/227945054/%E6%88%AA%E5%B1%8F2020-07-04%20%E4%B8%8B%E5%8D%883.06.22.png?version=1&modificationDate=1593846410000&api=v2)



本插件提供三个指令：

1. Show FullCoverage：展示全量覆盖率信息以及渲染代码区域
2. Show IncrementCoverage：展示未commit代码的增量覆盖率信息以及渲染代码区域
3. Show IncrementCoverage Between Branch：展示对比在settings中配置的git分支的增量覆盖率信息以及渲染代码区域



step2: 选择Command Palette之后，在输入框中输入Show FullCoverage，Show IncrementCoverage或Show IncrementCoverage Between Branch：

![img](https://iwiki.oa.tencent.com/download/attachments/227945054/%E6%88%AA%E5%B1%8F2020-07-09%20%E4%B8%8B%E5%8D%885.24.46.png?version=1&modificationDate=1594286737000&api=v2)



选择Show FullCoverage，则会在ide左下角展示整个项目全量覆盖率，右下角提示信息展示当前选中文件的覆盖率，同时渲染代码区域。绿色为覆盖到的代码，红色为未覆盖到的代码：

![img](https://iwiki.oa.tencent.com/download/attachments/227945054/%E6%88%AA%E5%B1%8F2020-07-04%20%E4%B8%8B%E5%8D%883.10.29.png?version=1&modificationDate=1593846675000&api=v2)



选择Show IncrementCoverage，则会在ide左下角展示整个项目增量覆盖率，右下角提示信息展示当前选中文件的增量覆盖率，同时渲染代码区域。绿色为覆盖到的代码，红色为未覆盖到的代码：

![img](https://iwiki.oa.tencent.com/download/attachments/227945054/%E6%88%AA%E5%B1%8F2020-07-04%20%E4%B8%8B%E5%8D%883.17.23.png?version=2&modificationDate=1593848202000&api=v2)



选择Show IncrementCoverage Between Branch，首先会弹出选择框，用户可选择执行单测或不执行单测：

![img](https://iwiki.oa.tencent.com/download/attachments/227945054/%E6%88%AA%E5%B1%8F2020-07-09%20%E4%B8%8B%E5%8D%885.28.34.png?version=1&modificationDate=1594286963000&api=v2)



若选择执行单测，插件会触发单测执行指令，重新执行单测并计算增量覆盖率，渲染代码区域：

![img](https://iwiki.oa.tencent.com/download/attachments/227945054/%E6%88%AA%E5%B1%8F2020-07-09%20%E4%B8%8B%E5%8D%887.00.55.png?version=1&modificationDate=1594292546000&api=v2)



若选择不执行单测，插件则直接计算增量覆盖率，渲染代码区域：

![img](https://iwiki.oa.tencent.com/download/attachments/227945054/%E6%88%AA%E5%B1%8F2020-07-09%20%E4%B8%8B%E5%8D%887.01.23.png?version=1&modificationDate=1594292770000&api=v2)

### tips：

增量覆盖率的渲染需要执行最新编写的单测后生成lcov.info文件，这样覆盖率文件才会有增量代码的覆盖率信息，之后就可以渲染了。