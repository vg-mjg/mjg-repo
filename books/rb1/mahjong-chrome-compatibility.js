'use strict';

let incompatible_browsers = ['Chrome', 'Opera', 'OPE', 'MSIE'];

window.addEventListener("DOMContentLoaded", () => {
    for (let i = 0; i < incompatible_browsers.length; i++) {
        if (navigator.userAgent.indexOf(incompatible_browsers[i]) >= 0) {
            convert_tiles();
        }
    }
});
