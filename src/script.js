import { getBrightOrDark } from "./getContrast.js";
import { Color } from "./Color.js";

const btnArray = document.querySelectorAll(".btn");
const colorPalette = document.querySelector(".color-palette");

const templateColor = "#ddd";
const CONTEXT_MENU_MARGIN_PX = 20;
const CUSTOM_COLOR_NAME_PLACEHOLDER = "Unnamed"

let prevPickColorCallback = undefined;

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

/**
 * Re-render color pallete based on data from color object array
 */
function updateColorPalette() {
    colorPalette.innerHTML = '<input type="color" id="picker" style="display:none;">';

    // Render HTML from data in color object array
    colorObjArray.forEach((colorObj) => {
        console.log(`colorObj.name: ${JSON.stringify(colorObj.name)}`)
        const colorDivHtml = `
            <div class="color ${getBrightOrDark(colorObj.colorHex)}-color" id="${colorObj.id}" style="background-color:${colorObj.colorHex}">
                <div class="context-menu">
                    <button class="btn" aria-label="Add to Left">Add to Left</button>
                    <button class="btn" aria-label="Edit">Edit</button>
                    <button class="btn" aria-label="Add to Right">Add to Right</button>
                </div>
                <div class="text custom-color-name ${colorObj.name || "empty"}" 
                    contenteditable="true" 
                    spellcheck="false"
                    data-placeholder="${CUSTOM_COLOR_NAME_PLACEHOLDER}">${colorObj.name || ""}</div>
                <div class="text color-hex">
                    ${colorObj.colorHex}
                    <span>(copy?)</span>
                </div>
            </div>  
        `;
        colorPalette.innerHTML += colorDivHtml;
    });

    // Add event listeners to all the
    // .custom-color-name elements
    const customColorNameEls = document.querySelectorAll(".custom-color-name");
    customColorNameEls.forEach((inputEl) => {
        inputEl.addEventListener("keydown", (e) => {
            console.log("keydown event fired")

            if (e.key === 'Enter') {
                e.preventDefault();
                updateEmptyClass(e);
                updateColorPalette();
            }
        })
        
        // update colorObj.name on every keystroke
        inputEl.addEventListener("input", (e) => {
            updateEmptyClass(e);
            handleCustomNameChange(e);
        });

        // re-render DOM when .custom-color-name loses focus
        inputEl.addEventListener("blur", (e) => {
            console.log("blur event fired")

            updateEmptyClass(e);
            updateColorPalette();
        });
    });
}

function updateEmptyClass(e) {
    console.log(`e.target.innerHTML: ${JSON.stringify(e.target.innerHTML)}`)
    console.log(`e.target.innerHTML.trim(): ${JSON.stringify(e.target.innerHTML.trim())}`)
    const isEmpty = e.target.textContent.trim() === '';
    e.target.classList.toggle("empty", isEmpty);
    console.log(`isEmpty: ${isEmpty}`)
    console.log(`e.target.classList: ${e.target.classList}`)
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
    const newCustomName = e.target.innerText.trim();
    // NOTE: It is IMPERATIVE that we trim the innerText here
    // There's a browser behavior where when an element
    // with contenteditable="true" is emptied out, it is filled
    // with a '\n', or a <br>, rather than letting it stay truly empty.
    // This serves a purpose, for proper rendering of the caret
    // or whatever. But this becomes an obstruction when I need
    // to be able to tell when a user has left the field blank,
    // and update it so that it shows a placeholder text.
    // By ensuring newCustomName -- whose value gets assigned to
    // the `name` property of a Color object -- is trimmed, 
    // we ensure that the `empty` class is properly given to the 
    // corresponding .color element, thus activating the placeholder
    // text rule given to .empty elements. 

    // debugging
    // newCustomName.replace(/[\r\n]+/g, "");

    console.log(`newCustomName: ${JSON.stringify(newCustomName)}`);
    window.emptyish = newCustomName;
    
    colorObjArray[currentColorIndex].name = newCustomName;
}

// `colorBlockClicked` is an HTMLElement
function handlePickColor(colorBlockClicked) {
    const picker = document.getElementById('picker');

    // this is to prevent leftover `input` event listeners in case user
    // opens the color picker on a block, which triggers this function
    // to add the `input` event listener to `picker`, but the user then
    // does not proceed with inputting a color, and opens the color picker on another 
    // color block, causing two color blocks to simultaneously have
    // their own `input` event listeners. Consequently, when the user
    // selects a color, supposedly only on the second block, 
    // both blocks' `input` event listeners are triggered and 
    // change their colors to the selected color.
    // TL;DR only one color block shall have an `input` event listener at a time.
    picker.removeEventListener('input', prevPickColorCallback);

    picker.addEventListener('click', (e) => {
        e.stopPropagation(); // avoid event bubbling, which may cause unwanted event triggers higher up the document tree
        console.log('picker clicked')
    })

    prevPickColorCallback = e => {
        e.stopPropagation(); // avoid event bubbling, which may cause unwanted event triggers higher up the document tree
        console.log('input event triggered on picker')
        const targetHex = normalizeColorHex(e.target.value);
        console.log('selected hex value: '+targetHex)
        const idx = findCurrentColorIndex(colorBlockClicked);
        colorObjArray[idx].colorHex = targetHex;
        updateColorPalette();
    }
    picker.addEventListener('input', prevPickColorCallback)  
    picker.click();
}

// function resizeCustomNameEl(e) {
//     const customNameEl = e.target;
//     const content = customNameEl.innerText || customNameEl.placeholder;
//     // customNameEl.style.width = `${content.length}ch`;
// }

// Handle click event on .color-hex elements
// for copying hex codes
colorPalette.addEventListener("click", e => {
    if (e.target.matches(".color-hex")) {
        const hexText = e.target.childNodes.item(0).textContent.trim(); // childNodes includes text nodes, unlike children. 
                                                                        // children is an Array, whereas childNodes is a NodeList.
                                                                        // Use item() to access an element in a NodeList.
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
            
    }
})


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

    console.log('"click" event triggered on `window`')
    console.log('e.target:')
    console.log(e.target)

    const colorBlockClicked = e.target.classList.contains('color') ? e.target : null;
    console.log('colorBlockClicked:')
    console.log(colorBlockClicked)

    let contextMenuWasOpen = false;

    // hide all context menus
    const colors = getColorsArray();
    colors.forEach((color) => {
        const contextMenu = color.children[0]; // temporary
        if (contextMenu && contextMenu.classList.contains("show")) {
            contextMenuWasOpen = true;
            contextMenu.classList.remove("show");
        }
    })

    // show color picker only if no context menus were open.
    // in effect, when a context menu is open, the user
    // is able to click away the context menu without
    // summoning the color picker.
    if (!contextMenuWasOpen && colorBlockClicked) {
        handlePickColor(colorBlockClicked);
    }

    console.log('contextMenuWasOpen: ', contextMenuWasOpen)
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

const purpleElObj = createColorObj("#639");
const lightPurpleElObj = createColorObj("#CC77CC");
const a = createColorObj("#CCA8B8");
const redElObj = createColorObj("#CCCC99");
const blueElObj = createColorObj("#996633");
const colorObjArray = [purpleElObj, lightPurpleElObj, a, redElObj, blueElObj];
// const colorObjArray = [purpleElObj, lightPurpleElObj];

purpleElObj.name = "rebeccapurple";
console.log('before: ')
console.log(btnArray)
updateColorPalette();
console.log('after: ')
console.log(btnArray)

// testing
console.log(`emptyish: ${window.emptyish}`)