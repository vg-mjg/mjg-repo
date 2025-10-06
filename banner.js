// I'd love to build the array by looping the directory, but GitHub pages doesn't allow it.
function pickimg(){
    let images = [
    "repobanner/0.png",
    "repobanner/1.png",
    "repobanner/2.png",
    "repobanner/3.png",
    "repobanner/4.png",
    "repobanner/5.png",
    "repobanner/6.png",
    "repobanner/7.png",
    "repobanner/8.png",
    "repobanner/9.png",
    "repobanner/10.png",
    "repobanner/11.png",
    "repobanner/12.png",
    "repobanner/13.png",
    "repobanner/14.png",
    "repobanner/15.png",
    "repobanner/16.png",
    "repobanner/18.png"
    ];
    var rand1 = Math.round( (images.length -1) * Math.random) + 1;
    
    var image = images[rand1]
    document.randimg.src = image
    }
