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
  "banners/8.png",
  "banners/9.png",
  "banners/10.jpg",
  "banners/11.png",
  "banners/12.jpg",
  "banners/13.jpg",
  "banners/14.jpg",
  "banners/15.jpg",
  "banners/16.png",
  "banners/17.jpg",
  "banners/18.jpg",
  "banners/19.jpg",
  "banners/20.jpg",
  "banners/21.jpg",
  "banners/22.jpg",
  "banners/23.jpg",
  "banners/24.png",
  "banners/25.png"
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
