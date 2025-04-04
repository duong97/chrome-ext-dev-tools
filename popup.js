async function fetchAndExtractValue() {
    try {
        loading();

        // Get token from staging
        const response = await fetch('https://admin-staging.kynaforkids.vn/setting/params/view?id=62');
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const table = doc.getElementById('w0');
        const rows = table?.querySelectorAll('tr') || [];

        let value = null;

        rows.forEach(row => {
            const th = row.querySelector('th');
            const td = row.querySelector('td');
            if (th && th.textContent.trim() === 'Value') {
                value = td.textContent.trim();
            }
        });

        if (value) {
            // Update local
            fetch('http://admin.kynaforkids.local/setting/params/update?id=65', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    'Setting[key]': 'ZALO_ACCESS_TOKEN',
                    'Setting[name]': 'zalo access token. updated at: ' + (new Date()).toLocaleString(),
                    'Setting[value]': value
                }),
                credentials: 'include' // Important to include cookies like _csrf-backend
            })
                .then(response => response.text())
                .then(result => {
                    loading('hide');
                    alert('Done');
                })
                .catch(error => {
                    loading('hide');
                    alert('error' + error.message);
                });
        } else {
            alert("Check login staging (token not found)");
            loading('hide');
        }
    } catch (error) {
        loading('hide');
        console.error('Error:', error);
    }
}

function loading(value = 'show') {
    const isShow = value === 'show';
    document.getElementById('loading').style.display = isShow ? 'block' : 'none';
}

document
    .getElementById('sync-zalo-token')
    .addEventListener('click', fetchAndExtractValue);
