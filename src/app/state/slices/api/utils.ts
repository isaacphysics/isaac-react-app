import {KEY, load} from "../../../services/localStorage";
import produce from "immer";
import {AppAssignmentProgress} from "../../../../IsaacAppTypes";
import {UserGameboardProgressSummaryDTO} from "../../../../IsaacApiTypes";

export const anonymiseIfNeededWith = <T>(anonymisationCallback: (nonanonymousData: T) => T) => (nonanonymousData: T) =>
    load(KEY.ANONYMISE_USERS) === "YES" ? anonymisationCallback(nonanonymousData) : nonanonymousData;

export const anonymisationFunctions = {
    progressState: produce<AppAssignmentProgress[]>((progress) => {
        progress.forEach((userProgress, i) => {
            if (userProgress.user) {
                userProgress.user.familyName = "";
                userProgress.user.givenName = `Test Student ${i + 1}`;
            }
        });
    }),
    groupProgress: produce<UserGameboardProgressSummaryDTO[]>((groupProgress) => {
        groupProgress.forEach((up, i) => {
            if (up.user) {
                up.user.familyName = "";
                up.user.givenName = `Test Student ${i + 1}`;
            }
        });
    }),
}