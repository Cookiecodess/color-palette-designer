const btnArray = document.querySelectorAll(".btn");
const colorPalette = document.querySelector(".color-palette");

const templateColor = "#333333";

/**
 * 
 * @returns a string, containing random characters from 0-9, a-z
 */
function getRandomString() {
    // toString(36) creates base-36 string like "0.x5q318z",
    // and slice(2) removes the "0."
    return Math.random().toString(36).slice(2); 
}

function getColorsArray() {
    return Array.from(colorPalette.children);
}

function createColorElObj(colorHex) {
    if (!colorHex.match(/^#/)) {
        // prepend with '#' if does not begin with '#'
        // this is so that the function supports
        // color hex codes without a starting '#'
        colorHex = '#' + colorHex;
    }    
    if (!colorHex.match(/^#(?:[0-9a-fA-F]{3}){1,2}$/)) {
        // does not match the pattern "#000" or "#000000"
        return;
    }

    // id = colorHex + random string, to ensure uniqueness
    const uniqueID = colorHex + '-' + getRandomString();

    return {
        id: uniqueID,
        html: `
            <div class="color" id="${uniqueID}" style="background-color:${colorHex}">
                <div class="context-menu">
                    <button class="btn" aria-label="Add to Left">Add to Left</button>
                    <button class="btn" aria-label="Edit">Edit</button>
                    <button class="btn" aria-label="Add to Right">Add to Right</button>
                </div>
                <div class="color-hex" style="color:${getContrast(colorHex)}">${colorHex}</div>
            </div>  
        `
    };
}

function updateColorPalette() {
    colorPalette.innerHTML = "";

    colorElObjArray.forEach((colorElObj) => {
        const colorDivHtml = colorElObj.html;
        colorPalette.innerHTML += colorDivHtml;
    });
}

colorPalette.addEventListener("contextmenu", (e) => {
    if (e.target.classList.contains("color")) {
        e.preventDefault(); // suppress default context menu
        const colorDiv = e.target;
        const contextMenu = colorDiv.children[0];        
        const addToLeftBtn = contextMenu.children[0];
        const editBtn = contextMenu.children[1];
        const addToRightBtn = contextMenu.children[2];

        const currentColorIndex = colorElObjArray.findIndex((obj) => obj.id === colorDiv.id);
        if (currentColorIndex >= 0) {
            console.log(colorElObjArray[currentColorIndex].id)
        } else {
            console.log("Error: color element object not found in colorElObjArray")
        }

        contextMenu.classList.add("show");

        addToLeftBtn.addEventListener('click', (e) => {
            // insert new color div to the left of current color div
            const newColorObj = createColorElObj(templateColor);
            colorElObjArray.splice(currentColorIndex, 0, newColorObj);
            updateColorPalette();
        });

        editBtn.addEventListener('click', (e) => {
            console.log("edit")
        });

        addToRightBtn.addEventListener('click', (e) => {
            // insert new color div to the right of current color div
            const newColorObj = createColorElObj(templateColor);
            colorElObjArray.splice(currentColorIndex + 1, 0, newColorObj);
            updateColorPalette();
        });
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

const purpleElObj = createColorElObj("#663399");
const redElObj = createColorElObj("#660000");
const blueElObj = createColorElObj("#00FFFF");
const colorElObjArray = [purpleElObj, redElObj, blueElObj];

colorElObjArray.forEach((colorElObj) => {
    console.log("appended")
    colorPalette.innerHTML += colorElObj.html;
})
