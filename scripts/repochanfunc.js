
  window.hcb_user = window.hcb_user || {};
  hcb_user.onload = function() {
    // 1) Append “ #ID” to each author
    document.querySelectorAll('#HCB_comment_box .comment')               // select all comments :contentReference[oaicite:4]{index=4}
      .forEach(function(c) {                                             // NodeList.forEach :contentReference[oaicite:5]{index=5}
        var id = c.id.split('_')[1],
            authorEl = c.querySelector('.author-name');                 // Element.querySelector :contentReference[oaicite:6]{index=6}
        if (authorEl && !authorEl.textContent.includes('#')) {
          authorEl.textContent = authorEl.textContent.trim() + ' #' + id;
        }
      });

    // 2) Override reply() => prefill “>>ID”
    var origReply = window.hcb.reply;
    window.hcb.reply = function(id) {
      origReply.call(this, id);
      setTimeout(function() {                                            // setTimeout :contentReference[oaicite:7]{index=7}
        var ta = document.querySelector('#HCB_comment_box textarea');
        if (ta) ta.value = '>>' + id + ' ';
      }, 50);
    };

    // 3) Linkify all >>ID mentions
    document.querySelectorAll('#HCB_comment_box .hcb-comment-body')      // querySelectorAll :contentReference[oaicite:8]{index=8}
      .forEach(function(b) {
        b.innerHTML = b.innerHTML.replace(
          /&gt;&gt;(\d+)/g,                                             // global regex :contentReference[oaicite:9]{index=9}
          '<a href="#comment_$1" class="hcb-quote" data-id="$1">>>$1</a>'
        );
      });

    // 4) Build replies map and inject “Replies:” lists
    var repliesMap = {};
      document.querySelectorAll(
        '#HCB_comment_box .hcb-quote'
      ).forEach(function(a) {
        var tgt  = a.dataset.id,
            from = a.closest('.comment').id.split('_')[1];
        repliesMap[tgt] = repliesMap[tgt] || [];
        repliesMap[tgt].push(from);
      });

      // ... inside hcb_user.onload, after building repliesMap ...

Object.keys(repliesMap).forEach(function(tgt) {
    var c = document.getElementById('comment_' + tgt);
    if (!c) return;
  
    // Sort the reply IDs numerically in ascending order
    var sortedReplies = repliesMap[tgt].sort(function(a, b) {
      return parseInt(a, 10) - parseInt(b, 10);
    });
  
    // Build the inline links HTML
    var inlineLinks = sortedReplies
      .map(function(r) {
        return '<a href="#comment_' + r +
               '" class="hcb-quote" data-id="' + r +
               '">>>' + r + '</a>';
      }).join(' ');
  
    // Find the date span and inject AFTER it
    var dateEl = c.querySelector('blockquote .date');
    if (dateEl) {
      dateEl.insertAdjacentHTML(
        'afterend',
        '<span class="hcb-replies-inline"> Replies: ' + inlineLinks + '</span>'
      );
    }
  });
  

    // 5) Delegate click: scroll & highlight
    document.getElementById('HCB_comment_box')
      .addEventListener('click', function(e) {                          // addEventListener :contentReference[oaicite:12]{index=12}
        var tgt = e.target;
        if (tgt.matches('a.hcb-quote')) {
          e.preventDefault();
          var id = tgt.dataset.id,
              el = document.getElementById('comment_' + id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });                  // scrollIntoView :contentReference[oaicite:13]{index=13}
            el.classList.add('hcb-highlight');                          // classList :contentReference[oaicite:14]{index=14}
            setTimeout(function() {
              el.classList.remove('hcb-highlight');
            }, 2000);
          }
        }
      });
  };

