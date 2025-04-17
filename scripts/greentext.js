(function() {
    // Inject CSS for spoiler styling
    const style = document.createElement('style');
    style.textContent = `
      .spoiler {
        color: black;
        outline: 1px solid black;
        background-color: transparent;
        user-select: text;
      }
    `;
    document.head.appendChild(style);
  
    function formatComments() {
      const commentBodies = document.querySelectorAll('.hcb-comment-body');
  
      commentBodies.forEach((comment) => {
        // Process spoilers
        let html = comment.innerHTML;
  
        // Replace [spoiler]...[/spoiler] with <span class="spoiler">...</span>
        html = html.replace(/\[spoiler\]([\s\S]*?)\[\/spoiler\]/gi, '<span class="spoiler">$1</span>');
  
        // Process greentext
        // Replace lines starting with '>' with a green-colored span
        html = html.replace(/^(&gt;[^\n]*)/gm, '<span style="color: #789922;">$1</span>');
  
        comment.innerHTML = html;
      });
    }
  
    // Run on page load
    window.addEventListener('load', () => {
      formatComments();
  
      // Observe for dynamically added comments
      const hcbBox = document.getElementById('HCB_comment_box');
      if (hcbBox) {
        const observer = new MutationObserver((mutationsList) => {
          for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
              setTimeout(formatComments, 100);
            }
          }
        });
  
        observer.observe(hcbBox, { childList: true, subtree: true });
      }
    });
  })();
  