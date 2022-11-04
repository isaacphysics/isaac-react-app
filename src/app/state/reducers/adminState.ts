import {RegisteredUserDTO, UserSummaryForAdminUsersDTO} from "../../../IsaacApiTypes";
import {Action, AdminStatsResponse, ContentErrorsResponse, TemplateEmail} from "../../../IsaacAppTypes";
import {ACTION_TYPE, ContentVersionUpdatingStatus} from "../../services";

export type AdminUserSearchState = UserSummaryForAdminUsersDTO[] | null;
export const adminUserSearch = (adminUserSearch: AdminUserSearchState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.ADMIN_USER_SEARCH_REQUEST:
            return null;
        case ACTION_TYPE.ADMIN_USER_SEARCH_RESPONSE_SUCCESS:
            return action.users;
        default:
            return adminUserSearch;
    }
};

export type AdminUserGetState = RegisteredUserDTO | null;
export const adminUserGet = (adminUserGet: AdminUserGetState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.ADMIN_USER_GET_REQUEST:
            return null;
        case ACTION_TYPE.ADMIN_USER_GET_RESPONSE_SUCCESS:
            return action.getUsers;
        default:
            return adminUserGet;
    }
};

export type AdminContentErrorsState = ContentErrorsResponse | null;
export const adminContentErrors = (adminContentErrors: AdminContentErrorsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.ADMIN_CONTENT_ERRORS_REQUEST:
            return null;
        case ACTION_TYPE.ADMIN_CONTENT_ERRORS_RESPONSE_SUCCESS:
            return action.errors;
        default:
            return adminContentErrors;
    }
};

export type AdminStatsState = AdminStatsResponse | null;
export const adminStats = (adminSiteStats: AdminStatsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.ADMIN_STATS_REQUEST:
            return null;
        case ACTION_TYPE.ADMIN_STATS_RESPONSE_SUCCESS:
            return action.stats;
        default:
            return adminSiteStats;
    }
};

export type AdminEmailTemplateState = TemplateEmail | null;
export const adminEmailTemplate = (adminEmailTemplate: AdminEmailTemplateState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.ADMIN_EMAIL_TEMPLATE_REQUEST:
            return null;
        case ACTION_TYPE.ADMIN_EMAIL_TEMPLATE_RESPONSE_SUCCESS:
            return action.email;
        default:
            return adminEmailTemplate;
    }
};

export type ContentVersionState = {liveVersion?: string; updateState?: ContentVersionUpdatingStatus; updatingVersion?: string} | null;
export const contentVersion = (contentVersion: ContentVersionState = null, action: Action): ContentVersionState => {
    switch (action.type) {
        case ACTION_TYPE.CONTENT_VERSION_GET_RESPONSE_SUCCESS:
            return {...contentVersion, liveVersion: action.liveVersion};
        case ACTION_TYPE.CONTENT_VERSION_SET_REQUEST:
            return {...contentVersion, updateState: ContentVersionUpdatingStatus.UPDATING, updatingVersion: action.version};
        case ACTION_TYPE.CONTENT_VERSION_SET_RESPONSE_SUCCESS:
            return {...contentVersion, updateState: ContentVersionUpdatingStatus.SUCCESS, liveVersion: action.newVersion};
        case ACTION_TYPE.CONTENT_VERSION_SET_RESPONSE_FAILURE:
            return {...contentVersion, updateState: ContentVersionUpdatingStatus.FAILURE};
        default:
            return contentVersion;
    }
};
