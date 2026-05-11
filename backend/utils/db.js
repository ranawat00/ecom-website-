/**
 * db.js — Lightweight JSON file-based persistence layer
 * Replaces in-memory arrays to survive server restarts.
 */
const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const filePath = (name) => path.join(DB_DIR, `${name}.json`);

const readDB = (name) => {
    try {
        if (!fs.existsSync(filePath(name))) return {};
        return JSON.parse(fs.readFileSync(filePath(name), 'utf8'));
    } catch {
        return {};
    }
};

const writeDB = (name, data) => {
    fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2), 'utf8');
};

module.exports = { readDB, writeDB };
