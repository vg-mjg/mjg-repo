// ==UserScript==
// @name         Repochan Latest Posts
// @namespace    https://repo.riichi.moe/
// @version      1.2
// @description  Shows the latest posts in the repochan threads
// @icon         https://raw.githubusercontent.com/vg-mjg/mjg-repo/refs/heads/master/favicon.ico
// @match        https://repo.riichi.moe/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let numPostsToShow = 10;

    function parseRelativeTime(relativeStr) {
        const now = Date.now();
        relativeStr = relativeStr.toLowerCase().trim();
        if (relativeStr.indexOf('just now') !== -1) {
            return now;
        }
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
            }
            return now - diff;
        }
        return now;
    }

    function createFloatingBox() {
        const box = document.createElement('div');
        box.id = 'latest-posts-box';
        Object.assign(box.style, {
            position: 'fixed',
            top: '10px',
            left: 'auto',
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

        const header = document.createElement('div');
        header.id = 'latest-posts-header';
        header.style.backgroundColor = '#333';
        header.style.padding = '8px';
        header.style.cursor = 'move';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';

        const title = document.createElement('span');
        title.textContent = 'Latest Posts';
        title.style.fontWeight = 'bold';
        header.appendChild(title);

        const controls = document.createElement('div');

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
            e.stopPropagation();
            updateLatestPosts();
        });
        controls.appendChild(refreshButton);

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

        const body = document.createElement('div');
        body.id = 'latest-posts-body';
        Object.assign(body.style, {
            padding: '8px',
            overflowY: 'auto',
            maxHeight: '70vh'
        });

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

        const list = document.createElement('div');
        list.id = 'latest-posts-list';
        body.appendChild(list);

        box.appendChild(body);
        document.body.appendChild(box);

        // Drag functionality
        let isDragging = false;
        let offsetX, offsetY;

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            const rect = box.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                box.style.left = `${e.clientX - offsetX}px`;
                box.style.top = `${e.clientY - offsetY}px`;
                box.style.right = 'auto';
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            document.body.style.userSelect = '';
        });
    }

    function getAllPosts() {
        return Array.from(document.querySelectorAll("div.comment")).filter(el => {
            const id = el.getAttribute("id");
            return id && (id.startsWith("comment_") || id.startsWith("replies_"));
        });
    }

    function updateLatestPosts() {
        const list = document.getElementById('latest-posts-list');
        if (!list) return;

        const posts = getAllPosts();
        const postsWithTime = posts.map(el => {
            const dateEl = el.querySelector("span.date");
            if (!dateEl) return null;
            const timestamp = parseRelativeTime(dateEl.textContent);

            const authorEl = el.querySelector(".author");
            const author = authorEl ? authorEl.textContent.trim() : "Anonymous";

            const bodyEl = el.querySelector(".hcb-comment-body");
            let bodyText = bodyEl ? bodyEl.textContent.trim() : "";
            bodyText = bodyText.replace("Flag 0", "").trim();

            const snippet = bodyText.length > 100 ? bodyText.slice(0, 100) + "…" : bodyText;
            return { el, timestamp, author, dateText: dateEl.textContent.trim(), snippet };
        }).filter(p => p !== null);

        postsWithTime.sort((a, b) => b.timestamp - a.timestamp);
        const recentPosts = postsWithTime.slice(0, numPostsToShow);

        list.innerHTML = '';
        recentPosts.forEach(item => {
            const entry = document.createElement('div');
            const timeStr = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

    function attachPageRefreshListener() {
        const refreshBtn = document.querySelector("button.float-btn[onclick*='refreshCommentsWrapper']");
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                setTimeout(updateLatestPosts, 500);
            });
        }
    }

    function waitForPosts() {
        const checkInterval = setInterval(() => {
            if (getAllPosts().length > 0) {
                clearInterval(checkInterval);
                createFloatingBox();
                updateLatestPosts();
                attachPageRefreshListener();
                setInterval(updateLatestPosts, 10000);
            }
        }, 1000);
    }

    waitForPosts();
})();
