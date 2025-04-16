
function changeBanner() {
  var banners = [
    "banners/0.png",
    "banners/1.png",
    "banners/2.jpg",
    "banners/3.png",
    "banners/4.png",
    "banners/5.png"
  ];
  var randomIndex = Math.floor(Math.random() * banners.length);
  document.getElementById("banner").src = banners[randomIndex];
}