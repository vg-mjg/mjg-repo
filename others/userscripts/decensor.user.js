// ==UserScript==
// @name         You're all free now!
// @namespace    NyaggerSquad
// @icon         https://i.imgur.com/tKWKjza.jpg
// @version      1.1.0
// @description  Riichi-Oh: The Story of Riichi
// @author       anon
// @include      https://mahjongsoul.game.yo-star.com/
// @include      https://game.mahjongsoul.com/
// @include      https://game.maj-soul.com/1/
// @updateURL    https://repo.riichi.moe/others/userscripts/decensor.user.js
// @downloadURL  https://repo.riichi.moe/others/userscripts/decensor.user.js
// ==/UserScript==

(function() {
    'use strict';

    const COWARD = true;

    var LazyCheck = setInterval(function(){
        if (GameMgr && GameMgr.Inst && GameMgr.Inst.EnterLobby) {
            GameMgr.Inst.EnterLobby = (function () {
                var cacheF = GameMgr.Inst.EnterLobby;
                return function(){
                    if (COWARD)
                        app.Taboo.test = (a) => null;
                    game.Tools.strWithoutForbidden = (a) => a;
                    var result = cacheF.apply(this, arguments);
                    return result;
                };
            })();
            clearInterval(LazyCheck);
        }
    },2000);
})();

