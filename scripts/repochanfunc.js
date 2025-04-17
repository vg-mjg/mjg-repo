
  // Ensure hcb_user exists
  window.hcb_user = window.hcb_user || {};
  // Define the onload callback
  hcb_user.onload = function() {
    // Select all comment containers
    var comments = document.querySelectorAll('#HCB_comment_box .comment');
    comments.forEach(function(c) {
      // Extract the numeric ID from the container's id attribute
      var id = c.id.split('_')[1];
      // Find the author-name element
      var authorEl = c.querySelector('.author-name');
      // Append " #ID" if not already present
      if (authorEl && !authorEl.textContent.includes('#')) {
        authorEl.textContent = authorEl.textContent.trim() + ' #' + id;
      }
    });
  };

  
  window.hcb_user = window.hcb_user || {};
  hcb_user.onload = function() {
    // 1) Append "#ID" in reply textarea
    var origReply = window.hcb.reply;
    window.hcb.reply = function(id) {
      origReply.call(this, id);
      setTimeout(function() {
        var ta = document.querySelector('#HCB_comment_box textarea');
        if (ta) {
          ta.value = ta.value.replace(/@Anonymous\b/, '@Anonymous#' + id);
        }
      }, 50);
    };
  };
    // 2) Linkify existing @Anonymous#ID texts
    document.querySelectorAll(
      '#HCB_comment_box .hcb-comment-body'
    ).forEach(function(b) {
      b.innerHTML = b.innerHTML.replace(
        /@Anonymous#(\d+)/g,
        function(_, num) {
          return '<a href="#comment_' + num +
                 '" class="hcb-mention" data-id="' + num +
                 '">@Anonymous#' + num + '</a>';
        }
      );
    });

    // 3) Smooth-scroll on mention click
    document.getElementById('HCB_comment_box')
      .addEventListener('click', function(e) {
        var tgt = e.target;
        if (tgt.matches('a.hcb-mention')) {
          e.preventDefault();
          var id = tgt.getAttribute('data-id'),
              el = document.getElementById('comment_' + id);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      });
 
