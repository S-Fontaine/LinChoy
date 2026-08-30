import os from "os";
import express from "express";

const router = express.Router();

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d > 0 ? d + " Jours " : ""}${h > 0 ? h + " Heures " : ""}${m > 0 ? m + " Minutes" : "0m"}`;
}

function formatRAM(totalRAM: number, FreeRAM: number): string {
  const RAM = (totalRAM / 1024 ** 3).toFixed(2);
  const usedRAM = ((totalRAM - FreeRAM) / 1024 ** 3).toFixed(2);
  const freeRAM = (FreeRAM / 1024 ** 3).toFixed(2);
  return `Mémoire utilisée : ${usedRAM} GB sur ${RAM} GB (Il reste ${freeRAM} GB libres)`;
}

router.get("/status", (_req, res) => {
  const [load1, load5, load15] = os.loadavg() as [number, number, number];
  res.json({
    status: "Serveur allumé depuis " + formatUptime(os.uptime()),
    statusRAM: formatRAM(os.totalmem(), os.freemem()),
    statusCharge1: `Charge 1min : ${load1.toFixed(2)}`,
    statusCharge5: `Charge 5min : ${load5.toFixed(2)}`,
    statusCharge15: `Charge 15min : ${load15.toFixed(2)}`,
  });
});

export default router;