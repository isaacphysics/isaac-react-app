import {TestCaseDTO} from "../../../IsaacApiTypes";
import {Action, AdminStatsResponse, TemplateEmail} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services";

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
