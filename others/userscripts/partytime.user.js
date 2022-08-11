// ==UserScript==
// @name         Party Time
// @namespace    NyaggerSquad
// @icon         https://i.imgur.com/CXj6fxh.png
// @version      0.8
// @description  Everyone's invited. Press Ctrl+C during a match to get a link to the game. Anyone with the script can use that url to spectate.
// @author       anon
// @include      https://mahjongsoul.game.yo-star.com/
// @include      https://game.mahjongsoul.com/
// @include      https://game.maj-soul.com/1/
// @updateURL    https://repo.riichi.moe/others/userscripts/partytime.user.js
// @downloadURL  https://repo.riichi.moe/others/userscripts/partytime.user.js
// ==/UserScript==

(function () {
    'use strict';
    let spec = localStorage.getItem("_pre_spec");

    document.addEventListener('keydown', e => {
        if (e.code === 'KeyC' && e.ctrlKey) {
            let uuid = GameMgr.Inst.mj_game_uuid;
            if (!uuid)
                return;
            navigator.clipboard.writeText(window.location + "?spec=" + uuid);
            uiscript.UI_Popout.PopOutNoTitle("Spectator URL copied to clipboard.", null);
        }
    });

    function spectateUUID(uuid) {
        localStorage.removeItem("_pre_spec");
        uiscript.UI_Live_Broadcast.fetchInfo(uuid, Laya.Handler.create(uiscript.UI_Friend.Inst, function (e) {
            e.success && uiscript.UI_Friend.Inst.close(Laya.Handler.create(uiscript.UI_Friend.Inst, function () {
                let plist = e.data.live_head.players;
                uiscript.UI_Live_Broadcast.goToWatch(uuid, e.data, plist[Math.floor(Math.random() * plist.length)].account_id)
            }))
        }, null, !1))
    }

    var LazyCheck = setInterval(function () {
        if (uiscript && uiscript.UI_Lobby && uiscript.UI_Lobby.Inst && uiscript.UI_Lobby.Inst.pending_lobby_jump) {
            uiscript.UI_Lobby.Inst.pending_lobby_jump = (function () {
                var cacheF = uiscript.UI_Lobby.Inst.pending_lobby_jump;
                return function () {
                    var result = cacheF.apply(this, arguments);
                    if (typeof spec !== 'undefined' && spec !== null) {
                        spectateUUID(spec);
                    }
                    return result;
                };
            })();
            clearInterval(LazyCheck);
        }
    }, 2000);
})();