import {
    ContentSummaryDTO,
    QuestionDTO,
    RegisteredUserDTO,
    ResultsWrapper,
    UserAuthenticationSettingsDTO
} from "../IsaacApiTypes";
import {UserPreferencesDTO} from "../IsaacAppTypes";

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

export const userAuthenticationSettings: {[id: number]: UserAuthenticationSettingsDTO} = {
    1: {
        hasSegueAccount: true,
        id: 1,
        linkedAccounts: ["GOOGLE"]
    }
};

export const userPreferencesSettings: {[id: number]: UserPreferencesDTO} = {
    1: {
        EMAIL_PREFERENCE: {EVENTS: false, NEWS_AND_UPDATES: true, ASSIGNMENTS: true}
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


