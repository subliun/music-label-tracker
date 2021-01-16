import { DateTime } from "luxon";
import { Label } from "./Label";
import { MbEntity } from "./MbEntity";

export interface Release extends MbEntity {
  name: string;
  artist: string;
  date?: DateTime;
  labels: Label[];
  releaseGroupMbid: string;
}