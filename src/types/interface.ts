export interface Detail {
  line: number;
  hit: number;
}

export interface DetailLines {
  found: number;
  hit: number;
  details: Array<Detail>;
}

export interface Info {
  lines: DetailLines;
  functions: Object;
  branches: Object;
  title: string;
  file: string;
}
