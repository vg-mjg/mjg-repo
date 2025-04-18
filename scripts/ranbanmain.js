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
  "boards/banners/8.png",
  "boards/banners/9.png",
  "boards/banners/10.jpg",
  "boards/banners/11.png",
  "boards/banners/12.jpg",
  "boards/banners/13.jpg",
  "boards/banners/14.jpg",
  "boards/banners/15.jpg",
  "boards/banners/16.png",
  "boards/banners/17.jpg",
  "boards/banners/18.jpg",
  "boards/banners/19.jpg",
  "boards/banners/20.jpg",
  "boards/banners/21.jpg",
  "boards/banners/22.jpg",
  "boards/banners/23.jpg",
  "boards/banners/24.png",
  "boards/banners/25.png",
  "boards/banners/26.png"
];

// 2) Function to pick and apply a random banner
function randomizeBanner() {
  const img = document.getElementById('banner');
  const idx = Math.floor(Math.random() * banners.length);
  img.src = banners[idx];
}

// 3) On page load, pick one
window.addEventListener('DOMContentLoaded', function(){
  randomizeBanner();
  document.getElementById('banner').addEventListener('click', randomizeBanner);
});

// 4) On click, pick another
