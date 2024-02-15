"use strict";

var $buoop = { required: { e: -4, f: -3, o: -3, s: -1, c: -3 }, insecure: true, api: 2024.02 };

function $buo_f() {
    var e = document.createElement("script");
    e.src = "//browser-update.org/update.min.js";
    document.body.appendChild(e);
}

try {
    document.addEventListener("DOMContentLoaded", $buo_f, false);
} catch (e) {
    window.attachEvent("onload", $buo_f);
}

async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function checkPreselected(code, level) {
    const urlHash = window.location.href.split("/#/")[1];
    if (urlHash && urlHash.split("+").length > 0) {
        const hashParts = urlHash.split("+");
        for (let i = hashParts.length - 1; i >= 0; i--) {
            const [checkCode, checkLevel] = hashParts[i].split("-");
            if (code === checkCode && level === checkLevel) {
                return true;
            }
        }
    }
    return false;
}

function addSelectionBox(index, sfiaJson, rootKey, subKey, skillKey) {
    const col = document.createElement('td');
    if (sfiaJson[rootKey][subKey][skillKey]["levels"].hasOwnProperty(index)) {
        const jsonData = JSON.stringify({
            "category": rootKey,
            "subCategory": subKey,
            "skill": skillKey,
            "level": index
        });
        const checked = checkPreselected(sfiaJson[rootKey][subKey][skillKey]["code"], index) ? "checked" : "";
        col.innerHTML = `<input type='checkbox' title='${sfiaJson[rootKey][subKey][skillKey]["levels"][index]}' sfia-data='${jsonData}' ${checked}/>`;
        col.className += " select_col";
    } else {
        col.innerHTML = "<input type='checkbox' disabled/>";
        col.className += " no_select_col";
    }
    col.className += " col-checkbox";
    return col;
}

function exportCSV(sfiaJson) {
    const checkedBoxes = document.querySelectorAll('input[type=checkbox]:checked');
    const data = [];

    for (const box of checkedBoxes) {
        const jsonData = JSON.parse(box.getAttribute('sfia-data'));
        data.push([
            `${jsonData.skill} ${sfiaJson[jsonData.category][jsonData.subCategory][jsonData.skill]["code"]}-${jsonData.level}`,
            sfiaJson[jsonData.category][jsonData.subCategory][jsonData.skill]["description"],
            sfiaJson[jsonData.category][jsonData.subCategory][jsonData.skill]["levels"][jsonData.level]
        ]);
    }

    const csvContent = data.map(infoArray => `"${infoArray.join('","')}"`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const a = document.createElement('a');
    a.href = 'data:attachment/csv,' + encodedUri;
    a.download = 'PositionSummary.csv';

    document.body.appendChild(a);
    a.click();
    a.remove();
}

function exportHTML() {
    const htmlContent = document.getElementById('sfia-output').innerHTML;

    const encodedUri = encodeURI(htmlContent);
    const a = document.createElement('a');
    a.href = 'data:attachment/plain;charset=utf-8,' + encodedUri;
    a.download = 'PositionSummary.html';

    document.body.appendChild(a);
    a.click();
    a.remove();
}

function renderOutput(sfiaJson) {
    const checkedBoxes = document.querySelectorAll('input[type=checkbox]:checked');
    const newJson = sfiaJson;
    const newArr = {};
    const urlHash = [];

    for (const box of checkedBoxes) {
        const jsonData = JSON.parse(box.getAttribute('sfia-data'));

        if (typeof newArr[jsonData.category] === "undefined") {
            newArr[jsonData.category] = {};
        }
        if (typeof newArr[jsonData.category][jsonData.subCategory] === "undefined") {
            newArr[jsonData.category][jsonData.subCategory] = {};
        }
        if (typeof newArr[jsonData.category][jsonData.subCategory][jsonData.skill] === "undefined") {
            newArr[jsonData.category][jsonData.subCategory][jsonData.skill] = {};
            newArr[jsonData.category][jsonData.subCategory][jsonData.skill]["description"] = newJson[jsonData.category][jsonData.subCategory][jsonData.skill]["description"];
            newArr[jsonData.category][jsonData.subCategory][jsonData.skill]["code"] = newJson[jsonData.category][jsonData.subCategory][jsonData.skill]["code"];
            newArr[jsonData.category][jsonData.subCategory][jsonData.skill]["levels"] = {};
        }

        newArr[jsonData.category][jsonData.subCategory][jsonData.skill]["levels"][jsonData.level] = newJson[jsonData.category][jsonData.subCategory][jsonData.skill]["levels"][jsonData.level];

        urlHash.push(newJson[jsonData.category][jsonData.subCategory][jsonData.skill]["code"] + "-" + jsonData.level);
    }

    const html = document.getElementById('sfia-output');

    while (html.firstChild) {
        html.removeChild(html.firstChild);
    }

    for (const category in newArr) {
        const categoryEle = document.createElement('h1');
        categoryEle.textContent = category;
        html.appendChild(categoryEle);

        for (const subCategory in newArr[category]) {
            const subCategoryEle = document.createElement('h2');
            subCategoryEle.textContent = subCategory;
            html.appendChild(subCategoryEle);

            for (const skill in newArr[category][subCategory]) {
                const skillEle = document.createElement('h3');
                skillEle.textContent = skill + " - " + newArr[category][subCategory][skill]["code"];
                html.appendChild(skillEle);

                const skillDescriptionEle = document.createElement('p');
                skillDescriptionEle.textContent = newArr[category][subCategory][skill]["description"];
                html.appendChild(skillDescriptionEle);

                for (const level in newArr[category][subCategory][skill]["levels"]) {
                    const levelEle = document.createElement('h4');
                    levelEle.textContent = "Level " + level;
                    html.appendChild(levelEle);

                    const levelDescriptionEle = document.createElement('p');
                    levelDescriptionEle.textContent = newArr[category][subCategory][skill]["levels"][level];
                    html.appendChild(levelDescriptionEle);
                }
            }
        }
    }

    window.location.href = location.protocol + '//' + location.host + location.pathname + "#/" + urlHash.join("+");
}

document.addEventListener('DOMContentLoaded', async function () {
    const sfiaJson = await fetchData("json_source.json");
    initializeSFIAContent(sfiaJson);
});

function initializeSFIAContent(sfiaJson) {
    const rootKeyPrinted = [];
    const subKeyPrinted = [];

    const table = document.getElementById('sfia-content');

    for (const rootKey in sfiaJson) {
        for (const subKey in sfiaJson[rootKey]) {
            for (const skillKey in sfiaJson[rootKey][subKey]) {
                const row = document.createElement('tr');
                row.className += " " + rootKey.trim().replace(/ /g, "_").toLowerCase();

                const col1 = document.createElement('td');
                if (rootKeyPrinted.indexOf(rootKey) === -1) {
                    rootKeyPrinted.push(rootKey);
                    col1.textContent = rootKey;
                }
                col1.className += " root_key";
                row.appendChild(col1);

                const col2 = document.createElement('td');
                if (subKeyPrinted.indexOf(subKey) === -1) {
                    subKeyPrinted.push(subKey);
                    col2.textContent = subKey;
                }
                col2.className += " sub_key";
                row.appendChild(col2);

                const col3 = document.createElement('td');
                col3.className += " skill_key";
                row.appendChild(col3);

                const skillSpan = document.createElement('span');
                skillSpan.textContent = skillKey + " - " + sfiaJson[rootKey][subKey][skillKey]["code"];
                skillSpan.title = sfiaJson[rootKey][subKey][skillKey]["description"];
                col3.appendChild(skillSpan);

                for (let i = 1; i < 8; i++) {
                    row.appendChild(addSelectionBox(i, sfiaJson, rootKey, subKey, skillKey));
                }

                table.appendChild(row);
            }
        }
    }

    if (window.location.href.split("/#/").length > 0) {
        renderOutput(sfiaJson);
    }

    const checkboxes = document.querySelectorAll('input[type=checkbox]');
    checkboxes.forEach(function (checkbox) {
        checkbox.addEventListener('click', () => renderOutput(sfiaJson), false);
    });
}