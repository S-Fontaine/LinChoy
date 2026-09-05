import { EventEmitter } from "events";

export const gameServerEvents = new EventEmitter();
gameServerEvents.setMaxListeners(0);