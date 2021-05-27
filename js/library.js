function ThemeSwitcher(state) {
    if (state == "light") {
        $("link[rel*='stylesheet']")[2].href = "css/light.css";
        $("[class*='text-white']").each(function(i, v) {$(v).toggleClass("text-white text-dark");});
        $("[class*='dropdown-menu-dark']").each(function(i, v) {$(v).toggleClass("dropdown-menu-dark dropdown-menu-light");});
        $("[class*='bg-dark']").each(function(i, v) {$(v).toggleClass("bg-dark bg-light");})
        localStorage.setItem("theme", "light");
        $("label[for='theme-switch']").html("おやすみ");
    } else {
        $("link[rel*='stylesheet']")[2].href = "css/dark.css";
        $("[class*='text-dark']").each(function(i, v) {$(v).toggleClass("text-dark text-white");});
        $("[class*='dropdown-menu-light']").each(function(i, v) {$(v).toggleClass("dropdown-menu-light dropdown-menu-dark");});
        $("[class*='bg-light']").each(function(i, v) {$(v).toggleClass("bg-light bg-dark");})
        localStorage.setItem("theme", "dark");
        $("label[for='theme-switch']").html("おはよう");
    }
}

function LoadSection(section) {
  var library_sections = {};
  library_sections["resources-game"] = "resources-game.html";
  library_sections["resources-strategy"] = "resources-strategy.html";
  library_sections["resources-toolz"] = "resources-toolz.html";
  library_sections["resources-gguides"] = "resources-gguides.html";
  library_sections["resources-majplus"] = "resources-majplus.html";
  library_sections["resources-media"] = "resources-media.html";
  library_sections["resources-mleague"] = "resources-mleague.html";
  library_sections["resources-mjg"] = "resources-mjg.html";
  library_sections["resources-offline"] = "resources-offline.html";
  $(section).load("resources/"+section.substring(1)+".html", function(response, status, xhr) {
    /* Stuff to do after the page is loaded */
    if(status == "success") {
      $(section).tab("show");
      $('a[href="'+section+'"]').addClass('active');
      // Checks if the light theme is on and switches the pages to light
      if (localStorage.getItem("theme") == "light") {
          ThemeSwitcher("light");
      }
    }
  });
  
};


$(document).ready(function() {
    // If people enter to see a specific tab this should show it
    // Or fallback to the default tab
    if (window.location.hash != "") {
      // If the location is the library use the new way to load pages
      if (window.location.pathname == "/library.html") {
        LoadSection(window.location.hash);
      } else {
        // Else drop back to the old method
        load_anchor = $(window.location.hash);
        load_anchor.tab("show");
      }
    } else {
      // This will now load the first tab of the side menu
      if (window.location.pathname == "/library.html") {
        var res = $("#side-menu a:first").attr("href");
        LoadSection(res);
      } else {
        $("#side-menu a:first").tab("show");
      }
      $("#side-menu a:first").addClass("active");
    }
    if (localStorage.getItem("theme") === null) {
        localStorage.setItem("theme", "dark");
    };
    ThemeSwitcher(localStorage.getItem("theme"));
    var audioElement = document.createElement('audio');
    audioElement.setAttribute('src', '/audio/beeei.mp3');
    $(window).scroll(function() {
      if ($(this).scrollTop() > 50) {
        $('.back-to-top').fadeIn();
      } else {
        $('.back-to-top').fadeOut();
      }
    });
    // scroll body to 0px on click
    $('#back-to-top').click(function() {
      audioElement.play();
      $('body,html').animate({
        scrollTop: 0
      }, 2000);
      return false;
    });
    $("#side-menu a").click(function(event) {
      event.preventDefault();
      section = $(this).attr("href");
      LoadSection(section);
    });
    $("#search-term").on("keyup", function() {
      var value = $(this).val().toLowerCase();
      $("#term-table tr").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
    });
});

$("#theme-switch").on('click', function(event) {
    if(event.originalEvent === undefined)return;
    if ($(this).prop('checked')) {
        ThemeSwitcher("light");
    } else {
        ThemeSwitcher("dark");
    }
});

$("#resources a").click(function() {
    $("html, body").animate({ scrollTop: 0 }, "slow");
    // window.scrollTo({top: 0, behavior: 'smooth'});
});

hash = function(h){
  if (history.pushState){
    history.pushState(null, null, h);
  }else{
    location.hash = h;
  }
};

// this makes the height of each page equal to the height of the window
$('.page').css('height', $(window).height());

// scrollspy section
(function($){
  //variable that will hold the href attr of the links in the menu
  var sections = [];
  //variable that stores the id of the section
  var id = false;
  //variable for the selection of the anchors in the navbar
  var $navbara = $('.list-inline a');
  
  $navbara.click(function(e){
    //prevent the page from refreshing
    if ($(this).attr('href') != '../index.html') {
        e.preventDefault();
    }
    //set the top offset animation and speed
    $('html, body').animate({
      scrollTop: $($(this).attr('href')).offset().top
},1000);
    hash($(this).attr('href'));
  });

  //select all the anchors in the navbar one after another
  $('.list-inline a').each(function(){
   // and adds them in the sections variable
    if ($(this).attr('href') != '../index.html') {
        sections.push($($(this).attr('href')));
    }
    
  })
  $(window).scroll(function(e){
    // scrollTop retains the value of the scroll top with the reference at the middle of the page
    var scrollTop = $(this).scrollTop() + ($(window).height()/2);
    //cycle through the values in sections array
    for (var i in sections) {
      var section = sections[i];
      //if scrollTop variable is bigger than the top offset of a section in the sections array then 
      if (scrollTop > section.offset().top){
        var scrolled_id = section.attr('id');
      }
    }
  })
})(jQuery);