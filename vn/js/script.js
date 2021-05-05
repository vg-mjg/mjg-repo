"use strict";

// CHARACTERS


// MUSIC


// VOICE
const voice = {};
// SOUNDS
const sound = {};
// IMAGES
const images = {};
// VIDEOS
const videos = {};

// NOTIFICATIONS
let notifications = {
	"NewTab": {
		title: "Notice",
		body: "Open the links in new tab for me, okay?",
		icon: "favicon.ico"
	}
};


const scenes = {
	"black":"black.jpg",
	"room":"room.jpg",
	"hallway":"hallway.jpg",
	"classroom":"classroom.jpg"

};

// START HERE
let script = {
	"Start": [
		"scene room with fadeIn",
		"...",
		".............",
		"play music dokidoki loop",
		"show m stand center with fadeIn",
		"m:maid1 ...!",
		"m:maid6 ...",
		"m Welcome. This is a test to show the capabilities of the Monogatari system.",
		"m The goal is simple: make a vn version of Riichi Book 1.",
		"m:maid6 ...Well not only Riichi Book 1, there are actually 3 sections that we want to implement. It's a lot more complicated that that.",
		"m It's outlined at the planning.txt file, but I'll give you an overview of it.",
		"m Do you want to know more about the vn engine we're using?",
		{"Choice":{
			"Monogatari":{
				"Text": "Yes",
				"Do": "jump j_Monogatari"
			},
			"Sections":{
				"Text": "No need, just tell me about the project",
				"Do": "jump j_Sections"
			}
		}}
	],

	"j_Monogatari":[
		"m:maid5 Yeah, so about the system.",
		"m It's using the <a href='https://monogatari.io/' target='_blank'><u>Monogatari engine</u></a>. Unlike renpy, you can load the entire VN in any web browser, and it even looks good on mobile.",
		"m:maid3 Yes I am aware renpy has a web version, but it's slow and bulky as shit.",
		"m Anyways, so like I was saying. I think for our intents and purposes, the Monogatari system is our best choice. And it's flexible, with lots of effects and fancy stuff that we can use to our advantage.",
		"show m stand left",
		"show new/rm1.jpg center with fadeIn",
		"m We can show images like this, among other things.",
		"hide new/rm1.jpg",
		"show m stand center with fadeIn",
		"m There are also other special effects we can implement. Basically, anything we can do in the browser, like interactive stuff and whatnot, we can do here.",
		"m:maid7 That is, if we get people who actually knows how to code.",
		"m ...It looks clunky now but with a bit of fixing, this can be even prettier.",
		"m That should be it for the overview for the engine, I guess. If you want to learn more, you can read <a href='https://monogatari.io/' target='_blank'><u>this</u></a>.",
		"jump j_Sections"
	],

	"j_Sections":[
		"m:maid3 Ahem. So about the project.",
		"m We've got a lot of newfriends lately. I do think mahjong is a wonderful game once you truly understand how to play it, and I want to share the joy of getting baiman ron'd knowing it was entirely your fault and not because of luck.",
		"m When I was starting, anons in the thread kept telling me to read RB1. But fuck them, I was so new the game that most of it just flew past my head.",
		"m I've been playing for several months now, and I still haven't completely read it.",
		"m So there was this thought. What if, we made this esoteric mahjong knowledge a lot more palatable?",
		"m What if, there was an easier entry-level resource that could improve your mahjong drastically?",
		"m Not written by that fag chink who uses WRC terminology. But by anons, for anons.",
		"m:maid3 Sure, Riichi Book 1 will always be there. But I wanted something more... newfag friendly. Something fun.",
		"m Reading is for faggots.",
		"m Plus, if someone's gonna teach me, I wanted my favorite majsoul girls to do it.",
		"m Let's go to the classroom.",
		"scene hallway with fadeIn",
		"show m stand center with fadeIn",
		"play music blackjack.mp3 loop",
		"m I think you have a general idea of what we're trying to achieve, so now I'll give you specifics this time.",
		"m First, the workforce. We need helpers if we want this project to be successful.",
		"m:maid5 <small>Tried making it alone at first, but it was a clusterfuck.</small>",
		"m:maid1 Ahem. So the workforce. We'll be dividing the work needed to be done into 3 sections: Writers, Programmers, Testers.",
		"m:maid6 ...",
		"m:maid5 I was supposed to put choices here, but fuck it. I'm explaining everything one by one, so you get the gist of everything.",
		"m First off, the Writing Section.",
		"scene classroom with fadeIn",
		"show m stand center with fadeIn",
		"m This is the meat of the project, and we will learn everything in this classroom.",
		"m The idea is that we can split the sections of what to learn in bite-sized classes. So (as an example), we'll have Efficiency Classes, Defense Classes, Riichi Classes and so on and so forth.",
		"m:maid2 So different classes will have different teachers. The writers get to choose who teaches what subject. And they don't have to be stuck with one character.",
		"show m stand left with fadeIn",
		"show c stand center with fadeIn",
		"c:cunny8 Hello! Chiori here, to teach you hopeless perverts about TRUE mahjong!",
		"m:maid5 Chiori-sama, please don't call our potential helpers perverts.",
		"c:cunny5 They can't deny it after they spent an entire night sharing their favorite loli doujins!",
		"c:cunny6 Be grateful that this Chiori will give you her time to show everyone her demonic Mahjong. Goodbye!",
		"hide c stand",
		"show m stand center with fadeIn",
		"m:maid6 ...Something like that.",
		"m Back to the topic at hand. So for now, we'll focus on writing for what's equivalent to Riichi Book 1.",
		"m As outlined in the planning.txt (at the vn folder of the repo files), in the future we CAN implement two more things: a tutorial section, basically the mahjong soul tutorial but with a lot more details and yaku-stuff, and more advanced class that takes the stuff from RMS and other stronger intermediate resources.",
		"m:maid2 Now that you know the plans with writing, this time we'll talk about Programming.",
		"m:maid3 Frankly, fuck programming.",
		"m Monogatari should have a fairly simple renpy-like language and a lot more flexibility due to it being web-based, but there are still some hard stuff to fix.",
		"m Well, there are some guidelines that I want to follow for this project. First: the entire thing (the vn folder) should be less that 15mb. Even lower, if possible.",
		"m:maid1 'What the fuck,' you say. 'Get better internet,' you say.",
		"m:maid4 Shut up you retards no need to bloat shit. I don't want to wait for minutes just to load the vn, since this isn't downloaded like normal vns.",
		"m But how can we achieve that? Simple. For music, we use pc-98 music, shit that we can compress up to 60kbps and still be listenable.",
		"m:maid4 As for non-transparent images, use jpgs. No need for the ultra high quality when you just want to show a graph or something. Get better eyesight. It's all the fucking same shit.",
		"m For more details, read this <a href='https://developers.monogatari.io/documentation/' target='_blank'><u>monogatari documentation</u></a>.",
		"m That should be all for programming. Everything's in github anyways, so it should be easy to collaborate.",
		"m And lastly, testers.",
		"m:maid5 Anyone can test it and give feedback. Especially if you're new, stuff you can't understand/you'd want more clarified, feel free to say so.",
		"m:maid2 And that should be all, I guess.",
		"m Mind you, we're still at the planning stage. Gathering ideas and people willing to help out.",
		"m If you DO want to help out, just give me a heads up.",
		"m But the plan is to start the actual heavy work some time after the tourney, when everyone is relatively free.",
		"m I really do think this is a project that's worth the time and effort. There are so many people around thirsty to learn more, to become even better players. And mahjong becomes a lot more enjoyable if everyone is fairly skilled at the game.",
		"m:maid2 Imagine the potential of new mahjong players! Because despite everything we say, Mahjong truly is fun!",
		"m:maid2 So come help friends. Whether you're new to the game or have been playing it for years, we can all truly share the joys of mahjong to everyone else!",
		"m:maid2 Let us not be the only ones to suffer in this retarded game!",
		"m:maid8 That's all, see you after the tourney.",
		"end"

	]


};