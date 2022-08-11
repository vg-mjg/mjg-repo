// ==UserScript==
// @name         Weeb Names Nya
// @namespace    NyaggerSquad
// @icon         https://mahjongsoul.game.yo-star.com/icon_en.png
// @version      1.1.0
// @description  For all your weeaboo needs, change WEEB_LEVEL in script if you feel like it
// @author       anon
// @updateURL    https://repo.riichi.moe/others/userscripts/weebnamesnya.js
// @downloadURL  https://repo.riichi.moe/others/userscripts/weebnamesnya.js
// @include      https://mahjongsoul.game.yo-star.com/
// @include      https://game.mahjongsoul.com/
// @include      https://majsoul.union-game.com/0/
// ==/UserScript==

(function() {
    'use strict';

    const HIGH = 0;
    const LOW = 1;
    const FORCE_UNICODE = false;

    var WEEB_LEVEL = LOW;
 
    var map = [
        [["Menzenchin Tsumohou", "Menzen Tsumo"],1,103], //or just Tsumo
        ["Riichi",2,101],
        ["Nyankan",3,109],
        ["Rinnyan Kaihou",4,110],
        ["Haitei Raoyue",5,111],
        ["Houtei Raoyui",6,112],
        ["Haku",7,0],
        ["Hatsu",8,0],
        ["Chun",9,0],
        [["Jikaze", "Seat Wind"],10,104],
        [["Bakaze", "Prevalent Wind"],11,105],
        [["Tanyaochuu", "Tanyao"],12,102],
        ["Iipeikou",13,108],
        ["Nyanfu",14,107],
        [["Honchantaiyaochuu", "Nyanta"],15,209],
        [["Ikkitsuukan", "Ittsuu"],16,210], //or Ittsu
        ["Nyanshoku Doujun",17,211],
        ["Double Riichi",18,201],
        ["Nyanshoku Doukou",19,202],
        ["Nyankantsu",20,203],
        [["Toitoihou", "Toitoi"],21,204],
        ["Nyanyankou",22,205],
        ["Shounyangen",23,206],
        ["Honroutou",24,207],
        [["Chiitoitsu", "Chiitoi"],25,208],
        [["Junchan Taiyao", "Junnyan"],26,302],
        ["Honitsu",27,303],
        ["Nyanpeikou",28,301],
        ["Chinitsu",29,401],
        ["Ippatsu",30,113],
        ["Doraneko",31,114],
        ["Akadoraneko",32,115],
        ["Uradoraneko",33,0],
        ["Pei Nya",34,116],
        ["Tenhou",35,601],
        ["Chiihou",36,602],
        ["Dainyangen",37,603],
        ["Suunyankou",38,604],
        ["Tsuuiisou",39,605],
        ["Ryuuiisou",40,606],
        ["Chinroutou",41,607],
        ["Kokushi Musou",42,608],
        ["Shousuushii",43,609],
        ["Suukantsu",44,610],
        ["Nyanren Poutou",45,611],
        ["Paarenchan",46,0],
        ["Junsei Nyanren Poutou",47,703],
        ["Suunyankou Tanki",48,701],
        ["Kokushi Juusan Nyanmachi",49,702],
        ["Daisuushii",50,704],
        ["Tsubame-gaeshi",51,0],
        ["Nyanburi",52,0],
        ["Shiiaruraotai",53,0],
        ["Uunyansai",54,0],
        ["Nyanrenkou",55,0],
        ["Iishoku Nyanjun",56,0],
        ["Iipinmoyue",57,0],
        ["Chuupinraoyui",58,0],
        ["Renhou",59,0],
        ["Daisharin",60,0],
        ["Daichikurin",61,0],
        ["Daisuurin",62,0],
        ["Ishinouenimosannen",63,0],
        ["Daichisei",64,0],
        [["Yakuhai - Sangen", "Dragons"],0,106],
        ["Nagashi Manyan",0,501], //hardcoded in game.Tools.strOfLocalization(2154)
        ["Suufon Renda",0,801],
        ["Suukaikan",0,802],
        ["Kyuushuu Kyuuhai",0,803],
        ["Suucha Riichi",0,804]
    ];
 
    if (FORCE_UNICODE){
        var YakuCheck = setInterval(function(){
            try {
            if (uiscript.UI_Win.Inst.container_fan_8){
                let containers = ["container_fan_yiman","container_fan_8","container_fan_12","container_fan_liuju"];
                for (const container of containers){
                    for (let child of uiscript.UI_Win.Inst[container]._childs){
                        child.getChildByName("l_name")._tf.font = "SimHei"
                    }
                }
                clearInterval(YakuCheck);
            }
            } catch (e){}
        },2000);
    }
 
    var LobbyCheck = setInterval(function(){
        // using nasty syntax because electron shipped with MJS+ builds doesn't support `?`
        if (GameMgr != undefined && GameMgr.Inst != undefined && GameMgr.Inst.EnterLobby != undefined) {
            GameMgr.Inst.EnterLobby = (function() {
                var cacheF = GameMgr.Inst.EnterLobby;
                return function(){
                    map.forEach(i=>{
                        let n = i[0];
                        if (Array.isArray(n))
                            n = n[WEEB_LEVEL];
                        i[1] != 0 && (cfg.fan.fan.map_[i[1]].name_en = n);
                        i[2] != 0 && (cfg.fandesc.fandesc.map_[i[2]].name_en = n);
                    });
                    var result = cacheF.apply(this, arguments);
                    return result;
                };
            })();
            clearInterval(LobbyCheck);
        }
    },2000);
})();
