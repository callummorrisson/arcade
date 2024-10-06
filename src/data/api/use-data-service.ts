import { useMemo } from "react";
import GameServiceContract from "./game-service.contract";
import { GameServiceFromJson } from "./mock/game-service.from-json";

type ServiceOptions = {
  games: GameServiceContract;
};

const getServices = () => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  // todo would likely do some kind of switch here
  return {
    games: new GameServiceFromJson(basePath),
  };
};

export default function useDataService<
  TService extends ServiceOptions[keyof ServiceOptions]
>(serviceLink: (services: ServiceOptions) => TService): TService {

  // todo this is gross
  const services = useMemo(() => getServices(), []);
  const service = useMemo(() => serviceLink(services), [services, serviceLink]);

  return service;
}
