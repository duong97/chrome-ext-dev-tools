// Hard code mở form login để force login cho admin
// Prepend login form for task.kynaforkids.vn/login
if (window.location.host === "task.kynaforkids.vn" && window.location.pathname === "/login") {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
        const loginFormHtml = `
            <div id="login-form" style="margin-bottom: 20px; border: 1px solid #ccc; padding: 15px; background: #f9f9f9;">
              <form onsubmit="return keepAnchorOnSignIn(this);" action="/login" accept-charset="UTF-8" name="form-0f107ebe" method="post">
                <input name="utf8" type="hidden" value="✓" autocomplete="off">
                <input type="hidden" name="authenticity_token" value="${csrfToken}" autocomplete="off">
                <input type="hidden" name="back_url" value="/" autocomplete="off">

                <label for="username" style="display: block; margin-bottom: 5px;">Login (Admin force login)</label>
                <input type="text" name="username" id="username" tabindex="1" autofocus="autofocus" style="margin-bottom: 10px; display: block; width: 100%; padding: 5px;">

                <label for="password" style="display: block; margin-bottom: 5px;">
                  Password
                  <a class="lost_password" href="/account/lost_password" style="float: right; font-size: 0.8em;">Lost password</a>
                </label>
                <input type="password" name="password" id="password" tabindex="2" style="margin-bottom: 10px; display: block; width: 100%; padding: 5px;">

                <input type="submit" name="login" value="Login" tabindex="5" id="login-submit" style="padding: 5px 15px; cursor: pointer;">
              </form>
            </div>
        `;
        const contentDiv = document.getElementById('content');
        if (contentDiv) {
            contentDiv.insertAdjacentHTML('afterbegin', loginFormHtml);
        }
    }
}
