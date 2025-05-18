#!/bin/bash

# deploy.sh - Skript zum Aktualisieren und Deployment von n8n-Nodes
# Dieses Script kann für verschiedene n8n-Nodes verwendet werden

# Fehler abfangen und Skript beenden bei Fehlern
set -e

# Node-Name aus package.json extrahieren
NODE_NAME=$(node -p "require('./package.json').name")
echo "=== n8n Node Update und Deployment für $NODE_NAME ==="

# Repository aktualisieren
echo "[1/6] Git Repository aktualisieren..."
git pull

# Abhängigkeiten installieren
echo "[2/6] Abhängigkeiten installieren..."
pnpm install

# Projekt bauen
echo "[3/6] Projekt bauen mit pnpm..."
pnpm build

# Zielverzeichnis erstellen
echo "[4/6] Zielverzeichnis vorbereiten..."
TARGET_DIR="/home/n8n/.n8n/custom/custom-nodes/${NODE_NAME}"
sudo mkdir -p "$TARGET_DIR"

# Dateien kopieren
echo "[5/6] Node-Dateien in Custom-Verzeichnis kopieren..."
sudo cp -r dist/* "$TARGET_DIR/"

# Berechtigungen setzen
echo "[6/6] Berechtigungen setzen und n8n neustarten..."
sudo chown -R n8n:n8n "/home/n8n/.n8n/custom/custom-nodes"
sudo systemctl restart n8n

echo "=== Deployment abgeschlossen ==="
echo "Node wurde nach $TARGET_DIR deployed"
