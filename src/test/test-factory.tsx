import {
  ContentSummaryDTO,
  QuestionDTO,
  RegisteredUserDTO,
  ResultsWrapper,
  UserAuthenticationSettingsDTO,
  UserGroupDTO,
} from "../IsaacApiTypes";
import { UserPreferencesDTO } from "../IsaacAppTypes";

export const errorResponses: { [key: string]: object } = {
  mustBeLoggedIn401: {
    responseCode: 401,
    responseCodeType: "Unauthorized",
    errorMessage: "You must be logged in to access this resource.",
    bypassGenericSiteErrorPage: false,
  },
};

export const registeredUserDTOs: { [key: string]: RegisteredUserDTO } = {
  dameShirley: {
    givenName: "Steve",
    familyName: "Shirley",
    gender: "FEMALE",
    id: 1,
  },
  profWheeler: {
    givenName: "David",
    familyName: "Wheeler",
    gender: "MALE",
    id: 2,
    email: "dw@example.com",
  },
};

export const userGroupDTOs: { [key: string]: UserGroupDTO } = {
  one: {
    archived: false,
    groupName: "Group One",
    id: 1,
    ownerId: 1,
    additionalManagers: [],
    ownerSummary: registeredUserDTOs.dameShirley,
  },
  two: {
    archived: false,
    groupName: "Group Two",
    id: 2,
    ownerId: 1,
    additionalManagers: [],
    ownerSummary: registeredUserDTOs.dameShirley,
  },
  three: {
    archived: false,
    groupName: "Group Three (new)",
    id: 3,
    ownerId: 2,
    additionalManagers: [],
    ownerSummary: registeredUserDTOs.profWheeler,
  },
  archivedX: {
    archived: true,
    groupName: "Group Ten",
    id: 10,
    ownerId: 1,
    additionalManagers: [],
    ownerSummary: registeredUserDTOs.dameShirley,
  },
};

export const userAuthenticationSettings: { [id: number]: UserAuthenticationSettingsDTO } = {
  1: {
    hasSegueAccount: true,
    id: 1,
    linkedAccounts: ["GOOGLE"],
  },
};

export const userPreferencesSettings: { [id: number]: UserPreferencesDTO } = {
  1: {
    EMAIL_PREFERENCE: { EVENTS: false, NEWS_AND_UPDATES: true, ASSIGNMENTS: true },
  },
};

export const questionDTOs: { [key: string]: QuestionDTO } = {
  aToboggan: {
    id: "a_toboggan|123abc",
  },
  manVsHorse: {
    id: "man_vs_horse|test",
  },
};

export const unitsList: string[] = ["kg", "m", "s"];

export const searchResultsList: ResultsWrapper<ContentSummaryDTO> = {
  totalResults: 1,
  results: [
    {
      id: "result1",
      title: "Result 1",
    },
  ],
};
