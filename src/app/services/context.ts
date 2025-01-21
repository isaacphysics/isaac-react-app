import { Stage } from "../../IsaacApiTypes";
import { Subject } from "../../IsaacAppTypes";
import { HUMAN_STAGES, HUMAN_SUBJECTS } from "./constants";

export function getHumanContext(pageContext?: {subject?: Subject, stage?: Stage}): string {
    return `${pageContext?.stage ? (HUMAN_STAGES[pageContext.stage] + " ") : ""}${pageContext?.subject ? HUMAN_SUBJECTS[pageContext.subject] : ""}`;
}
