(function() {
    // Inject spoiler CSS
    const style = document.createElement('style');
    style.textContent = `
      .spoiler {
        background-color: black;
        color: black;
        cursor: pointer;
        transition: color 0.1s ease;
      }
      .spoiler:hover {
        color: inherit;
      }
    `;
    document.head.appendChild(style);
  
    function formatComments() {
      const commentBodies = document.querySelectorAll('.hcb-comment-body');
  
      commentBodies.forEach((comment) => {
        // We’ll rebuild the innerHTML via tokenization to handle both greentext and spoilers.
        let html = comment.innerHTML;
  
        // 1) Escape any existing HTML so we only operate on text nodes
        //    (skip this if you know innerHTML contains no tags)
        // html = html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
        // 2) Handle spoilers: [spoiler]secret[/spoiler]
        html = html.replace(
          /\[spoiler\]([\s\S]*?)\[\/spoiler\]/gi,
          '<span class="spoiler">$1</span>'
        );
  
        // 3) Handle greentext: any standalone '>' at start of a line or after whitespace
        //    We wrap the '>' and everything after up to a newline or end.
        html = html.replace(
          /(^|\s)&gt;([^\n<]*)/g,
          '$1&gt;<span style="color: #789922;">$2</span>'
        );
  
        comment.innerHTML = html;
      });
    }
  
    // Run on load
    window.addEventListener('load', formatComments);
  
    // Watch for dynamically added comments
    const hcbBox = document.getElementById('HCB_comment_box');
    if (hcbBox) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((m) => {
          if (m.type === 'childList') {
            // Slight delay to allow new nodes to settle
            setTimeout(formatComments, 50);
          }
        });
      });
      observer.observe(hcbBox, { childList: true, subtree: true });
    }
  })();
  