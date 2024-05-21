// Tool config
const listTools = {
    base64encode: {
        id: "dtx-base64-encode",
        label: "Base64 encode",
        events:{
            onclick: function (e) {
                return btoa(selectedText);
            }
        }
    },
    base64decode: {
        id: "dtx-base64-decode",
        label: "Base64 decode",
        events:{
            onclick: function (e) {
                return atob(selectedText);
            }
        }
    },
    toHumanDate: {
        id: "dtx-to-human-date",
        label: "To human date",
        events:{
            onclick: function (e) {
                let unix_timestamp = +selectedText;
                const date = new Date(unix_timestamp * 1000);
                if (isNaN(date.getTime())) {
                    throw new Error("Invalid date");
                } else {
                    const timePart = [
                        ("0" + date.getHours()).slice(-2),
                        ("0" + date.getMinutes()).slice(-2),
                        ("0" + date.getSeconds()).slice(-2),
                    ];
                    const datePart = [
                        ("0" + date.getDate()).slice(-2),
                        ("0" + date.getMonth()).slice(-2),
                        date.getFullYear(),
                    ];
                    return timePart.join(':') + " " + datePart.join('/');
                }
            }
        }
    },
    formatJson: {
        id: "dtx-format-json",
        label: "Format Json",
        events:{
            onclick: function (e) {
                let formattedJson = syntaxHighlight(JSON.stringify(JSON.parse(selectedText), null, 4));
                return '<pre style="white-space: pre-wrap;">'+formattedJson+'</pre>';
            }
        }
    },
    trimAllWhitespaces: {
        id: "dtx-trim-all-whitespaces",
        label: "Trim all whitespaces",
        events:{
            onclick: function (e) {
                return selectedText.replaceAll(/\s/g,'');
            }
        }
    },
    replaceSlashQuote: {
        id: "dtx-replace-slash-quote",
        label: "Replace \\\" with \"",
        events:{
            onclick: function (e) {
                return selectedText.replaceAll("\\\"",'"');
            }
        }
    },
}
var selectedText = '';

// Tool list element
const elmToolList = document.createElement("div");
elmToolList.id = "dtx-tool-list";
for (const key in listTools) {
    const item = listTools[key];
    let child = document.createElement("div");
    child.textContent = item.label;
    child.onclick = function (e) {
        try {
            selectedText = elmInfoSelectedText.value;
            setResult(item.events.onclick(e));
        } catch(err) {
            showError(err);
        }
        resetToolListSelection();
        child.classList.add('active');
    }
    child.id = item.id;
    child.className = 'dtx-tool-item';
    elmToolList.appendChild(child);
}

// Popup info element
// 1. Selected element
// 1.1 Label
const elmInfoSelectedTextLabel = document.createElement("label");
elmInfoSelectedTextLabel.textContent = 'Selected text';
// 1.2 Copy selected text button
const elmInfoSelectedCopyButton = document.createElement("div");
elmInfoSelectedCopyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#74C0FC" d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16l140.1 0L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z"/></svg>';
elmInfoSelectedCopyButton.id = 'dtx-info-copy-selected-btn';
elmInfoSelectedCopyButton.classList.add('dtx-info-text-tool-button');
elmInfoSelectedCopyButton.title = 'Copy selected text';
elmInfoSelectedCopyButton.onclick = function () {
    copyToClipboard(elmInfoSelectedText.value);
}
// 1.3 Clear selected text button
const elmInfoSelectedClearButton = document.createElement("div");
elmInfoSelectedClearButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#c85151" d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z"/></svg>';
elmInfoSelectedClearButton.id = 'dtx-info-clear-selected-btn';
elmInfoSelectedClearButton.classList.add('dtx-info-text-tool-button');
elmInfoSelectedClearButton.title = 'Clear selected text';
elmInfoSelectedClearButton.onclick = function () {
    setSelectedText('');
    showNotify('Clean!');
}
// 1.4 Text area show selected text
const elmInfoSelectedText = document.createElement("textarea");
elmInfoSelectedText.id = 'dtx-info-selected-text';

// 2. Result element
// 2.1 Label
const elmInfoResultLabel = document.createElement("label");
elmInfoResultLabel.textContent = 'Result';
// 2.2 Copy result text button
const elmInfoResultCopyButton = elmInfoSelectedCopyButton.cloneNode(true);
elmInfoResultCopyButton.id = 'dtx-info-copy-result-btn';
elmInfoResultCopyButton.onclick = function () {
    copyToClipboard(elmInfoResult.innerText);
}
// 2.3 Clear result text button
const elmInfoResultClearButton = elmInfoSelectedClearButton.cloneNode(true);
elmInfoResultClearButton.id = 'dtx-info-clear-result-btn';
elmInfoResultClearButton.onclick = function () {
    resetPopupContent();
    showNotify('Clean!');
}
// 2.4 Div as text area show result text
const elmInfoResult = document.createElement("div");
elmInfoResult.id = 'dtx-info-result';
elmInfoResult.contentEditable = "true";

// append child element to popup
const elmInfo = document.createElement("div");
elmInfo.id = "dtx-info";
elmInfo.appendChild(elmInfoSelectedTextLabel)
elmInfo.appendChild(elmInfoSelectedCopyButton)
elmInfo.appendChild(elmInfoSelectedClearButton)
elmInfo.appendChild(elmInfoSelectedText)
elmInfo.appendChild(elmInfoResultLabel)
elmInfo.appendChild(elmInfoResultCopyButton)
elmInfo.appendChild(elmInfoResultClearButton)
elmInfo.appendChild(elmInfoResult)

// Overlay element
const elmOverlay = document.createElement("div");
elmOverlay.id = "dtx-overlay";

// Notify element
const elmNotify = document.createElement("div");
elmNotify.id = "dtx-notify";
elmNotify.innerText = 'This is notify'

// Tooltip element (show after select text)
const elmTooltip = document.createElement("div");
elmTooltip.id = "dtx-container";
elmTooltip.textContent = "Tools";

// Event when click tooltip element
elmTooltip.onclick = function (event) {
    showPopup();
}

// Wrapper contain all element
const wrapper = document.createElement("div");
wrapper.id = "dtx-wrapper";
wrapper.appendChild(elmTooltip)
wrapper.appendChild(elmToolList)
wrapper.appendChild(elmInfo)
wrapper.appendChild(elmOverlay)
wrapper.appendChild(elmNotify)

// Append html tool to body
document.body.appendChild(wrapper);

// Event select a text paragraph
document.addEventListener('click', function(event) {
    const currentSelectedText = window.getSelection().toString().trim();
    if (currentSelectedText !== '') {
        setSelectedText(currentSelectedText);
        const x = event.pageX;
        const y = event.pageY;
        showTooltip(x, y + 20);
        event.stopPropagation();
    } else {
        hideElement(elmTooltip);
    }
});

// Click outside popup or overlay to hide popup tools
window.addEventListener("click", function(event) {
    const isOverlay = event.target.id === 'dtx-overlay';
    if (isOverlay) {
        // Hide the menus if visible
        hideElement(elmToolList)
        hideElement(elmInfo)
        hideElement(elmOverlay)
    }
});

function setSelectedText(value) {
    selectedText = value;
    elmInfoSelectedText.innerText = value;
}

// Show result
function setResult(result) {
    elmInfoResult.classList.remove('error');
    elmInfoResult.innerHTML = result;
}

// Show error message
function showError(message) {
    setResult(message);
    elmInfoResult.classList.add('error');
}

// Reset popup content
function resetPopupContent() {
    elmInfoResult.innerHTML = '';
}

// Reset tool list selection
function resetToolListSelection() {
    removeClassByClassName('active', 'dtx-tool-item');
}

// Show popup tool list and result
function showPopup() {
    resetPopupContent();
    resetToolListSelection();

    elmToolList.style.display = 'block';
    elmInfo.style.display = 'block';
    elmOverlay.style.display = 'block';

    // Set default tool base on selected text
    setDefaultTool()
}

// Show small tooltip after select a text range
function showTooltip(x = 0, y = 0) {
    elmTooltip.style.display = 'block';
    elmTooltip.style.top = y + 'px';
    elmTooltip.style.left = x + 'px';
}

// Hide an element
function hideElement(node) {
    node.style.display = 'none';
}

// Remove class by class name
function removeClassByClassName(classNameRemove, elementClassName) {
    for (const elm of document.getElementsByClassName(elementClassName)) {
        elm.classList.remove(classNameRemove);
    }
}

// Highlight json
function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'dtx-json-f-number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'dtx-json-f-key';
            } else {
                cls = 'dtx-json-f-string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'dtx-json-f-boolean';
        } else if (/null/.test(match)) {
            cls = 'dtx-json-f-null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

// Check is valid json
function isJsonString(jsonString) {
    try {
        JSON.parse(jsonString);
    } catch (e) {
        return false;
    }
    return true;
}

// Get default tool id when show popup base on selected text
function getDefaultToolId() {
    if (!selectedText) {
        return false;
    }

    // Format timestamp
    const isNumber = (typeof selectedText === 'string' || typeof selectedText === 'number') && !isNaN(selectedText);
    if (isNumber && selectedText.length === 10) {
        return listTools.toHumanDate.id;
    }

    // Format json string
    if (isJsonString(selectedText)) {
        return listTools.formatJson.id;
    }
    return false;
}

// default tool select
function setDefaultTool() {
    let toolId = getDefaultToolId();
    if (!toolId) {
        return;
    }

    let element = document.getElementById(toolId);
    if (!element) {
        return;
    }

    element.click();
}

// Copy text to clipboard
function copyToClipboard(text = '') {
    if (!text || !navigator?.clipboard) {
        return;
    }
    navigator.clipboard.writeText(text).then(function () {
        showNotify('Copied!');
    });
}

// Show notify
function showNotify(msg = '') {
    if (!msg) {
        return;
    }

    elmNotify.style.display = 'block';
    elmNotify.textContent = msg;
    setTimeout(function() {
        elmNotify.style.display = 'none';
        elmNotify.textContent = 'You forgot notify message in your code!';
    }, 2000);
}