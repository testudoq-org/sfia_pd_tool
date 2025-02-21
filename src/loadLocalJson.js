// BOF: loadLocalJson.js

function loadLocalJsonFile(callback) {
  const fileInput = document.getElementById("localJsonFileInput");
  console.log("Initialized loadLocalJsonFile function.");

  if (!fileInput.dataset.listenerBound) {
    console.log("Setting up event listener for file input change.");
    fileInput.addEventListener("change", function () {
      const file = fileInput.files[0];
      if (!file) {
        console.warn("No file selected.");
        return;
      }

      console.log("File selected:", file.name);
      const reader = new FileReader();
      reader.onload = function (event) {
        try {
          const jsonData = JSON.parse(event.target.result);
          console.log("Local JSON parsed successfully:", jsonData);

          // Set pseudo-version for local file
          document.cookie = "selectedVersion=localFile; path=/";
          console.log("Set selectedVersion cookie to 'localFile'");

          // Update global SFIA data
          sfiaJson = jsonData;
          console.log("Global sfiaJson updated.");

          // Initialize content with loaded data
          initializeSFIAContent(jsonData);
          console.log("SFIA content initialized.");

          if (typeof callback === "function") {
            console.log("Executing callback function.");
            callback(jsonData);
          }

          showNotification('JSON file loaded successfully', 'success');
          console.log("Success notification displayed.");
        } catch (e) {
          console.error("Error parsing JSON:", e);
          showNotification('Error loading JSON file: ' + e.message, 'error');
        }
      };
      reader.readAsText(file);
    });

    fileInput.dataset.listenerBound = "true";
    console.log("Event listener marked as bound.");
  }
}

// EOF: loadLocalJson.js
