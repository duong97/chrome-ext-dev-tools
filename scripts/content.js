// Tool config
const listTools = {
    base64encode: {
        label: "Base64 encode",
        events:{
            onclick: function (e) {
                return btoa(selectedText);
            }
        }
    },
    base64decode: {
        label: "Base64 decode",
        events:{
            onclick: function (e) {
                return atob(selectedText);
            }
        }
    },
    toHumanDate: {
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
        label: "Format Json",
        events:{
            onclick: function (e) {
                let formattedJson = syntaxHighlight(JSON.stringify(JSON.parse(selectedText), null, 4));
                return '<pre style="white-space: pre-wrap;">'+formattedJson+'</pre>';
            }
        }
    },
    trimAllWhitespaces: {
        label: "Trim all whitespaces",
        events:{
            onclick: function (e) {
                return selectedText.replaceAll(/\s/g,'');
            }
        }
    },
    replaceSlashQuote: {
        label: "Replace \\\" with \"",
        events:{
            onclick: function (e) {
                return selectedText.replaceAll("\\\"",'"');
            }
        }
    },
}

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
    child.id = key;
    child.className = 'dtx-tool-item';
    elmToolList.appendChild(child);
}

// Popup info element
const elmInfoSelectedTextLabel = document.createElement("label");
elmInfoSelectedTextLabel.textContent = 'Selected text';
const elmInfoSelectedText = document.createElement("textarea");
elmInfoSelectedText.id = 'dtx-info-selected-text';

const elmInfoResultLabel = document.createElement("label");
elmInfoResultLabel.textContent = 'Result';
const elmInfoResult = document.createElement("div");
elmInfoResult.id = 'dtx-info-result';
elmInfoResult.contentEditable = "true";

const elmInfo = document.createElement("div");
elmInfo.id = "dtx-info";
elmInfo.appendChild(elmInfoSelectedTextLabel)
elmInfo.appendChild(elmInfoSelectedText)
elmInfo.appendChild(elmInfoResultLabel)
elmInfo.appendChild(elmInfoResult)

// Overlay element
const elmOverlay = document.createElement("div");
elmOverlay.id = "dtx-overlay";

// Tooltip element (show after select text)
const elmTooltip = document.createElement("div");
elmTooltip.id = "dtx-container";
elmTooltip.textContent = "Tools";
var selectedText = '';

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