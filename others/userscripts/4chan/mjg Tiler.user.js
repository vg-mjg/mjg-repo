// ==UserScript==
// @name         /mjg/ Tiler
// @namespace    http://repo.riichi.moe/
// @icon         https://files.catbox.moe/iz2zh3.png
// @version      1.2.4
// @description  Highlights tile notation. Hover over text to view image.
// @author       anon
// @match        *://boards.4chan.org/*/thread/*
// @run-at       document-start
// @grant        GM_addStyle
// ==/UserScript==

const TRAINING_WHEELS = 0;
const tile_w = 80;
const tile_h = 129;
const scale = 0.375;


GM_addStyle(`
.mjgTilemaker{
  position: relative;
  display: inline-block;
  border-bottom: 1px dotted black;
}
 
.mjgTilemakerBox{
  visibility: hidden;
  text-align: center;
  overflow: visible;
  border-radius: 3px;
 
  position: absolute;
  transform: translate(-50%, 0);
  bottom: 125%;
  left: 50%;
 
  opacity: 0;
  transition: opacity 0.3s;
}
 
.mjgTilemaker:hover .mjgTilemakerBox {
  visibility: visible;
  opacity: 1;
}
`);

const atlas = JSON.parse(`{"frames":{"0m.png":{"frame":{"h":129,"idx":0,"w":80,"x":486,"y":130},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"0p.png":{"frame":{"h":129,"idx":0,"w":80,"x":324,"y":0},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"0s.png":{"frame":{"h":129,"idx":0,"w":80,"x":405,"y":0},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"1m.png":{"frame":{"h":129,"idx":0,"w":80,"x":486,"y":0},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"1p.png":{"frame":{"h":129,"idx":0,"w":80,"x":567,"y":0},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"1s.png":{"frame":{"h":129,"idx":0,"w":80,"x":324,"y":130},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"1z.png":{"frame":{"h":129,"idx":0,"w":80,"x":324,"y":260},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"2m.png":{"frame":{"h":129,"idx":0,"w":80,"x":324,"y":390},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"2p.png":{"frame":{"h":129,"idx":0,"w":80,"x":324,"y":520},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"2s.png":{"frame":{"h":129,"idx":0,"w":80,"x":405,"y":130},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"2z.png":{"frame":{"h":129,"idx":0,"w":80,"x":243,"y":520},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"3m.png":{"frame":{"h":129,"idx":0,"w":80,"x":567,"y":130},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"3p.png":{"frame":{"h":129,"idx":0,"w":80,"x":405,"y":260},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"3s.png":{"frame":{"h":129,"idx":0,"w":80,"x":405,"y":390},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"3z.png":{"frame":{"h":129,"idx":0,"w":80,"x":405,"y":520},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"4m.png":{"frame":{"h":129,"idx":0,"w":80,"x":486,"y":260},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"4p.png":{"frame":{"h":129,"idx":0,"w":80,"x":567,"y":260},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"4s.png":{"frame":{"h":129,"idx":0,"w":80,"x":486,"y":390},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"4z.png":{"frame":{"h":129,"idx":0,"w":80,"x":486,"y":520},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"5m.png":{"frame":{"h":129,"idx":0,"w":80,"x":162,"y":0},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"5p.png":{"frame":{"h":129,"idx":0,"w":80,"x":0,"y":130},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"5s.png":{"frame":{"h":129,"idx":0,"w":80,"x":0,"y":260},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"5z.png":{"frame":{"h":129,"idx":0,"w":80,"x":0,"y":390},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"6m.png":{"frame":{"h":129,"idx":0,"w":80,"x":0,"y":520},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"6p.png":{"frame":{"h":129,"idx":0,"w":80,"x":81,"y":0},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"6s.png":{"frame":{"h":129,"idx":0,"w":80,"x":81,"y":130},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"6z.png":{"frame":{"h":129,"idx":0,"w":80,"x":81,"y":260},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"7m.png":{"frame":{"h":129,"idx":0,"w":80,"x":81,"y":390},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"7p.png":{"frame":{"h":129,"idx":0,"w":80,"x":81,"y":520},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"7s.png":{"frame":{"h":129,"idx":0,"w":80,"x":0,"y":0},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"7z.png":{"frame":{"h":129,"idx":0,"w":80,"x":162,"y":130},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"8m.png":{"frame":{"h":129,"idx":0,"w":80,"x":162,"y":260},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"8p.png":{"frame":{"h":129,"idx":0,"w":80,"x":162,"y":390},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"8s.png":{"frame":{"h":129,"idx":0,"w":80,"x":162,"y":520},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"9m.png":{"frame":{"h":129,"idx":0,"w":80,"x":243,"y":0},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"9p.png":{"frame":{"h":129,"idx":0,"w":80,"x":243,"y":130},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"9s.png":{"frame":{"h":129,"idx":0,"w":80,"x":243,"y":260},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}},"back.png":{"frame":{"h":129,"idx":0,"w":80,"x":243,"y":390},"sourceSize":{"h":129,"w":80},"spriteSourceSize":{"x":0,"y":0}}},"meta":{"image":"ui.png","prefix":"en/myres2/mjp/mjp_default/ui/"}}`);
const atlas_source = "https://files.catbox.moe/36c08m.png";
const atlas_source_babby = "https://files.catbox.moe/bvd3tn.png";
const tile_regex = /\b((?:\d+m|\d+s|\d+p|[1-7]+z)+)\b/g;
var atlas_img;

(function() {
    'use strict';

    var updatePost = function(node){
        let post = node.querySelector(".postMessage");
        post.childNodes.forEach((item) => {
            let parentNode = post;
            if (item.nodeName == "S" || item.nodeType == Node.ELEMENT_NODE && item.classList.contains("quote")){
                parentNode = item;
                item = item.firstChild;
            }
            if (item.nodeType == Node.TEXT_NODE){
                let results = item.nodeValue.split(tile_regex);
                let container = null;
                if (results.length != 1){
                    container = document.createElement("span");
                    for (let result of results){
                        if (result == undefined)
                            continue;
                        if (result.search(tile_regex) == -1){
                            let textElement = document.createTextNode(result);
                            container.appendChild(textElement);
                        } else {
                            let newElement = document.createElement("span");
                            let tileBox = document.createElement("span");
                            newElement.innerHTML = result;
                            newElement.className = "mjgTilemaker";
                            newElement.ondblclick = () => {
                                let tileBox = document.getElementById('mjgTilebox'+post.id);
                                tileBox.style.visibility = "visible";
                                tileBox.style.opacity = "1";
                            }
                            tileBox.className = "mjgTilemakerBox";
                            tileBox.id = "mjgTilebox"+post.id;
                            tileBox.onclick = (e) => {
                                e.stopPropagation();
                            }

                            container.appendChild(newElement);
                            newElement.appendChild(tileBox);
                            let tokens = result.split('').reverse();
                            let token = null;
                            let tiles = []
                            tokens.forEach((tile,index,arr) => {
                                if (tile.search(/[mspz]/) != -1){
                                    token = tile;
                                }
                                if (tile.search(/\d/) != -1) {
                                    tiles.push(tile+token);
                                }
                            });
                            tiles = tiles.reverse();
                            var canvas = document.createElement("canvas");
                            canvas.className = "mjgCanvas";
                            canvas.id = "mjgCanvas"+post.id;
                            canvas.width = (tiles.length*tile_w);
                            canvas.height = tile_h;
                            canvas.style.width = parseFloat(canvas.width)*scale+"px";
                            canvas.style.height = parseFloat(canvas.height)*scale+"px";
                            var context = canvas.getContext('2d');
                            tiles.forEach((tile, index) => {
                                let tframe = atlas.frames[tile+".png"].frame;
                                context.drawImage(atlas_img, tframe.x, tframe.y, tframe.w, tframe.h, index*tile_w, 0, tile_w, tile_h);
                            });
                            tileBox.appendChild(canvas);
                            post.parentNode.style.overflow = "visible";
                        }
                    }
                }
                if (container != null){
                    parentNode.replaceChild(container,item);
                    container.querySelectorAll(".mjgTilemakerBox").forEach((tileBox) => {
                        if (tileBox.getBoundingClientRect().left  < 0)
                            tileBox.style.transform = "translateX("+(-tileBox.clientWidth/2-tileBox.getBoundingClientRect().left)+"px)";
                        if (tileBox.getBoundingClientRect().right  < 0)
                            tileBox.style.transform = "translateX("+(tileBox.clientWidth/2+tileBox.getBoundingClientRect().right)+"px)";
                    });
                }
            }
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        if(!document.title.includes("/mjg/"))
            return;

        document.body.onclick = (e) => {
            document.body.querySelectorAll('.mjgTilemakerBox').forEach((tileBox) => {
                tileBox.style.visibility = "";
                tileBox.style.opacity = "";
            });
        }

        atlas_img = document.createElement("img");
        atlas_img.src = TRAINING_WHEELS ? atlas_source_babby : atlas_source;
        atlas_img.onload = () => {
            document.body.querySelectorAll(".postContainer").forEach((node) => {
                updatePost(node);
            });
            var observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === "childList"){
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains("postContainer")){
                                updatePost(node);
                            }
                        });
                    }
                });
            });
            observer.observe(document.body, {childList: true, subtree: true });
        };
    });
})();