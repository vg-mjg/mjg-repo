function SwitchLight() {
    localStorage.setItem("theme", "light");
    $("link[rel='stylesheet']")[1].href = "/css/light.css";
    $("label[for='ThemeSwitch']").html("おやすみ");
    $("#library-header").addClass("border-dark");
    $("thead").each(function() {
        $(this).removeClass("thead-dark");
        $(this).addClass("thead-light");
    });
    $("tbody").each(function() {
        $(this).removeClass("text-white");
    });
    $("td#subtitle").each(function() {
        $(this).removeClass("bg-success");
        $(this).addClass("bg-info");
    });
};

function SwitchDark() {
    localStorage.setItem("theme", "dark");
    $("link[rel='stylesheet']")[1].href = "/css/dark.css";
    $("label[for='ThemeSwitch']").html("おはよう");
    $("#library-header").removeClass("border-dark");
    $("thead").each(function() {
        $(this).removeClass("thead-light");
        $(this).addClass("thead-dark");
    });
    $("tbody").each(function() {
        $(this).addClass("text-white");
    });
    $("td#subtitle").each(function() {
        $(this).removeClass("bg-info");
        $(this).addClass("bg-secondary");
    });
};

function ChangeTheme() {
    if (localStorage.getItem("theme") == "dark") {
        SwitchLight();
    } else {
        SwitchDark();
    }
};

$(document).ready(function() {
    // If people enter to see a specific tab this should show it
    // Or fallback to the default tab
    if (window.location.hash != "") {
      var load_anchor = $(window.location.hash);
      load_anchor.tab("show");
      $('a[href$="'+window.location.hash+'"]').addClass("active");
    } else {
      $("#resources-game").tab("show");
      $('a[href$="#resources-game"]').addClass("active");
    }
    if (localStorage.getItem("theme") === null) {
        localStorage.setItem("theme", "dark");
    };
    if (localStorage.getItem("theme") == "light") {
        SwitchLight();
        $("#ThemeSwitch").prop('checked', true);
    }
    if (localStorage.getItem("theme") == "dark"){
        SwitchDark();
    }
});

$("#ThemeSwitch").click(function() {
    ChangeTheme();
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