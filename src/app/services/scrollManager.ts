import {history} from "./history";

history.listen((location, action) => {
    switch (action) {
        case "PUSH":
        case "REPLACE":
            window.scrollTo({top: 0, left: 0, behavior: "auto"});
            break;
    }
});