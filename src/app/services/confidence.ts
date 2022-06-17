import {ConfidenceType} from "../../IsaacAppTypes";

export interface ConfidenceVariables {
    title: string;
    firstQuestion: string;
    secondQuestion: string;
    firstOptions: {
        negative: string;
        neutral: string;
        positive: string;
    },
    secondOptions: {
        negative: string;
        neutral: string;
        positive: string;
    }
}

const defaultConfidenceVariables: ConfidenceVariables = {
    title: "Click a button to show the answer",
    firstQuestion: "What is your level of confidence that your own answer is correct?",
    secondQuestion: "Is your own answer correct?",
    firstOptions: {
        negative: "Low",
        neutral: "Medium",
        positive: "high"
    },
    secondOptions: {
        negative: "No",
        neutral: "Partly",
        positive: "Yes"
    }
}

export const confidenceOptions: {[option in ConfidenceType]: ConfidenceVariables} = {
    "question": {
        title: "Click a button to check your answer",
        firstQuestion: "What is your level of confidence that your own answer is correct?",
        secondQuestion: "Having read the feedback, do you feel more confident in answering this question?",
        firstOptions: {
            negative: "Low",
            neutral: "Medium",
            positive: "high"
        },
        secondOptions: {
            negative: "No",
            neutral: "Partly",
            positive: "Yes"
        }
    },
    "quick_question": defaultConfidenceVariables
};
