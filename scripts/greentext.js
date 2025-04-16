document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.board');
    const textNodes = [];

    // Regex to detect URLs (simple version)
    const urlRegex = /https?:\/\/[^\s]+/g;

    // Traverse all text nodes in the container
    const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: node => node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
        }
    );

    while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
    }

    textNodes.forEach(node => {
        const lines = node.nodeValue.split('\n');
        const fragment = document.createDocumentFragment();

        lines.forEach((line, index) => {
            const span = document.createElement('span');
            if (line.trim().startsWith('>')) {
                span.className = 'greentext';
            }

            // Process the line to replace URLs with <a> elements
            let lastIndex = 0;
            let match;

            while ((match = urlRegex.exec(line)) !== null) {
                // Append text before the URL
                span.appendChild(document.createTextNode(line.substring(lastIndex, match.index)));

                // Create the <a> element for the URL
                const a = document.createElement('a');
                a.href = match[0];
                a.textContent = match[0];
                a.target = '_blank';  // Open in new tab
                a.rel = 'noopener noreferrer';  // Security best practice

                span.appendChild(a);

                lastIndex = match.index + match[0].length;
            }

            // Append remaining text after last URL
            span.appendChild(document.createTextNode(line.substring(lastIndex)));

            fragment.appendChild(span);

            // Append a newline character node except after the last line
            if (index < lines.length - 1) {
                fragment.appendChild(document.createTextNode('\n'));
            }
        });

        node.parentNode.replaceChild(fragment, node);
    });
});
