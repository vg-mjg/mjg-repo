// ==UserScript==
// @name         Friendly Check
// @namespace    mjg
// @icon         https://files.catbox.moe/a08htr.png
// @version      0.1.0
// @description  Shan't play with (you)
// @author       anon
// @include      https://mahjongsoul.game.yo-star.com/
// @include      https://game.mahjongsoul.com/
// @include      https://game.maj-soul.com/1/
// @updateURL    https://repo.riichi.moe/others/userscripts/friendlycheck.user.js
// @downloadURL  https://repo.riichi.moe/others/userscripts/friendlycheck.user.js
// ==/UserScript==

(function()
{
    'use strict';

    const KEY = 70; // 'f' - https://keycode.info/

    function checkscene(scene)
    {
        return scene && (scene.Inst && scene.Inst._enable);
    }

    document.addEventListener('keydown', function(e)
    {
        e = e || window.event;
        if (checkscene(uiscript.UI_Lobby) && (KEY == e.keyCode || KEY == e.key))
            friendly_checker();
    });

    function join_choice_yes(room_id)
    {
        app.NetAgent.sendReq2Lobby('Lobby', 'joinRoom', { room_id: room_id }, (t, i) =>
        {
            if (t || i.error)
            {
              if (i.error)
                  uiscript.UIMgr.Inst.ShowErrorInfo(cfg.info.error.map_[i.error.code].en);
                console.log('failed to join room for real.');
                uiscript.UI_Lobby.Inst.enable = true;
                uiscript.UI_WaitingRoom.Inst.enable = false;
                uiscript.UI_Lobby.Inst.showEnter();

                return;
            }
            console.log('joined room for realsies');
            script.UI_WaitingRoom.Inst.updateData(i.room);
            uiscript.UIMgr.Inst.ShowWaitingRoom();

            return;
        });

        return;
    }

    function join_choice_no()
    {
        console.log('hard pass.');
        uiscript.UI_Lobby.Inst.enable = true;
        uiscript.UI_WaitingRoom.Inst.enable = false;
        uiscript.UI_Lobby.Inst.showEnter();

        return;
    }
    function act_on_roomnum()
    {
        if (uiscript.UI_NumberInput && uiscript.UI_NumberInput.Inst && uiscript.UI_NumberInput.Inst._valid)
        {
            let room_id = parseInt(uiscript.UI_NumberInput.Inst.txtinput.text);
            app.NetAgent.sendReq2Lobby('Lobby', 'joinRoom', { room_id: room_id }, (t, i) =>
            {
                if (t || i.error)
                {
                    console.log('failed to join room.');
                    if (i.error)
                        uiscript.UIMgr.Inst.ShowErrorInfo(cfg.info.error.map_[i.error.code].en);
                    return;
                }
                else
                {
                    console.log('joined room');
                    //app.NetAgent.sendReq2Lobby('Lobby', 'leaveRoom', {}, (t, i) => {});
                    uiscript.UI_Lobby.Inst.enable = false;
                    uiscript.UI_WaitingRoom.Inst.updateData(i.room);
                    uiscript.UIMgr.Inst.ShowWaitingRoom();

                    uiscript.UI_SecondConfirm.Inst.show('join for real?',
                        Laya.Handler.create(this, function() {join_choice_yes(room_id)} ),
                        Laya.Handler.create(this, function() {join_choice_no()} ),
                        undefined,
                        200
                    );

                    return;
                }
            });
            app.NetAgent.sendReq2Lobby('Lobby', 'leaveRoom', {}, (t, i) => { console.log('left room')});//faster here

            return;
        }
    }

    function friendly_checker()
    {
        console.log('getting room number');
        uiscript.UI_NumberInput.Inst.show(
            'check out room',
            Laya.Handler.create(this, function() { act_on_roomnum(); })
        );

        return;
    }
})();

// vim: ts=4 et