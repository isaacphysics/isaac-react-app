/* eslint-disable @typescript-eslint/no-empty-interface */
/* tslint:disable */

// Manually added/modified parts

import {EXAM_BOARD} from "./app/services";

export interface IsaacCardDTO extends ContentDTO {
    image?: ImageDTO;
    clickUrl?: string;
    disabled?: boolean;
    verticalContent?: boolean;
}

export interface IsaacCardDeckDTO extends ContentDTO {
    cards?: IsaacCardDTO[];
}

export interface ChemicalFormulaDTO extends ChoiceDTO {
    mhchemExpression?: string;
}

export interface TestCaseDTO extends QuestionValidationResponseDTO {
    expected?: boolean;
}

export interface TestQuestionDTO extends ChoiceQuestionDTO {
    testCases?: TestCaseDTO[];
}

// Generated using typescript-generator version 2.12.476 on 2021-03-01 09:58:17.

export interface AssignmentDTO extends IAssignmentLike {
    gameboardId?: string;
    gameboard?: GameboardDTO;
    groupId?: number;
    groupName?: string;
    ownerUserId?: number;
    assignerSummary?: UserSummaryDTO;
    notes?: string;
    creationDate?: Date;
    dueDate?: Date;
    scheduledStartDate?: Date;
}

export interface AssignmentFeedbackDTO {
    groupId: number;
    assignmentId?: number;
    errorMessage?: string;
}

export interface GameboardDTO extends HasTitleOrId {
    contents?: GameboardItem[];
    wildCard?: IsaacWildcard;
    wildCardPosition?: number;
    creationDate?: Date;
    gameFilter?: GameFilter;
    ownerUserId?: number;
    ownerUserInformation?: UserSummaryDTO;
    tags?: string[];
    creationMethod?: GameboardCreationMethod;
    percentageCompleted?: number;
    lastVisited?: Date;
    startedQuestion?: boolean;
    savedToCurrentUser?: boolean;
}

export interface GameboardListDTO extends ResultsWrapper<GameboardDTO> {
    totalNotStarted?: number;
    totalInProgress?: number;
    totalCompleted?: number;
}

export interface GameboardProgressSummaryDTO {
    assignmentId?: number;
    gameboardId?: string;
    gameboardTitle?: string;
    dueDate?: Date;
    creationDate?: Date;
    questionPartsCorrect?: number;
    questionPartsIncorrect?: number;
    questionPartsNotAttempted?: number;
    questionPartsTotal?: number;
    passMark?: number;
    questionPagesPerfect?: number;
    questionPagesTotal?: number;
}

export interface IsaacAnvilQuestionDTO extends QuestionDTO {
    anvilApp?: AnvilAppDTO;
}

export interface IsaacConceptPageDTO extends SeguePageDTO {
}

export interface IsaacEventPageDTO extends ContentDTO {
    date?: Date;
    bookingDeadline?: Date;
    prepWorkDeadline?: Date;
    location?: Location;
    eventThumbnail?: ImageDTO;
    numberOfPlaces?: number;
    groupReservationLimit?: number;
    allowGroupReservations?: boolean;
    eventStatus?: EventStatus;
    placesAvailable?: number;
    endDate?: Date;
}

export interface IsaacFastTrackQuestionPageDTO extends IsaacQuestionPageDTO {
}

export interface IsaacFeaturedProfileDTO extends ContentDTO {
    emailAddress?: string;
    image?: ImageDTO;
    homepage?: string;
}

export interface IsaacFreeTextQuestionDTO extends QuestionDTO {
}

export interface IsaacGraphSketcherQuestionDTO extends IsaacSymbolicQuestionDTO {
}

export interface IsaacItemQuestionDTO extends QuestionDTO {
    items?: ItemDTO[];
}

export interface IsaacMultiChoiceQuestionDTO extends QuestionDTO {
    choices?: ChoiceDTO[];
}

export interface IsaacNumericQuestionDTO extends QuestionDTO {
    requireUnits?: boolean;
    availableUnits?: string[];
    knownUnits?: string[];
    displayUnit?: string;
}

export interface IsaacParsonsQuestionDTO extends IsaacItemQuestionDTO {
    disableIndentation?: boolean;
}

export interface IsaacReorderQuestionDTO extends IsaacItemQuestionDTO {}

export interface IsaacClozeQuestionDTO extends IsaacItemQuestionDTO {
    withReplacement?: boolean;
}

export interface IsaacPodDTO extends ContentDTO {
    image?: ImageDTO;
    url?: string;
}

export interface IsaacQuestionPageDTO extends SeguePageDTO {
    difficulty?: number;
    passMark?: number;
    supersededBy?: string;
}

export interface IsaacQuestionSummaryPageDTO extends SeguePageDTO {
    featuredQuestions?: GameboardItem[];
    topBoards?: GameboardDTO[];
    extraordinaryQuestions?: ExternalReference[];
}

export interface IsaacQuickQuestionDTO extends QuestionDTO {
    answer?: ContentBaseDTO;
    showConfidence?: boolean;
}

export interface IsaacQuizDTO extends SeguePageDTO, HasTitleOrId {
    rubric?: ContentDTO;
    visibleToStudents?: boolean;
    hiddenFromRoles?: Role[];
    defaultFeedbackMode?: QuizFeedbackMode;
    total?: number;
    sectionTotals?: { [index: string]: number };
    individualFeedback?: QuizFeedbackDTO;
}

export interface IsaacQuizSectionDTO extends SeguePageDTO {
}

export interface IsaacStringMatchQuestionDTO extends QuestionDTO {
    multiLineEntry?: boolean;
    preserveTrailingWhitespace?: boolean;
}

export interface IsaacRegexMatchQuestionDTO extends QuestionDTO {
    multiLineEntry?: boolean;
}

export interface IsaacSymbolicChemistryQuestionDTO extends IsaacSymbolicQuestionDTO {
}

export interface IsaacSymbolicLogicQuestionDTO extends IsaacSymbolicQuestionDTO {
}

export interface IsaacSymbolicQuestionDTO extends QuestionDTO {
    formulaSeed?: string;
    availableSymbols?: string[];
}

export interface IsaacTopicSummaryPageDTO extends SeguePageDTO {
    linkedGameboards?: GameboardDTO[];
}

export interface IsaacWildcardDTO extends ContentDTO {
    description?: string;
    url?: string;
}

export interface QuestionPartConceptDTO {
    title?: string;
    bestLevel?: FastTrackConceptState;
    upperQuestions?: GameboardItem[];
    lowerQuestions?: GameboardItem[];
}

export interface QuizAssignmentDTO extends IAssignmentLike, IHasQuizSummary {
    assignerSummary?: UserSummaryDTO;
    quizFeedbackMode?: QuizFeedbackMode;
    attempt?: QuizAttemptDTO;
    userFeedback?: QuizUserFeedbackDTO[];
    quiz?: IsaacQuizDTO;
}

export interface QuizAttemptDTO extends IHasQuizSummary {
    id?: number;
    userId?: number;
    quizAssignmentId?: number;
    startDate?: Date;
    completedDate?: Date;
    quiz?: IsaacQuizDTO;
    quizAssignment?: QuizAssignmentDTO;
    feedbackMode?: QuizFeedbackMode;
}

export interface QuizFeedbackDTO {
    complete?: boolean;
    overallMark?: Mark;
    sectionMarks?: { [index: string]: Mark };
    questionMarks?: { [index: string]: Mark };
}

export interface QuizUserFeedbackDTO {
    user?: UserSummaryDTO;
    feedback?: QuizFeedbackDTO;
}

export interface QuizAttemptFeedbackDTO {
    user?: UserSummaryDTO;
    attempt?: QuizAttemptDTO;
}

export interface UserGameboardProgressSummaryDTO {
    user?: UserSummaryDTO;
    progress?: GameboardProgressSummaryDTO[];
}

export interface EventBookingDTO {
    bookingId?: number;
    userBooked?: UserSummaryDTO;
    reservedById?: number;
    eventId?: string;
    eventTitle?: string;
    eventDate?: Date;
    bookingStatus?: BookingStatus;
    bookingDate?: Date;
    additionalInformation?: { [index: string]: string };
    updated?: Date;
}

export interface FormulaValidationResponseDTO extends QuestionValidationResponseDTO {
    correctExact?: boolean;
    correctSymbolic?: boolean;
    correctNumeric?: boolean;
}

export interface LocalAuthDTO {
    email?: string;
    password?: string;
    rememberMe?: boolean;
    _randomPadding?: string;
}

export interface MFAResponseDTO {
    mfaVerificationCode?: string;
    rememberMe?: boolean;
}

export interface QuantityValidationResponseDTO extends QuestionValidationResponseDTO {
    correctValue?: boolean;
    correctUnits?: boolean;
}

export interface QuestionValidationResponseDTO {
    questionId?: string;
    answer?: ChoiceDTO;
    correct?: boolean;
    explanation?: ContentDTO;
    dateAttempted?: Date;
}

export interface UserGroupDTO {
    id?: number;
    groupName?: string;
    ownerId?: number;
    created?: Date;
    lastUpdated?: Date;
    token?: string;
    archived?: boolean;
    ownerSummary?: UserSummaryWithEmailAddressDTO;
    additionalManagers?: UserSummaryWithEmailAddressDTO[];
    _id?: number;
}

export interface AnvilAppDTO extends ContentDTO {
    appId?: string;
    appAccessKey?: string;
}

export interface ChemicalFormulaDTO extends ChoiceDTO {
    mhchemExpression?: string;
}

export interface ChoiceDTO extends ContentDTO {
}

export interface ChoiceQuestionDTO extends QuestionDTO {
}

export interface ContentBaseDTO {
    id?: string;
    type?: string;
    tags?: string[];
    version?: string;
    audience?: AudienceContext[];
    display?: { [index: string]: string[] };
}

export interface ContentDTO extends ContentBaseDTO {
    title?: string;
    subtitle?: string;
    encoding?: string;
    layout?: string;
    expandable?: boolean;
    children?: ContentBaseDTO[];
    value?: string;
    attribution?: string;
    relatedContent?: ContentSummaryDTO[];
    published?: boolean;
    deprecated?: boolean;
    level?: number;
}

export interface ContentSummaryDTO {
    id?: string;
    title?: string;
    summary?: string;
    type?: string;
    level?: string;
    tags?: string[];
    url?: string;
    correct?: boolean;
    supersededBy?: string;
    deprecated?: boolean;
    difficulty?: string;
    audience?: AudienceContext[];
}

export interface QuizSummaryDTO extends ContentSummaryDTO {
    visibleToStudents?: boolean;
    hiddenFromRoles?: Role[];
}

export interface EmailTemplateDTO extends ContentDTO {
    subject?: string;
    plainTextContent?: string;
    htmlContent?: string;
    overrideFromAddress?: string;
    overrideFromName?: string;
    overrideEnvelopeFrom?: string;
    replyToEmailAddress?: string;
    replyToName?: string;
}

export interface FigureDTO extends ImageDTO {
}

export interface FormulaDTO extends ChoiceDTO {
    pythonExpression?: string;
}

export interface FreeTextRuleDTO extends ChoiceDTO {
    wordProximity?: number;
}

export interface GlossaryTermDTO extends ContentDTO {
    explanation?: ContentDTO;
    examBoard?: EXAM_BOARD | "";
}

export interface CodeSnippetDTO extends ContentDTO {
    language?: string;
    code?: string;
    disableHighlighting?: boolean;
    url?: string;
}

export interface InteractiveCodeSnippetDTO extends CodeSnippetDTO {
    setupCode?: string;
    testCode?: string;
    expectedResult?: string;
    wrapCodeInMain?: boolean;
}

export interface GraphChoiceDTO extends ChoiceDTO {
    graphSpec?: string;
}

export interface ImageDTO extends MediaDTO {
    clickUrl?: string;
    clickTarget?: string;
}

export interface ItemChoiceDTO extends ChoiceDTO {
    items?: ItemDTO[];
}

export interface LogicFormulaDTO extends ChoiceDTO {
    pythonExpression?: string;
}

export interface MediaDTO extends ContentDTO {
    src?: string;
    altText?: string;
}

export interface NotificationDTO extends ContentDTO {
    externalReference?: ExternalReference;
    expiry?: Date;
}

export interface ParsonsChoiceDTO extends ItemChoiceDTO {
    items?: ParsonsItemDTO[];
}

export interface ItemDTO extends ContentDTO {
}

export interface ParsonsItemDTO extends ItemDTO {
    indentation?: number;
}

export interface QuantityDTO extends ChoiceDTO {
    units?: string;
}

// TODO move hiding past bast attempts into the backend for more flexibility
// We use `null` to mean "best attempt hidden" so that all checks for whether `bestAttempt` is defined automatically
// return false if it's hidden, without having to wrap all of these checks in an `isDefinedOrHidden()` predicate.
// This latter approach would be more principled however. As it is, we make it clear at the type level that BestAttemptHidden
// is "null with meaning" which should be fine for now, especially if we move best-attempt-hiding to the backend.
export type BestAttemptHidden = null;
export const BEST_ATTEMPT_HIDDEN: BestAttemptHidden = null;
export interface QuestionDTO extends ContentDTO {
    hints?: ContentBaseDTO[];
    bestAttempt?: QuestionValidationResponseDTO | BestAttemptHidden;
}

export interface SeguePageDTO extends ContentDTO {
    canonicalSourceFile?: string;
    summary?: string;
}

export interface StringChoiceDTO extends ChoiceDTO {
    caseInsensitive?: boolean;
}

export interface VideoDTO extends MediaDTO {
}

export interface AbstractSegueUserDTO {
}

export interface AnonymousUserDTO extends AbstractSegueUserDTO {
    sessionId?: string;
    temporaryQuestionAttempts?: { [index: string]: { [index: string]: QuestionValidationResponseDTO[] } };
    dateCreated?: Date;
    lastUpdated?: Date;
}

export interface GroupMembershipDTO {
    groupId?: number;
    userId?: number;
    status?: GroupMembershipStatus;
    updated?: Date;
    created?: Date;
}

export type Stage = "year_7_and_8" | "year_9" | "gcse" | "a_level" | "further_a" | "university" | "all";

export type ExamBoard = "aqa" | "cie" | "edexcel" | "eduqas" | "ocr" | "wjec" | "all";

export type Difficulty = "practice_1" | "practice_2" | "practice_3" | "challenge_1" | "challenge_2" | "challenge_3";

export type RoleRequirement = "logged_in" | "teacher";


export interface UserContext {
    stage?: Stage;
    examBoard?: ExamBoard;
}

export interface AudienceContext {
    stage?: Stage[];
    examBoard?: ExamBoard[];
    difficulty?: Difficulty[];
    role?: RoleRequirement[];
}

export interface RegisteredUserDTO extends AbstractSegueUserDTO {
    givenName?: string;
    familyName?: string;
    email?: string;
    dateOfBirth?: Date;
    gender?: Gender;
    registrationDate?: Date;
    schoolId?: string;
    role?: Role;
    schoolOther?: string;
    registeredContexts?: UserContext[];
    registeredContextsLastConfirmed?: Date;
    firstLogin?: boolean;
    lastUpdated?: Date;
    lastSeen?: Date;
    emailVerificationStatus?: EmailVerificationStatus;
    id?: number;
    _id?: number;
}

export interface UserAuthenticationSettingsDTO extends AbstractSegueUserDTO {
    linkedAccounts?: AuthenticationProvider[];
    hasSegueAccount?: boolean;
    mfaStatus?: boolean;
    id?: number;
}

export interface UserIdMergeDTO {
    targetId?: number;
    sourceId?: number;
}

export interface UserSummaryDTO extends AbstractSegueUserDTO {
    givenName?: string;
    familyName?: string;
    role?: Role;
    authorisedFullAccess?: boolean;
    emailVerificationStatus?: EmailVerificationStatus;
    registeredContexts?: UserContext[];
    id?: number;
}

export interface UserSummaryForAdminUsersDTO extends UserSummaryWithEmailAddressDTO {
    lastUpdated?: Date;
    lastSeen?: Date;
    registrationDate?: Date;
    schoolId?: string;
    schoolOther?: string;
}

export interface UserSummaryWithEmailAddressDTO extends UserSummaryDTO {
    email?: string;
}

export interface UserSummaryWithGroupMembershipDTO extends UserSummaryDTO {
    groupMembershipInformation?: GroupMembershipDTO;
}

export interface IAssignmentLike {
    groupId?: number;
    id?: number;
    creationDate?: Date;
    dueDate?: Date;
    ownerUserId?: number;
}

export interface GameboardItem {
    id?: string;
    contentType?: string;
    title?: string;
    description?: string;
    uri?: string;
    tags?: string[];
    audience?: AudienceContext[];
    creationContext?: AudienceContext;
    questionPartsCorrect?: number;
    questionPartsIncorrect?: number;
    questionPartsNotAttempted?: number;
    questionPartsTotal?: number;
    passMark?: number;
    state?: GameboardItemState;
    questionPartStates?: QuestionPartState[];
    boardId?: string;
    supersededBy?: string;
}

export interface IsaacWildcard extends Content {
    description?: string;
    url?: string;
}

export interface GameFilter {
    subjects?: string[];
    fields?: string[];
    topics?: string[];
    levels?: number[];
    concepts?: string[];
}

export interface HasTitleOrId {
    title?: string;
    id?: string;
}

export interface Location {
    address?: Address;
    latitude?: number;
    longitude?: number;
}

export interface IHasQuizSummary {
    quizId?: string;
    quizSummary?: ContentSummaryDTO;
}

export interface Mark {
    correct?: number;
    incorrect?: number;
    notAttempted?: number;
}

export interface ExternalReference {
    title?: string;
    url?: string;
}

export interface ContentBase {
    id?: string;
    type?: string;
    tags?: string[];
    canonicalSourceFile?: string;
    version?: string;
    audience?: AudienceContext[];
    display?: { [index: string]: string[] };
}


export interface Content extends ContentBase {
    title?: string;
    subtitle?: string;
    author?: string;
    encoding?: string;
    layout?: string;
    children?: ContentBase[];
    value?: string;
    attribution?: string;
    relatedContent?: string[];
    published?: boolean;
    level?: number;
    searchableContent?: string;
}

export interface ResultsWrapper<T> {
    results?: T[];
    totalResults?: number;
}

export interface Address {
    addressLine1?: string;
    addressLine2?: string;
    town?: string;
    county?: string;
    postalCode?: string;
    country?: string;
}

export interface AnsweredQuestionsByDate {
    [date: string]: number;
}

export interface TOTPSharedSecretDTO {
    userId: number;
    sharedSecret: string;
    created: Date;
}

export type GameboardCreationMethod = "FILTER" | "BUILDER";

export type EventStatus = "OPEN" | "FULLY_BOOKED" | "CANCELLED" | "CLOSED" | "WAITING_LIST_ONLY";

export type FastTrackConceptState = "ft_top_ten" | "ft_upper" | "ft_lower";

export type BookingStatus = "CONFIRMED" | "CANCELLED" | "WAITING_LIST" | "ATTENDED" | "ABSENT" | "RESERVED";

export const ROLES = ["STUDENT", "TEACHER", "EVENT_LEADER", "CONTENT_EDITOR", "EVENT_MANAGER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export type EmailVerificationStatus = "VERIFIED" | "NOT_VERIFIED" | "DELIVERY_FAILED";

export type QuizFeedbackMode = "NONE" | "OVERALL_MARK" | "SECTION_MARKS" | "DETAILED_FEEDBACK";

export type GroupMembershipStatus = "ACTIVE" | "INACTIVE" | "DELETED";

export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY" | "UNKNOWN";

export type AuthenticationProvider = "GOOGLE" | "FACEBOOK" | "TWITTER" | "RAVEN" | "TEST" | "SEGUE";

export type GameboardItemState = "PERFECT" | "PASSED" | "IN_PROGRESS" | "NOT_ATTEMPTED" | "FAILED";

export type QuestionPartState = "CORRECT" | "INCORRECT" | "NOT_ATTEMPTED";
