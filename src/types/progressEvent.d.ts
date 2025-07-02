export interface ProgressEvent {
  loaded: number;
  total?: number;
  percent?: number;
  lengthComputable: boolean;
}
