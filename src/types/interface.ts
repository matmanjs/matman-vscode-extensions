export interface Total {
  linesCovered: number;
  linesValid: number;
}

export interface DetailLines {
  lineRate: number;
  lines: {
    branch: string;
    hits: number;
    number: string;
  }[];
}

export type Info = Record<string | '$', Total | DetailLines>;
