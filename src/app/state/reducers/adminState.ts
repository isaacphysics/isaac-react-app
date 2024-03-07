import { RegisteredUserDTO, TestCaseDTO, UserSummaryForAdminUsersDTO } from "../../../IsaacApiTypes";
import { Action, AdminStatsResponse, ContentErrorsResponse, TemplateEmail } from "../../../IsaacAppTypes";
import { ACTION_TYPE } from "../../services";

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

export type ContentVersionState = {
  liveVersion?: string;
} | null;
export const contentVersion = (contentVersion: ContentVersionState = null, action: Action): ContentVersionState => {
  switch (action.type) {
    case ACTION_TYPE.CONTENT_VERSION_GET_RESPONSE_SUCCESS:
      return { ...contentVersion, liveVersion: action.liveVersion };
    default:
      return contentVersion;
  }
};

// For string match tool
type TestQuestionsState = TestCaseDTO[] | null;
export const testQuestions = (testQuestions: TestQuestionsState = null, action: Action) => {
  switch (action.type) {
    case ACTION_TYPE.TEST_QUESTION_RESPONSE_SUCCESS: {
      return action.testCaseResponses;
    }
    default: {
      return testQuestions;
    }
  }
};

type AdminModifyTeacherPendingState = string | null;
export const adminModifyTeacherPendingMessage = (message: AdminModifyTeacherPendingState = null, action: Action) => {
  if (action.type === ACTION_TYPE.ADMIN_MODIFY_TEACHER_PENDING_RESPONSE_SUCCESS) {
    return action.message;
  } else {
    return message;
  }
};
