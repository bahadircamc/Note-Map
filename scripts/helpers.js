import { personIcon, homeIcon, jobIcon, gotoIcon, parkIcon } from "./constants.js";



// status degerine bagli olarak dinamik dogru icon'u return eden fonks. yaz

function getIcon(status) {
    switch (status) {
        case "goto":
            return gotoIcon;
        case "home":
            return homeIcon;
        case "job":
            return jobIcon;
        case "park":
            return parkIcon;
        default:
            return undefined;
    }
}

export default getIcon

//status degerinin turkce karsiligini return eden fonk.
export function getStatus(status) {
    switch (status) {
        case "goto":
            return "Ziyaret";
        case "home":
            return "Ev";
        case "job":
            return "Is";
        case "park":
            return "Park";
        default:
            return "varsayilan";
    }
}

