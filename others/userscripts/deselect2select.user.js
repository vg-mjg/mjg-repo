// ==UserScript==
// @name        Deselect to Select Script
// @namespace   majsoul_script
// @version     1.0
// @author      anon
// @include      https://mahjongsoul.game.yo-star.com/
// @include      https://game.mahjongsoul.com/
// @include      https://majsoul.union-game.com/0/
// @description   script that makes "Deselect All" select all (except purples)
// @updateURL    https://repo.riichi.moe/others/userscripts/deselect2select.user.js
// @downloadURL  https://repo.riichi.moe/others/userscripts/deselect2select.user.js
// ==/UserScript==

var waitForLoad = setInterval(function () {
    if (uiscript && uiscript.UI_Bag_PageGift && uiscript.UI_Bag.Inst) {
        uiscript.UI_Bag_PageGift.prototype.clear_choose = (function () {
            var cacheF = uiscript.UI_Bag_PageGift.prototype.clear_choose;
            return function () {
                var selected = 0;
                for (key in this.choose_count)
                    selected += this.choose_count[key]
                if (selected)
                    return cacheF.apply(this, arguments);
                for (var e = 0; e < this.items.length; e++) {
                    var o = cfg.item_definition.item.get(this.items[e].item_id)
                    if (o.can_sell && o.sell_reward_count < 6) {
                        var x = 0,
                            i = this,
                            s = i.items[e]
                        i.choose_count.hasOwnProperty(s.item_id.toString()) ? (x = i.choose_count[s.item_id],
                            i.choose_count[s.item_id] = s.count) : (x = 0,
                                i.choose_count[s.item_id] = s.count),
                            i.choose_count[s.item_id] > s.count && (i.choose_count[s.item_id] = s.count),
                            i.stardust_detail += (i.choose_count[s.item_id] - x) * o.sell_reward_count,
                            i.refresh_stardust()
                        this.scrollview.wantToRefreshAll()
                    }
                }
            };
        })();
        uiscript.UI_Bag_PageGift.prototype.refresh_stardust = (function () {
            var cacheF = uiscript.UI_Bag_PageGift.prototype.refresh_stardust;
            return function () {
                cacheF.apply(this, arguments);
                this.btn_clear_choose.visible = !0
            };
        })();
        uiscript.UI_Bag.Inst.page_gift.container_sell.getChildByName("btn_clear").clickHandler = new Laya.Handler(uiscript.UI_Bag.Inst.page_gift, uiscript.UI_Bag.Inst.page_gift.clear_choose)
        clearInterval(waitForLoad);
    }
}, 1000);
