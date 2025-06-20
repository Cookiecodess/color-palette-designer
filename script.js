const btnArray = document.querySelectorAll(".btn");
const colorPalette = document.querySelector(".color-palette");

function getColorsArray() {
    return Array.from(colorPalette.children);
}

colorPalette.addEventListener("contextmenu", (e) => {
    if (e.target.classList.contains("color")) {
        e.preventDefault();
        const color = e.target;
        const contextMenu = color.children[0];
        contextMenu.classList.add("show");
    } 
});

window.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
        // dont execute this listener if it is a button that's clicked
        return;
    }

    // hide all context menus
    const colors = getColorsArray();
    colors.forEach((color) => {
        const contextMenu = color.children[0]; // temporary
        contextMenu.classList.remove("show");
    })
})

window.addEventListener("contextmenu", (e) => {
    let targetColor;
    if (e.target.classList.contains("color")) {
        targetColor = e.target;
    }

    // hide context menus of colors that are not right-clicked on
    const colors = getColorsArray();
    colors.forEach((color) => {
        if (color !== targetColor) {
            // hide context menu
            const contextMenu = color.children[0]; 
            contextMenu.classList.remove("show");
        }
    })
})