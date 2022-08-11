// ==UserScript==
// @name         America! F U C K yeah!
// @namespace    NyaggerSquad
// @icon         https://i.imgur.com/8rD6fPE.png
// @version      1.1.0
// @description  Super secret complex script very hush-hush
// @author       anon
// @include      https://mahjongsoul.game.yo-star.com/
// @include      https://game.mahjongsoul.com/
// @include      https://game.maj-soul.com/1/
// @updateURL    https://repo.riichi.moe/others/userscripts/usa.user.js
// @downloadURL  https://repo.riichi.moe/others/userscripts/usa.user.js
// ==/UserScript==


(function () {
    'use strict'

    var LobbyCheck = setInterval(function () {
        if (GameMgr && GameMgr.Inst && GameMgr.Inst.EnterLobby) {
            GameMgr.Inst.EnterLobby = (function () {
                var cacheF = GameMgr.Inst.EnterLobby;
                return function () {
                    GameMgr.country = "US";
                    var result = cacheF.apply(this, arguments);
                    return result;
                };
            })();
            clearInterval(LobbyCheck);
        }
    }, 2000);
})();
