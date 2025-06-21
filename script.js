import { getBrightOrDark } from "./getContrast.js";
import { Color } from "./Color.js";

const btnArray = document.querySelectorAll(".btn");
const colorPalette = document.querySelector(".color-palette");

const templateColor = "#ddd";
const CONTEXT_MENU_MARGIN_PX = 20;

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

/**
 * 
 * @param {string} colorHex 
 * @returns empty string on failure, normalized hex code (e.g. "#00AAFF") on success
 */
function normalizeColorHex(colorHex) {
    // prepend with '#' if does not begin with '#'
    // this is so that the function supports
    // color hex codes without a starting '#'
    if (!colorHex.match(/^#/)) {
        colorHex = '#' + colorHex;
    }    

    // if does not match the pattern "#000" or "#000000",
    // return empty string, signifying failure
    if (!colorHex.match(/^#(?:[0-9a-fA-F]{3}){1,2}$/)) {
        return "";
    }

    // Normalize

    // 1. To uppercase
    let normalizedHex = colorHex.toUpperCase();

    // 2. For #FFF format, convert to #FFFFFF format
    if (colorHex.length === 4) {
        normalizedHex = '#' + normalizedHex[1].repeat(2) + normalizedHex[2].repeat(2) + normalizedHex[3].repeat(2);
    } 

    return normalizedHex;
}

/**
 * 
 * @param {string} colorHex e.g. "#00DDFF" or "#0DF" or "00DDFF" or "0DF"
 * @returns a Color object
 * @throws an Error if colorHex is in an invalid format
 */
function createColorObj(colorHex) {
    const normalizedHex = normalizeColorHex(colorHex);
    if (!normalizedHex) {
        throw new Error("Invalid hex code passed into createColorObj");
    }

    // id = normalizedHex + random string, to ensure uniqueness
    const uniqueID = normalizedHex + '-' + getRandomString();

    return new Color(
        uniqueID,
        normalizedHex
    );
}

function updateColorPalette() {
    colorPalette.innerHTML = "";

    // Render HTML from data in color object array
    colorObjArray.forEach((colorObj) => {
        const colorDivHtml = `
            <div class="color ${getBrightOrDark(colorObj.colorHex)}-color" id="${colorObj.id}" style="background-color:${colorObj.colorHex}">
                <div class="context-menu">
                    <button class="btn" aria-label="Add to Left">Add to Left</button>
                    <button class="btn" aria-label="Edit">Edit</button>
                    <button class="btn" aria-label="Add to Right">Add to Right</button>
                </div>
                <div class="text custom-color-name ${colorObj.name || "show-on-hover-fade-in-out"}">
                    <input class="custom-color-name-input" type="text" placeholder="Unnamed" value="${colorObj.name || ""}"/>
                </div>
                <div class="text color-hex">
                    ${colorObj.colorHex}
                    <span>(copy?)</span>
                </div>
            </div>  
        `;
        colorPalette.innerHTML += colorDivHtml;
    });

    // Add click event listeners to all the 
    // .color-hex elements (for copying)
    const colorHexEls = document.querySelectorAll(".color-hex");
    colorHexEls.forEach((colorHexEl) => {
        colorHexEl.addEventListener("click", (e) => {
            if (!e.target.classList.contains("color-hex")) {
                return;
            }
            
            const hexText = e.target.childNodes.item(0).textContent.trim(); // childNodes includes text nodes, unlike children. 
                                                                            // Also, childNodes is a NodeList, which means array methods don't work on it;
                                                                            // children is an Array. Use item() to access an element of a NodeList.
            const copyText = e.target.children[0];
            const original = copyText.innerText;  

            navigator.clipboard.writeText(hexText)
                .then(() => {
                    console.log("Copied!");
                    copyText.innerText = "(copied!)";                    
                })
                .catch(() => {
                    console.log("Failed to copy to clipboard")
                    copyText.innerText = "(failed to copy)";                    
                })
                .finally(() => {
                    // reset text content to original
                    setTimeout(() => {
                        copyText.innerText = original;
                    }, 3000);
                });
        });
    })

    // Add change event listeners to all the
    // .custom-color-name-input elements
    const customColorNameInputEls = document.querySelectorAll(".custom-color-name-input");
    customColorNameInputEls.forEach((inputEl) => {
        inputEl.addEventListener("change", handleCustomNameChange);
    });
}

function findCurrentColorIndex(colorDivEl) {
    const currentColorIndex = colorObjArray.findIndex((obj) => obj.id === colorDivEl.id);
    if (currentColorIndex < 0) {
        throw new Error("color element object not found in colorObjArray")
    }
    return currentColorIndex;
}

// Event handlers

function handleAddToLeft(e, currentColorIndex) {
    // insert new color div to the left of current color div
    const newColorObj = createColorObj(templateColor);
    colorObjArray.splice(currentColorIndex, 0, newColorObj);
    updateColorPalette();
}

function handleEdit(e, currentColorIndex) {
    console.log("edit")
}

function handleAddToRight(e, currentColorIndex) {
    // insert new color div to the right of current color div
    const newColorObj = createColorObj(templateColor);
    colorObjArray.splice(currentColorIndex + 1, 0, newColorObj);
    updateColorPalette();
}

function handleCustomNameChange(e) {
    const currentColorDiv = e.target.closest('.color');
    const currentColorIndex = findCurrentColorIndex(currentColorDiv);

    const newCustomName = e.target.value;
    
    colorObjArray[currentColorIndex].name = newCustomName;

    updateColorPalette();
}


colorPalette.addEventListener("contextmenu", (e) => {
    if (e.target.classList.contains("color")) {
        e.preventDefault(); // suppress default context menu
        const colorDiv = e.target;
        const contextMenu = colorDiv.children[0];        
        const addToLeftBtn = contextMenu.children[0];
        const editBtn = contextMenu.children[1];
        const addToRightBtn = contextMenu.children[2];

        const currentColorIndex = findCurrentColorIndex(colorDiv);

        // show custom context menu
        contextMenu.classList.add("show"); 

        // adjust custom context menu's position so it stays fully within the viewport
        // IMPORTANT: this only works when display != none
        // so this must run after adding the "show" class
        const rect = contextMenu.getBoundingClientRect();
        console.log(rect.left);
        if (rect.left < CONTEXT_MENU_MARGIN_PX) {
            contextMenu.style.position = "fixed";
            contextMenu.style.left = `${CONTEXT_MENU_MARGIN_PX}px`;
            contextMenu.style.transform = "translateY(-50%)"; // only center vertically, don't translate vertically
            console.log(contextMenu.style.left)
        } else if (rect.right > window.innerWidth - CONTEXT_MENU_MARGIN_PX) {
            contextMenu.style.position = "fixed";
            contextMenu.style.left = `${window.innerWidth - rect.width - CONTEXT_MENU_MARGIN_PX}px`;
            contextMenu.style.transform = "translateY(-50%)"; // only center vertically, don't translate vertically
            console.log(contextMenu.style.right)
        }
        

        addToLeftBtn.addEventListener('click', (e) => {
            handleAddToLeft(e, currentColorIndex);
        });

        editBtn.addEventListener('click', (e) => {
            handleEdit(e, currentColorIndex);
        });

        addToRightBtn.addEventListener('click', (e) => {
            handleAddToRight(e, currentColorIndex);
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

const purpleElObj = createColorObj("#663399");
const lightPurpleElObj = createColorObj("#CC77CC");
const a = createColorObj("#CCA8B8");
const redElObj = createColorObj("#CCCC99");
const blueElObj = createColorObj("#996633");
const colorObjArray = [purpleElObj, lightPurpleElObj, a, redElObj, blueElObj];

purpleElObj.name = "rebeccapurple";
updateColorPalette();

// testing

