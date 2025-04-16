// 1) List of banner image URLs
const banners =[
  "banners/0.png",
  "banners/1.png",
  "banners/2.jpg",
  "banners/3.png",
  "banners/4.png",
  "banners/5.png",
  "banners/6.png",
  "banners/7.png",
  "banners/8.png"
];

<<<<<<< HEAD
// 2) Function to pick and apply a random banner
function randomizeBanner() {
  const img = document.getElementById('banner');
  const idx = Math.floor(Math.random() * banners.length);
  img.src = banners[idx];
}

// 3) On page load, pick one
window.addEventListener('DOMContentLoaded', randomizeBanner);

// 4) On click, pick another
document.getElementById('banner').addEventListener('click', randomizeBanner);
=======
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

document.getElementById("banner").addEventListener('click', changeBanner);
>>>>>>> 1b0aae2a01d1a8e9b1e05c75c9bb1a5dec47484d
