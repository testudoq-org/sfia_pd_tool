// src/constants.js

// This file contains constant variables or configuration values used throughout the project.

let sfiaJson = {};  // declare sfiaJson at a higher scope
let lorJson; // declare lorJson at a higher scope
let lastExportTime = 0; // Initialize lastExportTime to 0
const $buoop = { required: { e: -4, f: -3, o: -3, s: -1, c: -3 }, insecure: true, api: 2024.02 };
const SELECTED_VERSION = "selectedVersion";
// Initialize global variables with values from the URL hash
const urlHashParts = window.location.hash.substring(1).split("&&"); // Remove the "#" symbol and split by "&&"
g_sfiahash = urlHashParts[0];
g_lorhash = urlHashParts[1];
