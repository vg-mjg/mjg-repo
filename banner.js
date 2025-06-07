function pickimg(){
    var imagenumber = 18 ;
    var randomnumber = Math.random() ;
    var rand1 = Math.round( (imagenumber-1) * randomnumber) + 1;
    images = new Array
    images[1] = "repobanner/0.png"
    images[2] = "repobanner/1.png"
    images[3] = "repobanner/2.png"
    images[4] = "repobanner/3.png"
    images[5] = "repobanner/4.png"
    images[6] = "repobanner/5.png"
    images[7] = "repobanner/6.png"
    images[8] = "repobanner/7.png"
    images[9] = "repobanner/8.png"
    images[10] = "repobanner/9.png"
    images[11] = "repobanner/10.png"
    images[12] = "repobanner/11.png"
    images[13] = "repobanner/12.png"
    images[14] = "repobanner/13.png"
    images[15] = "repobanner/14.png"
    images[16] = "repobanner/15.png"
    images[17] = "repobanner/16.png"
    images[18] = "repobanner/18.png"
    var image = images[rand1]
    document.randimg.src = image
    }
