import {
  AdditionalInformation,
  AugmentedEvent,
  UserEmailPreferences,
  UserPreferencesDTO,
  ValidationUser,
} from "../../IsaacAppTypes";
import { UserContext, UserSummaryWithEmailAddressDTO } from "../../IsaacApiTypes";
import { FAILURE_TOAST } from "../components/navigation/Toasts";
import { EXAM_BOARD, isStudent, isTutor, STAGE } from "./";
import { Immutable } from "immer";

export function atLeastOne(possibleNumber?: number): boolean {
  return possibleNumber !== undefined && possibleNumber > 0;
}

export function zeroOrLess(possibleNumber?: number): boolean {
  return possibleNumber !== undefined && possibleNumber <= 0;
}

export function validateName(userName?: string | null) {
  const forbiddenWords = ["https", "www"];
  const validPattern = /^[\p{L}\-'_! ]+$/u;

  if (!userName) return false;

  const isValidLength = userName.length > 0 && userName.length <= 50;
  const isValidCharacters = validPattern.test(userName);
  const containsForbiddenWords = forbiddenWords.some((word) => userName.includes(word));

  return isValidLength && isValidCharacters && !containsForbiddenWords;
}

export const validateEmail = (email?: string) => {
  return email && email.length > 0 && email.includes("@");
};

// function that returns true if email exists and is not on the nonSchoolDomains list
export const allowedDomain = (email: string | undefined) => {
  const nonSchoolDomains = ["@gmail", "@yahoo", "@hotmail", "@sharklasers", "@guerrillamail"];

  if (!email) {
    return false;
  }
  return !nonSchoolDomains.some((domain) => email.includes(domain));
};

export const isValidGameboardId = (gameboardId?: string) => {
  return !gameboardId || /^[a-z0-9_-]+$/.test(gameboardId);
};

const isDobOverN = (n: number, dateOfBirth?: Date | number) => {
  if (dateOfBirth !== null && dateOfBirth !== undefined) {
    // Convert the input to a Date object if it's a number (timestamp)
    const dobAsDate = typeof dateOfBirth === "number" ? new Date(dateOfBirth) : dateOfBirth;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nYearsAgo = new Date(today.getFullYear() - n, today.getMonth(), today.getDate());
    const hundredAndTwentyYearsAgo = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
    return hundredAndTwentyYearsAgo <= dobAsDate && dobAsDate <= nYearsAgo;
  } else {
    return false;
  }
};

export const isDobOverThirteen = (dateOfBirth?: Date | number) => isDobOverN(13, dateOfBirth);

// ============================================================================
// COMPREHENSIVE PASSWORD VALIDATION
// ============================================================================

export const MINIMUM_PASSWORD_LENGTH = 12;
export const MAXIMUM_PASSWORD_LENGTH = 128;

export const PASSWORD_REQUIREMENTS = `Passwords must be ${MINIMUM_PASSWORD_LENGTH}-${MAXIMUM_PASSWORD_LENGTH} characters, containing at least one number, one lowercase letter, one uppercase letter, and one ASCII punctuation character.`;

export enum PasswordStrength {
  INVALID = 0,
  WEAK = 1,
  FAIR = 2,
  GOOD = 3,
  STRONG = 4,
  VERY_STRONG = 5,
}

/**
 * Validates that a password meets all requirements:
 * - Between 12-128 characters
 * - Contains at least one number
 * - Contains at least one lowercase letter
 * - Contains at least one uppercase letter
 * - Contains at least one ASCII punctuation character
 */
export const validatePassword = (password: string): boolean => {
  if (password) {
    if (password.length < MINIMUM_PASSWORD_LENGTH || password.length > MAXIMUM_PASSWORD_LENGTH) {
      return false;
    }
    if (!/\d/.test(password)) {
      return false;
    }
    if (!/[a-z]/.test(password)) {
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      return false;
    }
    return /[!-/:-@[-`{-~]/.test(password);
  } else {
    return false;
  }
};

/**
 * Returns an array of specific validation errors for a password
 */
export const getPasswordValidationErrors = (password: string): string[] => {
  const errors: string[] = [];

  if (password) {
    if (password.length < MINIMUM_PASSWORD_LENGTH) {
      errors.push(`Password must be at least ${MINIMUM_PASSWORD_LENGTH} characters`);
    }
    if (password.length > MAXIMUM_PASSWORD_LENGTH) {
      errors.push(`Password must be no more than ${MAXIMUM_PASSWORD_LENGTH} characters`);
    }
    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[!-/:-@[-`{-~]/.test(password)) {
      errors.push(
        "Password must contain at least one punctuation character (e.g., !@#$%^&*()-_=+[]{};:'\",.<>/?\\|`~)",
      );
    }
    return errors;
  } else {
    errors.push("Password is required");
    return errors;
  }
};

/**
 * Calculates the strength of a password on a scale from INVALID to VERY_STRONG
 */
export const calculatePasswordStrength = (password: string): PasswordStrength => {
  // Early return for invalid input
  if (!password || !validatePassword(password)) {
    return PasswordStrength.INVALID;
  }

  // Calculate strength score by accumulating bonuses/penalties
  let strengthScore = 1; // Base score for valid password

  strengthScore += calculateLengthBonus(password);
  strengthScore += calculateCharacterDiversityBonus(password);
  strengthScore += calculatePatternComplexityBonus(password);
  strengthScore += calculateCommonPatternPenalty(password);

  // Convert score to strength enum
  return scoreToStrength(Math.floor(strengthScore));
};

/**
 * Calculates bonus points based on password length
 */
const calculateLengthBonus = (password: string): number => {
  let bonus = 0;
  if (password.length >= 15) bonus += 1;
  if (password.length >= 20) bonus += 1;
  if (password.length >= 25) bonus += 1;
  return bonus;
};

const calculateCharacterDiversityBonus = (password: string): number => {
  let bonus = 0;

  const hasMultipleLowercase = (password.match(/[a-z]/g) || []).length >= 3;
  const hasMultipleUppercase = (password.match(/[A-Z]/g) || []).length >= 3;
  const hasMultipleNumbers = (password.match(/\d/g) || []).length >= 3;
  const hasMultiplePunctuation = (password.match(/[!-/:-@[-`{-~]/g) || []).length >= 2;

  if (hasMultipleLowercase) bonus += 0.25;
  if (hasMultipleUppercase) bonus += 0.25;
  if (hasMultipleNumbers) bonus += 0.25;
  if (hasMultiplePunctuation) bonus += 0.25;

  return bonus;
};

const calculatePatternComplexityBonus = (password: string): number => {
  let bonus = 0;

  const hasNoRepeatingChars = !/(.)\1{2,}/.test(password);
  const hasNoSequentialNumbers = !/012|123|234|345|456|567|678|789|890|987|876|765|654|543|432|321|210/.test(password);

  if (hasNoRepeatingChars) bonus += 0.5;
  if (hasNoSequentialNumbers) bonus += 0.25;

  return bonus;
};

/**
 * Checks for common weak password patterns and applies penalty
 */
const calculateCommonPatternPenalty = (password: string): number => {
  const commonPatterns = [/password/i, /123456/, /qwerty/i, /abc123/i, /admin/i, /letmein/i];

  const hasCommonPattern = commonPatterns.some((pattern) => pattern.test(password));
  return hasCommonPattern ? -1 : 0;
};

/**
 * Converts numeric score to PasswordStrength enum
 */
const scoreToStrength = (score: number): PasswordStrength => {
  if (score <= 0) return PasswordStrength.INVALID;
  if (score === 1) return PasswordStrength.WEAK;
  if (score === 2) return PasswordStrength.FAIR;
  if (score === 3) return PasswordStrength.GOOD;
  if (score === 4) return PasswordStrength.STRONG;
  return PasswordStrength.VERY_STRONG;
};

/**
 * Gets a human-readable label for a password strength value
 */
export const getPasswordStrengthLabel = (strength: PasswordStrength): string => {
  switch (strength) {
    case PasswordStrength.INVALID:
      return "Invalid";
    case PasswordStrength.WEAK:
      return "Weak";
    case PasswordStrength.FAIR:
      return "Fair";
    case PasswordStrength.GOOD:
      return "Good";
    case PasswordStrength.STRONG:
      return "Strong";
    case PasswordStrength.VERY_STRONG:
      return "Very Strong";
    default:
      return "Unknown";
  }
};

/**
 * Gets a color for strength indicator
 */
export const getPasswordStrengthColor = (strength: PasswordStrength): string => {
  switch (strength) {
    case PasswordStrength.INVALID:
      return "#dc3545";
    case PasswordStrength.WEAK:
      return "#fd7e14";
    case PasswordStrength.FAIR:
      return "#ffc107";
    case PasswordStrength.GOOD:
      return "#28a745";
    case PasswordStrength.STRONG:
      return "#20c997";
    case PasswordStrength.VERY_STRONG:
      return "#007bff";
    default:
      return "#6c757d";
  }
};

/**
 * Validates that two passwords match
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

/**
 * Validates a complete password form (password + confirmation)
 */
export const validatePasswordForm = (
  password: string | undefined,
  confirmPassword: string | undefined,
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password) {
    const passwordErrors = getPasswordValidationErrors(password);
    errors.push(...passwordErrors);
  } else {
    errors.push("Password is required");
  }

  if (!confirmPassword) {
    errors.push("Please confirm your password");
  } else if (password && password !== confirmPassword) {
    errors.push("Passwords do not match");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validates a password reset with strength checking
 */
export const validatePasswordReset = (
  newPassword: string,
  confirmPassword: string,
): { valid: boolean; errors: string[]; strength: PasswordStrength } => {
  const validation = validatePasswordForm(newPassword, confirmPassword);
  const strength = newPassword ? calculatePasswordStrength(newPassword) : PasswordStrength.INVALID;

  if (strength < PasswordStrength.FAIR && validation.valid) {
    validation.errors.push("Warning: Your password is weak. Consider using a stronger password for better security.");
  }

  return {
    ...validation,
    strength,
  };
};

/**
 * Checks if a password is acceptable (alias for validatePassword for backward compatibility)
 */
export const isPasswordAcceptable = (password: string): boolean => {
  return validatePassword(password);
};

/**
 * Helper to get all password info at once
 */
export const getPasswordInfo = (password: string) => {
  const isValid = validatePassword(password);
  const errors = getPasswordValidationErrors(password);
  const strength = calculatePasswordStrength(password);
  const strengthLabel = getPasswordStrengthLabel(strength);
  const strengthColor = getPasswordStrengthColor(strength);

  return {
    isValid,
    errors,
    strength,
    strengthLabel,
    strengthColor,
    meetsRequirements: isValid,
    isWeak: strength <= PasswordStrength.WEAK,
    isStrong: strength >= PasswordStrength.GOOD,
  };
};

// ============================================================================
// EMAIL PREFERENCES VALIDATION
// ============================================================================

export const validateEmailPreferences = (emailPreferences?: UserEmailPreferences | null) => {
  return (
    emailPreferences &&
    [emailPreferences.ASSIGNMENTS, emailPreferences.EVENTS, emailPreferences.NEWS_AND_UPDATES].reduce(
      // Make sure all expected values are either true or false
      (prev, next) => prev && (next === true || next === false),
      true,
    )
  );
};

// ============================================================================
// USER CONTEXT VALIDATION
// ============================================================================

export function validateUserContexts(userContexts?: UserContext[]): boolean {
  if (userContexts === undefined) {
    return false;
  }
  if (userContexts.length === 0) {
    return false;
  }
  return userContexts.every(
    (uc) =>
      Object.values(STAGE).includes(uc.stage as STAGE) && //valid stage
      Object.values(EXAM_BOARD).includes(uc.examBoard as EXAM_BOARD), // valid exam board for cs
  );
}

// ============================================================================
// USER SCHOOL VALIDATION
// ============================================================================

// Users school is valid if user is a tutor - their school is allowed to be undefined
export const validateUserSchool = (user?: Immutable<ValidationUser> | null) => {
  const forbiddenWords = ["https", "www"];
  const maxSchoolOtherLength = 150;

  if (!user) return false;

  const isValidSchoolOther = user.schoolOther
    ? user.schoolOther.length > 0 &&
      user.schoolOther.length <= maxSchoolOtherLength &&
      !forbiddenWords.some((word) => user.schoolOther!.includes(word))
    : false;

  return !!user.schoolId || isTutor(user) || isValidSchoolOther;
};

// ============================================================================
// USER ATTRIBUTE VALIDATION
// ============================================================================

export const validateUserGender = (user?: Immutable<ValidationUser> | null) => {
  return user && user.gender && user.gender !== "UNKNOWN";
};

export const validateFullName = (user?: Immutable<ValidationUser> | null) => {
  return user && validateName(user.givenName) && validateName(user.familyName);
};

// ============================================================================
// TIME-BASED VALIDATION
// ============================================================================

const withinLastNMinutes = (nMinutes: number, dateOfAction: string | null) => {
  if (dateOfAction) {
    const now = new Date();
    const nMinutesAgo = new Date(now.getTime() - nMinutes * 60 * 1000);
    const actionTime = new Date(dateOfAction);
    return nMinutesAgo <= actionTime && actionTime <= now;
  } else {
    return false;
  }
};

export const withinLast2Minutes = withinLastNMinutes.bind(null, 2);
export const withinLast2Hours = withinLastNMinutes.bind(null, 120);

// ============================================================================
// COMPOSITE VALIDATION FUNCTIONS
// ============================================================================

export function allRequiredInformationIsPresent(
  user?: Immutable<ValidationUser> | null,
  userPreferences?: UserPreferencesDTO | null,
  userContexts?: UserContext[],
) {
  return (
    user &&
    userPreferences &&
    validateUserSchool(user) &&
    validateUserGender(user) &&
    validateFullName(user) &&
    (userPreferences.EMAIL_PREFERENCE === null || validateEmailPreferences(userPreferences.EMAIL_PREFERENCE)) &&
    validateUserContexts(userContexts)
  );
}

export function validateBookingSubmission(
  event: AugmentedEvent,
  user: Immutable<UserSummaryWithEmailAddressDTO>,
  additionalInformation: AdditionalInformation,
) {
  if (!validateUserSchool(Object.assign({ password: null }, user))) {
    return Object.assign({}, FAILURE_TOAST, {
      title: "School information required",
      body: "You must enter a school in order to book on to this event.",
    });
  }

  // validation for users / forms that indicate the booker is not a teacher
  if (
    isStudent(user) &&
    !(additionalInformation.yearGroup == "TEACHER" || additionalInformation.yearGroup == "OTHER")
  ) {
    if (!additionalInformation.yearGroup) {
      return Object.assign({}, FAILURE_TOAST, {
        title: "Year group required",
        body: "You must enter a year group to proceed.",
      });
    }

    if (!event.isVirtual && (!additionalInformation.emergencyName || !additionalInformation.emergencyNumber)) {
      return Object.assign({}, FAILURE_TOAST, {
        title: "Emergency contact details required",
        body: "You must enter a emergency contact details in order to book on to this event.",
      });
    }
  }

  // validation for users that are teachers or tutors
  if (!isStudent(user) && !additionalInformation.jobTitle) {
    return Object.assign({}, FAILURE_TOAST, {
      title: "Job title required",
      body: "You must enter a job title to proceed.",
    });
  }

  return true;
}

export function safePercentage(correct: number | null | undefined, attempts: number | null | undefined) {
  return !(correct || correct == 0) || !attempts ? null : (correct / attempts) * 100;
}

export const validateForm = (
  registrationUser: Immutable<ValidationUser>,
  unverifiedPassword: string | undefined,
  userContexts: UserContext[],
  dobOver13CheckboxChecked: boolean,
  emailPreferences: UserEmailPreferences | undefined,
) => {
  return (
    validateName(registrationUser.familyName) &&
    validateName(registrationUser.givenName) &&
    validateUserSchool(registrationUser) &&
    validatePassword(registrationUser.password || "") &&
    registrationUser.password === unverifiedPassword &&
    validateEmail(registrationUser.email) &&
    (isDobOverThirteen(registrationUser.dateOfBirth) || dobOver13CheckboxChecked) &&
    validateUserGender(registrationUser) &&
    validateUserContexts(userContexts) &&
    validateEmailPreferences(emailPreferences)
  );
};

// ============================================================================
// DEFAULT EXPORT (for backward compatibility)
// ============================================================================

export default {
  MINIMUM_PASSWORD_LENGTH,
  MAXIMUM_PASSWORD_LENGTH,
  PASSWORD_REQUIREMENTS,

  PasswordStrength,

  validatePassword,
  validatePasswordMatch,
  validatePasswordForm,
  validatePasswordReset,

  getPasswordValidationErrors,

  calculatePasswordStrength,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,

  isPasswordAcceptable,
  getPasswordInfo,
};
