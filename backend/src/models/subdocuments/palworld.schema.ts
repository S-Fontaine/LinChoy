import { Schema, Document } from "mongoose";

export interface IPalworldInfo {
  version: string;
  servername: string;
  description: string;
  worldguid: string;
}

export interface IPalworldMetrics {
  serverfps: number;
  currentplayernum: number;
  serverframetime: number;
  maxplayernum: number;
  uptime: number;
  basecampnum: number;
  days: number;
}
export interface IPalworldPlayer {
  name: string;
  accountName: string;
  playerId: string;
  userId: string;
  ip: string;
  ping: number;
  location_x: number;
  location_y: number;
  level: number;
  building_count: number;
}

export interface IPalWorldSettings {
  Difficulty: string;
  DayTimeSpeedRate: number;
  NightTimeSpeedRate: number;
  ExpRate: number;
  PalCaptureRate: number;
  PalSpawnNumRate: number;
  PalDamageRateAttack: number;
  PalDamageRateDefense: number;
  PlayerDamageRateAttack: number;
  PlayerDamageRateDefense: number;
  PlayerStomachDecreaceRate: number;
  PlayerStaminaDecreaceRate: number;
  PlayerAutoHPRegeneRate: number;
  PlayerAutoHpRegeneRateInSleep: number;
  PalStomachDecreaceRate: number;
  PalStaminaDecreaceRate: number;
  PalAutoHPRegeneRate: number;
  PalAutoHpRegeneRateInSleep: number;
  BuildObjectDamageRate: number;
  BuildObjectDeteriorationDamageRate: number;
  CollectionDropRate: number;
  CollectionObjectHpRate: number;
  CollectionObjectRespawnSpeedRate: number;
  EnemyDropItemRate: number;
  DeathPenalty: string;
  bEnablePlayerToPlayerDamage: boolean;
  bEnableFriendlyFire: boolean;
  bEnableInvaderEnemy: boolean;
  bActiveUNKO: boolean;
  bEnableAimAssistPad: boolean;
  bEnableAimAssistKeyboard: boolean;
  DropItemMaxNum: number;
  DropItemMaxNum_UNKO: number;
  BaseCampMaxNum: number;
  BaseCampWorkerMaxNum: number;
  DropItemAliveMaxHours: number;
  bAutoResetGuildNoOnlinePlayers: boolean;
  AutoResetGuildTimeNoOnlinePlayers: number;
  GuildPlayerMaxNum: number;
  PalEggDefaultHatchingTime: number;
  WorkSpeedRate: number;
  bIsMultiplay: boolean;
  bIsPvP: boolean;
  bCanPickupOtherGuildDeathPenaltyDrop: boolean;
  bEnableNonLoginPenalty: boolean;
  bEnableFastTravel: boolean;
  bIsStartLocationSelectByMap: boolean;
  bExistPlayerAfterLogout: boolean;
  bEnableDefenseOtherGuildPlayer: boolean;
  CoopPlayerMaxNum: number;
  ServerPlayerMaxNum: number;
  ServerName: string;
  ServerDescription: string;
  PublicPort: number;
  PublicIP: string;
  RCONEnabled: boolean;
  RCONPort: number;
  Region: string;
  bUseAuth: boolean;
  BanListURL: string;
  RESTAPIEnabled: boolean;
  RESTAPIPort: number;
  bShowPlayerList: boolean;
  AllowConnectPlatform: string;
  bIsUseBackupSaveData: boolean;
  LogFormatType: string;
}

export interface IPalworld extends Document {
  name: string;
  image: string;
  info: IPalworldInfo;
  metrics: IPalworldMetrics;
  players: IPalworldPlayer[];
  settings: IPalWorldSettings;
}

const playerSchema = new Schema<IPalworldPlayer>(
  {
    name: { type: String, required: true },
    accountName: { type: String, required: true },
    playerId: { type: String, required: true },
    userId: { type: String, required: true },
    ip: String,
    ping: Number,
    location_x: Number,
    location_y: Number,
    level: Number,
    building_count: Number,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    _id: false,
  },
);
playerSchema.virtual("mapY").get(function () {
  if (this.location_x == null) return null;
  return Math.round((this.location_x + 123888) / 459);
});

playerSchema.virtual("mapX").get(function () {
  if (this.location_y == null) return null;
  return Math.round((this.location_y - 158000) / 459);
});

const PalworldSchema = new Schema<IPalworld>(
  {
    name: { type: String, default: "Palworld" },
    image: { type: String, default: "/assets/palworld.webp" },
    info: {
      version: String,
      servername: String,
      description: String,
      worldguid: String,
    },
    metrics: {
      serverfps: Number,
      currentplayernum: Number,
      serverframetime: Number,
      maxplayernum: Number,
      uptime: Number,
      basecampnum: Number,
      days: Number,
    },
    players: [playerSchema],
    settings: {
      Difficulty: String,
      DayTimeSpeedRate: Number,
      NightTimeSpeedRate: Number,
      ExpRate: Number,
      PalCaptureRate: Number,
      PalSpawnNumRate: Number,
      PalDamageRateAttack: Number,
      PalDamageRateDefense: Number,
      PlayerDamageRateAttack: Number,
      PlayerDamageRateDefense: Number,
      PlayerStomachDecreaceRate: Number,
      PlayerStaminaDecreaceRate: Number,
      PlayerAutoHPRegeneRate: Number,
      PlayerAutoHpRegeneRateInSleep: Number,
      PalStomachDecreaceRate: Number,
      PalStaminaDecreaceRate: Number,
      PalAutoHPRegeneRate: Number,
      PalAutoHpRegeneRateInSleep: Number,
      BuildObjectDamageRate: Number,
      BuildObjectDeteriorationDamageRate: Number,
      CollectionDropRate: Number,
      CollectionObjectHpRate: Number,
      CollectionObjectRespawnSpeedRate: Number,
      EnemyDropItemRate: Number,
      DeathPenalty: String,
      bEnablePlayerToPlayerDamage: Boolean,
      bEnableFriendlyFire: Boolean,
      bEnableInvaderEnemy: Boolean,
      bActiveUNKO: Boolean,
      bEnableAimAssistPad: Boolean,
      bEnableAimAssistKeyboard: Boolean,
      DropItemMaxNum: Number,
      DropItemMaxNum_UNKO: Number,
      BaseCampMaxNum: Number,
      BaseCampWorkerMaxNum: Number,
      DropItemAliveMaxHours: Number,
      bAutoResetGuildNoOnlinePlayers: Boolean,
      AutoResetGuildTimeNoOnlinePlayers: Number,
      GuildPlayerMaxNum: Number,
      PalEggDefaultHatchingTime: Number,
      WorkSpeedRate: Number,
      bIsMultiplay: Boolean,
      bIsPvP: Boolean,
      bCanPickupOtherGuildDeathPenaltyDrop: Boolean,
      bEnableNonLoginPenalty: Boolean,
      bEnableFastTravel: Boolean,
      bIsStartLocationSelectByMap: Boolean,
      bExistPlayerAfterLogout: Boolean,
      bEnableDefenseOtherGuildPlayer: Boolean,
      CoopPlayerMaxNum: Number,
      ServerPlayerMaxNum: Number,
      ServerName: String,
      ServerDescription: String,
      PublicPort: { type: Number, select: false },
      PublicIP: { type: String, select: false },
      RCONEnabled: { type: Boolean, select: false },
      RCONPort: { type: Number, select: false },
      Region: String,
      bUseAuth: Boolean,
      BanListURL: String,
      RESTAPIEnabled: { type: Boolean, select: false },
      RESTAPIPort: { type: Number, select: false },
      bShowPlayerList: Boolean,
      AllowConnectPlatform: String,
      bIsUseBackupSaveData: Boolean,
      LogFormatType: String,
    },
  },
  { _id: false },
);
export default PalworldSchema;
