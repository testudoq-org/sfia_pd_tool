
// src/browserUpdate.js

// This file contains the code for appending a script tag to the document body, loading the Browser Update script

/**
 * Function $buo_f is responsible for appending a script tag to the
 * document body. This script tag loads the Browser Update script
 * from the specified source.
 */
function $buo_f() {
    // Create a new script element
    let scriptElement = document.createElement("script");

    // Set the source of the script element to the Browser Update script
    scriptElement.src = "https:////browser-update.org/update.min.js";

    // Append the script element to the document body
    document.body.appendChild(scriptElement);
}

// Check if the hostname is 127.0.0.1 to skip the code
if (window.location.hostname !== '127.0.0.1') {
    try {
        document.addEventListener("DOMContentLoaded", $buo_f, false);
    } catch (e) {
        window.attachEvent("onload", $buo_f);
    }
}
