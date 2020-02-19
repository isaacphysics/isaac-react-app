/* tslint:disable */
// Generated using typescript-generator version 2.12.476 on 2019-05-15 20:09:01.

import {EXAM_BOARD} from "./app/services/constants";

export interface AssignmentDTO {
    gameboardId?: string;
    gameboard?: GameboardDTO;
    groupId?: number;
    ownerUserId?: number;
    assignerSummary?: UserSummaryDTO;
    creationDate?: Date;
    dueDate?: Date;
    _id?: number;
}

export interface GameboardDTO {
    id?: string;
    title?: string;
    questions?: GameboardItem[];
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

export interface IsaacAnvilQuestionDTO extends IsaacQuestionBaseDTO {
    anvilApp?: AnvilAppDTO;
}

export interface IsaacConceptPageDTO extends SeguePageDTO {
    canonicalSourceFile?: string;
}

export interface IsaacEventPageDTO extends ContentDTO {
    date?: Date;
    bookingDeadline?: Date;
    prepWorkDeadline?: Date;
    location?: Location;
    eventThumbnail?: ImageDTO;
    numberOfPlaces?: number;
    eventStatus?: EventStatus;
    placesAvailable?: number;
    endDate?: Date;
    groupReservationLimit?: number;
    allowGroupReservations?: boolean;
}

export interface IsaacFastTrackQuestionPageDTO extends IsaacQuestionPageDTO {
}

export interface IsaacFeaturedProfileDTO extends ContentDTO {
    emailAddress?: string;
    image?: ImageDTO;
    homepage?: string;
}

export interface IsaacFreeTextQuestionDTO extends IsaacQuestionBaseDTO {
}

export interface IsaacGraphSketcherQuestionDTO extends IsaacSymbolicQuestionDTO {
}

export interface IsaacMultiChoiceQuestionDTO extends IsaacQuestionBaseDTO {
    choices?: ChoiceDTO[];
}

export interface IsaacNumericQuestionDTO extends IsaacQuestionBaseDTO {
    requireUnits?: boolean;
    availableUnits?: string[];
    knownUnits?: string[];
}

export interface IsaacItemQuestionDTO extends IsaacQuestionBaseDTO {
    items?: ItemDTO[];
}

export interface IsaacParsonsQuestionDTO extends IsaacItemQuestionDTO {
    disableIndentation?: boolean;
}

export interface IsaacPodDTO extends ContentDTO {
    image?: ImageDTO;
    url?: string;
}

export interface IsaacQuestionBaseDTO extends ChoiceQuestionDTO {
}

export interface IsaacQuestionPageDTO extends SeguePageDTO {
    canonicalSourceFile?: string;
    passMark?: number;
    supersededBy?: string;
}

export interface IsaacQuestionSummaryPageDTO extends SeguePageDTO {
    featuredQuestions?: GameboardItem[];
    topBoards?: GameboardDTO[];
    extraordinaryQuestions?: ExternalReference[];
}

export interface IsaacQuickQuestionDTO extends IsaacQuestionBaseDTO {
    answer?: ContentBaseDTO;
}

export interface IsaacStringMatchQuestionDTO extends IsaacQuestionBaseDTO {
    multiLineEntry?: boolean;
}

export interface IsaacSymbolicChemistryQuestionDTO extends IsaacSymbolicQuestionDTO {
}

export interface IsaacSymbolicLogicQuestionDTO extends IsaacSymbolicQuestionDTO {
}

export interface IsaacSymbolicQuestionDTO extends IsaacQuestionBaseDTO {
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
    groupName?: string;
    ownerId?: number;
    created?: Date;
    lastUpdated?: Date;
    token?: string;
    archived?: boolean;
    ownerSummary?: UserSummaryWithEmailAddressDTO;
    additionalManagers?: UserSummaryWithEmailAddressDTO[];
    id?: number;
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

export interface GlossaryTermDTO extends ContentDTO {
    explanation?: ContentDTO;
    examBoard: string;
}

export interface ContentBaseDTO {
    id?: string;
    type?: string;
    tags?: string[];
    version?: string;
}

export interface ContentDTO extends ContentBaseDTO {
    title?: string;
    subtitle?: string;
    encoding?: string;
    layout?: string;
    children?: any[];
    value?: string;
    attribution?: string;
    relatedContent?: ContentSummaryDTO[];
    published?: boolean;
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
}

export interface EmailTemplateDTO extends ContentDTO {
    subject?: string;
    plainTextContent?: string;
    htmlContent?: string;
    replyToEmailAddress?: string;
    replyToName?: string;
}

export interface FigureDTO extends ImageDTO {
}

export interface FormulaDTO extends ChoiceDTO {
    pythonExpression?: string;
}

export interface FreeTextRuleDTO extends ChoiceDTO {
}

export interface GraphChoiceDTO extends ChoiceDTO {
    graphSpec?: string;
}

export interface ImageDTO extends MediaDTO {
    clickUrl?: string;
    clickTarget?: string;
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

export interface ItemChoiceDTO extends ChoiceDTO {
    items?: ItemDTO[];
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

export interface QuestionDTO extends ContentDTO {
    hints?: any[];
    bestAttempt?: QuestionValidationResponseDTO;
}

export interface SeguePageDTO extends ContentDTO {
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
}

export interface DetailedUserSummaryDTO extends UserSummaryDTO {
    email?: string;
}

export interface GroupMembershipDTO {
    groupId?: number;
    userId?: number;
    status?: GroupMembershipStatus;
    updated?: Date;
    created?: Date;
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
    examBoard?: EXAM_BOARD;
    schoolOther?: string;
    firstLogin?: boolean;
    lastUpdated?: Date;
    lastSeen?: Date;
    emailVerificationStatus?: EmailVerificationStatus;
    _id?: number;
    id?: number;
}

export interface UserAuthenticationSettingsDTO extends AbstractSegueUserDTO {
    linkedAccounts?: AuthenticationProvider[];
    hasSegueAccount?: boolean;
    id?: number;
}

export interface UserSummaryDTO extends AbstractSegueUserDTO {
    givenName?: string;
    familyName?: string;
    role?: Role;
    authorisedFullAccess?: boolean;
    emailVerificationStatus?: EmailVerificationStatus;
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

export interface GameboardItem {
    id?: string;
    title?: string;
    description?: string;
    uri?: string;
    tags?: string[];
    level?: number;
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

export interface Location {
    address?: Address;
    latitude?: number;
    longitude?: number;
}

export interface ExternalReference {
    title?: string;
    url?: string;
}

export interface GlossaryTerm extends Content {
    explanation?: Content;
    examBoard: string;
}

export interface ContentBase {
    id?: string;
    type?: string;
    tags?: string[];
    canonicalSourceFile?: string;
    version?: string;
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

export type GameboardCreationMethod = "FILTER" | "BUILDER";

export type EventStatus = "OPEN" | "FULLY_BOOKED" | "CANCELLED" | "CLOSED" | "WAITING_LIST_ONLY";

export type FastTrackConceptState = "ft_top_ten" | "ft_upper" | "ft_lower";

export type BookingStatus = "CONFIRMED" | "CANCELLED" | "WAITING_LIST" | "ATTENDED" | "ABSENT" | "RESERVED";

export type Role = "STUDENT" | "TEACHER" | "EVENT_LEADER"| "CONTENT_EDITOR" | "EVENT_MANAGER" | "ADMIN";

export type EmailVerificationStatus = "VERIFIED" | "NOT_VERIFIED" | "DELIVERY_FAILED";

export type GroupMembershipStatus = "ACTIVE" | "INACTIVE" | "DELETED";

export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY" | "UNKNOWN";

export type AuthenticationProvider = "GOOGLE" | "FACEBOOK" | "TWITTER" | "RAVEN" | "TEST" | "SEGUE";

export type GameboardItemState = "PERFECT" | "PASSED" | "IN_PROGRESS" | "NOT_ATTEMPTED" | "FAILED";

export type QuestionPartState = "CORRECT" | "INCORRECT" | "NOT_ATTEMPTED";
