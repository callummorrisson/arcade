export default interface GameDetailsModel {
  id: string;
  name: string;
  description: string;
  createdDate: Date;

  gameFolder: string;
  coverExtension?: string;
}
