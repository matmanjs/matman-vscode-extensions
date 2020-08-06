import * as fs from 'fs';
import * as path from 'path';
import * as xml2js from 'xml2js';

export class Parser {
  path = '';
  resMap: any;

  constructor(path: string) {
    this.path = path;
    this.resMap = {};
  }

  /**
   * 处理每个文件的命中次数, 注意有时需要合并
   * @param {*} item
   * @param {*} callPath
   */
  dealClass(item: any, callPath: string) {
    if (!this.resMap[path.resolve(callPath, item.$.filename)]) {
      this.resMap[path.resolve(callPath, item.$.filename)] = {
        lines: item.lines[0].line.map((item: any) => ({
          ...item.$,
          hits: parseInt(item.$.hits),
        })),
      };
    } else {
      const temp = this.resMap[path.resolve(callPath, item.$.filename)].lines;
      item.lines[0].line.forEach((item: any) => {
        const res = temp.find((tempItem: any) => {
          return tempItem.number === item.$.number;
        });
        res.hits += parseInt(item.$.hits);
      });
    }
  }

  /**
   * 处理单文件结果
   * @param {*} xml
   */
  parserSingle(xml: any) {
    const callPath = xml.coverage.sources[0].source[0];
    const classes = xml.coverage.packages[0].class;

    for (const item of classes) {
      if (Array.isArray(item)) {
        item.forEach(item => {
          this.dealClass(item, callPath);
        });
      } else {
        this.dealClass(item, callPath);
      }
    }
  }

  /**
   * 处理多文件结果
   * @param {*} xml
   */
  parserMultiple(xml: any) {
    const callPath = xml.coverage.sources[0].source[0];
    const classes = xml.coverage.packages[0].package.map(
      (item: any) => item.classes[0].class,
    );

    for (const item of classes) {
      if (Array.isArray(item)) {
        item.forEach(item => {
          this.dealClass(item, callPath);
        });
      } else {
        this.dealClass(item, callPath);
      }
    }
  }

  async run() {
    const promiseArray = [
      // xml2js.parseStringPromise(
      //   fs.readFileSync(
      //     path.resolve(
      //       this.path,
      //       'unit_test_report/coverage/cobertura-coverage.xml',
      //     ),
      //   ),
      // ),
      xml2js.parseStringPromise(
        fs.readFileSync(
          path.resolve(this.path, 'e2e/coverage/cobertura-coverage.xml'),
        ),
      ),
    ];

    const res = await Promise.all(promiseArray);

    // 得到文件的具体覆盖率
    for (const item of res) {
      if (item.coverage.packages[0].class) {
        this.parserSingle(item);
      } else {
        this.parserMultiple(item);
      }
    }

    let lineSum = 0,
      lineCovered = 0;

    // 计算总覆盖率
    for (const file of Object.keys(this.resMap)) {
      const val = this.resMap[file];
      const fileSum = val.lines.length;
      let fileCovered = 0;

      val.lines.forEach((item: any) => {
        if (item.hits) {
          fileCovered += 1;
          lineCovered += 1;
        }
      });

      val.lineRate = fileCovered / fileSum;

      // 全部覆盖率
      lineSum += fileSum;
    }

    this.resMap.$ = {};
    this.resMap.$.linesValid = lineSum;
    this.resMap.$.linesCovered = lineCovered;

    return this.resMap;
  }
}
