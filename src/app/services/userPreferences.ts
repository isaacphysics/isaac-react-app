import { BOOLEAN_NOTATION, examBoardBooleanNotationMap, PROGRAMMING_LANGUAGE, useUserViewingContext } from './';
import { AppState, useAppSelector } from '../state';

interface UseUserPreferencesReturnType {
    preferredProgrammingLanguage?: PROGRAMMING_LANGUAGE;
    preferredBooleanNotation?: BOOLEAN_NOTATION;
    preferMathML?: boolean;
}

export function useUserPreferences(): UseUserPreferencesReturnType {
    const examBoard = useUserViewingContext().contexts[0].examBoard;

    const {PROGRAMMING_LANGUAGE: programmingLanguage, BOOLEAN_NOTATION: booleanNotation, ACCESSIBILITY: accessibilitySettings} =
        useAppSelector((state: AppState) => state?.userPreferences) || {};

    // Programming language preference -
    let preferredProgrammingLanguage;
    if (programmingLanguage) {
        preferredProgrammingLanguage = Object.values(PROGRAMMING_LANGUAGE).find(key => programmingLanguage[key] === true);
    }

    // Boolean notation preference -
    let preferredBooleanNotation: BOOLEAN_NOTATION | undefined;
    if (booleanNotation) {
        preferredBooleanNotation = Object.values(BOOLEAN_NOTATION).find(key => booleanNotation[key] === true);
    }
    // if we don't have a boolean notation preference for the user, then set it based on the (first) exam board
    if (preferredBooleanNotation === undefined && examBoard) {
        preferredBooleanNotation = examBoardBooleanNotationMap[examBoard];
    }

    // Accessibility preferences:
    const preferMathML = accessibilitySettings?.PREFER_MATHML;

    return {
        preferredProgrammingLanguage,
        preferredBooleanNotation,
        preferMathML
    };
}
