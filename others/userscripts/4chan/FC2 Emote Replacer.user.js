// ==UserScript==
// @name         FC2 Mahjong Soul Emote Name Replacer
// @version      0.3
// @description  Replaces "charname-nn.png" text with the actual emote in the FC2 chatbox
// @author       Ling (and Anon)
// @match        https://live.fc2.com/*
// @grant        none
// ==/UserScript==

// Use with your -monkey browser extension of choice
// This version (v0.3) adds optional colors to user >names for better readability

(function() {
    'use strict';

    // Set emote size here. 64 works pretty good, 120 too.
    const EMOTE_SIZE = 64;
    // Colorize >names? Set to false to disable this feature.
    const COLORIZE_NAMES = true;
    const chatboxSelector = '#js-commentListContainer';
    const chatboxDisplaySelector = '.chat_display'
    const messageSelector = '.js-commentText';

    const messageContainerSelector = '.js-commentLine';
    const userNameSelector = '.js-commentUserName';
    const uidSelector = '.js-commentId';
    const imageRegex = /(\w+)-(\d+)\.png/i;
    const imageBaseUrl = 'https://files.riichi.moe/mjg/game%20resources%20and%20tools/Mahjong%20Soul/game%20files/emotes/';


    function colorizeUserName(messageContainer) {
        const userNameElement = messageContainer.querySelector(userNameSelector);
        const uidElement = messageContainer.querySelector(uidSelector);

        if (userNameElement && uidElement && !userNameElement.dataset.nameColorized) {
            const uid = uidElement.textContent.trim();
            if (uid) {
                var color = '#' + uid.substring(0, 6);

                var r = parseInt(color.slice(1, 3), 16);
                var g = parseInt(color.slice(3, 5), 16);
                var b = parseInt(color.slice(5, 7), 16);

                // Ensure correct contrast against white bg and darken if it's too bright (https://www.w3.org/TR/AERT/#color-contrast)
                const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
                if (brightness > 220) {
                    r = Math.floor(r * 0.90);
                    g = Math.floor(g * 0.90);
                    b = Math.floor(b * 0.90);
                }

                const finalColor = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

                userNameElement.style.color = finalColor;
                userNameElement.dataset.nameColorized = true;
            }
        }
    }

    function toHex(c) {
        return ('0' + c.toString(16)).slice(-2);
    }

    function replaceImagesInMessage(messageElement) {
        const messageText = messageElement.textContent;
        const newMessageText = messageText.replace(imageRegex, (match, charname, number) => {
            const imageUrl = `${imageBaseUrl}${charname}-${number}.png`;
            return `<img src="${imageUrl}" alt="${charname}-${number}" width="${EMOTE_SIZE}" height="${EMOTE_SIZE}">`;
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

        const messageContainers = chatbox.querySelectorAll(messageContainerSelector);
        messageContainers.forEach(container => {
            const message = container.querySelector(messageSelector);
            if (message && !message.dataset.hasImagesReplaced) {
                replaceImagesInMessage(message);
                message.dataset.hasImagesReplaced = true;
            }
            if (COLORIZE_NAMES) {
              colorizeUserName(container);
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
                        if (COLORIZE_NAMES) {
                          colorizeUserName(node);
                        }
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
