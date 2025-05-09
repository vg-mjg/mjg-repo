// ==UserScript==
// @name         FC2 Mahjong Soul Emote Name Replacer
// @namespace    https://live.fc2.com/
// @version      0.2
// @description  Replaces "charname-nn.png" text with the actual emote in the FC2 chatbox
// @author       Ling (and Anon)
// @match        https://live.fc2.com/*
// @grant        none
// ==/UserScript==

// Use with your -monkey browser extension of choice
// This version (v0.2) fixes the bug where the chatbox doesn't automatically fully scroll down when a new message containing an emote is posted

(function() {
    'use strict';

    // Set emote size here. 64 works pretty good, 120 too.
    const emoteSize = 64
    const chatboxSelector = '#js-commentListContainer';
    const chatboxDisplaySelector = '.chat_display'
    const messageSelector = '.js-commentText';
    const messageContainerSelector = '.js-commentLine';
    const imageRegex = /(\w+)-(\d+)\.png/i;
    const imageBaseUrl = 'https://files.riichi.moe/mjg/game%20resources%20and%20tools/Mahjong%20Soul/game%20files/emotes/';

    function replaceImagesInMessage(messageElement) {
        const messageText = messageElement.textContent;
        const newMessageText = messageText.replace(imageRegex, (match, charname, number) => {
            const imageUrl = `${imageBaseUrl}${charname}-${number}.png`;
            return `<img src="${imageUrl}" alt="${charname}-${number}" width="${emoteSize}" height="${emoteSize}">`;
        });

        messageElement.innerHTML = newMessageText;
        messageElement.style="height:unset;";
    }

    function processChatbox() {
        const chatbox = document.querySelector(chatboxSelector);
        if (!chatbox) {
            console.error('Chatbox not found');
            return;
        }

        const messages = chatbox.querySelectorAll(messageSelector);
        messages.forEach(message => {
            if (!message.dataset.hasImagesReplaced) {
                replaceImagesInMessage(message);
                message.dataset.hasImagesReplaced = true;
            }
        });
        const chatboxDisplay = document.querySelector(chatboxDisplaySelector);
        chatboxDisplay.scrollTop = chatboxDisplay.scrollHeight;
    }

    function processNewMessages(mutationsList, observer) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.matches(messageContainerSelector)) {
                        const messages = node.querySelectorAll(messageSelector);
                        messages.forEach(message => {
                            if (!message.dataset.hasImagesReplaced) {
                                replaceImagesInMessage(message);
                                message.dataset.hasImagesReplaced = true;
                            }
                        });
                    }
                });
            }
        }
        const chatboxDisplay = document.querySelector(chatboxDisplaySelector);
        chatboxDisplay.scrollTop = chatboxDisplay.scrollHeight;
    }

    function startObservingChatbox() {
        const chatbox = document.querySelector(chatboxSelector);
        if (!chatbox) {
            console.error('Chatbox not found');
            return;
        }

        const observer = new MutationObserver(processNewMessages);
        const config = { childList: true, subtree: true };
        observer.observe(chatbox, config);
    }

  // Fucking hate init events, shit never works well, time for some good old pajeet timeout crap
    setTimeout(() => {
        processChatbox();
        startObservingChatbox();
    }, 2500);
})();