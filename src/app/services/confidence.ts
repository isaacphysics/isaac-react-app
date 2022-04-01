import {Confidence} from "../../IsaacAppTypes";

export function confidenceOptions(option: Confidence) {
    switch (option) {
        case "concept":
            return {
                title: "Click a button to rate your confidence",
                firstQuestion: "What is your level of confidence in this concept?",
                firstOptions: {
                    negative: "Low",
                    neutral: "Medium",
                    positive: "high"
                }
            };
        case "question":
            return {
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
            }
        default:
            return {
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
    }
}
