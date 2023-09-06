var imageURLs = [
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
    "repobanner/17.gif"
];
function getImageTag() {
 var img = '<img src=\"';
 var randomIndex = Math.floor(Math.random() * imageURLs.length);
 img += imageURLs[randomIndex];
 img += '\" alt=\"Some alt text\"/>';
 return img;
}