#!/bin/bash

# deploy.sh - Skript zum Aktualisieren und Deployment von n8n-Nodes
# Dieses Script kann für verschiedene n8n-Nodes verwendet werden

# Fehler abfangen und Skript beenden bei Fehlern
set -e

# Node-Name aus package.json extrahieren
NODE_NAME=$(node -p "require('./package.json').name")
echo "=== n8n Node Update und Deployment für $NODE_NAME ==="

# Repository aktualisieren
echo "[1/7] Git Repository aktualisieren..."
git pull

# Abhängigkeiten installieren
echo "[2/7] Abhängigkeiten installieren..."
npm install

# Projekt bauen
echo "[3/7] Projekt bauen mit npm..."
npm run build

# Zielverzeichnis erstellen
echo "[4/7] Zielverzeichnis vorbereiten..."
TARGET_DIR="/home/n8n/.n8n/custom/custom-nodes/${NODE_NAME}"
sudo rm -rf "$TARGET_DIR"
sudo mkdir -p "$TARGET_DIR"

# Dateien kopieren
echo "[5/7] Node-Dateien in Custom-Verzeichnis kopieren..."
sudo cp -r dist/* "$TARGET_DIR/"

# Node Modules kopieren
echo "[6/7] Node Modules kopieren..."
sudo cp -r node_modules "$TARGET_DIR/"

# Berechtigungen setzen
echo "[7/7] Berechtigungen setzen und n8n neustarten..."
sudo chown -R n8n:n8n "/home/n8n/.n8n/custom/custom-nodes"
sudo systemctl restart n8n

echo "=== Deployment abgeschlossen ==="
echo "Node wurde nach $TARGET_DIR deployed"
