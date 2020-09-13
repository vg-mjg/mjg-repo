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

// Mute sounds if window lost focus
const soundOptions = ['audio', 'music', 'lizhi', 'yuyin', 'teshuyuyin'];
var soundSettings = {};
var waitaudiomod = setInterval(function() {
    if (view && view.AudioMgr) {
		unMute = function() {
			if (old = window.localStorage.getItem('soundSettings'))
				soundSettings = JSON.parse(old);
            Object.entries(soundSettings).forEach(([k, v]) => {
                view.AudioMgr[k] = v;
            });
		}
		unMute();
        document.body.onfocus = () => {
			unMute();
        }
        document.body.onblur = () => {
            soundOptions.forEach((n) => {
                soundSettings[n + 'Volume'] = view.AudioMgr[n + 'Volume'];
                soundSettings[n + 'Muted'] = view.AudioMgr[n + 'Muted'];
				window.localStorage.setItem('soundSettings',JSON.stringify(soundSettings));
            });
            soundOptions.forEach((n) => {
                view.AudioMgr[n + 'Muted'] = true;
            });
        }
        clearInterval(waitaudiomod);
    }
}, 1000);