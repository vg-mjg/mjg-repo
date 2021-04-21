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
    sticky_image = new Array;
    sticky_image[1] = "pics/haruna.png";
    sticky_image[2] = "pics/hatt.png";
    sticky_audio = new Array;
    sticky_audio[1] = "modottekoi";
    sticky_audio[2] = "kaan";
    randnum = 2;
    var rand2 = Math.round( (randnum-1) * randomnumber) + 1;
    var img2 = sticky_image[rand2];
    $("#flying-cunny").attr("src", img2);
    $("#flying-cunny").addClass(sticky_audio[rand2]);
};

function SwitchLight() {
    localStorage.setItem("theme", "light");
    $("link[rel='stylesheet']")[1].href = "css/light.css";
    $("label[for='ThemeSwitch']").html("おやすみ");
    $("#menu").removeClass("bg-dark");
    $("#menu").addClass("bg-white");
    $("#menu a").addClass("text-dark");
    $(".card").addClass("border-dark");
    $(".card-header").removeClass("bg-dark");
    $(".card-header").addClass("bg-secondary");
    $(".card-body").removeClass("bg-secondary");
    $(".card-body").addClass("bg-light");
    $(".card-body").addClass("text-dark");
    $("#more").removeClass("text-light");
    $("#more").addClass("text-dark");
    $(".tab-content").removeClass("bg-secondary");
    $(".tab-content").addClass("bg-white");
    $(".tab-content").removeClass("border-white");
};

function SwitchDark() {
    localStorage.setItem("theme", "dark");
    $("link[rel='stylesheet']")[1].href = "css/dark.css";
    $("label[for='ThemeSwitch']").html("おはよう");
    $("#menu").removeClass("bg-white");
    $("#menu").addClass("bg-dark");
    $("#menu a").removeClass("text-dark");
    $(".card-header").removeClass("bg-secondary");
    $(".card-header").addClass("bg-dark");
    $(".card-body").removeClass("bg-light");
    $(".card-body").addClass("bg-secondary");
    $(".card-body").removeClass("text-dark");
    $(".card-body").addClass("text-light");
    $("#more").removeClass("text-dark");
    $("#more").addClass("text-light");
    $(".tab-content").removeClass("bg-white");
    $(".tab-content").addClass("bg-secondary");
    $(".tab-content").addClass("border-white");
};

function ChangeTheme() {
    if (localStorage.getItem("theme") == "dark") {
        SwitchLight();
    } else {
        SwitchDark();
    }
};

function GetTime() {
    var now = new Date(Date.now());
    var formatted = now.toUTCString();
    $("#time").html(formatted);
};

function SoundAdvice() {
    var kaan = new Audio("audio/kaan.mp3");
    var modottekoi = new Audio("audio/modottekoi.mp3");
    var cunny = $("#flying-cunny").hasClass('kaan');
    if(cunny) {
        kaan.play();
    } else {
        modottekoi.play();
    }
};

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

$("#flying-cunny").click(function() {
    SoundAdvice();
})