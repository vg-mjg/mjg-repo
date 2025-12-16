// ==UserScript==
// @name         /mjg/ Repochan Theme
// @namespace    /mjg/
// @version      1.0
// @description  Makes /mjg/ look like Repochan
// @icon         https://raw.githubusercontent.com/vg-mjg/mjg-repo/refs/heads/master/favicon.ico
// @match        https://boards.4chan.org/vg/thread/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
  'use strict';
  // Repochan Banners stolen
  const banners = ["0.png","11.png","13.jpg","15.jpg","17.jpg","19.jpg","20.jpg","22.jpg","24.png","26.png","28.png","2.jpg","31.png","3.png","4.png","6.png","8.png","10.jpg","12.jpg","14.jpg","16.png","18.jpg","1.png","21.jpg","23.jpg","25.png","27.png","29.png","30.png","32.gif","5.png","7.png","9.png","4han/0.gif","4han/1.png","4han/2.gif","4han/3.gif","4han/4.png","4han/5.png","4han/6.gif","4han/7.png","4han/8.gif","4han/9.png","4han/10.png","4han/11.png","4han/12.gif","4han/13.png","4han/14.png","4han/15.png","4han/16.png","4han/17.png","4han/18.gif","4han/19.png","4han/20.png","4han/21.png","4han/22.gif"];

  function randomBannerUrl() {
    return 'https://repo.riichi.moe/boards/banners/' + banners[banners.length * Math.random() | 0]
  }

  function repochanTheme() {
    // Only Run on /mjg/
    const subject = document.querySelector(".subject");
    if (!subject || !subject.textContent.includes('mjg')) {
      return;
    }

    // Changes to Repochan banners
    let banner = document.querySelector('#bannerCnt');
    let bannerImg = banner.querySelector('img');
    bannerImg.setAttribute('src', randomBannerUrl());

    // Check if 4chan X is enabled
    if (!document.documentElement.classList.contains('fourchan-x')) {
      banner.addEventListener('click', (e) => {
        bannerImg.setAttribute('src', randomBannerUrl());
      });
    } else {
      // just wait lol
      setTimeout(() => {
        banner.replaceWith(banner.cloneNode(true));
        document.querySelector('#bannerCnt').addEventListener('click', (e) => {
          e.currentTarget.querySelector('img').setAttribute('src', randomBannerUrl());
        });
      }, 1000);
    }

    // Changes board name to /mjg/
    document.querySelector('.boardTitle').textContent = '/mjg/ - Mahjong General';

    // Everyone is a Jyanshi now
    function changeNameToJyanshi() {
      document.querySelectorAll('.nameBlock > .name').forEach(nameElement => {
        if (nameElement.textContent.trim() === 'Anonymous') {
          nameElement.textContent = 'Jyanshi';
        }
      });
    }

    changeNameToJyanshi();

    // New Jyanshi friends
    new MutationObserver(changeNameToJyanshi).observe(document.querySelector('.thread'), {
      childList: true,
      subtree: true
    });

    // CSS Demon
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --bg-color: #1d2021;
        --secondary-bg: #282828;
        --text-color: #dfdfdf;
        --link-color: #458588;
        --border-color: #4b4b4b;
        --accent-color: #c4ae00;
        --font-family: 'Liberation Sans', Arial, sans-serif;
        --mono-font: 'Liberation Mono', monospace;
        --post-title-color: #a10000;
      }

      /* General */

      body,
      html {
        background: var(--bg-color);
        color: var(--text-color);
        font-family: var(--font-family);
        font-weight: 300;
        font-size: 14px;
        margin: 0;
        padding: 15px 80px;
      }

      a, a:visited, a:hover {
        color: var(--link-color) !important;
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
      }

      img {
  		max-width: 100% !important;
	  }

      /* Top Nav Bar */

      #boardNavDesktop {
        font-size: 14px !important;
        color: var(--text-color) !important;
        margin-bottom: 10px;
      }

      /* Banner */

      .boardBanner, .closed {
        background: var(--secondary-bg);
        border: 2px dashed var(--border-color);
        padding: 10px 15px;
        margin-bottom: 10px;
      }

      .boardTitle {
        color: var(--post-title-color);
        font-family: var(--font-family) !important;
        letter-spacing: 0px !important;
    	}

      form[name='post'], .abovePostForm, #blotter, .aboveMidAd, .middlead.center, .middlead.center + hr, #toggleMsgBtn, #globalMessage, hr[style='clear: both;'], .adl, #op {
        display:none;
      }

      /* Top of Thread Nav */

      .navLinks.desktop {
        background: var(--secondary-bg);
        border: 1px var(--border-color) solid;
        max-width: 900px;
        margin: 0 auto 10px auto;
        padding:10px
      }

      .navLinks.desktop + hr {
  		display: none;
      }

	  /* Column */

      .thread {
  		font-family: var(--mono-font);
        background: var(--secondary-bg);
        border: 1px var(--border-color) solid;
        padding: 10px;
        max-width: 900px;
        margin: 0 auto 10px auto !important;
	  }

     	/* OP */

      .nameBlock > .name {
      	color: var(--link-color) !important;
      }

      .postInfo.desktop > .subject {
        color: var(--post-title-color) !important;
        display: none;
      }

      .dateTime {
        font-size: 13px;
        color: gray;
        text-decoration: none;
        font-family: 'Liberation Mono', monospace;
      }

      .quote {
      	color: #789922 !important;
      }

      div.post div.postInfo span.postNum > a, div.post div.postInfo span.postNum > a:hover {
        color: var(--text-color) !important;
      }

      div.post div.postInfo span.postNum > a:hover {
        text-decoration: underline;
      }

      .post.op > .postMessage {
      	overflow: auto;
      }

      a.quotelink, .postInfo.desktop > .backlink a, .backlink.deadlink {
        color: var(--link-color) !important;
        text-decoration: none;
        font-size: 14px;
      }

      a.quotelink:hover, .postInfo.desktop > .backlink a:hover {
        color: var(--link-color) !important;
        text-decoration: underline;
      }

      .postContainer.opContainer + div {
      	border-top: 1px solid var(--border-color);
      }

      /* Reply */

      .sideArrows, .postInfo.desktop > input {
        display:none;
      }

      .postContainer.replyContainer {
        margin-top: 12px;
      }

      .post.reply {
        background: var(--secondary-bg);
        border: none;
      }


      .post.reply:not(#quote-preview.post.reply) {
      	width: 100%;
	  }

      .fileThumb {
        margin-left: 0px !important;
      }

      .postMessage {
      	margin-left: 0px;
      }


      #quote-preview {
      	background: var(--secondary-bg) !important;
       	border: 1px var(--border-color) solid !important;
        font-family: var(--mono-font);
      }

      div#quote-preview.highlight.post.reply {
      	border: 1px var(--border-color) solid !important;
      }

      .reply:target, .reply.highlight {
  		background: rgba(0, 0, 0, .14) !important;
  		border:none !important;
	  }

      .post.reply.highlight-anti {
  		background: rgba(0, 0, 0, .28) !important;
	  }

      /* Bottom Nav */

      .thread + hr, .adl + hr, .bottomCtrl.desktop, #boardNavDesktopFoot, #absbot  {
      	display: none;
      }

      /* Reply Box */

      #quickReply, #qrHeader, :root.burichan .dialog {
        background-color: var(--secondary-bg);
        border: 1px var(--border-color) solid !important;
        color: var(--text-color);
      }

      #qrForm input, #qrForm textarea {
        background-color: #1d2021;
        border: 1px var(--border-color) solid !important;
        color: var(--text-color);
      }

      #qrForm input[name='name'], #qrEmail, #qrForm textarea {
        font-family: var(--mono-font) !important;
        border: 1px var(--border-color) solid !important;
      }

      #quickReply input[type="submit"] {
    	margin-top: 2px !important;;
      }

      /* Settings */
      .extPanel.reply {
      	background: var(--secondary-bg);
        border: 1px var(--color-bg) solid;
      }

      /* Captcha */
      .captcha-container {
        background: var(--secondary-bg) !important;
        color: var(--text-color) !important;
        scrollbar-color: var(--text-color) var(--border-color);
      }

      /* 4chanX */

      .fourchan-x #qr .captcha-container > div {
        width: auto;
      }

      .fourchan-x #header-bar {
        background: var(--secondary-bg) !important;
        color: var(--text-color);
        font-size: 14px !important;
        border-bottom: 1px var(--border-color) solid;
      }

      .fourchan-x .dialog, .fourchan-x #qr .move {
        background: var(--secondary-bg);
        color: var(--text-color) !important;
      }

      .fourchan-x .focused.entry {
        background: rgb(0,0,0,.33);
      }

      :root.fourchan-x > body div.boardTitle {
        color: var(--post-title-color);
        font-family: var(--font-family) !important;
        letter-spacing: 0px !important;
        text-shadow: none;
        font-weight: bold !important;
      }

      .fourchan-x .globalMessage + hr {
      	display:none;
      }

      .fourchan-x .watch-thread-link {
  		opacity: 100%;
  		color: var(--link-color);
	  }

      .fourchan-x .post.op {
      	border-bottom: 1px var(--border-color) solid;
      }

      .fourchan-x .postContainer.replyContainer {
        display:flex !important;;
      }

      .fourchan-x .postContainer.replyContainer > .post.reply {
        margin-top: 0px !important;
      }

      .fourchan-x  .fileText {
        margin-left: 0px !important;;
      }

      .fourchan-x #hoverUI  > .dialog {
        font-family: var(--mono-font);
        border: 1px var(--border-color) solid;
      }

      .fourchan-x #hoverUI  > .dialog > .postContainer.replyContainer {
        margin: 0px;
      }

      .fourchan-x .qphl {
        background: rgba(0, 0, 0, .14) !important;
        outline:none !important;
      }

      .fourchan-x .inline {
        border: 1px var(--border-color) solid !important;
        background: rgba(0, 0, 0, .14);
      }

      .fourchan-x .qr-link-container-bottom {
        text-align: center;
        width: 200px;
        position: absolute;
        margin-left: 50%;
        left: -100px;
        transform: none;
      }

      .fourchan-x #qr {
        border: 1px var(--border-color) solid;

      }

      .fourchan-x #qr select {
        color: white;
        background: var(--secondary-bg);
        border: 1px var(--border-color) solid;
      }

      .fourchan-x #qr .field {
        color: var(--text-color) !important;;
        background: var(--secondary-bg);
        border: 1px var(--border-color) solid;
        font-family: var(--mono-font);
        font-size: 14px;
      }

      .fourchan-x #qr .field:focus {
        border-color: var(--link-color) !important;
      }

      .fourchan-x #qr .qr-button {
        color: var(--text-color);
        background: var(--bg-color) !important;
        border: 1px var(--border-color) solid;
      }

      .fourchan-x #qr #qr-filename {
        color: var(--text-color);
      }

      #fcsp-container {
      	background: var(--secondary-bg) !important;
      	border: 1px var(--border-color) solid !important;
      	color: var(--text-color) !important;
      }

      #fcspImage {
      	max-width: none !important;
      }

      .fcsp-header #fcspImage {
      	max-width: none !important;
      }

      .fcsp-header {
      	border-bottom: 1px var(--border-color) solid !important;
      }

      .fcsp-playlist-search {
      	background: #1d2021 !important;
        color: var(--text-color) !important;
        border: 1px var(--border-color) solid !important;
      }

      .fcsp-list-item {
      	color: var(--text-color);
      	background: var(--secondary-bg) !important;
      }

      .fcsp-list-item:nth-child(2n) {
      	background: var(--bg-color) !important;
      }

      .fcsp-footer {
      	border-top: 1px var(--border-color) solid !important;
      }

      .fcsp-list-item.playing {
      	background: var(--link-color) !important;
      }
      `;

    document.head.append(style);
  }

  window.addEventListener('load', repochanTheme);
})();