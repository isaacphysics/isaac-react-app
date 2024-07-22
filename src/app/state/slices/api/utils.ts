import {
    KEY,
    persistence,
    NOT_FOUND,
    API_PATH,
    NO_CONTENT,
    API_REQUEST_FAILURE_MESSAGE
} from "../../../services";
import produce from "immer";
import {
    AuthorisedAssignmentProgress,
    AppGroup,
    GroupMembershipDetailDTO,
    NOT_FOUND_TYPE,
    UserProgress
} from "../../../../IsaacAppTypes";
import {
    QuizAssignmentDTO,
    QuizAttemptFeedbackDTO,
    UserGameboardProgressSummaryDTO,
    UserSummaryDTO,
    UserSummaryWithEmailAddressDTO
} from "../../../../IsaacApiTypes";
import {BaseQueryFn} from "@reduxjs/toolkit/query";
import {FetchArgs, FetchBaseQueryArgs, FetchBaseQueryError} from "@reduxjs/toolkit/dist/query/fetchBaseQuery";
import {fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {errorSlice} from "../internalAppState";
import {SerializedError} from "@reduxjs/toolkit";
import {Dispatch} from "redux";
import {PromiseWithKnownReason} from "@reduxjs/toolkit/dist/query/core/buildMiddleware/types";
import {showErrorToast, showRTKQueryErrorToastIfNeeded, showSuccessToast} from "../../actions/popups";

// This is used by default as the `baseQuery` of our API slice
export const isaacBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
    const baseQueryArgs: FetchBaseQueryArgs = {
        baseUrl: API_PATH,
        credentials: "include",
        prepareHeaders: (headers, { getState }) => {
            headers.set("accept", "application/json, text/plain, */*");
            return headers;
        }
    }
    let result = await fetchBaseQuery(baseQueryArgs)(args, api, extraOptions);
    if (result.error &&
        (typeof(result.error.status) === "number" ? result.error.status : parseInt(result.error.status)) >= 500 &&
        !(result.error.data as {bypassGenericSiteErrorPage?: boolean})?.bypassGenericSiteErrorPage) {
        if (result.error.status === 502) {
            // A '502 Bad Gateway' response means that the API no longer exists:
            api.dispatch(errorSlice.actions.apiGoneAway());
        } else {
            api.dispatch(errorSlice.actions.apiServerError());
        }
        // eslint-disable-next-line no-console
        console.warn("Error from API:", result.error);
    } else {
        const status = result.meta?.response?.status;
        if (!status) return result;
        if (status >= 500) {
            // eslint-disable-next-line no-console
            console.warn("Uncaught error from API:", result.meta?.response);
        } else if ([NOT_FOUND, NO_CONTENT].includes(status)) {
            result.data = NOT_FOUND;
        }
    }
    return result;
}

export const resultOrNotFound = <T>(result: T, error: FetchBaseQueryError | SerializedError | undefined) => {
    return error && 'status' in error && error.status === NOT_FOUND ? NOT_FOUND : result;
}

interface QueryLifecycleSpec<T, R> {
    onQueryStart?: (args: T, api: {dispatch: Dispatch<any>, getState: () => any}) => void | {resetOptimisticUpdates: (() => void)};
    successTitle?: string | ((args: T, response: R) => string);
    successMessage?: string | ((args: T, response: R) => string);
    onQuerySuccess?: (args: T, response: R, api: {dispatch: Dispatch<any>, getState: () => any}) => void;
    errorTitle?: string | ((args: T, error: FetchBaseQueryError) => string);
    errorMessage?: string | ((args: T, error: FetchBaseQueryError) => string);
    onQueryError?: (args: T, error: FetchBaseQueryError, api: {dispatch: Dispatch<any>, getState: () => any}) => void;
}
// A helper function to handle the lifecycle of a query, with hooks for start, success and error, and toasts for success
// and error.
// Each hook gets any data that is available at the time of the hook (arguments, response, error, etc.), and a dispatch
// function to dispatch actions.
//
// The `onQueryStart` hook can return an object with a `resetOptimisticUpdates` function, which will be called if the
// query fails. This allows you to use RTKs optimistic updates feature to update the state of the app before the query
// has completed.
//
// The `groupsApi` file is probably the best place to look for more in depth examples of how to use this.
export const onQueryLifecycleEvents = <T, R>({onQueryStart, successTitle, successMessage, onQuerySuccess, errorTitle, errorMessage, onQueryError}: QueryLifecycleSpec<T, R>) => async (arg: T, { dispatch, getState, queryFulfilled }: { dispatch: Dispatch<any>, getState: () => any, queryFulfilled: PromiseWithKnownReason<{data: R, meta: {} | undefined}, any>}) => {
    const queryStartCallbacks = onQueryStart?.(arg, {dispatch, getState});
    try {
        const response = await queryFulfilled;
        if (successTitle && successMessage) {
            const successTitleText = typeof successTitle === "function" ? successTitle(arg, response.data) : successTitle;
            const successMessageText = typeof successMessage === "function" ? successMessage(arg, response.data) : successMessage;
            dispatch(showSuccessToast(successTitleText, successMessageText));
        }
        onQuerySuccess?.(arg, response.data, {dispatch, getState});
    } catch (e: any) {
        if (errorTitle) {
            const errorTitleText = typeof errorTitle === "function" ? errorTitle(arg, e.error) : errorTitle;
            const errorMessageText = typeof errorMessage === "function" ? errorMessage(arg, e.error) : errorMessage;
            dispatch(showRTKQueryErrorToastIfNeeded(errorTitleText, e, errorMessageText));
        }
        onQueryError?.(arg, e.error, {dispatch, getState});
        queryStartCallbacks?.resetOptimisticUpdates();
    }
};

export const mutationSucceeded = <T>(response: {data: T} | {error: FetchBaseQueryError | SerializedError}): response is {data: T} => {
    return response.hasOwnProperty("data");
}

export const extractDataFromQueryResponse = <T>(response: { data?: T } | { error: FetchBaseQueryError | SerializedError; }): T | NOT_FOUND_TYPE | undefined => {
    if ('data' in response) {
        return response.data;
    } else if ('error' in response && 'status' in response.error && response.error.status === NOT_FOUND) {
        return NOT_FOUND;
    }
    return undefined;
};

export const getRTKQueryErrorMessage = (e: FetchBaseQueryError | SerializedError | undefined): {status?: number | string, message: string} => {
    if (e?.hasOwnProperty("data")) {
        // @ts-ignore
        return {status: e.status, message: e?.data?.errorMessage ?? API_REQUEST_FAILURE_MESSAGE}
    }
    if (e?.hasOwnProperty("message")) {
        const se = e as SerializedError;
        return {status: se.code, message: se?.message ?? API_REQUEST_FAILURE_MESSAGE}
    }
    return {message: API_REQUEST_FAILURE_MESSAGE};
}

// === Anonymisation utilities ===

interface AnonymisationOptions {
    anonymiseGroupNames?: boolean;
    indexOverride?: number;
}
const getAnonymisationOptions = (): AnonymisationOptions => ({anonymiseGroupNames: persistence.load(KEY.ANONYMISE_GROUPS) === "YES"});

export const anonymiseIfNeededWith = <T>(anonymisationCallback: (nonanonymousData: T, options?: AnonymisationOptions) => T) => (nonanonymousData: T): T =>
    persistence.load(KEY.ANONYMISE_USERS) === "YES" ? anonymisationCallback(nonanonymousData, getAnonymisationOptions()) : nonanonymousData;

export const anonymiseListIfNeededWith = <T>(anonymisationCallback: (nonanonymousData: T, options?: AnonymisationOptions) => T) => (nonanonymousData: T[]): T[] =>
    persistence.load(KEY.ANONYMISE_USERS) === "YES" ? nonanonymousData.map(d => anonymisationCallback(d, getAnonymisationOptions())) : nonanonymousData;

export const anonymisationFunctions = {
    progressState: produce<AuthorisedAssignmentProgress[]>((progress) => {
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
    userSummary: (overrideGivenName?: string, overrideFamilyName?: string) => function userSummary<T extends UserSummaryWithEmailAddressDTO>(userSummary: T, anonymisationOptions?: AnonymisationOptions): T {
        return {
            ...userSummary,
            familyName: overrideFamilyName ?? "",
            givenName: overrideGivenName ?? ("Test Student" + (anonymisationOptions?.indexOverride ? ` ${anonymisationOptions.indexOverride + 1}` : "")),
            email: "hidden@test.demo"
        };
    },
    appGroup: (appGroup: AppGroup, anonymisationOptions?: AnonymisationOptions): AppGroup => ({
        ...appGroup,
        ownerSummary: appGroup?.ownerSummary && anonymisationFunctions.userSummary("Group", "Manager 1")(appGroup.ownerSummary),
        additionalManagers: appGroup?.additionalManagers?.map((us, i) => anonymisationFunctions.userSummary("Group", `Manager ${i + 2}`)(us)),
        groupName: anonymisationOptions?.anonymiseGroupNames ? `Demo Group ${appGroup?.id}` : appGroup.groupName,
        members: appGroup?.members?.map((a, i) => anonymisationFunctions.userSummary()(a, {indexOverride: i})),
    }),
    assignment: (assignment: QuizAssignmentDTO): QuizAssignmentDTO => {
        return {
            ...assignment,
            userFeedback: assignment.userFeedback?.map((uf, i) => ({
                ...uf,
                user: uf.user && anonymisationFunctions.userSummary()(uf.user, {indexOverride: i})
            })),
        };
    },
    quizAttempt: produce<QuizAttemptFeedbackDTO>((quizAttempt) => {
        if (quizAttempt.user) {
            quizAttempt.user.familyName = "";
            quizAttempt.user.givenName = "Test Student";
        }
    }),
    userProgress: (userProgress: UserProgress): UserProgress => userProgress && {
        ...userProgress,
        userDetails: userProgress?.userDetails && anonymisationFunctions.userSummary()(userProgress?.userDetails)
    },
    activeAuthorisations: (activeAuthorisations: UserSummaryWithEmailAddressDTO[]): UserSummaryWithEmailAddressDTO[] =>
        activeAuthorisations?.map((a, i) => anonymisationFunctions.userSummary("Demo", `Teacher ${i + 1}`)(a, {indexOverride: i})),
    otherUserAuthorisations: (otherUserAuthorisations: UserSummaryDTO[]): UserSummaryDTO[] =>
        otherUserAuthorisations?.map((a, i) => anonymisationFunctions.userSummary()(a, {indexOverride: i})),
    groupMembershipDetail: (groupMembership: GroupMembershipDetailDTO, anonymisationOptions?: AnonymisationOptions): GroupMembershipDetailDTO => ({
        ...groupMembership,
        group: anonymisationFunctions.appGroup(groupMembership.group, anonymisationOptions) ?? {},
    })
}
