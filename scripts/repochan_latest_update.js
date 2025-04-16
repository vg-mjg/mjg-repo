// ==UserScript==
// @name         Repochan Latest Posts
// @namespace    https://repo.riichi.moe/
// @version      1.0
// @description  Shows the latest posts in the repochan threads
// @match        https://repo.riichi.moe/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Default number of posts to display (can be adjusted via settings)
    let numPostsToShow = 10;

    // Parses relative time strings like "3 minutes ago", "just now", etc. into approximate timestamps.
    function parseRelativeTime(relativeStr) {
        const now = Date.now();
        relativeStr = relativeStr.toLowerCase().trim();
        if (relativeStr.indexOf('just now') !== -1) {
            return now;
        }
        // Match patterns like "3 minutes ago"
        const match = relativeStr.match(/(\d+)\s*(second|minute|hour|day)s?\s+ago/);
        if (match) {
            const num = parseInt(match[1], 10);
            const unit = match[2];
            let diff = 0;
            switch (unit) {
                case 'second': diff = num * 1000; break;
                case 'minute': diff = num * 60 * 1000; break;
                case 'hour': diff = num * 60 * 60 * 1000; break;
                case 'day': diff = num * 24 * 60 * 60 * 1000; break;
                default: diff = 0;
            }
            return now - diff;
        }
        return now;
    }

    // Create the floating box with a header that includes a collapse toggle and settings.
    function createFloatingBox() {
        const box = document.createElement('div');
        box.id = 'latest-posts-box';
        Object.assign(box.style, {
            position: 'fixed',
            top: '10px',
            right: '10px',
            width: '300px',
            maxHeight: '90vh',
            backgroundColor: '#222',
            color: '#fff',
            border: '1px solid #555',
            borderRadius: '8px',
            padding: '0px',
            zIndex: 9999,
            fontSize: '14px',
            fontFamily: 'sans-serif',
            display: 'flex',
            flexDirection: 'column'
        });

        // Header with title, refresh button (optional) and collapse toggle.
        const header = document.createElement('div');
        header.id = 'latest-posts-header';
        header.style.backgroundColor = '#333';
        header.style.padding = '8px';
        header.style.cursor = 'pointer';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';

        const title = document.createElement('span');
        title.textContent = 'Latest Posts';
        title.style.fontWeight = 'bold';
        header.appendChild(title);

        // Right-side container for refresh and collapse buttons
        const controls = document.createElement('div');

        // Refresh button: clicking it will update the list
        const refreshButton = document.createElement('button');
        refreshButton.textContent = '⟳';
        refreshButton.title = 'Refresh Latest Posts';
        refreshButton.style.background = 'none';
        refreshButton.style.border = 'none';
        refreshButton.style.color = '#fff';
        refreshButton.style.fontSize = '16px';
        refreshButton.style.cursor = 'pointer';
        refreshButton.style.marginRight = '5px';
        refreshButton.addEventListener('click', (e) => {
            // Stop propagation so that it doesn't trigger collapse toggle.
            e.stopPropagation();
            updateLatestPosts();
        });
        controls.appendChild(refreshButton);

        // Collapse/Expand toggle button
        const toggleButton = document.createElement('button');
        toggleButton.textContent = '−';
        toggleButton.style.background = 'none';
        toggleButton.style.border = 'none';
        toggleButton.style.color = '#fff';
        toggleButton.style.fontSize = '16px';
        toggleButton.style.cursor = 'pointer';
        controls.appendChild(toggleButton);

        header.appendChild(controls);
        header.addEventListener('click', () => {
            const body = document.getElementById('latest-posts-body');
            if (body.style.display === 'none') {
                body.style.display = 'block';
                toggleButton.textContent = '−';
            } else {
                body.style.display = 'none';
                toggleButton.textContent = '+';
            }
        });

        box.appendChild(header);

        // Body for settings and list; add scrolling if needed.
        const body = document.createElement('div');
        body.id = 'latest-posts-body';
        Object.assign(body.style, {
            padding: '8px',
            overflowY: 'auto',
            maxHeight: '70vh'
        });

        // Settings: number of posts to show
        const settingsDiv = document.createElement('div');
        settingsDiv.style.marginBottom = '8px';
        settingsDiv.style.fontSize = '12px';

        const label = document.createElement('label');
        label.textContent = 'Show posts: ';
        label.style.marginRight = '4px';
        settingsDiv.appendChild(label);

        const numInput = document.createElement('input');
        numInput.type = 'number';
        numInput.min = '1';
        numInput.value = numPostsToShow;
        numInput.style.width = '50px';
        numInput.addEventListener('change', () => {
            numPostsToShow = parseInt(numInput.value, 10) || 10;
            updateLatestPosts();
        });
        settingsDiv.appendChild(numInput);

        body.appendChild(settingsDiv);

        // List container for posts
        const list = document.createElement('div');
        list.id = 'latest-posts-list';
        body.appendChild(list);

        box.appendChild(body);
        document.body.appendChild(box);
    }

    // Finds all posts by selecting div.comment with ids starting with "comment_" or "replies_"
    function getAllPosts() {
        return Array.from(document.querySelectorAll("div.comment")).filter(el => {
            const id = el.getAttribute("id");
            return id && (id.startsWith("comment_") || id.startsWith("replies_"));
        });
    }

    // Update the floating list with the latest posts based on the post's .date element.
    // This version uses the .author and .hcb-comment-body classes to extract detailed info.
    function updateLatestPosts() {
        const list = document.getElementById('latest-posts-list');
        if (!list) return;

        const posts = getAllPosts();
        const postsWithTime = posts.map(el => {
            // Find the date element and parse its relative time
            const dateEl = el.querySelector("span.date");
            if (!dateEl) return null;
            const timestamp = parseRelativeTime(dateEl.textContent);

            // Extract author; fallback to "Anonymous"
            const authorEl = el.querySelector(".author");
            const author = authorEl ? authorEl.textContent.trim() : "Anonymous";

            // Extract comment body text
            const bodyEl = el.querySelector(".hcb-comment-body");
            let bodyText = bodyEl ? bodyEl.textContent.trim() : "";
            // Remove any instance of "Flag 0"
            bodyText = bodyText.replace("Flag 0", "").trim();

            // Limit comment snippet length
            const snippet = bodyText.length > 100 ? bodyText.slice(0, 100) + "…" : bodyText;
            return { el, timestamp, author, dateText: dateEl.textContent.trim(), snippet };
        }).filter(p => p !== null);

        // Sort the posts descending (newest first)
        postsWithTime.sort((a, b) => b.timestamp - a.timestamp);
        // Limit to the configured number
        const recentPosts = postsWithTime.slice(0, numPostsToShow);

        // Clear the current list
        list.innerHTML = '';
        // Create and add an entry for each post
        recentPosts.forEach(item => {
            const entry = document.createElement('div');
            // Format: TIME - AUTHOR: snippet
            const timeStr = new Date(item.timestamp).toLocaleTimeString();
            entry.innerHTML = `<span class="date">${timeStr}</span> - <span class="author">${item.author}</span>: <span class="hcb-comment-body">${item.snippet}</span>`;
            entry.style.marginBottom = '5px';
            entry.style.cursor = 'pointer';
            entry.style.borderBottom = '1px solid #444';
            entry.style.paddingBottom = '3px';

            entry.addEventListener('click', () => {
                item.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const originalBg = item.el.style.backgroundColor;
                item.el.style.backgroundColor = '#444';
                setTimeout(() => item.el.style.backgroundColor = originalBg, 1500);
            });
            list.appendChild(entry);
        });
    }

    // Attaches an event listener to the page's refresh button so that when it is clicked,
    // the floating panel's latest posts also refresh.
    function attachPageRefreshListener() {
        // Look for the float button that calls refreshCommentsWrapper()
        const refreshBtn = document.querySelector("button.float-btn[onclick*='refreshCommentsWrapper']");
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                // Delay a little to allow any refresh actions to complete
                setTimeout(updateLatestPosts, 500);
            });
        }
    }

    // Wait until at least one post is present before initializing the floating panel and listeners.
    function waitForPosts() {
        const checkInterval = setInterval(() => {
            if (getAllPosts().length > 0) {
                clearInterval(checkInterval);
                createFloatingBox();
                updateLatestPosts();
                attachPageRefreshListener();
                // Refresh the latest posts list every 10 seconds.
                setInterval(updateLatestPosts, 10000);
            }
        }, 1000);
    }

    // Initialize the userscript.
    waitForPosts();
})();
