import {TestCaseDTO} from "../../../IsaacApiTypes";
import {Action} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services";

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
