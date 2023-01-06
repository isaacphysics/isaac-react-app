import {useState} from "react";
import {RegisteredUserDTO} from "../../IsaacApiTypes";
import {isTeacherOrAbove} from "./user";

export function useAssignmentProgressAccessibilitySettings({user}: {user: RegisteredUserDTO}) {
    const [colourBlind, setColourBlind] = useState(false);
    const [formatAsPercentage, setFormatAsPercentage] = useState(false);
    return {colourBlind, setColourBlind, formatAsPercentage, setFormatAsPercentage, isTeacher: isTeacherOrAbove(user)};
}
