import { Label } from "../../lib/struct/Label";
import { Release } from "../../lib/struct/Release";

export interface SearchResultData {
  label: Label;
  release?: Release;
}