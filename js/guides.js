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
$(document).ready(function() {
    if (localStorage.getItem("theme") === null) {
        localStorage.setItem("theme", "dark");
    }
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
});

$("#theme-switch").on('click', function(event) {
    if(event.originalEvent === undefined)return;
    if ($(this).prop('checked')) {
        ThemeSwitcher("light");
    } else {
        ThemeSwitcher("dark");
    }
});

hash = function(h){
  if (history.pushState){
    history.pushState(null, null, h);
  }else{
    location.hash = h;
  }
}

// this makes the height of each page equal to the height of the window
$('.page').css('height', $(window).height());

// scrollspy section
(function($){
  //variable that will hold the href attr of the links in the menu
  var sections = [];
  //variable that stores the id of the section
  var id = false;
  //variable for the selection of the anchors in the navbar
  var $navbara = $('#navbar-guide a');
  
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
  $('#navbar-guide a').each(function(){
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
    if (scrolled_id !== id) {
      id = scrolled_id;
      $($navbara).removeClass('text-info');
      $('#navbar-guide a[href="#' + id + '"]').addClass('text-info'); 
    }
  })
})(jQuery);
