// ==============================================
// Team Page Shared JS — /mjg/ League 7
// Used by all teams/t1.html through teams/t16.html
// ==============================================

// OC Tab Switching
(function () {
    const ocTabBtns = document.querySelectorAll('.oc-tab-btn');
    const ocTabContents = document.querySelectorAll('.oc-tab-content');

    ocTabBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const ocId = btn.getAttribute('data-oc');
            ocTabBtns.forEach(function (b) { b.classList.remove('active'); });
            ocTabContents.forEach(function (c) { c.classList.remove('active'); });
            btn.classList.add('active');
            document.getElementById('oc-' + ocId).classList.add('active');
        });
    });
})();

// 4chan-style image expand/contract on click
(function () {
    document.querySelectorAll('.post-thumb').forEach(function (thumb) {
        thumb.addEventListener('click', function (e) {
            e.preventDefault();
            thumb.classList.toggle('expanded');
        });
    });
})();
