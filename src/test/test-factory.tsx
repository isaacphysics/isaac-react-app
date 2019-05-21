import {ContentSummaryDTO, QuestionDTO, RegisteredUserDTO, ResultsWrapper} from "../IsaacApiTypes";

export const errorResponses: {[key: string]: object} = {
    mustBeLoggedIn401: {
        "responseCode":401,
        "responseCodeType":"Unauthorized",
        "errorMessage":"You must be logged in to access this resource.",
        "bypassGenericSiteErrorPage":false
    }
};

export const registeredUserDTOs: {[key: string]: RegisteredUserDTO} = {
    dameShirley: {
        givenName: "Steve",
        familyName: "Shirley",
        gender: "FEMALE",
        id: 1
    },
    profWheeler: {
        givenName: "David",
        familyName: "Wheeler",
        gender: "MALE",
        id: 2
    }
};

export const questionDTOs: {[key: string]: QuestionDTO} = {
    aToboggan: {
        id: "a_toboggan|123abc"
    },
    manVsHorse: {
        id: "man_vs_horse|test"
    }
};

export const unitsList: string[] = [
    "kg",
    "m",
    "s"
];

export const searchResultsList: ResultsWrapper<ContentSummaryDTO> = {
    totalResults: 1,
    results: [
        {
            id: "result1",
            title: "Result 1"
        }
    ]
};


