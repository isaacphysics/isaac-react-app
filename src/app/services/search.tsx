import {History} from "history";

import {DOCUMENT_TYPE} from "./constants";

export function calculateSearchTypes(problems: boolean, concepts: boolean) {
    const typesArray = [];
    if (problems) {
        typesArray.push(DOCUMENT_TYPE.QUESTION);
    }
    if (concepts) {
        typesArray.push(DOCUMENT_TYPE.CONCEPT);
    }
    return typesArray.join(",");
}

export const pushSearchToHistory = function(history: History, searchText: string, problems: boolean, concepts: boolean) {
    history.push({
        pathname: "/search",
        search: `?query=${encodeURIComponent(searchText)}&types=${calculateSearchTypes(problems, concepts)}`,
    });
};
