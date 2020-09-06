// ==UserScript==
// @name        Mute Unfocus
// @namespace   majsoul_script
// @include      https://mahjongsoul.game.yo-star.com/
// @include      https://game.mahjongsoul.com/
// @include      https://majsoul.union-game.com/0/
// @version     1.0
// @author      anon
// @description   mutes audio while the game is not focused
// ==/UserScript==

const soundOptions = ['audio','music','lizhi','yuyin','teshuyuyin'];
var soundSettings = {};
var waitaudiomutemod = setInterval(function() {
if (view && view.AudioMgr) {
document.body.onfocus = () => {
	Object.entries(soundSettings).forEach(([k, v]) => {
		view.AudioMgr[k] = v;
		});
}
document.body.onblur = () => {
	soundOptions.forEach((n) => {
		soundSettings[n+'Muted'] = view.AudioMgr[n+'Muted'];
		});
	soundOptions.forEach((n) => {
		view.AudioMgr[n+'Muted'] = true;
		});
}
clearInterval(waitaudiomutemod);
}}, 1000);