// @ts-ignore
import {Remarkable} from "remarkable";
// @ts-ignore
import {linkify} from "remarkable/linkify";
import {BooleanNotation, NOT_FOUND_TYPE} from "../../IsaacAppTypes";
import {
    AuthenticationProvider,
    BookingStatus,
    ContentDTO,
    Difficulty,
    ExamBoard,
    IsaacFastTrackQuestionPageDTO,
    IsaacQuestionPageDTO,
    Stage,
    UserRole
} from "../../IsaacApiTypes";
import {siteSpecific} from "./";
import Plausible from "plausible-tracker";

export const STAGING_URL = siteSpecific(
    "https://staging.isaacphysics.org",
    "https://staging.adacomputerscience.org"
);

// eslint-disable-next-line no-undef
export const API_VERSION: string = REACT_APP_API_VERSION || "any";

/*
 * Configure the api provider with the server running the API:
 * No need if we want to use the same server as the static content.
 */
let apiPath = `${document.location.origin}/api/${API_VERSION}/api`;
if (document.location.hostname === "localhost") {
    apiPath = "http://localhost:8080/isaac-api/api";
} else if (EDITOR_PREVIEW) {
    apiPath = `${STAGING_URL}/api/any/api`;
} else if (document.location.hostname.endsWith(".eu.ngrok.io")) {
    apiPath = "https://isaacscience.eu.ngrok.io/isaac-api/api";
}
let imagePath = `${apiPath}/images`;
if (apiPath.indexOf(`/api/${API_VERSION}/api`) > -1) {
    // If the API contains a version number, use a special Nginx
    // route to allow better caching:
    imagePath = apiPath.replace(`/api/${API_VERSION}/api`, '/images');
}

export const isTest = document.location.hostname.startsWith("test.");
export const isStaging = document.location.hostname.startsWith("staging.");

// Helper function for selecting between values based on whether the site in live, test, staging or dev
export const envSpecific = <L, T, S, D>(live: L, test: T, staging: S, dev: D) => isTest ? test : (process.env.NODE_ENV === 'production' ? live : (isStaging ? staging : dev));

export const API_PATH: string = apiPath;
export const IMAGE_PATH: string = imagePath;

export const EDITOR_ORIGIN = siteSpecific(
    "https://editor.isaacphysics.org",
    "https://editor.adacomputerscience.org"
);

export const EDITOR_URL = EDITOR_ORIGIN + "/edit/master/";
export const EDITOR_COMPARE_URL = EDITOR_ORIGIN + "/compare";

export const { trackPageview, trackEvent } = Plausible(
    {
        apiHost: siteSpecific("https://plausible.isaacphysics.org", "https://plausible.adacomputerscience.org"),
    }
);

export const SOCIAL_LINKS = siteSpecific(
    {
        youtube: {name: "YouTube", href: "https://www.youtube.com/user/isaacphysics"},
        twitter: {name: "X (Twitter)", href: "https://twitter.com/isaacphysics"},
        facebook: {name: "Facebook", href: "https://www.facebook.com/isaacphysicsUK"},
    },
    {
        facebook: {name: "Facebook", href: "https://www.facebook.com/RaspberryPiFoundation"},
        twitter: {name: "X (Twitter)", href: "https://twitter.com/RaspberryPi_org"},
        instagram: {name: "Instagram", href: "https://www.instagram.com/raspberrypifoundation"},
        youtube: {name: "YouTube", href: "https://www.youtube.com/c/RaspberryPiFoundation"}
    }
);

// Change to "http://localhost:3000" if you want to run a local version of the code editor
export const CODE_EDITOR_BASE_URL = "https://code-editor.ada-cs.org";

export const API_REQUEST_FAILURE_MESSAGE = `There may be an error connecting to the ${siteSpecific("Isaac", "Ada")} platform.`;
export const QUESTION_ATTEMPT_THROTTLED_MESSAGE = "You have made too many attempts at this question. Please try again later!";

export const NOT_FOUND: NOT_FOUND_TYPE = 404;
export const NO_CONTENT = 204;

export const MARKDOWN_RENDERER = new Remarkable({
    html: true
}).use(linkify);

export enum ACTION_TYPE {
    TEST_ACTION = "TEST_ACTION",

    USER_SNAPSHOT_PARTIAL_UPDATE = "USER_SNAPSHOT_PARTIAL_UPDATE",

    USER_LOG_IN_REQUEST = "USER_LOG_IN_REQUEST",
    USER_LOG_IN_RESPONSE_SUCCESS = "USER_LOG_IN_RESPONSE_SUCCESS",
    USER_LOG_IN_RESPONSE_FAILURE = "USER_LOG_IN_RESPONSE_FAILURE",

    CURRENT_USER_REQUEST = "CURRENT_USER_REQUEST",
    CURRENT_USER_RESPONSE_SUCCESS = "CURRENT_USER_RESPONSE_SUCCESS",
    CURRENT_USER_RESPONSE_FAILURE = "CURRENT_USER_RESPONSE_FAILURE",

    USER_DETAILS_UPDATE_REQUEST = "USER_DETAILS_UPDATE",
    USER_DETAILS_UPDATE_RESPONSE_SUCCESS = "USER_DETAILS_UPDATE_RESPONSE_SUCCESS",
    USER_DETAILS_UPDATE_RESPONSE_FAILURE = "USER_DETAILS_UPDATE_RESPONSE_FAILURE",

    USER_AUTH_SETTINGS_REQUEST = "USER_AUTH_SETTINGS_REQUEST",
    USER_AUTH_SETTINGS_RESPONSE_SUCCESS = "USER_AUTH_SETTINGS_RESPONSE_SUCCESS",
    USER_AUTH_SETTINGS_RESPONSE_FAILURE = "USER_AUTH_SETTINGS_RESPONSE_FAILURE",

    SELECTED_USER_AUTH_SETTINGS_REQUEST = "SELECTED_USER_AUTH_SETTINGS_REQUEST",
    SELECTED_USER_AUTH_SETTINGS_RESPONSE_SUCCESS = "SELECTED_USER_AUTH_SETTINGS_REQUEST_SUCCESS",
    SELECTED_USER_AUTH_SETTINGS_RESPONSE_FAILURE = "SELECTED_USER_AUTH_SETTINGS_RESPONSE_FAILURE",

    USER_AUTH_LINK_REQUEST = "USER_AUTH_LINK_REQUEST",
    USER_AUTH_LINK_RESPONSE_SUCCESS = "USER_AUTH_LINK_RESPONSE_SUCCESS",
    USER_AUTH_LINK_RESPONSE_FAILURE = "USER_AUTH_LINK_RESPONSE_FAILURE",

    USER_AUTH_UNLINK_REQUEST = "USER_AUTH_UNLINK_REQUEST",
    USER_AUTH_UNLINK_RESPONSE_SUCCESS = "USER_AUTH_UNLINK_RESPONSE_SUCCESS",
    USER_AUTH_UNLINK_RESPONSE_FAILURE = "USER_AUTH_UNLINK_RESPONSE_FAILURE",

    USER_AUTH_MFA_CHALLENGE_REQUIRED = "USER_AUTH_MFA_CHALLENGE_REQUIRED",
    USER_AUTH_MFA_CHALLENGE_REQUEST  = "USER_AUTH_MFA_CHALLENGE_REQUEST",
    USER_AUTH_MFA_CHALLENGE_SUCCESS = "USER_AUTH_MFA_CHALLENGE_SUCCESS",
    USER_AUTH_MFA_CHALLENGE_FAILURE = "USER_AUTH_MFA_CHALLENGE_FAILURE",

    USER_PREFERENCES_REQUEST = "USER_PREFERENCES_REQUEST",
    USER_PREFERENCES_RESPONSE_SUCCESS= "USER_PREFERENCES_RESPONSE_SUCCESS",
    USER_PREFERENCES_RESPONSE_FAILURE = "USER_PREFERENCES_RESPONSE_FAILURE",

    USER_PASSWORD_RESET_REQUEST= "USER_PASSWORD_RESET_REQUEST",
    USER_PASSWORD_RESET_RESPONSE_SUCCESS ="USER_PASSWORD_RESET_RESPONSE_SUCCESS",
    USER_PASSWORD_RESET_RESPONSE_FAILURE = "USER_PASSWORD_RESET_RESPONSE_FAILURE",

    USER_INCOMING_PASSWORD_RESET_REQUEST = "USER_INCOMING_PASSWORD_RESET_REQUEST",
    USER_INCOMING_PASSWORD_RESET_SUCCESS = "USER_INCOMING_PASSWORD_RESET_SUCCESS",
    USER_INCOMING_PASSWORD_RESET_FAILURE = "USER_INCOMING_PASSWORD_RESET_FAILURE",

    USER_LOG_OUT_REQUEST = "USER_LOG_OUT_REQUEST",
    USER_LOG_OUT_RESPONSE_SUCCESS = "USER_LOG_OUT_RESPONSE_SUCCESS",
    USER_LOG_OUT_EVERYWHERE_REQUEST = "USER_LOG_OUT_EVERYWHERE_REQUEST",
    USER_LOG_OUT_EVERYWHERE_RESPONSE_SUCCESS = "USER_LOG_OUT_EVERYWHERE_RESPONSE_SUCCESS",

    MY_PROGRESS_REQUEST = "MY_PROGRESS_REQUEST",
    MY_PROGRESS_RESPONSE_SUCCESS = "MY_PROGRESS_RESPONSE_SUCCESS",
    MY_PROGRESS_RESPONSE_FAILURE = "MY_PROGRESS_RESPONSE_FAILURE",

    USER_PROGRESS_REQUEST = "USER_PROGRESS_REQUEST",
    USER_PROGRESS_RESPONSE_SUCCESS = "USER_PROGRESS_RESPONSE_SUCCESS",
    USER_PROGRESS_RESPONSE_FAILURE = "USER_PROGRESS_RESPONSE_FAILURE",

    USER_SNAPSHOT_REQUEST = "USER_SNAPSHOT_REQUEST",
    USER_SNAPSHOT_RESPONSE_SUCCESS = "USER_SNAPSHOT_RESPONSE_SUCCESS",
    USER_SNAPSHOT_RESPONSE_FAILURE = "USER_SNAPSHOT_RESPONSE_FAILURE",

    AUTHENTICATION_REQUEST_REDIRECT = "AUTHENTICATION_REQUEST_REDIRECT",
    AUTHENTICATION_REDIRECT = "AUTHENTICATION_REDIRECT",
    AUTHENTICATION_HANDLE_CALLBACK = "AUTHENTICATION_HANDLE_CALLBACK",

    USER_CONSISTENCY_ERROR = "USER_CONSISTENCY_ERROR",

    GROUP_GET_MEMBERSHIPS_REQUEST = "GROUP_GET_MEMBERSHIP_REQUEST",
    GROUP_GET_MEMBERSHIPS_RESPONSE_SUCCESS = "GROUP_GET_MEMBERSHIP_RESPONSE_SUCCESS",
    GROUP_GET_MEMBERSHIPS_RESPONSE_FAILURE = "GROUP_GET_MEMBERSHIP_RESPONSE_FAILURE",
    GROUP_CHANGE_MEMBERSHIP_STATUS_REQUEST = "GROUP_CHANGE_MEMBERSHIP_STATUS_REQUEST",
    GROUP_CHANGE_MEMBERSHIP_STATUS_RESPONSE_SUCCESS = "GROUP_CHANGE_MEMBERSHIP_STATUS_RESPONSE_SUCCESS",
    GROUP_CHANGE_MEMBERSHIP_STATUS_RESPONSE_FAILURE = "GROUP_CHANGE_MEMBERSHIP_STATUS_RESPONSE_FAILURE",

    NOTIFICATIONS_REQUEST = "NOTIFICATIONS_REQUEST",
    NOTIFICATIONS_RESPONSE_SUCCESS = "NOTIFICATIONS_RESPONSE_SUCCESS",
    NOTIFICATIONS_RESPONSE_FAILURE = "NOTIFICATIONS_RESPONSE_FAILURE",

    DOCUMENT_REQUEST = "DOCUMENT_REQUEST",
    DOCUMENT_RESPONSE_SUCCESS = "DOCUMENT_RESPONSE_SUCCESS",
    DOCUMENT_RESPONSE_FAILURE = "DOCUMENT_RESPONSE_FAILURE",

    GLOSSARY_TERMS_REQUEST = "GLOSSARY_TERMS_REQUEST",
    GLOSSARY_TERMS_RESPONSE_SUCCESS = "GLOSSARY_TERMS_RESPONSE_SUCCESS",
    GLOSSARY_TERMS_RESPONSE_FAILURE = "GLOSSARY_TERMS_RESPONSE_FAILURE",

    QUESTION_REGISTRATION = "QUESTION_REGISTRATION",
    QUESTION_DEREGISTRATION = "QUESTION_DEREGISTRATION",
    QUESTION_ATTEMPT_REQUEST = "QUESTION_ATTEMPT_REQUEST",
    QUESTION_ATTEMPT_RESPONSE_SUCCESS = "QUESTION_ATTEMPT_RESPONSE_SUCCESS",
    QUESTION_ATTEMPT_RESPONSE_FAILURE = "QUESTION_ATTEMPT_RESPONSE_FAILURE",
    QUESTION_UNLOCK = "QUESTION_UNLOCK",
    QUESTION_SET_CURRENT_ATTEMPT = "QUESTION_SET_CURRENT_ATTEMPT",

    QUESTION_SEARCH_REQUEST = "QUESTION_SEARCH_REQUEST",
    QUESTION_SEARCH_RESPONSE_SUCCESS = "QUESTION_SEARCH_RESPONSE_SUCCESS",
    QUESTION_SEARCH_RESPONSE_FAILURE = "QUESTION_SEARCH_RESPONSE_FAILURE",

    MY_QUESTION_ANSWERS_BY_DATE_REQUEST = "MY_QUESTION_ANSWERS_BY_DATE_REQUEST",
    MY_QUESTION_ANSWERS_BY_DATE_RESPONSE_SUCCESS = "MY_QUESTION_ANSWERS_BY_DATE_RESPONSE_SUCCESS",
    MY_QUESTION_ANSWERS_BY_DATE_RESPONSE_FAILURE = "MY_QUESTION_ANSWERS_BY_DATE_RESPONSE_FAILURE",

    USER_QUESTION_ANSWERS_BY_DATE_REQUEST = "USER_QUESTION_ANSWERS_BY_DATE_REQUEST",
    USER_QUESTION_ANSWERS_BY_DATE_RESPONSE_SUCCESS = "USER_QUESTION_ANSWERS_BY_DATE_RESPONSE_SUCCESS",
    USER_QUESTION_ANSWERS_BY_DATE_RESPONSE_FAILURE = "USER_QUESTION_ANSWERS_BY_DATE_RESPONSE_FAILURE",

    QUIZ_SUBMISSION_REQUEST = "QUIZ_SUBMISSION_REQUEST",
    QUIZ_SUBMISSION_RESPONSE_SUCCESS = "QUIZ_SUBMISSION_RESPONSE_SUCCESS",
    QUIZ_SUBMISSION_RESPONSE_FAILURE = "QUIZ_SUBMISSION_RESPONSE_FAILURE",

    TEST_QUESTION_REQUEST = "TEST_QUESTION_REQUEST",
    TEST_QUESTION_RESPONSE_SUCCESS = "TEST_QUESTION_RESPONSE_SUCCESS",
    TEST_QUESTION_RESPONSE_FAILURE = "TEST_QUESTION_RESPONSE_FAILURE",

    TOPIC_REQUEST = "TOPIC_REQUEST",
    TOPIC_RESPONSE_SUCCESS = "TOPIC_RESPONSE_SUCCESS",
    TOPIC_RESPONSE_FAILURE = "TOPIC_RESPONSE_FAILURE",

    SEARCH_REQUEST = "SEARCH_REQUEST",
    SEARCH_RESPONSE_SUCCESS = "SEARCH_RESPONSE_SUCCESS",

    TOASTS_SHOW = "TOASTS_SHOW",
    TOASTS_HIDE = "TOASTS_HIDE",
    TOASTS_REMOVE = "TOASTS_REMOVE",

    ACTIVE_MODAL_OPEN = "ACTIVE_MODAL_OPEN",
    ACTIVE_MODAL_CLOSE = "ACTIVE_MODAL_CLOSE",

    GROUPS_MEMBERS_RESET_PASSWORD_REQUEST = "GROUPS_MEMBERS_RESET_PASSWORD_REQUEST",
    GROUPS_MEMBERS_RESET_PASSWORD_RESPONSE_SUCCESS = "GROUPS_MEMBERS_RESET_PASSWORD_RESPONSE_SUCCESS",
    GROUPS_MEMBERS_RESET_PASSWORD_RESPONSE_FAILURE = "GROUPS_MEMBERS_RESET_PASSWORD_RESPONSE_FAILURE",

    CONCEPTS_REQUEST = "CONCEPTS_REQUEST",
    CONCEPTS_RESPONSE_SUCCESS = "CONCEPTS_RESPONSE_SUCCESS",
    CONCEPTS_RESPONSE_FAILURE = "CONCEPTS_RESPONSE_FAILURE",

    // Different ways of loading attempts, but ultimately either an attempt is loaded or it isn't
    QUIZ_LOAD_ASSIGNMENT_ATTEMPT_REQUEST = "QUIZ_LOAD_ASSIGNMENT_ATTEMPT_REQUEST",
    QUIZ_START_FREE_ATTEMPT_REQUEST = "QUIZ_START_FREE_ATTEMPT_REQUEST",
    QUIZ_LOAD_ATTEMPT_RESPONSE_SUCCESS = "QUIZ_LOAD_ATTEMPT_RESPONSE_SUCCESS",
    QUIZ_LOAD_ATTEMPT_RESPONSE_FAILURE = "QUIZ_LOAD_ATTEMPT_RESPONSE_FAILURE",
}

export enum PROGRAMMING_LANGUAGE {
    PSEUDOCODE = "PSEUDOCODE",
    JAVASCRIPT = "JAVASCRIPT",
    PYTHON = "PYTHON",
    PHP = "PHP",
    CSHARP = "CSHARP",
    HASKELL = "HASKELL",
    ASSEMBLY = "ASSEMBLY",
    PLAINTEXT = "PLAINTEXT",
    SQL = "SQL",
    JAVA = "JAVA",
    VBA = "VBA",
    NONE = "NONE",
}

export const programmingLanguagesMap: {[language: string]: string} = {
    [PROGRAMMING_LANGUAGE.PSEUDOCODE]: "Pseudocode",
    [PROGRAMMING_LANGUAGE.JAVASCRIPT]: "Javascript",
    [PROGRAMMING_LANGUAGE.PYTHON]: "Python",
    [PROGRAMMING_LANGUAGE.PHP]: "PHP",
    [PROGRAMMING_LANGUAGE.CSHARP]: "C#",
    [PROGRAMMING_LANGUAGE.ASSEMBLY]: "Assembly",
    [PROGRAMMING_LANGUAGE.HASKELL]: "Haskell",
    [PROGRAMMING_LANGUAGE.PLAINTEXT]: "plaintext",
    [PROGRAMMING_LANGUAGE.SQL]: "SQL",
    [PROGRAMMING_LANGUAGE.JAVA]: "Java",
    [PROGRAMMING_LANGUAGE.VBA]: "Visual Basic",
};

// STAGES
export enum STAGE {
    YEAR_7_AND_8 = "year_7_and_8",
    YEAR_9 = "year_9",
    GCSE = "gcse",
    A_LEVEL = "a_level",
    FURTHER_A = "further_a",
    UNIVERSITY = "university",
    SCOTLAND_NATIONAL_5 = "scotland_national_5",
    SCOTLAND_HIGHER = "scotland_higher",
    SCOTLAND_ADVANCED_HIGHER = "scotland_advanced_higher",
    ALL = "all",
}
export const STAGE_NULL_OPTIONS = [STAGE.ALL];
export const STAGES_PHY = [STAGE.YEAR_7_AND_8, STAGE.YEAR_9, STAGE.GCSE, STAGE.A_LEVEL, STAGE.FURTHER_A, STAGE.UNIVERSITY] as const;
export const STAGES_CS = [STAGE.GCSE, STAGE.A_LEVEL, STAGE.SCOTLAND_NATIONAL_5, STAGE.SCOTLAND_HIGHER, STAGE.SCOTLAND_ADVANCED_HIGHER] as const;
export const stagesOrdered: Stage[] = ["year_7_and_8", "year_9", "gcse", "a_level", "further_a", "university", "scotland_national_5", "scotland_higher", "scotland_advanced_higher", "all"];
export const stageLabelMap: {[stage in Stage]: string} = {
    year_7_and_8: "Year\u00A07&8",
    year_9: "Year\u00A09",
    gcse: "GCSE",
    a_level: "A\u00A0Level",
    further_a: "Further\u00A0A",
    university: "University",
    scotland_national_5: "National 5",
    scotland_higher: "Higher",
    scotland_advanced_higher: "Adv. Higher",
    all: "All stages",
};

// EXAM BOARDS
export enum EXAM_BOARD {
    AQA = "aqa",
    CIE = "cie",
    EDEXCEL = "edexcel",
    EDUQAS = "eduqas",
    OCR = "ocr",
    WJEC = "wjec",
    SQA = "sqa",
    ALL = "all",
}
export const examBoardLabelMap: {[examBoard in ExamBoard]: string} = {
    [EXAM_BOARD.AQA]: "AQA",
    [EXAM_BOARD.CIE]: "CIE",
    [EXAM_BOARD.EDEXCEL]: "EDEXCEL",
    [EXAM_BOARD.EDUQAS]: "EDUQAS",
    [EXAM_BOARD.OCR]: "OCR",
    [EXAM_BOARD.WJEC]: "WJEC",
    [EXAM_BOARD.SQA]: "SQA",
    [EXAM_BOARD.ALL]: "All exam boards",
};

export const CS_EXAM_BOARDS_BY_STAGE: {[stage in typeof STAGES_CS[number]]: ExamBoard[]} = {
    gcse: [EXAM_BOARD.AQA, EXAM_BOARD.EDEXCEL, EXAM_BOARD.EDUQAS, EXAM_BOARD.OCR, EXAM_BOARD.WJEC],
    a_level: [EXAM_BOARD.AQA, EXAM_BOARD.CIE, EXAM_BOARD.OCR, EXAM_BOARD.EDUQAS, EXAM_BOARD.WJEC],
    scotland_national_5: [EXAM_BOARD.SQA],
    scotland_higher: [EXAM_BOARD.SQA],
    scotland_advanced_higher: [EXAM_BOARD.SQA],
};

export const EXAM_BOARD_NULL_OPTIONS = [EXAM_BOARD.ALL];

export const EXAM_BOARD_ITEM_OPTIONS = Object.keys(EXAM_BOARD).map(s => ({value: s, label: examBoardLabelMap[s as EXAM_BOARD]}));

// BOOLEAN LOGIC NOTATION OPTIONS
export enum BOOLEAN_NOTATION {
    ENG = "ENG",
    MATH = "MATH"
}
export const EMPTY_BOOLEAN_NOTATION_RECORD: {[bn in BOOLEAN_NOTATION]: false} & BooleanNotation = {
    [BOOLEAN_NOTATION.ENG]: false, [BOOLEAN_NOTATION.MATH]: false
};
export const examBoardBooleanNotationMap: {[examBoard in ExamBoard]: BOOLEAN_NOTATION} = {
    [EXAM_BOARD.AQA]: BOOLEAN_NOTATION.ENG,
    [EXAM_BOARD.EDUQAS]: BOOLEAN_NOTATION.ENG,
    [EXAM_BOARD.WJEC]: BOOLEAN_NOTATION.ENG,
    [EXAM_BOARD.OCR]: BOOLEAN_NOTATION.MATH,
    [EXAM_BOARD.EDEXCEL]: BOOLEAN_NOTATION.MATH,
    [EXAM_BOARD.CIE]: BOOLEAN_NOTATION.ENG,
    [EXAM_BOARD.SQA]: BOOLEAN_NOTATION.MATH,
    [EXAM_BOARD.ALL]: BOOLEAN_NOTATION.MATH,
};
export const booleanNotationMap: {[notation: string]: string} = {
    [BOOLEAN_NOTATION.MATH]: "And (∧) Or (∨) Not (¬)",
    [BOOLEAN_NOTATION.ENG]: "And (·) Or (+) Not (bar)",
};

// DIFFICULTIES
export const difficultyShortLabelMap: {[difficulty in Difficulty]: string} = {
    practice_1: "P1",
    practice_2: "P2",
    practice_3: "P3",
    challenge_1: "C1",
    challenge_2: "C2",
    challenge_3: "C3",
};
export const difficultyLabelMap: {[difficulty in Difficulty]: string} = {
    practice_1: "Practice\u00A0(P1)",
    practice_2: "Practice\u00A0(P2)",
    practice_3: "Practice\u00A0(P3)",
    challenge_1: "Challenge\u00A0(C1)",
    challenge_2: "Challenge\u00A0(C2)",
    challenge_3: "Challenge\u00A0(C3)",
};
export const difficultyIconLabelMap: {[difficulty in Difficulty]: string} = {
    practice_1: `Practice (P1) ${siteSpecific("\u2B22\u2B21\u2B21", "\u25CF\u25CB")}`,
    practice_2: `Practice (P2) ${siteSpecific("\u2B22\u2B22\u2B21", "\u25CF\u25CF")}`,
    practice_3: "Practice (P3) \u2B22\u2B22\u2B22",
    challenge_1: `Challenge (C1) \u25A0\u25A1${siteSpecific("\u25A1", "")}`,
    challenge_2: `Challenge (C2) \u25A0\u25A0${siteSpecific("\u25A1", "")}`,
    challenge_3: "Challenge (C3) \u25A0\u25A0\u25A0",
};
export const difficultiesOrdered: Difficulty[] = siteSpecific(
    ["practice_1", "practice_2", "practice_3", "challenge_1", "challenge_2", "challenge_3"],
    ["practice_1", "practice_2", "challenge_1", "challenge_2"]
);
export const DIFFICULTY_ITEM_OPTIONS: {value: Difficulty, label: string}[] = difficultiesOrdered.map(d => (
    {value: d, label: difficultyLabelMap[d]}
));
export const DIFFICULTY_ICON_ITEM_OPTIONS: {value: Difficulty, label: string}[] = difficultiesOrdered.map(d => (
    {value: d, label: difficultyIconLabelMap[d]}
));

// QUESTION CATEGORIES
export enum QUESTION_CATEGORY {
    LEARN_AND_PRACTICE = "learn_and_practice", /* pseudo option */
    PROBLEM_SOLVING = "problem_solving",
    BOOK_QUESTIONS = "book",
    QUICK_QUIZ = "quick_quiz",
    TOPIC_TEST = "topic_test",
    MASTER_MATHS_AND_PHYSICS = "master_maths_and_physics",
}

export const QUESTION_CATEGORY_ITEM_OPTIONS = [
    {label: "Learn and Practice", value: QUESTION_CATEGORY.LEARN_AND_PRACTICE},
    {label: "Quick Quiz", value: QUESTION_CATEGORY.QUICK_QUIZ},
    // {label: "Topic Test", value: QUESTION_CATEGORY.TOPIC_TEST},
    // {label: "Master Maths/Physics", value: QUESTION_CATEGORY.MASTER_MATHS_AND_PHYSICS},
];

export enum SUBJECTS {
    PHYSICS = 'physics',
    MATHS = 'maths',
    CHEMISTRY = 'chemistry',
    BIOLOGY = 'biology',
    CS = 'computer_science'
}

export const fastTrackProgressEnabledBoards = [
    'ft_core_2017', 'ft_core_2018', 'ft_core_stage2',
    'ft_mech_year1_2018', 'ft_mech_year2_2018', 'ft_further_stage1_2018',
    'ft_further_stage2_2018',
];

export enum TAG_ID {
    // Ada ----
    // Categories
    computerScience = "computer_science",

    // Strands
    aiAndMachineLearning = "ai_and_machine_learning",
    dataStructuresAndAlgorithms = "data_structures_and_algorithms",
    computerSystems = "computer_systems",
    creatingMedia = "creating_media",
    dataAndInformation = "data_and_information",
    designAndDevelopment = "design_and_development",
    effectiveUseOfTools = "effective_use_of_tools",
    impactsOfDigitalTechnology = "impacts_of_digital_tech",
    computerNetworks = "computer_networks",
    programming = "programming",
    cyberSecurity = "cyber_security",
    theoryOfComputation = "theory_of_computation",

    // AI and machine learning topics
    artificialIntelligence = "artificial_intelligence",
    machineLearning = "machine_learning",

    // Algorithms and data structures topics
    complexity = "complexity",
    computationalThinking = "computational_thinking",
    dataStructures = "data_structures",
    pathfinding = "pathfinding",
    searching = "searching",
    sorting = "sorting",

    // Computing systems topics
    booleanLogic = "boolean_logic",
    compression = "compression",
    memoryAndStorage = "memory_and_storage",
    operatingSystems = "operating_systems",
    programmingLanguages = "programming_languages",
    numberRepresentation = "number_representation",
    textRepresentation = "text_representation",
    architecture = "architecture",
    translators = "translators",

    // Creating media topics
    imageRepresentation = "image_representation",
    soundRepresentation = "sound_representation",

    // Data and information topics
    bigData = "big_data",
    databases = "databases",
    fileOrganisation = "file_organisation",
    sql = "sql",

    // Design and development topics
    programDesign = "program_design",
    softwareEngineeringPrinciples = "software_engineering_principles",
    softwareProject = "software_project",
    testing = "testing",

    // Effective use of tools topics
    hardware = "hardware",
    software = "software",

    // Impacts of technology topics
    impactsOfTech = "impacts_of_tech",
    legislation = "legislation",

    // Networks topics
    communication = "communication",
    networking = "networking",
    theInternet = "the_internet",
    webTechnologies = "web_technologies",

    // Programming topics
    eventDrivenProgramming = "event_driven_programming",
    files = "files",
    functionalProgramming = "functional_programming",
    objectOrientedProgramming = "object_oriented_programming",
    proceduralProgramming = "procedural_programming",
    programmingConcepts = "programming_concepts",
    recursion = "recursion",
    stringHandling = "string_handling",
    subroutines = "subroutines",

    // Safety and security topics
    encryption = "encryption",
    maliciousCode = "malicious_code",
    security = "security",
    socialEngineering = "social_engineering",

    // Models of computation topics
    machinesWithMemory = "machines_with_memory",
    mathsForCs = "maths_for_cs",

    // Old tags ------
    // programmingParadigms = "programming_paradigms",
    // programmingFundamentals = "programming_fundamentals",
    // theoryOfComputation = "theory_of_computation",
    // declarativeProgramming = "declarative_programming",
    // networkHardware = "network_hardware",
    // ide = "ide",
    // gcseToALevel = "gcse_to_a_level",
    // gcseBooleanLogic = "gcse_boolean_logic",
    // gcseProgrammingConcepts = "gcse_programming_concepts",
    // gcseNetworking = "gcse_networking",
    // gcseSystems = "gcse_systems",
    // numberSystems = "number_systems",
    // mathsFunctions = "functions",
    // graphsForAi = "graphs_for_ai",
    // neuralNetworks = "neural_networks",
    // machineLearning = "machine_learning",
    // backpropagationAndRegression = "regression",


    // PHY ----

    // Subjects ---
    physics = "physics",
    maths = "maths",
    chemistry = "chemistry",
    biology = "biology",

    // Fields ---

    // Physics Fields
    mechanics = "mechanics",
    fields = "fields",
    thermal = "thermal",
    wavesParticles = "waves_particles",
    skills = "skills",
    electricity = "electricity",
    applications = "applications",
    // Chemistry Fields
    inorganic = "inorganic",
    physical = "physical",
    analytical = "analytical",
    foundations = "foundations",
    organic = "organic",
    // Maths Fields
    geometry = "geometry",
    algebra = "algebra",
    statistics = "statistics",
    functions = "functions",
    calculus = "calculus",
    number = "number",
    // Biology Fields
    biochemistry = "biochemistry",
    cellBiology = "cell_biology",
    ecology = "ecology",
    evolution = "evolution",
    genetics = "genetics",
    physiology = "physiology",

    // Physics Topics ---

    // Mechanics
    dynamics = "dynamics",
    circularMotion = "circular_motion",
    oscillations = "oscillations",
    statics = "statics",
    kinematics = "kinematics",
    materials = "materials",
    // Fields
    combined = "combined",
    electric = "electric",
    magnetic = "magnetic",
    gravitational = "gravitational",
    // Thermal
    gases = "gases",
    heatCapacity = "heat_capacity",
    // Waves & Particles
    nuclear = "nuclear",
    superposition = "superposition",
    optics = "optics",
    quantum = "quantum",
    waveMotion = "wave_motion",
    fundamental = "fundamental",
    // Skills
    units = "units",
    graphs = "graphs",
    uncertainties = "uncertainties",
    relationships = "relationships",
    prefixes = "prefixes",
    sigFigs = "sig_figs",
    // Electricity
    chargeCurrent = "charge_current",
    resistors = "resistors",
    components = "components",
    internalResistance = "internal_resistance",
    capacitors = "capacitors",
    power = "power",

    // Maths Topics ---

    // Number
    arithmetic = "arithmetic",
    rational = "rational",
    factors = "factors_powers",
    complexNumbers = "complex_numbers",
    // Geometry
    vectors = "vectors",
    shapes = "shapes",
    trigonometry = "trigonometry",
    planes = "planes",
    coordinates = "coordinates",
    // Algebra
    manipulation = "manipulation",
    quadratics = "quadratics",
    series = "series",
    simultaneous = "simultaneous",
    matrices = "matrices",
    // Statistics
    hypothesisTests = "hypothesis_tests",
    dataAnalysis = "data_analysis",
    randomVariables = "random_variables",
    probability = "probability",
    // Functions
    generalFunctions = "general_functions",
    graphSketching = "graph_sketching",
    // Calculus
    integration = "integration",
    differentiation = "differentiation",
    differentialEq = "differential_eq",

    // Chemistry Topics ---

    // Inorganic
    redox = "redox",
    bonding = "bonding",
    transitionMetals = "transition_metals",
    periodicTable = "periodic_table",
    // Physical
    energetics = "energetics",
    electrochemistry = "electrochemistry",
    equilibrium = "equilibrium",
    acidsAndBases = "acids_and_bases",
    entropy = "entropy",
    kinetics = "kinetics",
    // Analytical
    electronicSpectroscopy = "electronic_spectroscopy",
    nmrSpectroscopy = "nmr_spectroscopy",
    massSpectrometry = "mass_spectrometry",
    infraredSpectroscopy = "infrared_spectroscopy",
    chromatography = "chromatography",
    // Foundations
    stoichiometry = "stoichiometry",
    gasLaws = "gas_laws",
    numericalSkills = "numerical_skills",
    atomicStructure = "atomic_structure",
    // Organic
    functionalGroups = "functional_groups",
    aromaticity = "aromaticity",
    organicReactions = "organic_reactions",
    isomerism = "isomerism",
    aromaticReactions = "aromatic_reactions",
    polymers = "polymers",

    // Biology Topics ---

    // Cell biology
    cellStructure = "cell_structure",
    mitosis = "mitosis",
    meiosis = "meiosis",
    viruses = "viruses",
    membraneTransport = "membrane_transport",
    tissues = "tissues",
    // Biochemistry
    proteins = "proteins",
    carbohydrates = "carbohydrates",
    lipids = "lipids",
    respiration = "respiration",
    photosynthesis = "photosynthesis",
    // Genetics
    dnaReplication = "dna_replication",
    transcription = "transcription",
    translation = "translation",
    genesAndAlleles = "genes_alleles",
    inheritance = "inheritance",
    biotechnology = "biotechnology",
    // Physiology
    plants = "plants",
    breathingAndCirculation = "breathing_circulation",
    hormones = "hormones",
    digestionAndExcretion = "digestion_excretion",
    senseAndMovement = "sense_movement",
    diseaseAndImmunity = "disease_immunity",
    // Ecology
    populations = "populations",
    ecosystems = "ecosystems",
    nutrientCycles = "nutrient_cycles",
    biodiversity = "biodiversity",
    // Evolution
    variation = "variation",
    theory = "theory",
    phylogenetics = "phylogenetics",
}

export enum TAG_LEVEL {
    subject = "subject",
    field = "field",
    category = "category",
    subcategory = "subcategory",
    topic = "topic",
}

export enum DOCUMENT_TYPE {
    CONCEPT = "isaacConceptPage",
    QUESTION = "isaacQuestionPage",
    FAST_TRACK_QUESTION = "isaacFastTrackQuestionPage",
    EVENT = "isaacEventPage",
    TOPIC_SUMMARY = "isaacTopicSummaryPage",
    GENERIC = "page",
    QUIZ = "isaacQuiz",
}
export function isAQuestionLikeDoc(doc: ContentDTO): doc is IsaacQuestionPageDTO | IsaacFastTrackQuestionPageDTO {
    return doc.type === DOCUMENT_TYPE.QUESTION || doc.type === DOCUMENT_TYPE.FAST_TRACK_QUESTION;
}

export enum SEARCH_RESULT_TYPE {SHORTCUT = "shortcut"}

export const documentDescription: {[documentType in DOCUMENT_TYPE]: string} = {
    [DOCUMENT_TYPE.CONCEPT]: "Concepts",
    [DOCUMENT_TYPE.QUESTION]: "Questions",
    [DOCUMENT_TYPE.FAST_TRACK_QUESTION]: "Questions",
    [DOCUMENT_TYPE.EVENT]: "Events",
    [DOCUMENT_TYPE.TOPIC_SUMMARY]: "Topics",
    [DOCUMENT_TYPE.GENERIC]: "Other pages",
    [DOCUMENT_TYPE.QUIZ]: "Tests",
};

export const documentTypePathPrefix: {[documentType in DOCUMENT_TYPE]: string} = {
    [DOCUMENT_TYPE.GENERIC]: "pages",
    [DOCUMENT_TYPE.CONCEPT]: "concepts",
    [DOCUMENT_TYPE.QUESTION]: "questions",
    [DOCUMENT_TYPE.FAST_TRACK_QUESTION]: "questions",
    [DOCUMENT_TYPE.EVENT]: "events",
    [DOCUMENT_TYPE.TOPIC_SUMMARY]: "topics",
    [DOCUMENT_TYPE.QUIZ]: "quiz",
};

export enum MEMBERSHIP_STATUS {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
}

export enum ACCOUNT_TAB {account, customise, passwordreset, teacherconnections, emailpreferences, betafeatures}

export enum MANAGE_QUIZ_TAB {set = 1, manage = 2}
export enum MARKBOOK_TYPE_TAB {assignments = 1, tests = 2}

export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const HOME_CRUMB = {title: "Home", to: "/"};
export const ALL_TOPICS_CRUMB = {title: "All topics", to: "/topics"};
export const ADMIN_CRUMB = {title: "Admin", to: "/admin"};
export const EVENTS_CRUMB = {title: "Events", to: "/events"};
export const ASSIGNMENT_PROGRESS_CRUMB = siteSpecific(
    {title: "Assignment Progress", to: "/assignment_progress"},
    {title: "My markbook", to: "/my_markbook"}
);

export const UserFacingRole: {[role in UserRole]: string} = {
    ADMIN: "Admin",
    EVENT_MANAGER: "Event Manager",
    CONTENT_EDITOR: "Content Editor",
    EVENT_LEADER: "Event Leader",
    TEACHER: "Teacher",
    TUTOR: "Tutor",
    STUDENT: "Student"
};

export enum SortOrder {
    ASC = "ASC",
    DESC = "DESC",
    NONE = "NONE"
}

export const bookingStatusMap: {[status in BookingStatus]: string} = {
    "ABSENT": "Absent",
    "ATTENDED": "Attended",
    "CANCELLED": "Booking cancelled",
    "CONFIRMED": "Booking confirmed",
    "RESERVED": "Place reserved",
    "WAITING_LIST": "In waiting list"
};

export enum sortIcon {
    "sortable" = '⇕',
    "ascending" = '⇑',
    "descending" = '⇓'
}

export enum EventStatusFilter {
    "All events" = "all",
    "Upcoming events" = "upcoming",
    "My booked events" = "showBookedOnly",
    "My event reservations" = "showReservationsOnly"
}
export enum EventTypeFilter {
    "All events" = "all",
    "Student events" = "student",
    "Teacher events" = "teacher",
    "Online tutorials" = "virtual",
}

export enum EventStageFilter {
    "All stages" = "all",
    "GCSE" = "gcse",
    "A-Level" = "a_level",
    "Further A" = "further_a",
    "University" = "university"
}

export const GREEK_LETTERS_MAP: { [letter: string]: string } = {
    "alpha": "α",
    "beta": "β",
    "gamma": "γ",
    "delta": "δ",
    "epsilon": "ε",
    "varepsilon": "ε",
    "zeta": "ζ",
    "eta": "η",
    "theta": "θ",
    "iota": "ι",
    "kappa": "κ",
    "lambda": "λ",
    "mu": "μ",
    "nu": "ν",
    "xi": "ξ",
    "omicron": "ο",
    "pi": "π",
    "rho": "ρ",
    "sigma": "σ",
    "tau": "τ",
    "upsilon": "υ",
    "phi": "ϕ",
    "chi": "χ",
    "psi": "ψ",
    "omega": "ω",
    "Gamma": "Γ",
    "Delta": "Δ",
    "Theta": "Θ",
    "Lambda": "Λ",
    "Xi": "Ξ",
    "Pi": "Π",
    "Sigma": "Σ",
    "Upsilon": "Υ",
    "Phi": "Φ",
    "Psi": "Ψ",
    "Omega": "Ω",
};

const _REVERSE_GREEK_LETTERS_MAP: { [key: string]: string } = {};
for(const entry of Object.entries(GREEK_LETTERS_MAP)) {
    _REVERSE_GREEK_LETTERS_MAP[entry[1]] = entry[0];
}
// Use "epsilon" in textual and code representations, but "varepsilon" in LaTeX (because we use "\varepsilon" instead
// of "\epsilon" to display epsilon in LaTeX)
export const REVERSE_GREEK_LETTERS_MAP_PYTHON: { [key: string]: string } = {..._REVERSE_GREEK_LETTERS_MAP, "ε": "epsilon"};
export const REVERSE_GREEK_LETTERS_MAP_LATEX: { [key: string]: string } = {..._REVERSE_GREEK_LETTERS_MAP, "ε": "varepsilon"};


export const specificDoughnutColours: { [key: string]: string } = siteSpecific(
    {
        "Physics": "#944cbe",
        "Maths": "#007fa9",
        "Chemistry": "#e22e25",
        "Biology": "#005210",
        [difficultyLabelMap.practice_1]: "#509e2e",
        [difficultyLabelMap.practice_2]: "#3b6e25",
        [difficultyLabelMap.practice_3]: "#27421a",
        [difficultyLabelMap.challenge_1]: "#d68000",
        [difficultyLabelMap.challenge_2]: "#955a0f",
        [difficultyLabelMap.challenge_3]: "#764811"
    },
    {}
);

export const doughnutColours = siteSpecific(
    [
        "#944cbe",
        "#007fa9",
        "#e22e25",
        "#005210",
        "#991846",
        "#fea100"
    ],
    [
        "#870D5A",
        "#333333",
        "#0AFFE7",
        "#B9B9B9",
        "#FF4DC9",
        "#FFE672",
        "#EBEBEB"
    ]
);

export const progressColour = siteSpecific(
    '#509E2E',
    '#000000'
);

export const GRAY_120 = '#c9cad1';

export const SEARCH_CHAR_LENGTH_LIMIT = 255;

export const GAMEBOARD_UNDO_STACK_SIZE_LIMIT = 10;

export const QUESTION_FINDER_CONCEPT_LABEL_PLACEHOLDER = "Loading...";

export const FEATURED_NEWS_TAG = "featured";

export const PATHS = siteSpecific({
    ASSIGNMENT_PROGRESS: "/assignment_progress",
    MY_GAMEBOARDS: "/my_gameboards",
    MY_ASSIGNMENTS: "/assignments",
    QUESTION_FINDER: "/gameboards/new",
    GAMEBOARD: "/gameboards",
    SET_ASSIGNMENTS: "/set_assignments",
    GAMEBOARD_BUILDER: "/gameboard_builder",
    ADD_GAMEBOARD: "/add_gameboard",
    PREVIEW_TEST: "/test/preview",
}, {
    ASSIGNMENT_PROGRESS: "/my_markbook",
    MY_GAMEBOARDS: "/quizzes",
    MY_ASSIGNMENTS: "/assignments",
    QUESTION_FINDER: "/quizzes/new",
    GAMEBOARD: "/quizzes/view",
    SET_ASSIGNMENTS: "/quizzes/set",
    GAMEBOARD_BUILDER: "/quizzes/builder",
    ADD_GAMEBOARD: "/quizzes/add",
    PREVIEW_TEST: "/test/preview",
});

export const CLOZE_ITEM_SECTION_ID = "non-selected-items";
export const CLOZE_DROP_ZONE_ID_PREFIX = "drop-zone-";
// Matches: [drop-zone], [drop-zone|w-50], [drop-zone|h-50] or [drop-zone|w-50h-200]
export const dropZoneRegex = /\[drop-zone(?<params>\|(?<index>i-\d+?)?(?<width>w-\d+?)?(?<height>h-\d+?)?)?]/g;

export const inlineQuestionRegex = /\[inline-question:(?<id>.+)]/g;

export const AUTHENTICATOR_FRIENDLY_NAMES_MAP: {[key: string]: string} = {
    "RASPBERRYPI": "Raspberry Pi Foundation",
    "FACEBOOK": "Facebook",
    "TWITTER": "Twitter",
    "GOOGLE": "Google",
    "RAVEN": "Raven",
    "TEST": "Test",
    "SEGUE": "your email address and password"
};

export const AUTHENTICATOR_PROVIDERS : AuthenticationProvider[] = siteSpecific(["GOOGLE"], ["RASPBERRYPI", "GOOGLE"]);

export const QUIZ_VIEW_STUDENT_ANSWERS_RELEASE_TIMESTAMP = Date.UTC(2023, 5, 12); // 12th June 2023

export const EMAIL_PREFERENCE_DEFAULTS = siteSpecific(
    {
        ASSIGNMENTS: true,
        NEWS_AND_UPDATES: undefined,
        EVENTS: undefined
    },
    {
        ASSIGNMENTS: true,
        NEWS_AND_UPDATES: false,
        EVENTS: false
    }
);
