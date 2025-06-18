// src/modules/constants.mjs

// Import required functions
import { fetchSelectedVersionData } from './dataFetching.mjs';

// This file contains constant variables or configuration values used throughout the project.

// Browser update configuration - this can remain const as it's truly constant
export const $buoop = { required: { e: -4, f: -3, o: -3, s: -1, c: -3 }, insecure: true, api: 2024.02 };

// Version selection constant
export const SELECTED_VERSION = "selectedVersion";

// Initialize global variables with values from the URL hash using destructuring
const urlHashParts = window.location.hash.substring(1).split("&&"); // Remove the "#" symbol and split by "&&"
const [sfiahash = "", lorhash = ""] = urlHashParts; // Use destructuring with default values

// Export the hash parts as let to allow reassignment
export let g_sfiahash = sfiahash;
export let g_lorhash = lorhash;

// These variables need to be let as they may be reassigned later
export let sfiaJson; // declare sfiaJson at a higher scope - will be initialized async
export let lorJson; // declare lorJson at a higher scope
export let lastExportTime = 0; // Initialize lastExportTime to 0

// Initialize sfiaJson asynchronously
fetchSelectedVersionData().then(data => {
    sfiaJson = data;
}).catch(error => {
    console.error('Failed to load initial SFIA data:', error);
    sfiaJson = null;
});

// Setter functions to allow reassignment from other modules
export function setG_sfiahash(value) {
    g_sfiahash = value;
}

export function setG_lorhash(value) {
    g_lorhash = value;
}

export function setSfiaJson(value) {
    sfiaJson = value;
}

export function setLorJson(value) {
    lorJson = value;
}

export function setLastExportTime(value) {
    lastExportTime = value;
}