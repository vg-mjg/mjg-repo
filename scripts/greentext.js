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


function chanTheme() {
    document.querySelectorAll('[id^="comment_"]').forEach(cmt => {
      // comment
      imgLink = cmt.querySelector(":scope > a");
      text = cmt.querySelector(":scope > blockquote .hcb-comment-body");
  
      if (imgLink){
        // new div for img and post
        div = document.createElement("div");
  
        // sets image size 
        img = imgLink.querySelector("img");
        img.style.float = "left";
        img.style.maxWidth = "120px";
        img.style.maxHeight = "120px";
        img.style.marginBottom = "0px";
        img.style.marginRight = "5px";
  
        //click to load
        const orig = img.src;
        const high = imgLink.href;
  
        imgLink.addEventListener('click', function(e) {
          e.preventDefault();
          image = this.querySelector("img");
  
          if (image.src === orig) {
            image.src = high;
            image.style.opacity = "50%";
            image.addEventListener('load', function () {
              image.style.maxWidth = "100%";
              image.style.maxHeight = "100%";
              image.style.opacity =  "100%";
            }, { once: true });
          } else {
            image.src = orig;
            image.style.maxWidth = "120px";
            image.style.maxHeight = "120px";
          }
        });
  
        //insert element
        div.appendChild(imgLink);
        div.appendChild(text);
        cmt.querySelector("blockquote").appendChild(div);
      }
    });
  }
  
  new MutationObserver(() => {
    chanTheme()
  }).observe(document.querySelector("#HCB_comment_box"), { childList: true });