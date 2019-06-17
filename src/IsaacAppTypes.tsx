import * as ApiTypes from "./IsaacApiTypes";
import {GameboardDTO, GroupMembershipDTO, UserGroupDTO, UserSummaryWithEmailAddressDTO} from "./IsaacApiTypes";
import {ACTION_TYPE, DOCUMENT_TYPE, EXAM_BOARD, MEMBERSHIP_STATUS, TAG_ID} from "./app/services/constants";


export type Action =
    | {type: ACTION_TYPE.TEST_ACTION}

    | {type: ACTION_TYPE.ROUTER_PAGE_CHANGE; path: string}

    | {type: ACTION_TYPE.API_SERVER_ERROR}
    | {type: ACTION_TYPE.API_GONE_AWAY}

    | {type: ACTION_TYPE.USER_UPDATE_REQUEST}
    | {type: ACTION_TYPE.USER_UPDATE_RESPONSE_FAILURE}
    | {type: ACTION_TYPE.USER_DETAILS_UPDATE_REQUEST}
    | {type: ACTION_TYPE.USER_DETAILS_UPDATE_RESPONSE_SUCCESS; user: ApiTypes.RegisteredUserDTO}
    | {type: ACTION_TYPE.USER_DETAILS_UPDATE_RESPONSE_FAILURE; errorMessage: string}
    | {type: ACTION_TYPE.USER_AUTH_SETTINGS_REQUEST}
    | {type: ACTION_TYPE.USER_AUTH_SETTINGS_RESPONSE_SUCCESS; userAuthSettings: ApiTypes.UserAuthenticationSettingsDTO}
    | {type: ACTION_TYPE.USER_AUTH_SETTINGS_RESPONSE_FAILURE; errorMessage: string}
    | {type: ACTION_TYPE.USER_PREFERENCES_REQUEST}
    | {type: ACTION_TYPE.USER_PREFERENCES_RESPONSE_SUCCESS; userPreferences: UserPreferencesDTO}
    | {type: ACTION_TYPE.USER_PREFERENCES_RESPONSE_FAILURE; errorMessage: string}

    | {type: ACTION_TYPE.USER_LOG_IN_REQUEST; provider: ApiTypes.AuthenticationProvider}
    | {type: ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS; user: ApiTypes.RegisteredUserDTO}
    | {type: ACTION_TYPE.USER_LOG_IN_RESPONSE_FAILURE; errorMessage: string}
    | {type: ACTION_TYPE.USER_PASSWORD_RESET_REQUEST}
    | {type: ACTION_TYPE.USER_INCOMING_PASSWORD_RESET_REQUEST}
    | {type: ACTION_TYPE.USER_INCOMING_PASSWORD_RESET_SUCCESS}
    | {type: ACTION_TYPE.USER_INCOMING_PASSWORD_RESET_FAILURE; errorMessage: string}
    | {type: ACTION_TYPE.USER_PASSWORD_RESET_REQUEST}
    | {type: ACTION_TYPE.USER_PASSWORD_RESET_RESPONSE_SUCCESS}
    | {type: ACTION_TYPE.USER_PASSWORD_RESET_RESPONSE_FAILURE; errorMessage: string}
    | {type: ACTION_TYPE.USER_LOG_OUT_REQUEST}
    | {type: ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS}
    | {type: ACTION_TYPE.AUTHENTICATION_REQUEST_REDIRECT; provider: string}
    | {type: ACTION_TYPE.AUTHENTICATION_REDIRECT; provider: string; redirectUrl: string}
    | {type: ACTION_TYPE.AUTHENTICATION_HANDLE_CALLBACK}
    | {type: ACTION_TYPE.USER_CONSISTENCY_ERROR}

    | {type: ACTION_TYPE.USER_REQUEST_EMAIL_VERIFICATION_REQUEST}
    | {type: ACTION_TYPE.USER_REQUEST_EMAIL_VERIFICATION_RESPONSE_SUCCESS}
    | {type: ACTION_TYPE.USER_REQUEST_EMAIL_VERIFICATION_RESPONSE_FAILURE}

    | {type: ACTION_TYPE.EMAIL_AUTHENTICATION_REQUEST}
    | {type: ACTION_TYPE.EMAIL_AUTHENTICATION_RESPONSE_SUCCESS}
    | {type: ACTION_TYPE.EMAIL_AUTHENTICATION_RESPONSE_FAILURE; errorMessage: string}

    | {type: ACTION_TYPE.ADMIN_USER_SEARCH_REQUEST}
    | {type: ACTION_TYPE.ADMIN_USER_SEARCH_RESPONSE_SUCCESS; users: {}[]}
    | {type: ACTION_TYPE.ADMIN_USER_SEARCH_RESPONSE_FAILURE}
    | {type: ACTION_TYPE.ADMIN_MODIFY_ROLES_REQUEST}
    | {type: ACTION_TYPE.ADMIN_MODIFY_ROLES_RESPONSE_SUCCESS}
    | {type: ACTION_TYPE.ADMIN_MODIFY_ROLES_RESPONSE_FAILURE}

    | {type: ACTION_TYPE.AUTHORISATIONS_ACTIVE_REQUEST}
    | {type: ACTION_TYPE.AUTHORISATIONS_ACTIVE_RESPONSE_SUCCESS; authorisations: ApiTypes.UserSummaryWithEmailAddressDTO[]}
    | {type: ACTION_TYPE.AUTHORISATIONS_ACTIVE_RESPONSE_FAILURE}
    | {type: ACTION_TYPE.AUTHORISATIONS_OTHER_USERS_REQUEST}
    | {type: ACTION_TYPE.AUTHORISATIONS_OTHER_USERS_RESPONSE_SUCCESS; otherUserAuthorisations: ApiTypes.UserSummaryDTO[]}
    | {type: ACTION_TYPE.AUTHORISATIONS_OTHER_USERS_RESPONSE_FAILURE}

    | {type: ACTION_TYPE.AUTHORISATIONS_TOKEN_OWNER_REQUEST}
    | {type: ACTION_TYPE.AUTHORISATIONS_TOKEN_OWNER_RESPONSE_SUCCESS}
    | {type: ACTION_TYPE.AUTHORISATIONS_TOKEN_OWNER_RESPONSE_FAILURE}
    | {type: ACTION_TYPE.AUTHORISATIONS_TOKEN_APPLY_REQUEST}
    | {type: ACTION_TYPE.AUTHORISATIONS_TOKEN_APPLY_RESPONSE_SUCCESS}
    | {type: ACTION_TYPE.AUTHORISATIONS_TOKEN_APPLY_RESPONSE_FAILURE}
    | {type: ACTION_TYPE.AUTHORISATIONS_REVOKE_REQUEST}
    | {type: ACTION_TYPE.AUTHORISATIONS_REVOKE_RESPONSE_SUCCESS}
    | {type: ACTION_TYPE.AUTHORISATIONS_REVOKE_RESPONSE_FAILURE}
    | {type: ACTION_TYPE.AUTHORISATIONS_RELEASE_USER_REQUEST}
    | {type: ACTION_TYPE.AUTHORISATIONS_RELEASE_USER_RESPONSE_SUCCESS}
    | {type: ACTION_TYPE.AUTHORISATIONS_RELEASE_USER_RESPONSE_FAILURE}
    | {type: ACTION_TYPE.AUTHORISATIONS_RELEASE_ALL_USERS_REQUEST}
    | {type: ACTION_TYPE.AUTHORISATIONS_RELEASE_ALL_USERS_RESPONSE_SUCCESS}
    | {type: ACTION_TYPE.AUTHORISATIONS_RELEASE_ALL_USERS_RESPONSE_FAILURE}

    | {type: ACTION_TYPE.GROUP_GET_MEMBERSHIPS_REQUEST}
    | {type: ACTION_TYPE.GROUP_GET_MEMBERSHIPS_RESPONSE_SUCCESS; groupMemberships: GroupMembershipDetailDTO[]}
    | {type: ACTION_TYPE.GROUP_GET_MEMBERSHIPS_RESPONSE_FAILURE}
    | {type: ACTION_TYPE.GROUP_CHANGE_MEMBERSHIP_STATUS_REQUEST}
    | {type: ACTION_TYPE.GROUP_CHANGE_MEMBERSHIP_STATUS_RESPONSE_SUCCESS; groupId: number; newStatus: MEMBERSHIP_STATUS}
    | {type: ACTION_TYPE.GROUP_CHANGE_MEMBERSHIP_STATUS_RESPONSE_FAILURE}

    | {type: ACTION_TYPE.CONSTANTS_UNITS_REQUEST}
    | {type: ACTION_TYPE.CONSTANTS_UNITS_RESPONSE_FAILURE}
    | {type: ACTION_TYPE.CONSTANTS_UNITS_RESPONSE_SUCCESS; units: string[]}

    | {type: ACTION_TYPE.CONSTANTS_SEGUE_VERSION_REQUEST}
    | {type: ACTION_TYPE.CONSTANTS_SEGUE_VERSION_RESPONSE_FAILURE}
    | {type: ACTION_TYPE.CONSTANTS_SEGUE_VERSION_RESPONSE_SUCCESS; segueVersion: string}

    | {type: ACTION_TYPE.DOCUMENT_REQUEST; documentType: DOCUMENT_TYPE; documentId: string}
    | {type: ACTION_TYPE.DOCUMENT_CACHE_SUCCESS; doc: ApiTypes.ContentDTO}
    | {type: ACTION_TYPE.DOCUMENT_RESPONSE_SUCCESS; doc: ApiTypes.ContentDTO}
    | {type: ACTION_TYPE.DOCUMENT_RESPONSE_FAILURE}

    | {type: ACTION_TYPE.QUESTION_REGISTRATION; question: ApiTypes.QuestionDTO}
    | {type: ACTION_TYPE.QUESTION_DEREGISTRATION; questionId: string}
    | {type: ACTION_TYPE.QUESTION_ATTEMPT_REQUEST; questionId: string; attempt: ApiTypes.ChoiceDTO}
    | {type: ACTION_TYPE.QUESTION_ATTEMPT_RESPONSE_SUCCESS; questionId: string; response: ApiTypes.QuestionValidationResponseDTO}
    | {type: ACTION_TYPE.QUESTION_ATTEMPT_RESPONSE_FAILURE}
    | {type: ACTION_TYPE.QUESTION_SET_CURRENT_ATTEMPT; questionId: string; attempt: ApiTypes.ChoiceDTO|ValidatedChoice<ApiTypes.ChoiceDTO>}

    | {type: ACTION_TYPE.TOPIC_REQUEST; topicName: TAG_ID}
    | {type: ACTION_TYPE.TOPIC_CACHE_SUCCESS; topic: ApiTypes.IsaacTopicSummaryPageDTO}
    | {type: ACTION_TYPE.TOPIC_RESPONSE_SUCCESS; topic: ApiTypes.IsaacTopicSummaryPageDTO}
    | {type: ACTION_TYPE.TOPIC_RESPONSE_FAILURE}

    | {type: ACTION_TYPE.GAMEBOARD_REQUEST; gameboardId: string | null}
    | {type: ACTION_TYPE.GAMEBOARD_RESPONSE_SUCCESS; gameboard: ApiTypes.GameboardDTO}

    | {type: ACTION_TYPE.CONTACT_FORM_SEND_REQUEST}
    | {type: ACTION_TYPE.CONTACT_FORM_SEND_RESPONSE_SUCCESS}
    | {type: ACTION_TYPE.CONTACT_FORM_SEND_RESPONSE_FAILURE; errorMessage: string}

    | {type: ACTION_TYPE.ASSIGNMENTS_REQUEST}
    | {type: ACTION_TYPE.ASSIGNMENTS_RESPONSE_SUCCESS; assignments: ApiTypes.AssignmentDTO[]}

    | {type: ACTION_TYPE.CONTENT_VERSION_GET_REQUEST}
    | {type: ACTION_TYPE.CONTENT_VERSION_GET_RESPONSE_SUCCESS; liveVersion: string}
    | {type: ACTION_TYPE.CONTENT_VERSION_GET_RESPONSE_FAILURE}

    | {type: ACTION_TYPE.CONTENT_VERSION_SET_REQUEST; version: string}
    | {type: ACTION_TYPE.CONTENT_VERSION_SET_RESPONSE_SUCCESS; newVersion: string}
    | {type: ACTION_TYPE.CONTENT_VERSION_SET_RESPONSE_FAILURE}

    | {type: ACTION_TYPE.SEARCH_REQUEST; query: string; types: string}
    | {type: ACTION_TYPE.SEARCH_RESPONSE_SUCCESS; searchResults: ApiTypes.ResultsWrapper<ApiTypes.ContentSummaryDTO>}

    | {type: ACTION_TYPE.TOASTS_SHOW; toast: Toast}
    | {type: ACTION_TYPE.TOASTS_HIDE; toastId: string}
    | {type: ACTION_TYPE.TOASTS_REMOVE; toastId: string}

    | {type: ACTION_TYPE.ACTIVE_MODAL_OPEN; activeModal: ActiveModal}
    | {type: ACTION_TYPE.ACTIVE_MODAL_CLOSE}

    | {type: ACTION_TYPE.GROUPS_REQUEST}
    | {type: ACTION_TYPE.GROUPS_RESPONSE_SUCCESS; groups: ApiTypes.UserGroupDTO[]; archivedGroupsOnly: boolean}

    | {type: ACTION_TYPE.GROUPS_SELECT; group: ApiTypes.UserGroupDTO | null}

    | {type: ACTION_TYPE.GROUPS_CREATE_REQUEST}
    | {type: ACTION_TYPE.GROUPS_CREATE_RESPONSE_SUCCESS; newGroup: ApiTypes.UserGroupDTO}

    | {type: ACTION_TYPE.GROUPS_DELETE_REQUEST}
    | {type: ACTION_TYPE.GROUPS_DELETE_RESPONSE_SUCCESS; deletedGroup: ApiTypes.UserGroupDTO}
    | {type: ACTION_TYPE.GROUPS_DELETE_RESPONSE_FAILURE; deletedGroup: ApiTypes.UserGroupDTO}

    | {type: ACTION_TYPE.GROUPS_UPDATE_REQUEST}
    | {type: ACTION_TYPE.GROUPS_UPDATE_RESPONSE_SUCCESS; updatedGroup: ApiTypes.UserGroupDTO}
    | {type: ACTION_TYPE.GROUPS_UPDATE_RESPONSE_FAILURE; updatedGroup: ApiTypes.UserGroupDTO}

    | {type: ACTION_TYPE.GROUPS_MEMBERS_REQUEST; group: ApiTypes.UserGroupDTO}
    | {type: ACTION_TYPE.GROUPS_MEMBERS_RESPONSE_SUCCESS; group: ApiTypes.UserGroupDTO; members: ApiTypes.UserSummaryWithGroupMembershipDTO[]}
    | {type: ACTION_TYPE.GROUPS_MEMBERS_RESPONSE_FAILURE; group: ApiTypes.UserGroupDTO}

    | {type: ACTION_TYPE.GROUPS_TOKEN_REQUEST; group: ApiTypes.UserGroupDTO}
    | {type: ACTION_TYPE.GROUPS_TOKEN_RESPONSE_SUCCESS; group: ApiTypes.UserGroupDTO; token: string}
    | {type: ACTION_TYPE.GROUPS_TOKEN_RESPONSE_FAILURE; group: ApiTypes.UserGroupDTO}

    | {type: ACTION_TYPE.GROUPS_MEMBERS_RESET_PASSWORD_REQUEST; member: AppGroupMembership}
    | {type: ACTION_TYPE.GROUPS_MEMBERS_RESET_PASSWORD_RESPONSE_SUCCESS; member: AppGroupMembership}
    | {type: ACTION_TYPE.GROUPS_MEMBERS_RESET_PASSWORD_RESPONSE_FAILURE; member: AppGroupMembership}

    | {type: ACTION_TYPE.GROUPS_MEMBERS_DELETE_REQUEST; member: AppGroupMembership}
    | {type: ACTION_TYPE.GROUPS_MEMBERS_DELETE_RESPONSE_SUCCESS; member: AppGroupMembership}
    | {type: ACTION_TYPE.GROUPS_MEMBERS_DELETE_RESPONSE_FAILURE; member: AppGroupMembership}

    | {type: ACTION_TYPE.GROUPS_MANAGER_ADD_REQUEST; group: ApiTypes.UserGroupDTO; managerEmail: string}
    | {type: ACTION_TYPE.GROUPS_MANAGER_ADD_RESPONSE_SUCCESS; group: ApiTypes.UserGroupDTO; managerEmail: string; newGroup: ApiTypes.UserGroupDTO}
    | {type: ACTION_TYPE.GROUPS_MANAGER_ADD_RESPONSE_FAILURE; group: ApiTypes.UserGroupDTO; managerEmail: string}

    | {type: ACTION_TYPE.GROUPS_MANAGER_DELETE_REQUEST; group: ApiTypes.UserGroupDTO; manager: UserSummaryWithEmailAddressDTO}
    | {type: ACTION_TYPE.GROUPS_MANAGER_DELETE_RESPONSE_SUCCESS; group: ApiTypes.UserGroupDTO; manager: UserSummaryWithEmailAddressDTO}
    | {type: ACTION_TYPE.GROUPS_MANAGER_DELETE_RESPONSE_FAILURE; group: ApiTypes.UserGroupDTO; manager: UserSummaryWithEmailAddressDTO}

    | {type: ACTION_TYPE.BOARDS_REQUEST; accumulate: boolean}
    | {type: ACTION_TYPE.BOARDS_RESPONSE_SUCCESS; boards: ApiTypes.GameboardListDTO; accumulate: boolean}

    | {type: ACTION_TYPE.BOARDS_GROUPS_REQUEST; board: ApiTypes.GameboardDTO}
    | {type: ACTION_TYPE.BOARDS_GROUPS_RESPONSE_SUCCESS; board: ApiTypes.GameboardDTO; groups: {[key: string]: ApiTypes.UserGroupDTO[]}}
    | {type: ACTION_TYPE.BOARDS_GROUPS_RESPONSE_FAILURE; board: ApiTypes.GameboardDTO}

    | {type: ACTION_TYPE.BOARDS_DELETE_REQUEST; board: ApiTypes.GameboardDTO}
    | {type: ACTION_TYPE.BOARDS_DELETE_RESPONSE_SUCCESS; board: ApiTypes.GameboardDTO}
    | {type: ACTION_TYPE.BOARDS_DELETE_RESPONSE_FAILURE; board: ApiTypes.GameboardDTO}

    | {type: ACTION_TYPE.BOARDS_UNASSIGN_REQUEST; board: ApiTypes.GameboardDTO; group: ApiTypes.UserGroupDTO}
    | {type: ACTION_TYPE.BOARDS_UNASSIGN_RESPONSE_SUCCESS; board: ApiTypes.GameboardDTO; group: ApiTypes.UserGroupDTO}
    | {type: ACTION_TYPE.BOARDS_UNASSIGN_RESPONSE_FAILURE; board: ApiTypes.GameboardDTO; group: ApiTypes.UserGroupDTO}

    | {type: ACTION_TYPE.BOARDS_ASSIGN_REQUEST; board: ApiTypes.GameboardDTO; groupId: number; dueDate?: number}
    | {type: ACTION_TYPE.BOARDS_ASSIGN_RESPONSE_SUCCESS; board: ApiTypes.GameboardDTO; groupId: number; dueDate?: number}
    | {type: ACTION_TYPE.BOARDS_ASSIGN_RESPONSE_FAILURE; board: ApiTypes.GameboardDTO; groupId: number; dueDate?: number}
;


export interface AppQuestionDTO extends ApiTypes.QuestionDTO {
    validationResponse?: ApiTypes.QuestionValidationResponseDTO;
    currentAttempt?: ApiTypes.ChoiceDTO;
    canSubmit?: boolean;
}

export interface AppGroup extends ApiTypes.UserGroupDTO {
    members?: AppGroupMembership[];
}

export interface AppGroupMembership extends ApiTypes.UserSummaryWithGroupMembershipDTO {
    groupMembershipInformation: GroupMembershipDTO;
}

export interface UserEmailPreferences {
    NEWS_AND_UPDATES: boolean;
    ASSIGNMENTS: boolean;
    EVENTS: boolean;
}

export interface UserExamPreferences {
    [EXAM_BOARD.AQA]: boolean;
    [EXAM_BOARD.OCR]: boolean;
}

export interface UserPreferencesDTO {
    BETA_FEATURE?: string;
    EMAIL_PREFERENCE?: UserEmailPreferences;
    EXAM_BOARD?: UserExamPreferences;
}

export interface ValidatedChoice<C extends ApiTypes.ChoiceDTO> {
    frontEndValidation: boolean;
    choice: C;
}

export function isValidatedChoice(choice: ApiTypes.ChoiceDTO|ValidatedChoice<ApiTypes.ChoiceDTO>): choice is ValidatedChoice<ApiTypes.ChoiceDTO> {
    return choice.hasOwnProperty("frontEndValidation");
}

export type LoggedInUser = {loggedIn: true} & ApiTypes.RegisteredUserDTO | {loggedIn: false};

export interface ValidationUser extends ApiTypes.RegisteredUserDTO {
    password: string | null;
}
export type LoggedInValidationUser = ValidationUser & {loggedIn: true}  | {loggedIn: false};

export interface GroupMembershipDetailDTO {
    group: ApiTypes.UserGroupDTO;
    membershipStatus: MEMBERSHIP_STATUS;
}

export interface AppGroupTokenDTO {
    token: string;
    ownerUserId: number;
    groupId: number;
}

export interface LinkInfo {
    title: string;
    to: string;
}

export interface PageNavigation {
    breadcrumbHistory: LinkInfo[];
    backToTopic?: LinkInfo;
    nextTopicContent?: LinkInfo;
}

export interface School {
    urn: string;
    name: string;
    postcode: string;
    closed: boolean;
    dataSource: string;
}

export interface Toast {
    color: string;
    title: string;
    body?: string;
    timeout?: number;
    closable?: boolean;

    // For internal use
    id?: string;
    showing?: boolean;
}

export interface ActiveModal {
    closeAction: () => void;
    title: string;
    body: any;
    buttons: any[];
}

export enum BoardOrder {
    "created" = "created",
    "visited" = "visited",
    "title" = "title",
    "-title" = "-title"
}

export type ActualBoardLimit = number | "ALL";

export type AppGameBoard = GameboardDTO & {assignedGroups?: UserGroupDTO[]};