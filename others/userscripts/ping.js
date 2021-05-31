// ==UserScript==
// @name         Invite Beeper
// @namespace    NyaggerSquad
// @icon         https://i.imgur.com/i6SJdWL.png
// @version      1.0
// @description  Konnichiwa
// @author       anon
// @grant        GM_notification
// @include      https://mahjongsoul.game.yo-star.com/
// @include      https://game.mahjongsoul.com/
// @include      https://game.maj-soul.com/1/
// ==/UserScript==
 
(function() {
    'use strict';
 
    const CHARID = 200007;
    const BRAP = "lobby_playerlogin";
    const USE_NOTIFICATION = true;
 
    function Beep(){
        USE_NOTIFICATION && GM_notification ( {
            title: 'Mahjong Soul',
            highlight: true,
            text: 'You got an invite from '+uiscript.UI_Invite._invites.slice(-1)[0].nickname,
            image: 'https://i.imgur.com/i6SJdWL.png',
            onclick: () => { event.preventDefault(); parent.focus(); window.focus(); }
        } );
 
        let slist = cfg.voice.sound.findGroup(cfg.item_definition.character.get(CHARID).sound)
        for (let o = 0; o < slist.length; o++){
            if (slist[o].type == BRAP){
                view.AudioMgr.PlaySound(slist[o].path, 1.0, null);
                break;
            }
        }
    }
 
    var LazyCheck = setInterval(function(){
        if (uiscript?.UI_Invite?.onNewInvite){
            uiscript.UI_Invite.onNewInvite = (function(){
                var cacheF = uiscript.UI_Invite.onNewInvite;
                return function(){
                    var result = cacheF.apply(this, arguments);
                    Beep();
                    return result;
                };
            })();
            clearInterval(LazyCheck);
        }
    },2000);
})();