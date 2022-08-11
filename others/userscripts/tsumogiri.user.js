// ==UserScript==
// @name         Dim Tsumogiri
// @namespace    majsoul_script
// @version      1.0.0
// @author       anon
// @description  Greys out tsumogiri like in the replays
// @include      https://mahjongsoul.game.yo-star.com/
// @include      https://game.mahjongsoul.com/
// @include      https://majsoul.union-game.com/0/
// @updateURL    https://repo.riichi.moe/others/userscripts/tsumogiri.user.js
// @downloadURL  https://repo.riichi.moe/others/userscripts/tsumogiri.user.js
// ==/UserScript==

var waittedashimod = setInterval(() => {
	if (view && view.Block_QiPai && view.ViewPai) {
		view.Block_QiPai.prototype.AddQiPai = (function () {
			var cacheF = view.Block_QiPai.prototype.AddQiPai;
			return function () {
				arguments[0].ismoqie = arguments[2];
				cacheF.apply(this, arguments);
			};
		})();
		view.ViewPai.prototype.GetDefaultColor = (function () {
			var cacheF = view.ViewPai.prototype.GetDefaultColor;
			return function () {
				var color = cacheF.apply(this, arguments);
				if (this.val.ismoqie)
					return new Laya.Vector4(.8, .8, .8, 1);
				return color;
			};
		})();
		clearInterval(waittedashimod);
	}
}, 1000);