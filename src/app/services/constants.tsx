import Remarkable from "remarkable";

export const API_VERSION: string = process.env.REACT_APP_API_VERSION || "any";

/*
 * Configure the api provider with the server running the API:
 * No need if we want to use the same server as the static content.
 */
let apiPath: string = `${document.location.origin}/api/${API_VERSION}/api`;
if (document.location.hostname === "localhost") {
    apiPath = "http://localhost:8080/isaac-api/api";
} else if (document.location.hostname.indexOf(".eu.ngrok.io") > -1) {
    apiPath = "https://isaacscience.eu.ngrok.io/isaac-api/api";
}
export const API_PATH: string = apiPath;

export const MARKDOWN_RENDERER = new Remarkable({
    linkify: true,
    html: true,
});

export enum ACTION_TYPE {
    TEST_ACTION = "TEST_ACTION",

    ROUTER_PAGE_CHANGE = "ROUTER_PAGE_CHANGE",
    API_SERVER_ERROR = "API_SERVER_ERROR",
    API_GONE_AWAY = "API_GONE_AWAY",

    USER_UPDATE_REQUEST = "USER_UPDATE_REQUEST",
    USER_UPDATE_FAILURE = "USER_UPDATE_FAILURE",
    USER_LOG_IN_REQUEST = "USER_LOG_IN_REQUEST",
    USER_LOG_IN_RESPONSE_SUCCESS = "USER_LOG_IN_RESPONSE_SUCCESS",
    USER_LOG_IN_FAILURE = "USER_LOG_IN_FAILURE",
    USER_PASSWORD_RESET_REQUEST= "USER_PASSWORD_RESET_REQUEST",
    USER_PASSWORD_RESET_REQUEST_SUCCESS = "USER_PASSWORD_RESET_REQUEST_SUCCESS",
    USER_LOG_OUT_REQUEST = "USER_LOG_OUT_REQUEST",
    USER_LOG_OUT_RESPONSE_SUCCESS = "USER_LOG_OUT_RESPONSE_SUCCESS",
    AUTHENTICATION_REQUEST_REDIRECT = "AUTHENTICATION_REQUEST_REDIRECT",
    AUTHENTICATION_REDIRECT = "AUTHENTICATION_REDIRECT",
    AUTHENTICATION_HANDLE_CALLBACK = "AUTHENTICATION_HANDLE_CALLBACK",
    USER_CONSISTENCY_CHECK = "USER_CONSISTENCY_CHECK",
    USER_CONSISTENCY_ERROR = "USER_CONSISTENCY_ERROR",

    CONSTANTS_UNITS_REQUEST = "CONSTANTS_UNITS_REQUEST",
    CONSTANTS_UNITS_RESPONSE_SUCCESS = "CONSTANTS_UNITS_SUCCESS",
    CONSTANTS_UNITS_RESPONSE_FAILURE = "CONSTANTS_UNITS_RESPONSE_FAILURE",

    CONSTANTS_SEGUE_VERSION_REQUEST = "CONSTANTS_SEGUE_VERSION_REQUEST",
    CONSTANTS_SEGUE_VERSION_RESPONSE_SUCCESS = "CONSTANTS_SEGUE_VERSION_RESPONSE_SUCCESS",
    CONSTANTS_SEGUE_VERSION_RESPONSE_FAILURE = "CONSTANTS_SEGUE_VERSION_RESPONSE_FAILURE",

    DOCUMENT_REQUEST = "DOCUMENT_REQUEST",
    DOCUMENT_RESPONSE_SUCCESS = "DOCUMENT_RESPONSE_SUCCESS",
    DOCUMENT_RESPONSE_FAILURE = "DOCUMENT_RESPONSE_FAILURE",

    QUESTION_REGISTRATION = "QUESTION_REGISTRATION",
    QUESTION_DEREGISTRATION = "QUESTION_DEREGISTRATION",
    QUESTION_ATTEMPT_REQUEST = "QUESTION_ATTEMPT_REQUEST",
    QUESTION_ATTEMPT_RESPONSE_SUCCESS = "QUESTION_ATTEMPT_RESPONSE_SUCCESS",
    QUESTION_ATTEMPT_RESPONSE_FAILURE = "QUESTION_ATTEMPT_RESPONSE_FAILURE",
    QUESTION_SET_CURRENT_ATTEMPT = "QUESTION_SET_CURRENT_ATTEMPT",

    TOPIC_REQUEST = "TOPIC_REQUEST",
    TOPIC_RESPONSE_SUCCESS = "TOPIC_RESPONSE_SUCCESS",
    TOPIC_RESPONSE_FAILURE = "TOPIC_RESPONSE_FAILURE",

    GAMEBOARD_REQUEST = "GAMEBOARD_REQUEST",
    GAMEBOARD_RESPONSE_SUCCESS = "GAMEBOARD_RESPONSE_SUCCESS",

    ASSIGNMENTS_REQUEST = "ASSIGNMENTS_REQUEST",
    ASSIGNMENTS_RESPONSE_SUCCESS = "ASSIGNMENTS_RESPONSE_SUCCESS",

    CONTENT_VERSION_GET_REQUEST = "CONTENT_VERSION_GET_REQUEST",
    CONTENT_VERSION_GET_RESPONSE_SUCCESS = "CONTENT_VERSION_GET_RESPONSE_SUCCESS",
    CONTENT_VERSION_GET_RESPONSE_FAILURE = "CONTENT_VERSION_GET_RESPONSE_FAILURE",

    CONTENT_VERSION_SET_REQUEST = "CONTENT_VERSION_SET_REQUEST",
    CONTENT_VERSION_SET_RESPONSE_SUCCESS = "CONTENT_VERSION_SET_RESPONSE_SUCCESS",
    CONTENT_VERSION_SET_RESPONSE_FAILURE = "CONTENT_VERSION_SET_RESPONSE_FAILURE",

    SEARCH_REQUEST = "SEARCH_REQUEST",
    SEARCH_RESPONSE_SUCCESS = "SEARCH_RESPONSE_SUCCESS",
}

export enum EXAM_BOARD {
    AQA = "AQA",
    OCR = "OCR"
}

export enum TAG_ID {
    // Categories
    theory = "theory",
    programming = "programming",

    // Theory sub-categories
    gcseToALevel = "gcse_to_a_level",
    dataStructuresAndAlgorithms = "data_structures_and_algorithms",
    computerNetworks = "computer_networks",
    computerSystems = "computer_systems",
    dataAndInformation = "data_and_information",
    // Programming sub-categories
    functionalProgramming = "functional_programming",
    objectOrientedProgramming = "object_oriented_programming",
    proceduralProgramming = "procedural_programming",

    // GCSE to A-Level transition topics
    gcseBooleanLogic = "gcse_boolean_logic",
    gcseProgrammingConcepts = "gcse_programming_concepts",
    gcseNetworking = "gcse_networking",
    gcseDataRepresentation = "gcse_data_representation",
    gcseSystems = "gcse_systems",
    // Data structures and algorithms topics
    searchingSortingPathfinding = "searching_sorting_pathfinding",
    complexity = "complexity",
    modelsOfComputation = "models_of_computation",
    planningAndDebugging = "planning_and_debugging",
    dataStructuresTheory = "data_structures_theory",
    // Computer networks topics
    security = "security",
    networkStructure = "network_structure",
    networkHardware = "network_hardware",
    communication = "communication",
    internet = "internet",
    // Computer systems topics
    booleanLogic = "boolean_logic",
    architecture = "architecture",
    hardware = "hardware",
    operatingSystemsAndSoftware = "operating_systems_and_software",
    translators = "translators",
    programmingLanguages = "programming_languages",
    // Data and information topics
    numberSystems = "number_systems",
    numberBases = "number_bases",
    representation = "representation",
    transmission = "transmission",
    databases = "databases",
    bigData = "big_data",
    compression = "compression",
    encryption = "encryption",

    // Functional programming topics
    functions = "functions",
    lists = "lists",
    higherOrderFunctions = "higher_order_functions",
    // Object oriented programming topics
    creatingObjects = "creating_objects",
    oopConcepts = "oop_concepts",
    classDiagrams = "class_diagrams",
    // Procedural programming topics
    programmingConcepts = "programming_concepts",
    subroutines = "subroutines",
    files = "files",
    structureAndRobustness = "structure_and_robustness",
    dataStructuresImplementation = "data_structures_implementation",
    recursion = "recursion",
    stringManipulation = "string_manipulation",
    guis = "guis",
    softwareEngineeringPrinciples = "software_engineering_principles",
    softwareProject = "software_project",
}

export enum TAG_LEVEL {
    category = "category",
    subcategory = "subcategory",
    topic = "topic",
}

export const TAG_HIERARCHY = [TAG_LEVEL.category, TAG_LEVEL.subcategory, TAG_LEVEL.topic];

export enum DOCUMENT_TYPE {
    CONCEPT = "isaacConceptPage",
    QUESTION = "isaacQuestionPage",
    GENERIC = "page",
    FRAGMENT = "isaacPageFragment",
    TOPIC_SUMMARY = "isaacTopicSummary"
}

export enum ContentVersionUpdatingStatus {
    UPDATING = "UPDATING",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE"
}
