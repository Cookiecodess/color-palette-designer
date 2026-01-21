let isPickerConfigured = false;

const configure_picker = () => {
    console.log("inside configure_picker")
    Coloris({
        el: '.clr-input',
        wrap: false,
        theme: 'pill',
        themeMode: 'dark',
        format: 'hex',
        formatToggle: true,
        closeButton: false,
        clearButton: false
    })
    isPickerConfigured = true;
};

// Testing using buttons to open coloris picker

const colorBtn = document.getElementById("clr-btn");
const colorInput = document.querySelector(".clr-input");
const colorValue = document.getElementById("clr-value");

// Using this pattern, we can make any element
// a trigger for opening the Coloris picker,
// not just input elements.
colorBtn.addEventListener("click", e => {
    if (!isPickerConfigured) configure_picker();
    
    colorInput.dispatchEvent(new Event("click", { bubbles: true }));
    
    movePicker();
});

// "coloris:pick" event is fired every time
// a new color is picked
document.addEventListener("coloris:pick", e => {
    console.log("new color: ", e.detail.color);
})    

let mouseX, mouseY;

// Keep track of mouse position at all times
document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    console.log(mouseX, mouseY)
})

// Move picker to where the mouse is
function movePicker() {        
    const colorisPicker = document.querySelector(".clr-picker");
    // console.log(`is clr-picker shown: ${colorisPicker.style.left !== ""}`);
    // console.log("MOVE: "+colorisPicker.style.left+colorisPicker.style.top)
    colorInput.style.top = `${mouseY}px`;
    colorInput.style.left = `${mouseX}px`;
    Coloris.updatePosition();
}


