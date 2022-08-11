// ==UserScript==
// @name         keyboard controls
// @namespace    majsoul_script
// @version      1.0
// @author       anon
// @match        https://www.majsoul.com/*
// @match        https://game.maj-soul.com/*
// @match        https://majsoul.union-game.com/
// @match        https://game.mahjongsoul.com/
// @match        https://mahjongsoul.game.yo-star.com/
// @description  RTFM
// @updateURL    https://repo.riichi.moe/others/userscripts/keyboard.user.js
// @downloadURL  https://repo.riichi.moe/others/userscripts/keyboard.user.js
// ==/UserScript==
// v3
// get keycodes here: https://keycode.info/
// skip and discard hotkeys will also press the Confirm button at the end of round/game


// planned:
// selector for multi-wait chi calls

// maybe:
// tsumogiri + cancel on same button? might be conflicts such as tenpai state
// correctly switch selected tile after calling if tile moved
// allow skipping of quest/reward screen


// If CONFIRM_DISCARDS is false tile hotkeys will discard immediately.
var CONFIRM_DISCARDS = false;
// show the hotkeys underneath the tiles.
var SHOW_TILE_HOTKEYS = true;
//                   1   2   3   4   5   6   7   8   9   0    -    =  bksp |
var TILE_HOTKEYS = [49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 189, 187, 8, 220];
// some may not display correctly, override below:
var TILE_DISP = ['', '', '', '', '', '', '', '', '', '', '', '=', '←', '\\'];
var HOTKEYS = {
    // skip and discard hotkeys will also press the Confirm button at the end of round/game
    'left': 37, // left arrow
    'right': 39, // right arrow
    'discard': 13, // enter
    'tsumogiri': 84, // t
    'skip': 83, // s
    'pon': 80, // p
    'chi': 67, // c
    'kan': 75, // k
    'win': 87, // w
    'riichi': 82, // r
    'pei': 78, // n
    'nineterminalsabort': 188, // ,
    'autowin': 72, // h
    'nocall': 70, // f
    'autogiri': 68, // d
}
// NUMPAD KEYS:        7    8    9    4    5    6   1   2   3   0    .    +
var EMOJI_HOTKEYS = [103, 104, 105, 100, 101, 102, 97, 98, 99, 96, 110, 107];
//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////
var waitkbmod = setInterval(() => {
    try {
        uiscript.UI_DesktopInfo.Inst.block_emo
        view.ViewPlayer_Me.Inst.hand

        window.onkeydown = function(e) {
            // should enable spamming while key is held down (might be system/browser dependant)
            var key = e.keyCode ? e.keyCode : e.which;
            switch (key) {
                case HOTKEYS.left:
                    // move 1 tile left
                    move_left();
                    break;
                case HOTKEYS.right:
                    // move 1 tile right
                    move_right();
                    break;
            }
        }
        window.onkeyup = function(e) {
            var key = e.keyCode ? e.keyCode : e.which;
            switch (key) {
                case HOTKEYS.discard:
                    discardTile(selectedTile);
                    pressConfirm();
                    break;
                case HOTKEYS.tsumogiri:
                    discardTile(view.ViewPlayer_Me.Inst.hand.length - 1);
                    break;
                case HOTKEYS.skip:
                    callOperation('btn_cancel')
                    pressConfirm();
                    break;
                case HOTKEYS.pon:
                    callOperation('btn_peng')
                    break;
                case HOTKEYS.chi:
                    callOperation('btn_chi')
                    // if there are multiple, check this._data.chi.length > 1, see i.prototype.onBtn_Chi
                    break;
                case HOTKEYS.kan:
                    callOperation('btn_gang')
                    break;
                case HOTKEYS.win:
                    callOperation('btn_hu')
                    callOperation('btn_zimo')
                    break;
                case HOTKEYS.riichi:
                    callOperation('btn_lizhi')
                    break;
                case HOTKEYS.pei:
                    callOperation('btn_babei')
                    break;
                case HOTKEYS.nineterminalsabort:
                    callOperation('btn_jiuzhongjiupai')
                    break;
                case HOTKEYS.autowin:
                    toggleAuto('btn_autohu')
                    break;
                case HOTKEYS.nocall:
                    toggleAuto('btn_autonoming')
                    break;
                case HOTKEYS.autogiri:
                    toggleAuto('btn_automoqie')
                    break;
            }
            // send emojis
            if (EMOJI_HOTKEYS.includes(key)) {
                sendEmoji(EMOJI_HOTKEYS.indexOf(key));
            }
            // choose tile directly
            if (TILE_HOTKEYS.includes(key)) {
                var tile = TILE_HOTKEYS.indexOf(key);
                if (tile < view.ViewPlayer_Me.Inst.hand.length) {
                    if (CONFIRM_DISCARDS)
                        selectTile(tile);
                    else
                        discardTile(tile);

                }
            }

        }

        function toggleAuto(op) {
            uiscript.UI_DesktopInfo.Inst._container_fun.getChildByName(op)._clickHandler.method()
        }

        function discardTile(index) {
            view.ViewPlayer_Me.Inst._choose_pai = view.ViewPlayer_Me.Inst.hand[index];
            view.ViewPlayer_Me.Inst.can_discard && view.ViewPlayer_Me.Inst._choose_pai.valid && (view.ViewPlayer_Me.Inst.DoDiscardTile(),
                view.ViewPlayer_Me.Inst.resetMouseState())
        }

        function pressConfirm() {
            if (uiscript.UIMgr.Inst && uiscript.UIMgr.Inst._ui_liuju && uiscript.UIMgr.Inst._ui_liuju._enable)
                uiscript.UIMgr.Inst._ui_liuju.onBtnConfirm();
            if (uiscript.UIMgr.Inst && uiscript.UIMgr.Inst._ui_gameend && uiscript.UIMgr.Inst._ui_gameend._enable)
                uiscript.UIMgr.Inst._ui_gameend.onConfirm();
            if (uiscript.UI_Huleshow.Inst && uiscript.UI_Huleshow.Inst._enable)
                uiscript.UI_Huleshow.Inst.onBtnConfirm();
            if (uiscript.UI_ScoreChange.Inst && uiscript.UI_ScoreChange.Inst._enable)
                uiscript.UI_ScoreChange.Inst.onBtnConfirm();
            if (uiscript.UIMgr.Inst && uiscript.UIMgr.Inst._ui_win && uiscript.UIMgr.Inst._ui_win._enable)
                uiscript.UIMgr.Inst._ui_win.onConfirm();
        }

        function sendEmoji(index) {
            var validc = 0;
            if (!uiscript.UI_DesktopInfo.Inst.block_emo.allgray)
                uiscript.UI_DesktopInfo.Inst.block_emo.scrollview._container_items._childs.some((e, i) => {
                    if (e.getChildByName('btn')._clickHandler) {
                        if (validc == index) {
                            uiscript.UI_DesktopInfo.Inst.block_emo.muted = true;
                            uiscript.UI_DesktopInfo.Inst.block_emo.scrollview._container_items._childs[i].getChildByName('btn')._clickHandler.method()
                            return true;
                        }
                        validc++;
                    }
                });
        }
        uiscript.UI_DesktopInfo.Inst.block_emo.__proto__.switchShow = (function() {
            var cacheF = uiscript.UI_DesktopInfo.Inst.block_emo.__proto__.switchShow;
            return function() {
                if (this.muted)
                    this.muted = false;
                else
                    return cacheF.apply(this, arguments);
            };
        })();

        var selectedTile = 0;

        function selectTile(index) {
            var n = 0,
                a = 0;
            Laya.Browser.width / 1920 < Laya.Browser.height / 1080 ? a = (Laya.Browser.height - Laya.Browser.width / 1920 * 1080) / 2 : n = (Laya.Browser.width - Laya.Browser.height / 1080 * 1920) / 2;
            Laya.MouseManager.instance.mouseX = ((index * view.ViewPlayer_Me.Inst.handwidth + view.ViewPlayer_Me.Inst.handorigin_x) - view.ViewPlayer_Me.Inst.screen_left) / (view.ViewPlayer_Me.Inst.screen_right - view.ViewPlayer_Me.Inst.screen_left) * (Laya.Browser.width - 2 * n);
            Laya.MouseManager.instance.mouseY = (-view.ViewPlayer_Me.Inst.screen_top) / (view.ViewPlayer_Me.Inst.screen_bottom - view.ViewPlayer_Me.Inst.screen_top) * (Laya.Browser.height - 2 * a)
            selectedTile = index;
        }

        function move_left() {
            selectedTile = (selectedTile + view.ViewPlayer_Me.Inst.hand.length - 1) % view.ViewPlayer_Me.Inst.hand.length;
            while (!view.ViewPlayer_Me.Inst.hand[selectedTile].valid) {
                selectedTile = (selectedTile + view.ViewPlayer_Me.Inst.hand.length - 1) % view.ViewPlayer_Me.Inst.hand.length;
            }
            selectTile(selectedTile);
        }

        function move_right() {
            selectedTile = (selectedTile + 1) % view.ViewPlayer_Me.Inst.hand.length;
            while (!view.ViewPlayer_Me.Inst.hand[selectedTile].valid) {
                selectedTile = (selectedTile + 1) % view.ViewPlayer_Me.Inst.hand.length;
            }
            selectTile(selectedTile);
        }

        function callOperation(opname) {
            this.GameMgr.Inst._pre_mouse_point = new Laya.Point(1, 1);
            if (uiscript.UI_LiQiZiMo.Inst.enable && uiscript.UI_LiQiZiMo.Inst._oplist.includes(opname)) {
                uiscript.UI_LiQiZiMo.Inst.onClickOpBtn(opname)
            } else if (uiscript.UI_ChiPengHu.Inst.enable && uiscript.UI_ChiPengHu.Inst._oplist.includes(opname)) {
                uiscript.UI_ChiPengHu.Inst.onClickOpBtn(opname)
            }
        }

        var keycss = `
:root {
	--keySize: 2.5vw;
	--keySizeH: 2.5vh;
}
.key__button {
  box-sizing: border-box;
  line-height: min(var(--keySize),calc(1.778*var(--keySizeH)));
  font-size: calc(.8*min(var(--keySize),calc(1.778*var(--keySizeH))));
  text-align: center;
  width: var(--keySize);
  color: #555;
  height: var(--keySize);
  max-width: calc(1.778*var(--keySizeH));
  max-height: calc(1.778*var(--keySizeH));
  border-color: #f2f2f2;
  border-style: solid;
  text-shadow: 0 0.5px 1px #777, 0 2px 6px #f2f2f2;
  border-width: 1px;
  border-radius: calc(.25*min(var(--keySize),calc(1.778*var(--keySizeH))));
  background: -webkit-linear-gradient(top, #f9f9f9 0%, #D2D2D2 80%, #c0c0c0 100%);
  font-family: sans-serif;
  display: inline-block;
  transition: box-shadow 0.3s ease, transform 0.15s ease;
  box-shadow: 0 0 1px #888,0 1px 0 #fff, 0 6px 0 #C0C0C0, 0 8px 17px rgba(#444, 0.4), 2px 1px 4px rgba(#444, 0.25), -2px 1px 4px rgba(#444, 0.25), 0 9px 16px rgba(#444, 0.1);
}
#tileLabels {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 100%;
  width: var(--labelsWidth);
  margin-left: var(--offsetLeft);
  pointer-events: none;
}
#tileWrapper
{
    width: 100vw; 
    height: 56.25vw; /* 100/56.25 = 1.778 */
    max-height: 100vh;
    max-width: 177.78vh; /* 16/9 = 1.778 */
    margin: auto;
    position: absolute;
    top:0;bottom:0; /* vertical center */
    left:0;right:0; /* horizontal center */
	pointer-events: none;
}
	`,
            head = document.head || document.getElementsByTagName('head')[0],
            style = document.getElementById('tileStyle') || document.createElement("STYLE");
        style.setAttribute('id', 'tileStyle');
        style.innerHTML = '';
        style.type = 'text/css';
        head.appendChild(style);
        var n = 0,
            a = 0;

        Laya.Browser.width / 1920 < Laya.Browser.height / 1080 ? a = (Laya.Browser.height - Laya.Browser.width / 1920 * 1080) / 2 : n = (Laya.Browser.width - Laya.Browser.height / 1080 * 1920) / 2;
        var x = (view.ViewPlayer_Me.Inst.handorigin_x - view.ViewPlayer_Me.Inst.screen_left - view.ViewPlayer_Me.Inst.handwidth / 2) / (view.ViewPlayer_Me.Inst.screen_right - view.ViewPlayer_Me.Inst.screen_left),
            w = view.ViewPlayer_Me.Inst.handwidth * 14 / (view.ViewPlayer_Me.Inst.screen_right - view.ViewPlayer_Me.Inst.screen_left);
        var keycssvars = ':root {--offsetLeft: ' + x * 100 + '%; --labelsWidth:' + w * 100 + '%; --maxWidth:' + w * 100 * 16 / 9 + 'vh}';
        style.appendChild(document.createTextNode(keycssvars));
        style.appendChild(document.createTextNode(keycss));


        var tileWrapper = document.getElementById('tileWrapper') || document.createElement("DIV");
        var tileLabels = document.getElementById('tileLabels') || document.createElement("DIV");
        tileWrapper.innerHTML = '';
        tileWrapper.setAttribute('id', 'tileWrapper')
        tileLabels.innerHTML = '';
        tileLabels.setAttribute('id', 'tileLabels')
        tileWrapper.appendChild(tileLabels);
        var TILE_ELEMENTS = [];
        TILE_HOTKEYS.forEach((key, i) => {
            let kdiv = document.createElement('DIV');
            kdiv.setAttribute('class', 'key__button');
            if (TILE_DISP[i])
                kdiv.innerHTML = TILE_DISP[i];
            else {
                let chrCode = key - 48 * Math.floor(key / 48);
                let chr = String.fromCharCode((96 <= key) ? chrCode : key);
                kdiv.innerHTML = chr;
            }
            tileLabels.appendChild(kdiv);
            TILE_ELEMENTS.push(kdiv);
        });
        document.body.appendChild(tileWrapper);

        function isInGame() {
            return this != null && view != null && view.DesktopMgr != null && view.DesktopMgr.Inst != null && view.DesktopMgr.player_link_state != null && game.Scene_MJ.Inst.active && (!uiscript.UI_GameEnd.Inst || !uiscript.UI_GameEnd.Inst.enable);
        }
        setInterval(() => {
            if (isInGame() && SHOW_TILE_HOTKEYS) {
                tileLabels.style.display = 'flex';
                // hide unneeded hotkeys
                TILE_ELEMENTS.forEach((e, i) => {
                    if (i < view.ViewPlayer_Me.Inst.hand.length)
                        e.style.visibility = 'visible';
                    else
                        e.style.visibility = 'hidden';
                });

            } else
                tileLabels.style.display = 'none';
        }, 500);

        clearInterval(waitkbmod);
    } catch (TypeError) {}
}, 1000);