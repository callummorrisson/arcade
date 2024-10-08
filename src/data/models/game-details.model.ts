import { ItemBase } from "@/data/types/item-base.type";

export default interface GameDetailsModel extends ItemBase {
  id: string;
  description: string;
  gamePath: string;
}
