function greentext() {
    const commentBodies = document.querySelectorAll('.hcb-comment-body');

    commentBodies.forEach((comment) => {
        let textNodes = Array.from(comment.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);

        textNodes.forEach((textNode) => {
            const text = textNode.textContent;
            const splitIndex = text.indexOf('>');

            if (splitIndex !== -1) {
                const beforeText = text.slice(0, splitIndex);
                const afterText = text.slice(splitIndex);

                const beforeTextNode = document.createTextNode(beforeText);
                const afterTextSpan = document.createElement('span');
                afterTextSpan.textContent = afterText;
                afterTextSpan.style.color = '#789922';

                textNode.replaceWith(beforeTextNode, afterTextSpan);
            }
        });
    });
}

window.addEventListener('load', () => {
    greentext();

    const hcbBox = document.getElementById('HCB_comment_box');
    if (hcbBox) {
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    setTimeout(greentext, 100);
                }
            }
        });

        observer.observe(hcbBox, { childList: true, subtree: true });
    }
});