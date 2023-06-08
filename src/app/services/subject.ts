let id;
if (document.location.host == "localhost:8003" || document.location.host.includes("isaaccomputerscience")) {
    id = "computer_science";
} else {
    id = "unknown";
}

let title = id[0].toUpperCase() + id.split("_").join(" ").substring(1);

export const subject = {
    id: id,
    title: title,
};
