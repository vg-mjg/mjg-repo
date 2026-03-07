// ==UserScript==
// @name         4hanX
// @namespace    https://repo.riichi.moe/
// @version      1.3.1
// @description  4hanX
// @icon         https://raw.githubusercontent.com/vg-mjg/mjg-repo/refs/heads/master/favicon.ico
// @match        https://repo.riichi.moe/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

// Debounce timer for observer
let observerDebounceTimer;

function fourHanX() {
  // Links
  ['.post > .content > .body:not([data-links-processed])', '.thread > .body:not([data-links-processed])'].forEach(selector => {
    document.querySelectorAll(selector).forEach(post => {
      const updatedChildNodes = [];
      let linksFound = false;

      post.childNodes.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          const updatedText = child.nodeValue.replace(
            /(https?:\/\/[^\s<]+)/g,
            '<a href="$1">$1</a>'
          );

          if (updatedText !== child.nodeValue) {
            linksFound = true;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = updatedText;
            updatedChildNodes.push(...tempDiv.childNodes);
          } else {
            updatedChildNodes.push(child);
          }
        } else {
          updatedChildNodes.push(child);
        }
      });

      if (linksFound) { // Only replaceChildren if changes were made
        post.replaceChildren(...updatedChildNodes);
        post.dataset.linksProcessed = 'true';
      }
    });
  });

  // Audio
  document.querySelectorAll('#main .post > .content:not([data-audio-processed]), #main .thread:not([data-audio-processed])').forEach(post => {
    const imgName = post.querySelector('.meta > a');
    let audioProcessed = false;
    if (!imgName || !imgName.textContent) {
      post.dataset.audioProcessed = 'true'; // Mark even if no imgName found to avoid re-checking
      return;
    }
    const soundMatch = imgName.textContent.match(/\[sound=([^\]]+\.(mp3|ogg))\]/);

    if (soundMatch) {
      let url = soundMatch[1].replace(/_2F/g, '%2F');
      url = decodeURIComponent(url);
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }

      // Avoid adding duplicate audio players
      if (post.querySelector('audio[src="' + url + '"]')) {
        post.dataset.audioProcessed = 'true';
        return;
      }

      const audio = document.createElement('audio');
      audio.src = url;
      audio.controls = true;
      audio.loop = true;

      let sibling = imgName.parentElement.nextSibling;
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.alignItems = 'center';
      container.style.float = 'left';

      if (imgName.parentElement && imgName.parentElement.parentElement) {
        if (sibling) {
          imgName.parentElement.parentElement.insertBefore(container, sibling);
            if (sibling.parentNode) {
              sibling.parentNode.removeChild(sibling);
              container.appendChild(sibling);
              requestAnimationFrame(() => {
                const width = sibling.offsetWidth;
                audio.style.width = (width < 270 ? 270 : width) + 'px';
              });
            }
        } else {
            imgName.parentElement.parentElement.appendChild(container);
            requestAnimationFrame(() => { audio.style.width = '270px'; });
        }
        container.appendChild(audio);
        audioProcessed = true;
      }
    }

    if (audioProcessed || soundMatch === null) { // Mark if audio added OR if no soundMatch was found (no need to check again)
      post.dataset.audioProcessed = 'true';
    }
  });

}

// Run initial processing since @run-at document-end ensures DOM is ready
fourHanX();

// Set up the observer to catch subsequent changes
const mainElement = document.querySelector('#main');
if (mainElement) {
   const observer = new MutationObserver(() => {
      // Debounce the function call
      clearTimeout(observerDebounceTimer);
      observerDebounceTimer = setTimeout(fourHanX, 100);
  });
  observer.observe(mainElement, { childList: true, subtree: true });
} else {
  console.error("Could not find #main element to observe for mutations.");
}