function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}  
docReady(function() {
    const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');

/*function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    else {
        document.documentElement.setAttribute('data-theme', 'light');
    }    
}*/

toggleSwitch.addEventListener('change', switchTheme, false);

function switchTheme(e) {
    console.log(e.target.checked);
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'dark'); //add this
        
    }
    else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'light'); //add this
        
    }    
}

const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);

    if (currentTheme === 'dark') {
        toggleSwitch.checked = true;
        document.documentElement.setAttribute('data-theme', 'light');
    }
    else{
        toggleSwitch.checked = false;
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
}

});

