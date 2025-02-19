# Implementation Plan for Local File Loading

## Overview
This plan incorporates a FileReader-based approach to load local JSON files under file:// protocol without triggering CORS errors, while preserving the existing cookie functionality and fetch-based data loading under HTTP. We will add new JavaScript code in separate files that get concatenated into sfiapdgen_func.js as part of the Grunt build process, ensuring we retain all BOF and EOF comments and do not modify the generated file directly.

## Steps

### 1. Create a New JavaScript Module
• Name it something like loadLocalJson.js (or localFileLoading.js).  
• Include BOF and EOF comments to match the project’s style:

```js
// BOF: loadLocalJson.js

function loadLocalJsonFile(callback) {
  const fileInput = document.getElementById("localJsonFileInput");

  // Only set up event listeners once, if not already bound
  if (!fileInput.dataset.listenerBound) {
    fileInput.addEventListener("change", function () {
      const file = fileInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (event) {
        try {
          const jsonData = JSON.parse(event.target.result);
          console.log("Local JSON parsed:", jsonData);

          // Mimic or integrate with the existing fetchSelectedVersionData logic:
          sfiaJson = jsonData;

          // If needed, call setupEventListenersForData(jsonData) or similar
          if (typeof callback === "function") {
            callback(jsonData);
          }
        } catch (e) {
          console.error("Error parsing JSON:", e);
        }
      };
      reader.readAsText(file);
    });
    
    // Mark the listener as bound to avoid duplicates
    fileInput.dataset.listenerBound = "true";
  }
}

// EOF: loadLocalJson.js
```

### 2. Add a File Input in HTML
In “src/sfiapdgen.html” (or a separate partial if your build merges multiple sources), add:
```html
<input type="file" id="localJsonFileInput" accept=".json" style="display:none;" />
<button id="localJsonLoadBtn" class="btn btn-secondary">Load Local JSON</button>
```
• This button triggers a “choose file” dialog.

### 3. Hook the Button Click to the File Input
Still in sfiapdgen.html (or in a small inline <script> / new JS file):
```html
<script>
// Wait until the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const loadBtn = document.getElementById("localJsonLoadBtn");
  const fileInput = document.getElementById("localJsonFileInput");
  
  // Show the file chooser when the user clicks "Load Local JSON"
  loadBtn.addEventListener("click", function() {
    fileInput.click();
  });
});
</script>
```

### 4. Integrate with the Existing Grunt Build
• Open Gruntfile.js and ensure your new file (loadLocalJson.js) is included in the “concat” task in the correct order.  
• The final piece might look like this in your `concat` config:
```js
concat: {
  options: {
    separator: ';',
  },
  dist: {
    src: [
      'src/init.js',
      'src/theme.js',
      // ...
      'src/dataFetching.js',
      // Add file below so it’s available after dataFetching code
      'src/loadLocalJson.js',
      // ...
      'src/windowEvents.js'
    ],
    dest: 'src/sfiapdgen_func.js',
  },
},
```
• This ensures that the new code is concatenated into sfiapdgen_func.js automatically without manually editing that file.

### 5. Retain Cookie and Version Handling
• The existing code uses cookies to set or retrieve the “selectedVersion” or other metadata. That logic can remain unchanged.  
• If the user chooses to load local JSON, you can decide whether that sets a cookie or simply bypasses the version check. For instance, you might:  
  - Store a pseudo-version “localFile” in the cookie.  
  - Or skip setting a version cookie if local JSON is used.  
• In either case, normal fetch-based usage remains intact when the app is served via HTTP.

### 6. Validate Under file:// and HTTP
1. Double-click the built sfiapdgen.html in your file explorer (file:// protocol).  
2. Click the “Load Local JSON” button, select a JSON file, and confirm the contents load correctly.  
3. Spin up your local server (e.g. `npm run start-server`), open http://localhost:5500, and confirm the existing fetch-based version selection also still works.  

## Notes & Best Practices
• For local “production-like” testing, running a local development server is strongly preferred.  
• Using FileReader is purely to circumvent CORS under file://.  
• Always keep your Grunt tasks in sync so that the new file is built into sfiapdgen_func.js.  
• Avoid editing the generated JS directly—work inside small, focused JS modules to preserve future maintainability.

With this approach, you can support both typical usage (HTTP fetch) and local usage (FileReader) seamlessly—retaining cookie-based version logic and abiding by the existing Grunt build pipeline with minimal disruption.
