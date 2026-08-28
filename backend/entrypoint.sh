#!/bin/sh
set -e

echo "Synchronisation des GameServers"
node dist/scripts/seedGameServers.js

echo "Démarrage du serveur..."
exec node dist/server.js