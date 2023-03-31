import {TAG_ID} from "./";

let id;
if (["localhost:8000", "localhost:8004"].includes(document.location.host)  || document.location.host.includes("isaacphysics")) {
    id = TAG_ID.physics;
} else if (document.location.host == "localhost:8001" || document.location.host.includes("isaacchemistry")) {
    id = TAG_ID.chemistry;
} else if (document.location.host == "localhost:8002" || document.location.host.includes("isaacbiology")) {
    id = TAG_ID.biology;
} else if (document.location.host == "localhost:8003" || document.location.host.includes("adacomputerscience")) {
    id = "computer_science";
} else {
    id = "unknown";
}

let title = id[0].toUpperCase() + id.split("_").join(" ").substring(1);

export const subject = {
    id: id,
    title: title,
};
