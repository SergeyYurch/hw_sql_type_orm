import { Buffer } from 'buffer';

export type ImageDataType = {
  width: number;
  height: number;
  buffer: Buffer;
  format: string;
  size: number;
};
