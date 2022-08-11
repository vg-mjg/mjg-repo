// ==UserScript==
// @name         Oversees
// @namespace    NyaggerSquad
// @icon         https://i.imgur.com/fI450UV.png
// @version      1.0
// @description  Yes, it's a pun. Shows players' server origin.
// @author       anon
// @include      https://mahjongsoul.game.yo-star.com/
// @include      https://game.mahjongsoul.com/
// @include      https://game.maj-soul.com/1/
// @updateURL    https://repo.riichi.moe/others/userscripts/oversees.user.js
// @downloadURL  https://repo.riichi.moe/others/userscripts/oversees.user.js
// ==/UserScript==

(function() {
    'use strict';

    const zones = ["","CN","JP","EN"];

    function refreshHook(){
        for (let i in view.DesktopMgr.Inst.players){
            let seat = view.DesktopMgr.Inst.players[i].seat;
            let local = view.DesktopMgr.Inst.seat2LocalPosition(seat);
            let player_data = view.DesktopMgr.Inst.player_datas[seat];
            if (player_data == undefined || player_data.account_id == undefined)
                continue;
            let player_info = uiscript.UI_DesktopInfo.Inst._player_infos[local];
            player_info.name.parent.width = 220;
            player_info.name.getChildByName("name").text = player_data.nickname + " ["+zones[game.Tools.get_zone_id(player_data.account_id)]+"]";
            game.Tools.child_align_center(player_info.name.getChildByName("name"));
            game.Tools.child_align_center(player_info.name.parent);
        }
    }

    function retardCompatibilityFix(){
        uiscript.UI_DesktopInfo.Inst.refreshSeat = (function() {
            var cacheF = uiscript.UI_DesktopInfo.Inst.refreshSeat;
            return function(){
                var result = cacheF.apply(this, arguments);
                refreshHook();
                return result;
            };
        })();
    }

    var LazyCheck = setInterval(function(){
        if (GameMgr && GameMgr.Inst && GameMgr.Inst.EnterMJ){
            GameMgr.Inst.EnterMJ = (function(){
                var cacheF = GameMgr.Inst.EnterMJ;
                return function(){
                    var result = cacheF.apply(this, arguments);
                    refreshHook();
                    retardCompatibilityFix();
                    return result;
                };
            })();
            clearInterval(LazyCheck);
        }
    },2000);
})();