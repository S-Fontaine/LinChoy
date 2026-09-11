import express from "express";
import Docker from "dockerode";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });
const app = express();

const CONTAINER_NAME_RE = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/;

function isValidName(name) {
  return typeof name === "string" && CONTAINER_NAME_RE.test(name);
}

app.post("/containers/:name/restart", async (req, res) => {
  if (!isValidName(req.params.name)) {
    return res
      .status(400)
      .json({ result: false, message: "Nom de conteneur invalide" });
  }
  try {
    const container = docker.getContainer(req.params.name);
    const emergency = req.query.t === "0";
    await container.restart(emergency ? { t: 0 } : undefined);
    return res.status(200).json({ result: true });
  } catch (err) {
    console.error(
      `[docker-power-proxy] restart ${req.params.name} a échoué :`,
      err,
    );
    return res
      .status(502)
      .json({ result: false, message: "Échec du redémarrage" });
  }
});

app.post("/containers/:name/stop", async (req, res) => {
  if (!isValidName(req.params.name)) {
    return res
      .status(400)
      .json({ result: false, message: "Nom de conteneur invalide" });
  }
  try {
    const container = docker.getContainer(req.params.name);
    await container.stop();
    return res.status(200).json({ result: true });
  } catch (err) {
    if (err.statusCode === 304) {
      return res
        .status(200)
        .json({ result: true, message: "Déjà arrêté" });
    }
    console.error(
      `[docker-power-proxy] stop ${req.params.name} a échoué :`,
      err,
    );
    return res
      .status(502)
      .json({ result: false, message: "Échec de l'extinction" });
  }
});

app.post("/containers/:name/start", async (req, res) => {
  if (!isValidName(req.params.name)) {
    return res
      .status(400)
      .json({ result: false, message: "Nom de conteneur invalide" });
  }
  try {
    const container = docker.getContainer(req.params.name);
    await container.start();
    return res.status(200).json({ result: true });
  } catch (err) {
    if (err.statusCode === 304) {
      return res
        .status(200)
        .json({ result: true, message: "Déjà démarré" });
    }
    console.error(
      `[docker-power-proxy] start ${req.params.name} a échoué :`,
      err,
    );
    return res
      .status(502)
      .json({ result: false, message: "Échec du démarrage" });
  }
});

app.use((_req, res) => {
  res.status(404).json({ result: false, message: "Not found" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[docker-power-proxy] Démarré sur le port ${PORT}`);
});
