// ==UserScript==
// @name         4hanX
// @namespace    https://repo.riichi.moe/
// @version      1.8.2
// @description  4hanX audio embedding, post previews
// @icon         https://raw.githubusercontent.com/vg-mjg/mjg-repo/refs/heads/master/favicon.ico
// @match        https://4han.moe/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
  'use strict';

  let observerDebounceTimer;

  // --- Audio Embedding ---
  function extractSoundUrlFromText(text) {
    const soundMatch = text.match(/\[sound=([^\]]*files\.catbox\.moe[^\]]+\.(mp3|ogg|flac|wav|m4a))\]/);
    if (!soundMatch) return null;

    let url = soundMatch[1]
    .replace(/_2F/g, '%2F')
    .replace(/_3A/g, '%3A');

    try {
      url = decodeURIComponent(url);
    } catch (e) {
      return null;
    }

    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    return url;
  }

  function processAudio(contentElement) { // Takes .content or .thread element
    if (!contentElement || contentElement.dataset.audioProcessed) return;

    const imgNameElement = contentElement.querySelector('.meta > a');
    let audioProcessed = false;
    let soundMatch = null;

    if (!imgNameElement || !imgNameElement.textContent) {
      contentElement.dataset.audioProcessed = 'true';
      return;
    }

    const url = extractSoundUrlFromText(imgNameElement.textContent);

    if (url) {
      if (contentElement.querySelector(`audio[src="${url}"]`)) {
        audioProcessed = true;
      } else {
        const audio = document.createElement('audio');
        audio.src = url;
        audio.controls = true;
        audio.loop = true;

        const metaDiv = contentElement.querySelector('.meta');
        let siblingAfterMeta = metaDiv ? metaDiv.nextElementSibling : null;

        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'flex-start';
        container.style.float = 'left'; // *** ADDED THIS BACK ***
        container.style.marginRight = '10px'; // *** ADDED MARGIN for text spacing ***

        if (metaDiv && metaDiv.parentElement) {
          metaDiv.parentElement.insertBefore(container, siblingAfterMeta);

          if (siblingAfterMeta && siblingAfterMeta.parentNode === metaDiv.parentElement) {
            container.appendChild(siblingAfterMeta);
            requestAnimationFrame(() => {
              if (siblingAfterMeta.offsetWidth > 0) {
                const width = siblingAfterMeta.offsetWidth;
                audio.style.width = (width < 270 ? 270 : width) + 'px';
              } else {
                audio.style.width = '270px';
              }
            });
          } else {
            requestAnimationFrame(() => { audio.style.width = '270px'; });
          }
          container.appendChild(audio);
          audioProcessed = true;
        }
      }
    }

    if (audioProcessed || soundMatch === null) {
      contentElement.dataset.audioProcessed = 'true';
    }
  }

  // -- Audio and Image Previews for forms
  function setupAudioFormFileInput() {
    document.querySelectorAll('form').forEach((form, index) => {
      const fileInput = form.querySelector('#image');
      if (!fileInput) return;

      const audioId = `form-audio-${index}`;
      const imagePreviewId = `image-preview-${index}`;
      
      // Handle file input change event
      fileInput.addEventListener('change', () => {
        document.getElementById(audioId)?.remove();
				document.getElementById(imagePreviewId)?.remove();
        
        const file = fileInput.files?.[0];
        if (!file) return;

        const img = document.createElement('img');
        img.id = imagePreviewId;
        img.style = 'margin-top: 10px; width: auto;';

        const reader = new FileReader();
        reader.onload = function(e) {
          img.src = e.target.result;
          form.appendChild(img);
        };
        reader.readAsDataURL(file);

        const url = extractSoundUrlFromText(file.name);
        if (!url) return;

        const audio = Object.assign(document.createElement('audio'), {
          id: audioId,
          src: url,
          controls: true,
          loop: true,
          style: 'display: block; margin-top: 10px; width: 100%;'
        });

        form.appendChild(audio);
      });

      // Add a listener to the form reset event to ensure the audio and image previews are removed
      form.addEventListener('reset', () => {
        const audioElement = document.getElementById(audioId);
        audioElement?.remove();

        const imagePreview = document.getElementById(imagePreviewId);
        imagePreview?.remove();
      });

      // Handle paste event on the form itself
      form.addEventListener('paste', (event) => {
        const items = event.clipboardData?.items;
        if (!items) return;

        const item = items[0]; // Only handle the first item
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            // Create a new FileList and set it to the input (this triggers change event)
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;

            // Trigger the change event on the file input
            fileInput.dispatchEvent(new Event('change'));
          }
        }
      });

      // spoiler text
      const textarea = form.querySelector('textarea');
      if (textarea) {
        textarea.addEventListener('keydown', (e) => {
          if (e.ctrlKey && e.key === 's') {
            e.preventDefault();

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = textarea.value.substring(start, end);
            const spoilerWrapped = `[spoiler]${selectedText}[/spoiler]`;

            // Preserve undo stack
            textarea.setSelectionRange(start, end);
            const successful = document.execCommand('insertText', false, spoilerWrapped);
          }
        });
      }
    });
  }

  // embed mp4s, webmds and mkvs
  function embedVideos(contentElement) {
    if (!contentElement || contentElement.dataset.videosProcessed) return;

    const body = contentElement.querySelector('.body');
    if (!body) return;

    const links = body.querySelectorAll('a[href^="https://files.catbox.moe/"]');
    const videoExtensions = ['.mp4', '.webm', '.mkv'];

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (videoExtensions.some(ext => href.toLowerCase().endsWith(ext))) {
        const embedToggle = document.createElement('a');
        embedToggle.textContent = '(embed)';
        embedToggle.style.marginLeft = '2px';
        embedToggle.style.cursor = 'pointer';

        let videoElement = null;

        embedToggle.addEventListener('click', (e) => {
          e.preventDefault();

          if (!videoElement) {
            videoElement = document.createElement('video');
            videoElement.src = href;
            videoElement.controls = true;
            videoElement.style.maxWidth = '100%';
            videoElement.style.paddingTop = '2px';

            embedToggle.insertAdjacentElement('afterend', videoElement);
            embedToggle.textContent = '(hide)';
          } else {
            videoElement.remove();
            videoElement = null;
            embedToggle.textContent = '(embed)';
          }
        });

        link.insertAdjacentElement('afterend', embedToggle);
      }
    });

    contentElement.dataset.videosProcessed = 'true';
  }

  // --- Main Execution Function ---
  function fourHanX() {
    // Process all posts/threads currently in #main
    document.querySelectorAll('#main .post, #main .thread').forEach(postElement => {
      // Determine the correct elements based on whether it's a post or thread OP
      const isThread = postElement.classList.contains('thread');
      const contentElement = isThread ? postElement : postElement.querySelector('.content');
      const bodyElement = contentElement ? contentElement.querySelector('.body') : null;

      if (contentElement) { // Audio needs the content element (or thread element)
        processAudio(contentElement);
        embedVideos(contentElement);
      }
    });
  }

  // Run initial processing after DOM is ready
  fourHanX();
  
  // Adds audio to forms last
  setupAudioFormFileInput();

  // Set up the observer to catch subsequent changes
  const mainElement = document.querySelector('#main');
  if (mainElement) {
    const observer = new MutationObserver((mutationsList) => {
      // Check if any added nodes are posts or contain posts before debouncing
      let relevantChange = false;
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if the added node itself is a post/thread OR if it contains one
              if (node.matches('.post, .thread') || node.querySelector('.post, .thread')) {
                relevantChange = true;
                break; // Found a relevant change in this mutation record
              }
            }
          }
        }
        if (relevantChange) break; // Found a relevant change, no need to check further mutations
      }

      if (relevantChange) {
        // console.log("Observer detected relevant change, running fourHanX...");
        clearTimeout(observerDebounceTimer);
        observerDebounceTimer = setTimeout(fourHanX, 250); // Debounce processing
      }
    });
    observer.observe(mainElement, { childList: true, subtree: true });
  } else {
    console.error("4hanX: Could not find #main element to observe.");
  }
})();