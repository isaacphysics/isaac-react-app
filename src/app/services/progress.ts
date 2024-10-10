import {useState} from "react";
import {AssignmentProgressDTO, RegisteredUserDTO} from "../../IsaacApiTypes";
import {isTeacherOrAbove} from "./user";
import {AuthorisedAssignmentProgress} from "../../IsaacAppTypes";

export function useAssignmentProgressAccessibilitySettings({user}: {user: RegisteredUserDTO}) {
    const [colourBlind, setColourBlind] = useState(false);
    const [formatAsPercentage, setFormatAsPercentage] = useState(false);
    const [attemptedOrCorrect, setAttemptedOrCorrect] = useState<"ATTEMPTED" | "CORRECT">("ATTEMPTED");
    return {colourBlind, setColourBlind, formatAsPercentage, setFormatAsPercentage, isTeacher: isTeacherOrAbove(user), attemptedOrCorrect, setAttemptedOrCorrect};
}

export function isAuthorisedFullAccess(progress: AssignmentProgressDTO): progress is AuthorisedAssignmentProgress {
    return !!progress.user?.authorisedFullAccess;
}
