export type GameServerType = "palworld" | "minecraft" | "protocol-valve";

export type PowerAction = "restart" | "emergency-restart" | "shutdown";

export interface AdminGameServer {
  _id: string;
  name: string;
  connectionInfo: {
    address: string;
    port: number;
    password: string;
    queryPort: number;
  };
  playerInfo: { maxPlayers: number };
  serverInfo: { image: string; description: string };
  gameData: { type: GameServerType; containerName: string; slug: string };
  hostInfo: { address: string; port: number; password: string };
}

export interface GameServerFormValue {
  name: string;
  connectionInfo: {
    address: string;
    port: string;
    password: string;
    queryPort: string;
  };
  playerInfo: { maxPlayers: string };
  serverInfo: { image: string; description: string };
  gameData: { type: GameServerType; containerName: string; slug: string };
  hostInfo: { address: string; port: string; password: string };
}

export const emptyFormValue: GameServerFormValue = {
  name: "",
  connectionInfo: { address: "linchoy.com", port: "", password: "", queryPort: "" },
  playerInfo: { maxPlayers: "" },
  serverInfo: { image: "", description: "" },
  gameData: { type: "minecraft", containerName: "", slug: "" },
  hostInfo: { address: "", port: "", password: "" },
};

export function toFormValue(server: AdminGameServer): GameServerFormValue {
  return {
    name: server.name,
    connectionInfo: {
      address: server.connectionInfo?.address ?? "",
      port: server.connectionInfo?.port?.toString() ?? "",
      password: server.connectionInfo?.password ?? "",
      queryPort: server.connectionInfo?.queryPort?.toString() ?? "",
    },
    playerInfo: {
      maxPlayers: server.playerInfo?.maxPlayers?.toString() ?? "",
    },
    serverInfo: {
      image: server.serverInfo?.image ?? "",
      description: server.serverInfo?.description ?? "",
    },
    gameData: {
      type: server.gameData?.type ?? "minecraft",
      containerName: server.gameData?.containerName ?? "",
      slug: server.gameData?.slug ?? "",
    },
    hostInfo: {
      address: server.hostInfo?.address ?? "",
      port: server.hostInfo?.port?.toString() ?? "",
      password: server.hostInfo?.password ?? "",
    },
  };
}

export function isFormValid(value: GameServerFormValue): boolean {
  return (
    value.name.trim().length > 0 &&
    value.gameData.containerName.trim().length > 0 &&
    value.gameData.slug.trim().length > 0
  );
}

export function toApiPayload(value: GameServerFormValue) {
  return {
    name: value.name,
    connectionInfo: {
      address: value.connectionInfo.address,
      password: value.connectionInfo.password,
      port: value.connectionInfo.port
        ? Number(value.connectionInfo.port)
        : undefined,
      queryPort: value.connectionInfo.queryPort
        ? Number(value.connectionInfo.queryPort)
        : undefined,
    },
    playerInfo: {
      maxPlayers: value.playerInfo.maxPlayers
        ? Number(value.playerInfo.maxPlayers)
        : undefined,
    },
    serverInfo: value.serverInfo,
    gameData: value.gameData,
    hostInfo: {
      address: value.hostInfo.address,
      password: value.hostInfo.password,
      port: value.hostInfo.port ? Number(value.hostInfo.port) : undefined,
    },
  };
}
