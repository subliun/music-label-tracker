import { MbEntity } from "./MbEntity";

export interface Label extends MbEntity {
  name: string;
  releaseCount: number;
}
