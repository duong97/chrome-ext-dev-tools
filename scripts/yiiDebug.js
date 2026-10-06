// Copy Yii Debug request as cURL
// Hiện nút "Copy as cURL" trên trang Yii debugger (/debug/default/view), lấy dữ liệu từ Request panel
(function () {
    const toolbar = document.getElementById('yii-debug-toolbar');
    if (!toolbar || !window.location.pathname.includes('/debug/default/view')) {
        return;
    }

    // Link Request panel của tag hiện tại (vẫn đúng khi URL không có tag => latest)
    const requestPanelLink = toolbar.querySelector('a[href*="panel=request"]');
    if (!requestPanelLink) {
        return;
    }

    // Header không cần đưa vào curl
    const SKIP_HEADERS = ['host', 'connection', 'content-length', 'accept-encoding', 'postman-token'];

    let curlPromise = null;

    function getCurl() {
        if (!curlPromise) {
            curlPromise = fetch(requestPanelLink.href, {credentials: 'include'})
                .then(response => response.text())
                .then(html => buildCurl(new DOMParser().parseFromString(html, 'text/html')));
        }
        return curlPromise;
    }

    // Lấy các bảng trong Request panel theo tiêu đề h3: {caption: {name: rawValue}}
    function getTables(doc) {
        const tables = {};
        doc.querySelectorAll('h3').forEach(h3 => {
            const rows = {};
            const table = h3.nextElementSibling?.querySelector('table');
            table?.querySelectorAll('tbody tr').forEach(tr => {
                const th = tr.querySelector('th');
                const td = tr.querySelector('td');
                if (th && td) {
                    rows[th.textContent.trim()] = td.textContent;
                }
            });
            tables[h3.textContent.trim()] = rows;
        });
        return tables;
    }

    // Parse giá trị do yii\helpers\VarDumper::dumpAsString sinh ra ('str', 123, true, null, [ 'k' => v ])
    function parseDump(text) {
        let pos = 0;
        const src = text.trim();

        function skipSpaces() {
            while (pos < src.length && /\s/.test(src[pos])) pos++;
        }

        function parseValue() {
            skipSpaces();
            const ch = src[pos];
            if (ch === "'") {
                let out = '';
                pos++;
                while (pos < src.length && src[pos] !== "'") {
                    if (src[pos] === '\\' && pos + 1 < src.length) {
                        pos++;
                        out += src[pos] === '0' ? '\0' : src[pos];
                    } else {
                        out += src[pos];
                    }
                    pos++;
                }
                if (src[pos] !== "'") throw new Error('Unterminated string');
                pos++;
                return out;
            }
            if (ch === '[') {
                pos++;
                const result = {};
                skipSpaces();
                while (src[pos] !== ']') {
                    const key = parseValue();
                    skipSpaces();
                    if (src.substr(pos, 2) !== '=>') throw new Error('Expected =>');
                    pos += 2;
                    result[key] = parseValue();
                    skipSpaces();
                    if (pos >= src.length) throw new Error('Unterminated array');
                }
                pos++;
                return result;
            }
            const match = /^(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null)/.exec(src.slice(pos));
            if (!match) throw new Error('Unknown token at ' + pos);
            pos += match[0].length;
            if (match[0] === 'true') return true;
            if (match[0] === 'false') return false;
            if (match[0] === 'null') return null;
            return match[0];
        }

        const value = parseValue();
        skipSpaces();
        if (pos !== src.length) throw new Error('Unexpected trailing data');
        return value;
    }

    function parseDumpSafe(text) {
        try {
            return parseDump(text);
        } catch (e) {
            return text.trim();
        }
    }

    // Flatten array lồng nhau thành dạng form: a[b][c]=value
    function flatten(value, prefix, out = []) {
        if (value !== null && typeof value === 'object') {
            for (const key in value) {
                flatten(value[key], prefix ? `${prefix}[${key}]` : key, out);
            }
        } else {
            out.push([prefix, value === null ? '' : value === true ? '1' : value === false ? '' : String(value)]);
        }
        return out;
    }

    function shellQuote(str) {
        return "'" + String(str).replace(/'/g, "'\\''") + "'";
    }

    function getRequestUrl(doc, tables) {
        // Dòng summary: "<tag>: GET <a href="url">url</a> at ..."
        const link = [...doc.querySelectorAll('.callout a[href]')]
            .find(a => /^https?:\/\//.test(a.getAttribute('href')));
        if (link) {
            return link.getAttribute('href');
        }

        const server = tables['$_SERVER'] || {};
        const scheme = parseDumpSafe(server['REQUEST_SCHEME'] || "'http'");
        const host = parseDumpSafe(server['HTTP_HOST'] || "''");
        const uri = parseDumpSafe(server['REQUEST_URI'] || "'/'");
        return `${scheme}://${host}${uri}`;
    }

    function buildCurl(doc) {
        const tables = getTables(doc);
        const general = tables['General Info'] || {};
        const method = String(parseDumpSafe(general['method'] || "'GET'")).toUpperCase();
        const url = getRequestUrl(doc, tables);

        const parts = [`curl --location --request ${method} ${shellQuote(url)}`];

        // Headers
        const requestHeaders = tables['Request Headers'] || {};
        const files = tables['$_FILES'] || {};
        const isMultipart = Object.keys(files).length > 0;
        for (const name in requestHeaders) {
            const lowerName = name.toLowerCase();
            if (SKIP_HEADERS.includes(lowerName)) continue;
            // multipart boundary sẽ do curl/postman tự sinh
            if (isMultipart && lowerName === 'content-type') continue;
            const value = parseDumpSafe(requestHeaders[name]);
            const headerValue = typeof value === 'object' ? Object.values(value).join(', ') : value;
            if (headerValue === '') continue;
            parts.push(`--header ${shellQuote(`${name}: ${headerValue}`)}`);
        }

        // Body
        const post = tables['$_POST'] || {};
        const rawBody = parseDumpSafe((tables['Request Body'] || {})['Raw'] || "''");
        if (isMultipart) {
            for (const name in post) {
                flatten(parseDumpSafe(post[name]), name).forEach(([key, value]) => {
                    parts.push(`--form ${shellQuote(`${key}=${value}`)}`);
                });
            }
            for (const name in files) {
                const file = parseDumpSafe(files[name]);
                flatten(file?.name ?? file, name).forEach(([key, fileName]) => {
                    parts.push(`--form ${shellQuote(`${key}=@"/path/to/${fileName}"`)}`);
                });
            }
        } else if (typeof rawBody === 'string' && rawBody !== '') {
            parts.push(`--data-raw ${shellQuote(rawBody)}`);
        } else if (Object.keys(post).length) {
            for (const name in post) {
                flatten(parseDumpSafe(post[name]), name).forEach(([key, value]) => {
                    parts.push(`--data-urlencode ${shellQuote(`${key}=${value}`)}`);
                });
            }
        }

        return parts.join(' \\\n');
    }

    // navigator.clipboard chỉ có trên secure context (https/localhost), *.local là http => fallback execCommand
    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand('copy');
        textarea.remove();
        return ok ? Promise.resolve() : Promise.reject(new Error('Copy failed'));
    }

    // Button
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'dtx-yii-copy-curl';
    button.className = 'btn btn-sm btn-primary';
    button.textContent = 'Copy as cURL';
    button.title = 'Copy request as cURL (import vào Postman)';
    button.onclick = function () {
        getCurl()
            .then(copyText)
            .then(() => showNotify('Copied cURL!'))
            .catch(err => {
                curlPromise = null;
                showNotify('Copy cURL error: ' + err.message);
            });
    };

    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group btn-group-sm';
    btnGroup.appendChild(button);

    const callout = document.querySelector('.main-container .callout');
    if (callout) {
        const lastGroup = [...callout.children].filter(el => el.classList.contains('btn-group')).pop();
        (lastGroup || callout.firstChild)?.after(btnGroup);
    } else {
        btnGroup.classList.add('dtx-yii-copy-curl-floating');
        document.body.appendChild(btnGroup);
    }

    // Prefetch để lúc click copy ngay (giữ user activation cho execCommand)
    getCurl().catch(() => {
        curlPromise = null;
    });
})();
