// ==UserScript==
// @name         Anonymizer
// @namespace    NyaggerSquad
// @icon         https://i.imgur.com/LeIOXEm.png
// @version      1.1.3
// @description  Press ctrl to Why
// @author       anon
// @include      https://mahjongsoul.game.yo-star.com/
// @include      https://game.mahjongsoul.com/
// @include      https://game.maj-soul.com/1/
// @updateURL    https://repo.riichi.moe/others/userscripts/anonymizer.user.js
// @downloadURL  https://repo.riichi.moe/others/userscripts/anonymizer.user.js
// ==/UserScript==

(function () {
    'use strict'

    var NAME = "";
    var TITLE = 600001;
    var RANK = 10101;
    var RANK3 = 20101;
    var HEAD = 0;//400101;
    var KEY = 17;

    var USE_TOGGLE = false;

    var ready = true;
    var down = false;
    var toggle = false;
    document.addEventListener('keydown', function (e) {
        e = e || window.event;
        if ((e.keyCode == KEY || e.key == KEY) && ready && !down) {
            if (!USE_TOGGLE)
                Anonymize(true);
        }
    }, true);

    document.addEventListener('keyup', function (e) {
        e = e || window.event;
        if ((e.keyCode == KEY || e.key == KEY) && ready) {
            Anonymize(false);
        }
    }, true);

    var WinNameBeautifulHack = "";
    function Anonymize(check) {
        if (USE_TOGGLE) {
            toggle = !toggle;
            check = toggle;
        }
        let uiscene = 0;
        function checkScene(scene) {
            return scene && ((scene.Inst && scene.Inst._enable) || (scene._Inst && scene._Inst._enable))
        }

        if (checkScene(uiscene = uiscript.UI_Lobby)) {
            //uiscene.Inst.top.label_name.text = NAME;
            //uiscene.Inst.top.name.text = NAME;
            uiscene.Inst.top.name._childs[0]._tf.text = NAME;
            uiscene.Inst.top.rank.id = RANK;
            uiscene.Inst.top.title.id = TITLE;
            uiscene.Inst.top.small_rank.id = RANK3;
            if (!check) uiscene.Inst.refreshInfo();
        }
        if (checkScene(uiscene = uiscript.UI_PlayerInfo)) {
            //uiscene.Inst.name.text = NAME;
            //uiscript.UI_PlayerInfo.Inst.container_info.getChildByName("name")
            uiscene.Inst.name._childs[0]._tf.text = NAME;

            uiscene.Inst.level.exp = 0;
            uiscript.UI_PlayerInfo.Inst.detail_data.mj_category == 1 ? uiscene.Inst.level.id = RANK : uiscene.Inst.level.id = RANK3;
            uiscene.Inst.title.id = TITLE;
            if (!check) {
                uiscene.Inst.refreshBaseInfo();
                uiscript.UI_PlayerInfo.Inst.changeMJCategory(uiscript.UI_PlayerInfo.Inst.detail_data.mj_category);
            }
        }
        if (checkScene(uiscene = uiscript.UI_DesktopInfo)) {
            for (let i in uiscene.Inst._player_infos) {
                //uiscene.Inst._player_infos[i].name.text = NAME;
                //uiscript.UI_DesktopInfo.Inst._player_infos[0].container.getChildByName("container_name").getChildByName("name")
                uiscene.Inst._player_infos[i].name._childs[0]._tf.text = NAME;
                uiscene.Inst._player_infos[i].title.id = TITLE;

                if (HEAD) uiscene.Inst._player_infos[i].head.id = HEAD;
            }
            if (!check) uiscene.Inst.refreshSeat();
        }
        if (checkScene(uiscene = uiscript.UI_GameEnd)) {
            for (let i in uiscene.Inst.players)
                //uiscene.Inst.players[i].label_name.text = NAME;
                uiscene.Inst.players[i].name._childs[0]._tf.text = NAME;
            if (!check) uiscene.Inst.show();
        }
        if (checkScene(uiscene = uiscript.UI_ScoreChange)) {
            for (let i in uiscene.Inst.viewplayers) {
                //uiscene.Inst.viewplayers[i].txt_name.text = NAME;
                uiscene.Inst.viewplayers[i].name._childs[0]._tf.text = NAME;
                if (HEAD) uiscene.Inst.viewplayers[i].head.id = HEAD;
            }
            //if (!check) uiscene.Inst.show(!1);
        }
        if (checkScene(uiscene = uiscript.UI_FightBegin)) {
            for (let i in uiscene._Inst.cells) {
                uiscene._Inst.cells[i].title.id = TITLE;
                uiscene._Inst.cells[i].rank.id = RANK;
                //uiscene._Inst.cells[i].name.text = NAME;
                uiscene._Inst.cells[i].name._childs[0]._tf.text = NAME;
                //uiscene._Inst.cells[i].body
            }
        }
        if (checkScene(uiscene = uiscript.UI_Win)) {
            if (check) {
                WinNameBeautifulHack = uiscene.Inst.winner_name._childs[0]._tf.text
                //uiscene.Inst.label_winner_name.text = NAME;
                uiscene.Inst.winner_name._childs[0]._tf.text = NAME;
            } else uiscene.Inst.winner_name._childs[0]._tf.text = WinNameBeautifulHack;
            //if (!check) uiscene.Inst.show(uiscene.Inst.data, !1);
        }
        if (checkScene(uiscene = uiscript.UI_WaitingRoom)) {
            for (let i in uiscene.Inst.players) {
                //uiscene.Inst.player_cells[i].name.text = NAME;
                uiscene.Inst.player_cells[i].name._childs[0]._tf.text = NAME;
                uiscene.Inst.player_cells[i].rank.id = RANK;
                uiscene.Inst.player_cells[i].title.id = TITLE;
                if (!check) uiscene.Inst._refreshPlayerInfo(uiscene.Inst.players[i]);
            }
        }
        down = check;
    }

    function ToggleCheck() {
        var cacheF = uiscript.UIBase.onEnable;
        return function () {
            console.log(this);
            var result = cacheF.apply(this, arguments);
            return result;
        };
    }

    var LobbyCheck = setInterval(function () {
        if (GameMgr && GameMgr.Inst && GameMgr.Inst.EnterLobby) {
            GameMgr.Inst.EnterLobby = (function () {
                var cacheF = GameMgr.Inst.EnterLobby;
                return function () {
                    ready = true;
                    uiscript.UIBase.onEnable = ToggleCheck;
                    var result = cacheF.apply(this, arguments);
                    return result;
                };
            })();
            clearInterval(LobbyCheck);
        }
    }, 2000);
})();

