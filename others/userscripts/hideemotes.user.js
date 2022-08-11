// ==UserScript==
// @name        Hide Emotes
// @namespace   majsoul_script
// @version     1.0
// @author      anon
// @description   no fun allowed script that hides emotes
// @include      https://mahjongsoul.game.yo-star.com/
// @include      https://game.mahjongsoul.com/
// @include      https://majsoul.union-game.com/0/
// @updateURL    https://repo.riichi.moe/others/userscripts/hideemotes.user.js
// @downloadURL  https://repo.riichi.moe/others/userscripts/hideemotes.user.js
// ==/UserScript==

var waitemojimutemod = setInterval(function () {
    try {
        uiscript.UI_DesktopInfo.Inst._player_infos[1].headbtn
        uiscript.UI_DesktopInfo.Inst._player_infos[1].headbtn.__proto__.reset = (function () {
            var cacheF = uiscript.UI_DesktopInfo.Inst._player_infos[1].headbtn.__proto__.reset;
            return function () {
                cacheF.apply(this, arguments);
                this.emj_banned = !0;
            };
        })();
        clearInterval(waitemojimutemod);
    }
    catch (err) { }
}, 1000);