'use strict';

function convert_to_raw(element) {
    element.classList.remove('otf');
}

function convert_to_otf(element) {
    element.classList.add('otf');
}

function convert_tiles() {
    let tile_containers = document.getElementsByClassName('tiles otf');
    let convert_func = convert_to_raw;
    let new_link_text = "I'm a retard using chrome and its variants";

    if (tile_containers.length == 0) {
        tile_containers = document.getElementsByClassName('tiles');
        convert_func = convert_to_otf;
        new_link_text = 'Try cool color tiles';
    }

    tile_containers = Array.from(tile_containers);

    for (let i = 0; i < tile_containers.length; i++) {
        convert_func(tile_containers[i]);
    }

    let link = document.getElementsByClassName('convert-tiles')[0];
    link.textContent = new_link_text;
}

window.addEventListener("DOMContentLoaded", () => {
    let convert_tiles_elements = document.getElementsByClassName('convert-tiles');
    for (let i = 0; i < convert_tiles_elements.length; i++) {
        convert_tiles_elements[i].addEventListener('click', () => convert_tiles());
    }

    let spoiler_elements = document.getElementsByClassName('spoiler');
    for (let i = 0; i < spoiler_elements.length; i++) {
        var spoiler_element = spoiler_elements[i];
        spoiler_element.classList.add('hidden');
        let reveal_spoiler_button = spoiler_element.getElementsByClassName('reveal-spoiler-button')[0];

        if (reveal_spoiler_button.style.backdropFilter === undefined) {
            reveal_spoiler_button.style.backgroundColor = 'var(--background)';
        }

        reveal_spoiler_button.addEventListener('click', () => spoiler_element.classList.remove('hidden'));
    }
});
