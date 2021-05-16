function SwitchLight() {
    localStorage.setItem("theme", "light");
    $("link[rel='stylesheet']")[1].href = "css/light.css";
    $("label[for='ThemeSwitch']").html("おやすみ");
};

function SwitchDark() {
    localStorage.setItem("theme", "dark");
    $("link[rel='stylesheet']")[1].href = "css/dark.css";
    $("label[for='ThemeSwitch']").html("おはよう");
};

function ChangeTheme() {
    if (localStorage.getItem("theme") == "dark") {
        SwitchLight();
    } else {
        SwitchDark();
    }
};

function SelectComic(name) {
    comics = {};
    // I need to pass this to a .json file
    // For now, this will work as a beta
    comics["a-shrine-maidens"] = {"name": "A Shrine Maiden's Christmas", "images": ["a-shrine-maidens-christmas.jpg"]};
    comics["a-story-about-mahjong"] = {"name": "A Story About Mahjong", "images": ["a-story-about-mahjong.jpg"]};
    comics["c1"] = {"name": "C1", "images": ["c1.png"]};
    comics["dear-anon"] = {"name": "Dear Anon", "images": ["dear-anon.png"]};
    comics["houteihai"] = {"name": "Houteihai", "images": ["houteihai.png"]};
    comics["mjg-drama"] = {"name": "/mjg/ Drama", "images": ["mjg-drama-1.gif", "mjg-drama-2.png"]};
    comics["nipples"] = {"name": "Nipples", "images": ["nipples.png"]};
    comics["ttott"] = {"name": "TToTT", "images": ["ttott-1.png", "ttott-2.png"]};
    comics["newspaper"] = {"name": "Newspaper Reports", "images": ["newspaper-1.jpg", "newspaper-2.jpg"]};
    comics["breaking"] = {"name": "Breaking News!", "images": ["breaking-1.jpg", "breaking-2.jpg", "breaking-3.png", "breaking-4.png"]};
    comics["maikagi"] = {"name": "Maikagi: The Last Saint", "images": ["maikagi-1.png", "maikagi-2.png"]};

    if (comics[name] == null) {
        $("#comic-header h2").html("Comic does not exist.");
    } else {
        document.title = "Comic - "+comics[name]["name"];
        $("#comic-header h2").html(comics[name]["name"]);
        var gallery = "";
        for (var i = 0; i < comics[name]["images"].length; i++) {
            gallery += '<div class="carousel-item w-100';
            // With no first "active" image this shit won't work
            // I think they fix this in bootstrap 5
            // Will look into it
            if (i == 0) {
                gallery += ' active">';
            } else {
                gallery += '">';
            }
            gallery += '<img src="/oc-pages/pictures/'+comics[name]["images"][i]+'" class="d-block mx-auto w-auto img-fluid container-fluid" alt=""></div>';
        };
        $(".carousel-inner").append(gallery);
    }
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
    var comic = window.location.hash;
    comic = comic.substring(1);
    SelectComic(comic);
    $('.carousel').carousel({
      interval: false,
      keyboard: true
    });
});