import { useMemo } from "react";
import GameServiceContract from "./game-service.contract";
import { GameServiceFromJson } from "./mock/game-service.from-json";

type ServiceOptions = {
  games: GameServiceContract;
};

const mockServices: ServiceOptions = {
  games: new GameServiceFromJson(),
};

export default function useDataService<
  TService extends ServiceOptions[keyof ServiceOptions]
>(serviceLink: (services: ServiceOptions) => TService): TService {
  
  // todo would likely do some kind of switch here
  const service = serviceLink(mockServices);

  return service;
}