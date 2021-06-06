function SwitchLight() {
    localStorage.setItem("theme", "light");
    $("link[rel='stylesheet']")[1].href = "../css/light.css";
    $("label[for='ThemeSwitch']").html("おやすみ");
};

function SwitchDark() {
    localStorage.setItem("theme", "dark");
    $("link[rel='stylesheet']")[1].href = "../css/dark.css";
    $("label[for='ThemeSwitch']").html("おはよう");
};

function ChangeTheme() {
    if (localStorage.getItem("theme") == "dark") {
        SwitchLight();
    } else {
        SwitchDark();
    }
};

function LoadTeams() {
    teams = '';
    for (var i = 1; i < 15; i++) {
        teams += '<li class="list-inline-item"><a href="#" data-team="'+i+'"><img src="team-logos/team'+i+'.png" width="75" height="75" alt=""></a></li>'
    }
    $("#teams-display").html(teams);
}

function LoadTeamsOCs(id) {
    $.getJSON('team-ocs.json', function(json, textStatus) {
        gallery = '';
        for (var i = 0; i < json["teams"][id].length; i++) {
            gallery += '<div class="carousel-item w-100';
            // With no first "active" image this shit won't work
            // I think they fix this in bootstrap 5
            // Will look into it
            if (i == 0) {
                gallery += ' active">';
            } else {
                gallery += '">';
            }
            gallery += '<img src="'+json["teams"][id][i]+'" class="d-block mx-auto w-auto img-fluid container-fluid" alt=""></div>';
        }
        $(".carousel-inner").html(gallery);
        if($(".img-active").length == 1) {
            $(".img-active").removeClass("img-active");
        }
        $("a[data-team='"+id+"'] img").toggleClass("img-active");
    });
    
}

$(document).ready(function() {
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

    $(".list-inline-item a").click(function(event) {
        event.preventDefault();
        LoadTeamsOCs(parseInt($(this).attr('data-team')));
    });

    LoadTeamsOCs(0);

    $('.carousel').carousel({
      interval: false,
      keyboard: true
    });

    $("#ThemeSwitch").click(function() {
        ChangeTheme();
    });
});