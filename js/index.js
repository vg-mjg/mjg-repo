function PickImage() {
    var imagenumber = 17 ;
    var randomnumber = Math.random() ;
    var rand1 = Math.round( (imagenumber-1) * randomnumber) + 1;
    images = new Array;
    // I hate this, it should be a lot cleaner
    images[1] = "repobanner/0.png";
    images[2] = "repobanner/1.png";
    images[3] = "repobanner/2.png";
    images[4] = "repobanner/3.png";
    images[5] = "repobanner/4.png";
    images[6] = "repobanner/5.png";
    images[7] = "repobanner/6.png";
    images[8] = "repobanner/7.png";
    images[9] = "repobanner/8.png";
    images[10] = "repobanner/9.png";
    images[11] = "repobanner/10.png";
    images[12] = "repobanner/11.png";
    images[13] = "repobanner/12.png";
    images[14] = "repobanner/13.png";
    images[15] = "repobanner/14.png";
    images[16] = "repobanner/15.png";
    images[17] = "repobanner/16.png";
    var image = images[rand1];
    $("#randimg").attr("src", image);
};

function SwitchLight() {
    localStorage.setItem("theme", "light");
    $("link[rel='stylesheet']")[1].href = "css/light.css";
    $("label[for='ThemeSwitch']").html("おやすみ");
    $("nav").removeClass("bg-dark");
    $("nav").addClass("bg-white");
    $("nav a").addClass("text-dark");
    $(".card").addClass("border-dark");
    $(".card-header").removeClass("bg-dark");
    $(".card-header").addClass("bg-secondary");
    $(".card-body").removeClass("bg-secondary");
    $(".card-body").addClass("bg-light");
    $(".card-body").addClass("text-dark");
    $("#more").removeClass("text-light");
    $("#more").addClass("text-dark");
};

function SwitchDark() {
    localStorage.setItem("theme", "dark");
    $("link[rel='stylesheet']")[1].href = "css/dark.css";
    $("label[for='ThemeSwitch']").html("おはよう");
    $("nav").removeClass("bg-white");
    $("nav").addClass("bg-dark");
    $("nav a").removeClass("text-dark");
    $(".card-header").removeClass("bg-secondary");
    $(".card-header").addClass("bg-dark");
    $(".card-body").removeClass("bg-light");
    $(".card-body").addClass("bg-secondary");
    $(".card-body").removeClass("text-dark");
    $(".card-body").addClass("text-light");
    $("#more").removeClass("text-dark");
    $("#more").addClass("text-light");
};

function ChangeTheme() {
    if (localStorage.getItem("theme") == "dark") {
        SwitchLight();
    } else {
        SwitchDark();
    }
}

function GetTime() {
    var now = new Date(Date.now());
    var formatted = now.toUTCString();
    $("#time").html(formatted);
}

$(document).ready(function() {
    var interval = setInterval(GetTime, 500);
    if (localStorage.getItem("theme") === null) {
        localStorage.setItem("theme", "dark");
    };
    if (localStorage.getItem("theme") == "light") {
        SwitchLight();
        $("#ThemeSwitch").prop('checked', true);
    }
    PickImage();
});

$("#ChangeImage").click(function() {
    PickImage();
});

$("#ThemeSwitch").click(function() {
    ChangeTheme();
})