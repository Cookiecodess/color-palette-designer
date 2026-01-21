export class Color {
    /**
     * 
     * @param {string} id required
     * @param {string} colorHex required
     * @param {string | null} name 
     */
    constructor(
        id = required("id"), 
        colorHex = required("colorHex"), 
        name = null
    ) {
        this.id = id;
        this.colorHex = colorHex;
        this.name = name;
    }
}

function required(paramName) {
    throw new Error(`Error: missing required parameter ${paramName}`)
}