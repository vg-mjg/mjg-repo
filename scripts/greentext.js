document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.board');
    const textNodes = [];
  
    // Traverse all text nodes in the container
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      { acceptNode: node => node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT }
    );
  
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }
  
    textNodes.forEach(node => {
      const lines = node.nodeValue.split('\n').map(line => {
        if (line.trim().startsWith('>')) {
          return `<span class="greentext">${line}</span>`;
        }
        return line;
      });
  
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = lines.join('\n');
      node.parentNode.replaceChild(tempDiv, node);
    });
  });