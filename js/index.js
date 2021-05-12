function PickImage() {
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
    images[18] = "repobanner/17.gif";
    var randomnumber = Math.random() ;
    var rand1 = Math.round( (images.length-1) * randomnumber) + 1;
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
    $(".tab-content").addClass("bg-lightgrey");
    $(".tab-content").removeClass("border-white");
    $(".tab-content").addClass("border-secondary");
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
    $(".tab-content").removeClass("bg-lightgrey");
    $(".tab-content").addClass("bg-secondary");
    $(".tab-content").removeClass("border-secondary");
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

function Countdown(count_time) {
    if (count_time != null) {
        var countDownDate = new Date(count_time).getTime();
        var now = new Date();
        var nowUTC = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());

        // Find the distance between now and the count down date
        var distance = countDownDate - nowUTC;

        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (distance > 0) {
            var end_time = "<br /> " + days + " days " + hours + " hours " + minutes + " minutes " + seconds + " seconds";

            $("#countdown").html(end_time);
        } else {
            $("#countdown").html("<br>It's time");
        }
    }
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
    var updates = "";
    $.ajax({
        url: '/updates.json',
    })
    .always(function(data) {
        for (var i = 0; i < data.updates.length; i++) {
            updates += `<dt><a href="`+data.updates[i].link+`"><strong>`+data.updates[i].title+`</strong></a></dt>
            <dd><span class="badge badge-secondary">`+data.updates[i].category+`</span></dd>
            <dd><small>`+data.updates[i].description+`</small></dd>`;
        }
        $("#news").html(updates);
    });


    var time_interval = setInterval(GetTime, 1000);
    /* HOW TO USE:
        Leave everything else as it is except the last argument. This already transforms everything to UTC.
        At the end of the set interval function add the date. An example: "Dec 25, 2021 22:00:00".
        It has to be a string.
    */
    var countdown_interval = setInterval(Countdown, 1000);
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