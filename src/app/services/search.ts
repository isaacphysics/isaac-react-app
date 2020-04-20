import {History} from "history";

import {DOCUMENT_TYPE, TAG_ID} from "./constants";
import {ContentSummaryDTO} from "../../IsaacApiTypes";
import {isStaff} from "./user";
import {LoggedInUser} from "../../IsaacAppTypes";

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

export function calculateConceptTypes(physics: boolean, maths: boolean) {
    const typesArray = [];
    if (physics) {
        typesArray.push(TAG_ID.physics);
    }
    if (maths) {
        typesArray.push(TAG_ID.maths);
    }
    return typesArray.join(",");
}

export const pushSearchToHistory = function(history: History, searchText: string, problems: boolean, concepts: boolean) {
    history.push({
        pathname: "/search",
        search: `?query=${encodeURIComponent(searchText)}&types=${calculateSearchTypes(problems, concepts)}`,
    });
};

export const pushConceptsToHistory = function(history: History, searchText: string, physics: boolean, maths: boolean) {
    history.push({
        pathname: "/concepts",
        search: `?query=${encodeURIComponent(searchText)}&types=${calculateConceptTypes(physics, maths)}`,
    });
};

export const searchResultIsPublic = function(content: ContentSummaryDTO, user?: LoggedInUser | null) {
    const isPublic = (content.id != "_regression_test_" && (!content.tags || content.tags.indexOf("nofilter") < 0 && !content.supersededBy));
    return isPublic || isStaff(user);
};
