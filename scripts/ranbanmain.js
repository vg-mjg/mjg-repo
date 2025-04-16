// 1) List of banner image URLs
const banners =[
  "boards/banners/0.png",
  "boards/banners/1.png",
  "boards/banners/2.jpg",
  "boards/banners/3.png",
  "boards/banners/4.png",
  "boards/banners/5.png",
  "boards/banners/6.png",
  "boards/banners/7.png",
  "boards/banners/8.png"
];

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