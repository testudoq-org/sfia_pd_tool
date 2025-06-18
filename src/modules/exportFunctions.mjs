// src/modules/exportFunctions.mjs

import { isExportSkippedDueToTimeout } from './utilityFunctions.mjs';

let lastExportTime = 0; // Initialize lastExportTime to 0

const getCheckedBoxes = () => {
    return document.querySelectorAll('input[type="checkbox"][id^="sfia-checkbox-"]:checked');
};

const processCheckedBoxes = (checkedBoxes, sfiaJson) => {
    const data = [];
    checkedBoxes.forEach(box => {
        const jsonData = JSON.parse(box.getAttribute('sfia-data'));
        const { category, subCategory, skill, level } = jsonData;
        const categoryData = sfiaJson[category];
        const subCategoryData = categoryData?.[subCategory];
        const skillData = subCategoryData?.[skill];

        if (categoryData && subCategoryData && skillData) {
            const skillCode = skillData["code"];
            const skillDescription = skillData["description"];
            const skillLevel = skillData["levels"][level];

            if (skillCode && skillDescription && skillLevel) {
                data.push([
                    `${skill} ${skillCode}-${level}`,
                    skillDescription,
                    skillLevel
                ]);
            } else {
                console.error(`Incomplete or missing data for ${category}/${subCategory}/${skill}`);
            }
        } else {
            console.error(`Skill data not found for ${category}/${subCategory}/${skill}`);
        }
    });

    return data;
};

const generateCSVContent = (data) => {
    let csvContent = "";
    data.forEach(infoArray => {
        const dataString = `"${infoArray.join('","')}"`;
        csvContent += `${dataString}\n`;
    });
    return csvContent;
};

/**
 * Export the CSV content to a downloadable CSV file.
 * @param {Event} event - The event triggering the function.
 * @param {Object} sfiaJson - The sfiaJson object containing all the data.
 */
const exportCSV = (event, sfiaJson) => {
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
};

/**
 * Export the HTML content to a downloadable HTML file.
 * @param {Event} event - The event triggering the function.
 * @param {Object} sfiaJson - The sfiaJson object containing all the data.
 */
const exportHTML = (event, sfiaJson) => {
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
    const dateStr = `${dd}${mm}${yyyy}`;

    // Generate the filename based on URL values and date
    const filenameBase = `PositionSummary_${urlHash}`;
    const filenameEnd = `_${dateStr}.html`;

    // Ensure the filename doesn't exceed 255 characters
    let truncatedFilename;
    if (filenameBase.length + filenameEnd.length > 255) {
        const availableSpace = 255 - filenameEnd.length;
        truncatedFilename = `${filenameBase.slice(0, availableSpace)}${filenameEnd}`;
    } else {
        truncatedFilename = `${filenameBase}${filenameEnd}`;
    }

    // Create a download link for the HTML file
    const encodedUri = encodeURI(htmlContent);
    const a = document.createElement('a');
    a.href = `data:attachment/plain;charset=utf-8,${encodedUri}`;
    a.download = truncatedFilename;

    // Append the link to the body, trigger the click event, and remove the link
    document.body.appendChild(a);
    a.click();
    a.remove();
};

/**
 * Save the content of a specified element to a file with versioning and date-time stamping.
 * @param {string} elementId - The ID of the element whose content is to be saved.
 * @param {string} baseFilename - The base name of the file to save the content to.
 */
const saveContentToFile = (elementId, baseFilename) => {
    const content = document.getElementById(elementId).innerHTML;
    const version = document.getElementById("jsonVersionSelect").value;
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const filename = `${baseFilename}_v${version}_${timestamp}.html`;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * Save the SFIA content to a file.
 */
const saveSfiaContent = () => {
    saveContentToFile('sfia-output', 'SFIA_Content');
};

/**
 * Save the LOR content to a file.
 */
const saveLorContent = () => {
    saveContentToFile('lor-output', 'LOR_Content');
};

export {
    getCheckedBoxes,
    processCheckedBoxes,
    generateCSVContent,
    exportCSV,
    exportHTML,
    saveContentToFile,
    saveSfiaContent,
    saveLorContent,
    lastExportTime
};