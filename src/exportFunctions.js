// src/exportFunctions.js

function getCheckedBoxes() {
    return document.querySelectorAll('input[type="checkbox"][id^="sfia-checkbox-"]:checked');
}

function processCheckedBoxes(checkedBoxes, sfiaJson) {
    const data = [];
    checkedBoxes.forEach(box => {
        const jsonData = JSON.parse(box.getAttribute('sfia-data'));
        const categoryData = sfiaJson[jsonData.category];
        const subCategoryData = categoryData[jsonData.subCategory];
        const skillData = subCategoryData[jsonData.skill];

        if (categoryData && subCategoryData && skillData) {
            const skillCode = skillData["code"];
            const skillDescription = skillData["description"];
            const skillLevel = skillData["levels"][jsonData.level];

            if (skillCode && skillDescription && skillLevel) {
                data.push([
                    `${jsonData.skill} ${skillCode}-${jsonData.level}`,
                    skillDescription,
                    skillLevel
                ]);
            } else {
                console.error(`Incomplete or missing data for ${jsonData.category}/${jsonData.subCategory}/${jsonData.skill}`);
            }
        } else {
            console.error(`Skill data not found for ${jsonData.category}/${jsonData.subCategory}/${jsonData.skill}`);
        }
    });

    return data;
}

function generateCSVContent(data) {
    let csvContent = "";
    data.forEach(infoArray => {
        let dataString = '"' + infoArray.join('","') + '"';
        csvContent += dataString + "\n";
    });
    return csvContent;
}


/**
 * Export the CSV content to a downloadable CSV file.
 * @param {Event} event - The event triggering the function.
 * @param {Object} sfiaJson - The sfiaJson object containing all the data.
 */
function exportCSV(event, sfiaJson) {
    // Log the function trigger and the event object
    console.log('Export CSV button triggered');
    console.log('Event:', event);

    // Prevent the default action associated with the event
    event.preventDefault();

    // Get the checked boxes
    const checkedBoxes = getCheckedBoxes();

    // Process the checked boxes and generate the CSV content
    const processedData = processCheckedBoxes(checkedBoxes, sfiaJson);
    const csvContent = generateCSVContent(processedData);

    // Create a blob from the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv' });

    // Create an anchor element to download the CSV file
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PositionSummary.csv';
    a.setAttribute('visibility', 'hidden');
    document.body.appendChild(a);

    // Trigger the download
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Export the HTML content to a downloadable HTML file.
 * @param {Event} event - The event triggering the function.
 * @param {Object} sfiaJson - The sfiaJson object containing all the data.
 */
function exportHTML(event, sfiaJson) {
    // Log the function trigger and the event object
    console.log('Export HTML button triggered');
    console.log('Event:', event);

    // Prevent the default action associated with the event
    event.preventDefault();

    // Check if the last export was within the timeout duration
    if (isExportSkippedDueToTimeout(3000)) {
        console.log("Export HTML skipped due to timeout.");
        return; // Return early to prevent multiple downloads
    }

    // Update the last export time
    lastExportTime = new Date().getTime();

    // Get the HTML content from the specified element
    const htmlContent = document.getElementById('sfia-output').innerHTML;

    // Get values from the URL after the #
    const urlHash = window.location.hash.replace('#/', '');

    // Get the current date in ddmmccyy format
    const currentDate = new Date();
    const dd = String(currentDate.getDate()).padStart(2, '0');
    const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
    const yyyy = currentDate.getFullYear();
    const dateStr = dd + mm + yyyy;

    // Generate the filename based on URL values and date
    const filenameBase = `PositionSummary_${urlHash}`;
    const filenameEnd = `_${dateStr}.html`;

    // Ensure the filename doesn't exceed 255 characters
    let truncatedFilename;
    if (filenameBase.length + filenameEnd.length > 255) {
        const availableSpace = 255 - filenameEnd.length;
        truncatedFilename = filenameBase.slice(0, availableSpace) + filenameEnd;
    } else {
        truncatedFilename = filenameBase + filenameEnd;
    }

    // Create a download link for the HTML file
    const encodedUri = encodeURI(htmlContent);
    const a = document.createElement('a');
    a.href = 'data:attachment/plain;charset=utf-8,' + encodedUri;
    a.download = truncatedFilename;

    // Append the link to the body, trigger the click event, and remove the link
    document.body.appendChild(a);
    a.click();
    a.remove();
}
