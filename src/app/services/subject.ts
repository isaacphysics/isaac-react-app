import {TAG_ID} from "./";

let id;
if (document.location.host === "localhost:8004" || document.location.host.includes("isaacscience")) {
    id = undefined;
} else if (document.location.host === "localhost:8003" || document.location.host.includes("adacomputerscience")) {
    id = "computer_science" as TAG_ID;
} else if (document.location.pathname.includes("/physics/")) {
    id = TAG_ID.physics;
} else if (document.location.pathname.includes("/maths/")) {
    id = TAG_ID.maths;
} else if (document.location.pathname.includes("/chemistry/")) {
    id = TAG_ID.chemistry;
} else if (document.location.pathname.includes("/biology/")) {
    id = TAG_ID.biology;
} else {
    id = undefined;
}

const title = id ? id[0].toUpperCase() + id.split("_").join(" ").substring(1) : undefined;

export const subject = {
    id: id,
    title: title,
};
