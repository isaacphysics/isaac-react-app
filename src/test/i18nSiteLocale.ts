// Jest stand-in for the Vite alias "@i18n/en-site": this site's English strings
import ada from "../app/locales/en/ada.json";
import sci from "../app/locales/en/sci.json";

export default ISAAC_SITE === "ada" ? ada : sci;
