import {Info, DetailLines} from '../types';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import parse = require('lcov-parse');

export class LcovParser {
  path: string;

  parserRes: any;

  constructor(path: string) {
    this.path = path;
  }

  async run(): Promise<Info> {
    this.parserRes = await new Promise((resolve, reject) => {
      parse(this.path, (err: any, data: any) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });

    return this.format();
  }

  private format(): Info {
    const info: Info = {};
    let found = 0;
    let hit = 0;

    this.parserRes.forEach((item: any) => {
      found += item.lines.found;
      hit += item.lines.hit;
      const temp: DetailLines = {
        lineRate: item.lines.hit / item.lines.found,
        lines: [],
      };

      item.lines.details.forEach((detail: any) => {
        temp.lines.push({
          number: detail.line,
          hits: detail.hit,
          branch: '',
        });
      });

      info[item.file] = temp;
    });

    info.$ = {
      linesValid: found,
      linesCovered: hit,
    };

    return info;
  }
}
