/***
 * @todo Redirect the user to login page if token is not present.
 */
function checklogin() {
    const x = localStorage.getItem('token');
    if (x == null) window.location.replace('../login/index.html');
}

checklogin();