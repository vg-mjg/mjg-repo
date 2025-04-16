
function changeBanner() {
  var banners = [
    "boards/banners/0.png",
    "boards/banners/1.png",
    "boards/banners/2.jpg",
    "boards/banners/3.png",
    "boards/banners/4.png",
    "boards/banners/5.png"
  ];
  var randomIndex = Math.floor(Math.random() * banners.length);
  document.getElementById("banner").src = banners[randomIndex];
}

document.getElementById("banner").addEventListener('click', changeBanner);