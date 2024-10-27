import GameDatabaseModel from "./game-database.model";

type withoutDateString = Omit<GameDatabaseModel, "createdDate">;

export default interface GameDetailsModel extends withoutDateString {
  createdDate: Date;
}
