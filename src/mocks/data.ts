import {isDefined, siteSpecific} from "../app/services";
import {FEATURED_NEWS_TAG} from "../app/services";
import {DAYS_AGO, SOME_FIXED_FUTURE_DATE, SOME_FIXED_PAST_DATE} from "../test/dateUtils";
import {
    BookingStatus,
    CompletionState,
    ContentSummaryDTO,
    DetailedQuizSummaryDTO,
    EmailVerificationStatus,
    EventStatus,
    IsaacQuizDTO,
    QuizAttemptDTO,
    SearchResultsWrapper,
    USER_ROLES,
    UserRole,
    UserSummaryWithGroupMembershipDTO
} from "../IsaacApiTypes";
import {LoggedInUser, School} from "../IsaacAppTypes";
import {recordOf} from "./utils";

export const mockUser = {
    givenName: "Test",
    familyName: "Admin",
    email: "test-admin@test.com",
    dateOfBirth: new Date(777777777777),
    gender: "MALE",
    registrationDate: new Date(DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 100)),
    role: "ADMIN" as UserRole,
    schoolOther: "N/A",
    countryCode: "GB-SCT",
    registeredContexts: [
        {
            stage: "all",
            examBoard: "all"
        }
    ],
    registeredContextsLastConfirmed: new Date(DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -1)),
    firstLogin: false,
    lastUpdated: new Date(DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 1)),
    lastSeen: new Date(DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 1)),
    emailVerificationStatus: "VERIFIED" as EmailVerificationStatus,
    loggedIn: true,
    id: 1 as const
} satisfies LoggedInUser;

export const buildMockStudent = <T extends number>(id: T extends (typeof mockUser.id) ? `Student ID cannot be the same as the mockUser: ${typeof mockUser.id}` : T) => {
    if (id === mockUser.id) throw Error("A mock student cannot have the same ID as the mockUser");
    return {
        givenName: "Test",
        familyName: `Student ${id}`,
        email: `test-student-${id}@test.com`,
        dateOfBirth: 888888888888,
        gender: id as number % 2 === 0 ? "MALE" : "FEMALE",
        registrationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 50),
        role: "STUDENT",
        countryCode: "GB-SCT",
        schoolOther: "N/A",
        registeredContexts: [{
            stage: "all",
            examBoard: "all"
        }],
        registeredContextsLastConfirmed: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -1),
        firstLogin: false,
        lastUpdated: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 1),
        lastSeen: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 1),
        emailVerificationStatus: "VERIFIED",
        loggedIn: true,
        id: id,
    };
};

export const buildMockTeacher = <T extends number>(id: T extends (typeof mockUser.id) ? `Teacher ID cannot be the same as the mockUser: ${typeof mockUser.id}` : T) => {
    if (id === mockUser.id) throw Error("A mock teacher cannot have the same ID as the mockUser");
    return {
        givenName: "Test",
        familyName: `Teacher ${id}`,
        email: `test-teacher-${id}@test.com`,
        dateOfBirth: 888888888888,
        gender: id as number % 2 === 0 ? "MALE" : "FEMALE",
        registrationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 50),
        role: "TEACHER",
        schoolOther: "N/A",
        countryCode: "GB-SCT",
        registeredContexts: [{
            stage: "all",
            examBoard: "all"
        }],
        registeredContextsLastConfirmed: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -1),
        firstLogin: false,
        lastUpdated: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 1),
        lastSeen: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 1),
        emailVerificationStatus: "VERIFIED",
        loggedIn: true,
        id: id,
    };
};

export const buildMockUserSummary = (user: any, authorisedFullAccess: boolean) => {
    const email = user.role !== "STUDENT" || authorisedFullAccess ? user.email : undefined;
    return Object.assign({
        givenName: user.givenName,
        familyName: user.familyName,
        role: user.role,
        authorisedFullAccess,
        emailVerificationStatus: user.emailVerificationStatus,
        registeredContexts: user.registeredContexts,
        id: user.id
    }, email ? {email} : {});
};

export const buildMockUserSummaryWithGroupMembership = (user: any, groupId: number, authorisedFullAccess: boolean): UserSummaryWithGroupMembershipDTO => {
    const summary = buildMockUserSummary(user, authorisedFullAccess);
    return Object.assign(summary, {
        groupMembershipInformation: {
            userId: user.id,
            groupId,
            status: "ACTIVE" as const,
            updated: 888888888888 as unknown as Date,
            created: 888888888888 as unknown as Date
        }
    });
};

export const mockGameboards = {
    results: [
        {
            id: "test-gameboard-1",
            title: "Test Gameboard 1",
            contents: [
                {
                    id: "phys_linking_17_q1",
                    contentType: "isaacQuestionPage",
                    title: "Banked Tracks for Turning 17.1",
                    uri: "/isaac-api/api/pages/questions/phys_linking_17_q1",
                    tags: [
                        "circular_motion",
                        "book",
                        "physics",
                        "physics_linking_concepts",
                        "mechanics"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_2"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "phys_linking_17_q2",
                    contentType: "isaacQuestionPage",
                    title: "Banked Tracks for Turning 17.2",
                    uri: "/isaac-api/api/pages/questions/phys_linking_17_q2",
                    tags: [
                        "circular_motion",
                        "book",
                        "physics",
                        "physics_linking_concepts",
                        "mechanics"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_2"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                }
            ],
            wildCard: {
                id: "sig_figs_wildcard",
                title: "Significant Figures",
                type: "isaacWildcard",
                author: "mjc209",
                canonicalSourceFile: "content/wildcards/sig_figs.json",
                children: [],
                published: true,
                tags: [
                    "chemistry",
                    "maths",
                    "physics"
                ],
                description: "How to use significant figures",
                url: "/solving_problems#acc_solving_problems_sig_figs"
            },
            wildCardPosition: 0,
            creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
            gameFilter: {
                subjects: [
                    "physics"
                ],
                fields: [],
                topics: [],
                levels: [],
                stages: [],
                difficulties: [],
                examBoards: [],
                concepts: [],
                questionCategories: []
            },
            ownerId: mockUser.id,
            tags: [
                "ISAAC_BOARD"
            ],
            creationMethod: "BUILDER",
            percentageCompleted: 0,
            lastVisited: 1660052631495,
            startedQuestion: false,
            savedToCurrentUser: true
        },
        {
            id: "test-gameboard-2",
            title: "Test Gameboard 2",
            contents: [
                {
                    id: "phys19_a1_q1",
                    contentType: "isaacQuestionPage",
                    title: "Essential Pre-Uni Physics A1.1",
                    uri: "/isaac-api/api/pages/questions/phys19_a1_q1",
                    tags: [
                        "maths",
                        "book",
                        "physics_skills_19",
                        "algebra",
                        "manipulation"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "phys19_a1_q2",
                    contentType: "isaacQuestionPage",
                    title: "Essential Pre-Uni Physics A1.2",
                    uri: "/isaac-api/api/pages/questions/phys19_a1_q2",
                    tags: [
                        "maths",
                        "book",
                        "physics_skills_19",
                        "algebra",
                        "manipulation"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "phys19_a1_q3",
                    contentType: "isaacQuestionPage",
                    title: "Essential Pre-Uni Physics A1.3",
                    uri: "/isaac-api/api/pages/questions/phys19_a1_q3",
                    tags: [
                        "maths",
                        "book",
                        "physics_skills_19",
                        "algebra",
                        "manipulation"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "phys19_a1_q4",
                    contentType: "isaacQuestionPage",
                    title: "Essential Pre-Uni Physics A1.4",
                    uri: "/isaac-api/api/pages/questions/phys19_a1_q4",
                    tags: [
                        "maths",
                        "book",
                        "physics_skills_19",
                        "algebra",
                        "manipulation"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "phys19_a1_q5",
                    contentType: "isaacQuestionPage",
                    title: "Essential Pre-Uni Physics A1.5",
                    uri: "/isaac-api/api/pages/questions/phys19_a1_q5",
                    tags: [
                        "maths",
                        "book",
                        "physics_skills_19",
                        "algebra",
                        "manipulation"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                }
            ],
            wildCard: {
                id: "aboutUsWildCard",
                title: "About Us",
                type: "isaacWildcard",
                canonicalSourceFile: "content/wildcards/aboutUs.json",
                children: [],
                published: true,
                tags: [
                    "maths",
                    "physics"
                ],
                description: "Who created Isaac Physics?",
                url: "/about"
            },
            wildCardPosition: 0,
            creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
            gameFilter: {
                subjects: [
                    "maths"
                ],
                fields: [],
                topics: [],
                levels: [],
                stages: [],
                difficulties: [],
                examBoards: [],
                concepts: [],
                questionCategories: []
            },
            ownerId: mockUser.id,
            tags: [
                "ISAAC_BOARD"
            ],
            creationMethod: "BUILDER",
            percentageCompleted: 0,
            lastVisited: 1659431079763,
            startedQuestion: false,
            savedToCurrentUser: true
        },
        {
            id: "test-gameboard-3",
            title: "Test Gameboard 3",
            contents: [
                {
                    id: "gravitational_stability",
                    contentType: "isaacQuestionPage",
                    title: "Gravitational Stability",
                    uri: "/isaac-api/api/pages/questions/gravitational_stability",
                    tags: [
                        "physics",
                        "fields",
                        "gravitational"
                    ],
                    creationContext: {},
                    level: 6,
                    questionPartStates: []
                },
                {
                    id: "gcse_maths_ch3_15_q4",
                    contentType: "isaacQuestionPage",
                    title: "Essential GCSE Maths 15.4",
                    uri: "/isaac-api/api/pages/questions/gcse_maths_ch3_15_q4",
                    tags: [
                        "maths",
                        "book",
                        "maths_book_gcse",
                        "algebra",
                        "manipulation"
                    ],
                    audience: [
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "challenge_1"
                            ]
                        },
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "gcse_ch1_3_q2",
                    contentType: "isaacQuestionPage",
                    title: "Essential GCSE Physics  3.2",
                    uri: "/isaac-api/api/pages/questions/gcse_ch1_3_q2",
                    tags: [
                        "skills",
                        "relationships",
                        "phys_book_gcse",
                        "book",
                        "physics"
                    ],
                    audience: [
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_2"
                            ]
                        },
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "gcse_ch4_30_q16_es",
                    contentType: "isaacQuestionPage",
                    title: "Essential GCSE Physics 30.16",
                    uri: "/isaac-api/api/pages/questions/gcse_ch4_30_q16_es",
                    tags: [
                        "phys_book_gcse",
                        "physics",
                        "book"
                    ],
                    audience: [
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "challenge_2"
                            ]
                        },
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_2"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "gcse_ch3_26_q8_es",
                    contentType: "isaacQuestionPage",
                    title: "Essential GCSE Physics 26.8",
                    uri: "/isaac-api/api/pages/questions/gcse_ch3_26_q8_es",
                    tags: [
                        "phys_book_gcse",
                        "physics",
                        "book"
                    ],
                    audience: [
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "year_9"
                            ],
                            difficulty: [
                                "challenge_2"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "gcse_ch1_5_q3",
                    contentType: "isaacQuestionPage",
                    title: "Skills - Variables and Constants 5.3",
                    uri: "/isaac-api/api/pages/questions/gcse_ch1_5_q3",
                    tags: [
                        "phys_book_gcse",
                        "physics",
                        "thermal",
                        "gases"
                    ],
                    audience: [
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_2"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "gcse_ch2_8_q7_es",
                    contentType: "isaacQuestionPage",
                    title: "Essential GCSE Physics  8.7",
                    uri: "/isaac-api/api/pages/questions/gcse_ch2_8_q7_es",
                    tags: [
                        "phys_book_gcse",
                        "physics",
                        "book"
                    ],
                    audience: [
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "year_7_and_8"
                            ],
                            difficulty: [
                                "challenge_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "manipulation_4_4",
                    contentType: "isaacQuestionPage",
                    title: "Algebraic Manipulation 4.4",
                    uri: "/isaac-api/api/pages/questions/manipulation_4_4",
                    tags: [
                        "maths",
                        "problem_solving",
                        "algebra",
                        "manipulation"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "challenge_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 4,
                    questionPartStates: []
                },
                {
                    id: "step_up_39_q9",
                    contentType: "isaacQuestionPage",
                    title: "Step up to GCSE Electricity Calculation Practice 39.9",
                    uri: "/isaac-api/api/pages/questions/step_up_39_q9",
                    tags: [
                        "resistors",
                        "book",
                        "physics",
                        "electricity",
                        "phys_book_step_up"
                    ],
                    audience: [
                        {
                            stage: [
                                "year_9"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "gcse_ch6_52_q3",
                    contentType: "isaacQuestionPage",
                    title: "Essential GCSE Physics 52.3",
                    uri: "/isaac-api/api/pages/questions/gcse_ch6_52_q3",
                    tags: [
                        "phys_book_gcse",
                        "book",
                        "physics",
                        "waves_particles",
                        "nuclear"
                    ],
                    audience: [
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                }
            ],
            wildCard: {
                id: "wildcard_mentor_scheme",
                title: "Mentoring",
                type: "isaacWildcard",
                author: "allydavies",
                canonicalSourceFile: "content/wildcards/mentor_scheme.json",
                children: [],
                published: true,
                tags: [
                    "maths",
                    "physics"
                ],
                description: "Isaac Mentor Scheme",
                url: "/pages/isaac_mentor"
            },
            wildCardPosition: 7,
            creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
            gameFilter: {
                subjects: [
                    "physics",
                    "maths"
                ]
            },
            ownerId: mockUser.id,
            tags: [],
            creationMethod: "FILTER",
            percentageCompleted: 0,
            lastVisited: 1659430575676,
            startedQuestion: false,
            savedToCurrentUser: true
        },
        {
            id: "test-gameboard-4",
            title: "Test Gameboard 4",
            contents: [
                {
                    id: "integration_3_3",
                    contentType: "isaacQuestionPage",
                    title: "Indefinite Integrals 2",
                    uri: "/isaac-api/api/pages/questions/integration_3_3",
                    tags: [
                        "maths_book",
                        "maths",
                        "problem_solving",
                        "integration",
                        "calculus"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_2"
                            ]
                        },
                        {
                            stage: [
                                "further_a"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 3,
                    questionPartStates: []
                },
                {
                    id: "int_substitution9",
                    contentType: "isaacQuestionPage",
                    title: "Test Gameboard 4 by Substitution 9",
                    uri: "/isaac-api/api/pages/questions/int_substitution9",
                    tags: [
                        "maths",
                        "problem_solving",
                        "integration",
                        "calculus"
                    ],
                    audience: [
                        {
                            stage: [
                                "further_a"
                            ],
                            difficulty: [
                                "challenge_1"
                            ]
                        },
                        {
                            stage: [
                                "university"
                            ],
                            difficulty: [
                                "challenge_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 6,
                    questionPartStates: []
                },
                {
                    id: "int_substitution2",
                    contentType: "isaacQuestionPage",
                    title: "Test Gameboard 4 by Substitution 2",
                    uri: "/isaac-api/api/pages/questions/int_substitution2",
                    tags: [
                        "maths_book",
                        "maths",
                        "problem_solving",
                        "integration",
                        "calculus"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_3"
                            ]
                        },
                        {
                            stage: [
                                "further_a"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 5,
                    questionPartStates: []
                },
                {
                    id: "int_trig_identity1",
                    contentType: "isaacQuestionPage",
                    title: "Test Gameboard 4 Using Trig Identities 1",
                    uri: "/isaac-api/api/pages/questions/int_trig_identity1",
                    tags: [
                        "maths_book",
                        "maths",
                        "problem_solving",
                        "integration",
                        "calculus"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_3"
                            ]
                        },
                        {
                            stage: [
                                "further_a"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 5,
                    questionPartStates: []
                },
                {
                    id: "int_exponentials2",
                    contentType: "isaacQuestionPage",
                    title: "Integrating Exponentials 2",
                    uri: "/isaac-api/api/pages/questions/int_exponentials2",
                    tags: [
                        "maths_book",
                        "maths",
                        "problem_solving",
                        "integration",
                        "calculus"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_3"
                            ]
                        },
                        {
                            stage: [
                                "further_a"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 4,
                    questionPartStates: []
                },
                {
                    id: "integration_3_8",
                    contentType: "isaacQuestionPage",
                    title: "Definite Integrals 1",
                    uri: "/isaac-api/api/pages/questions/integration_3_8",
                    tags: [
                        "maths_book",
                        "maths",
                        "problem_solving",
                        "integration",
                        "calculus"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_2"
                            ]
                        },
                        {
                            stage: [
                                "further_a"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 3,
                    questionPartStates: []
                },
                {
                    id: "integration_3_9",
                    contentType: "isaacQuestionPage",
                    title: "Definite Integrals 2",
                    uri: "/isaac-api/api/pages/questions/integration_3_9",
                    tags: [
                        "maths_book",
                        "maths",
                        "problem_solving",
                        "integration",
                        "calculus"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_2"
                            ]
                        },
                        {
                            stage: [
                                "further_a"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 3,
                    questionPartStates: []
                },
                {
                    id: "int_trig2",
                    contentType: "isaacQuestionPage",
                    title: "Integrating Trig 2",
                    uri: "/isaac-api/api/pages/questions/int_trig2",
                    tags: [
                        "maths_book",
                        "maths",
                        "problem_solving",
                        "integration",
                        "calculus"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_3"
                            ]
                        },
                        {
                            stage: [
                                "further_a"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 4,
                    questionPartStates: []
                },
                {
                    id: "partial_fraction",
                    contentType: "isaacQuestionPage",
                    title: "Test Gameboard 4 Using Partial Fractions",
                    uri: "/isaac-api/api/pages/questions/partial_fraction",
                    tags: [
                        "maths_book",
                        "maths",
                        "problem_solving",
                        "integration",
                        "calculus"
                    ],
                    audience: [
                        {
                            stage: [
                                "further_a"
                            ],
                            difficulty: [
                                "practice_2"
                            ]
                        },
                        {
                            stage: [
                                "university"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 6,
                    questionPartStates: []
                },
                {
                    id: "integration_3_6",
                    contentType: "isaacQuestionPage",
                    title: "Area Under a Curve 2",
                    uri: "/isaac-api/api/pages/questions/integration_3_6",
                    tags: [
                        "maths_book",
                        "maths",
                        "problem_solving",
                        "integration",
                        "calculus"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "challenge_1"
                            ]
                        },
                        {
                            stage: [
                                "further_a"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 3,
                    questionPartStates: []
                }
            ],
            wildCard: {
                id: "wildcard_mentor_scheme",
                title: "Mentoring",
                type: "isaacWildcard",
                author: "allydavies",
                canonicalSourceFile: "content/wildcards/mentor_scheme.json",
                children: [],
                published: true,
                tags: [
                    "maths",
                    "physics"
                ],
                description: "Isaac Mentor Scheme",
                url: "/pages/isaac_mentor"
            },
            wildCardPosition: 0,
            creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
            gameFilter: {
                subjects: [
                    "maths"
                ],
                fields: [
                    "calculus"
                ],
                topics: [
                    "integration"
                ],
                questionCategories: [
                    "quick_quiz",
                    "problem_solving",
                    "book"
                ]
            },
            ownerId: mockUser.id,
            tags: [],
            creationMethod: "FILTER",
            percentageCompleted: 0,
            lastVisited: 1643730257083,
            startedQuestion: false,
            savedToCurrentUser: true
        },
        {
            id: "test-gameboard-5",
            title: "Test Gameboard 5",
            contents: [
                {
                    id: "momentum_quiz_b",
                    contentType: "isaacQuestionPage",
                    title: "Momentum Quiz B",
                    uri: "/isaac-api/api/pages/questions/momentum_quiz_b",
                    tags: [
                        "dynamics",
                        "physics",
                        "mechanics",
                        "quick_quiz"
                    ],
                    audience: [
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_2"
                            ]
                        },
                        {
                            stage: [
                                "year_9"
                            ],
                            difficulty: [
                                "practice_3"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "spring_pick_up_num",
                    contentType: "isaacQuestionPage",
                    title: "Spring Pick-up",
                    uri: "/isaac-api/api/pages/questions/spring_pick_up_num",
                    tags: [
                        "physics",
                        "problem_solving",
                        "mechanics",
                        "oscillations"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "challenge_3"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 6,
                    questionPartStates: []
                },
                {
                    id: "gcse_ch2_14_q7",
                    contentType: "isaacQuestionPage",
                    title: "Essential GCSE Physics 14.7",
                    uri: "/isaac-api/api/pages/questions/gcse_ch2_14_q7",
                    tags: [
                        "dynamics",
                        "phys_book_gcse",
                        "book",
                        "physics",
                        "mechanics"
                    ],
                    audience: [
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "challenge_2"
                            ]
                        },
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "lifting_rod",
                    contentType: "isaacQuestionPage",
                    title: "Lifting a Rod",
                    uri: "/isaac-api/api/pages/questions/lifting_rod",
                    tags: [
                        "dynamics",
                        "physics",
                        "problem_solving",
                        "mechanics"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "challenge_2"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 5,
                    questionPartStates: []
                },
                {
                    id: "tug_war",
                    contentType: "isaacQuestionPage",
                    title: "Rotational Tug of War",
                    uri: "/isaac-api/api/pages/questions/tug_war",
                    tags: [
                        "circular_motion",
                        "physics",
                        "problem_solving",
                        "mechanics"
                    ],
                    audience: [
                        {
                            stage: [
                                "further_a"
                            ],
                            difficulty: [
                                "challenge_2"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 5,
                    questionPartStates: []
                },
                {
                    id: "gcse_ch2_9_q3",
                    contentType: "isaacQuestionPage",
                    title: "Essential GCSE Physics  9.3",
                    uri: "/isaac-api/api/pages/questions/gcse_ch2_9_q3",
                    tags: [
                        "dynamics",
                        "phys_book_gcse",
                        "book",
                        "physics",
                        "mechanics"
                    ],
                    audience: [
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_2"
                            ]
                        },
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "phys19_b1_q9",
                    contentType: "isaacQuestionPage",
                    title: "Essential Pre-Uni Physics B1.9",
                    uri: "/isaac-api/api/pages/questions/phys19_b1_q9",
                    tags: [
                        "dynamics",
                        "book",
                        "physics",
                        "physics_skills_19",
                        "mechanics"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "challenge_1"
                            ]
                        },
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "challenge_3"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "phys19_b6_q9",
                    contentType: "isaacQuestionPage",
                    title: "Essential Pre-Uni Physics B6.9",
                    uri: "/isaac-api/api/pages/questions/phys19_b6_q9",
                    tags: [
                        "materials",
                        "book",
                        "physics",
                        "physics_skills_19",
                        "mechanics"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "weigh_sea",
                    contentType: "isaacQuestionPage",
                    title: "Weighing at Sea",
                    uri: "/isaac-api/api/pages/questions/weigh_sea",
                    tags: [
                        "physics",
                        "problem_solving",
                        "mechanics",
                        "oscillations"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "challenge_2"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 4,
                    questionPartStates: []
                },
                {
                    id: "gcse_ch2_13_q2",
                    contentType: "isaacQuestionPage",
                    title: "Essential GCSE Physics 13.2",
                    uri: "/isaac-api/api/pages/questions/gcse_ch2_13_q2",
                    tags: [
                        "dynamics",
                        "phys_book_gcse",
                        "book",
                        "physics",
                        "mechanics"
                    ],
                    audience: [
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                }
            ],
            wildCard: {
                id: "equation_editor_help",
                title: "Equation Editor Help",
                type: "isaacWildcard",
                author: "bh412",
                canonicalSourceFile: "content/wildcards/equation_editor_help.json",
                children: [],
                published: true,
                tags: [
                    "maths",
                    "physics"
                ],
                description: "Help using our equation editor",
                url: "/pages/eqn_editor_help"
            },
            wildCardPosition: 4,
            creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
            gameFilter: {
                subjects: [
                    "physics"
                ],
                fields: [
                    "mechanics"
                ],
                questionCategories: [
                    "quick_quiz",
                    "problem_solving",
                    "book"
                ]
            },
            ownerId: mockUser.id,
            tags: [],
            creationMethod: "FILTER",
            percentageCompleted: 0,
            lastVisited: 1643729846732,
            startedQuestion: false,
            savedToCurrentUser: true
        },
        {
            id: "test-gameboard-6",
            title: "Test Gameboard 6",
            contents: [
                {
                    id: "gcse_ch2_19_q8",
                    contentType: "isaacQuestionPage",
                    title: "Essential GCSE Physics 19.8",
                    uri: "/isaac-api/api/pages/questions/gcse_ch2_19_q8",
                    tags: [
                        "dynamics",
                        "phys_book_gcse",
                        "book",
                        "physics",
                        "mechanics"
                    ],
                    audience: [
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "challenge_2"
                            ]
                        },
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "practice_2",
                            "challenge_2"
                        ]
                    },
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "gcse_ch1_3_q8_es",
                    contentType: "isaacQuestionPage",
                    title: "Essential GCSE Physics  3.8",
                    uri: "/isaac-api/api/pages/questions/gcse_ch1_3_q8_es",
                    tags: [
                        "phys_book_gcse",
                        "physics",
                        "book"
                    ],
                    audience: [
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_2"
                            ]
                        },
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "practice_2",
                            "challenge_2"
                        ]
                    },
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "chem_16_b3_4",
                    contentType: "isaacQuestionPage",
                    title: "Essential Pre-Uni Chemistry B3.4",
                    uri: "/isaac-api/api/pages/questions/chem_16_b3_4",
                    tags: [
                        "chemistry",
                        "chemistry_16",
                        "stoichiometry",
                        "book",
                        "foundations"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "challenge_2"
                            ]
                        }
                    ],
                    creationContext: {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "practice_2",
                            "challenge_2"
                        ]
                    },
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "gcse_ch2_19_q11_es",
                    contentType: "isaacQuestionPage",
                    title: "Essential GCSE Physics 19.11",
                    uri: "/isaac-api/api/pages/questions/gcse_ch2_19_q11_es",
                    tags: [
                        "phys_book_gcse",
                        "physics",
                        "book"
                    ],
                    audience: [
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_2"
                            ]
                        },
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "practice_2",
                            "challenge_2"
                        ]
                    },
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "gcse_ch7_59_q4_es",
                    contentType: "isaacQuestionPage",
                    title: "Essential GCSE Physics 59.4",
                    uri: "/isaac-api/api/pages/questions/gcse_ch7_59_q4_es",
                    tags: [
                        "phys_book_gcse",
                        "physics",
                        "book"
                    ],
                    audience: [
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_2"
                            ]
                        },
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_2"
                            ]
                        }
                    ],
                    creationContext: {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "practice_2",
                            "challenge_2"
                        ]
                    },
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "gcse_ch2_14_q7_es",
                    contentType: "isaacQuestionPage",
                    title: "Essential GCSE Physics 14.7",
                    uri: "/isaac-api/api/pages/questions/gcse_ch2_14_q7_es",
                    tags: [
                        "phys_book_gcse",
                        "physics",
                        "book"
                    ],
                    audience: [
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "challenge_2"
                            ]
                        },
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "practice_2",
                            "challenge_2"
                        ]
                    },
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "momentum_quiz_a",
                    contentType: "isaacQuestionPage",
                    title: "Momentum Quiz A",
                    uri: "/isaac-api/api/pages/questions/momentum_quiz_a",
                    tags: [
                        "dynamics",
                        "physics",
                        "mechanics",
                        "quick_quiz"
                    ],
                    audience: [
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_2"
                            ]
                        },
                        {
                            stage: [
                                "year_9"
                            ],
                            difficulty: [
                                "practice_3"
                            ]
                        }
                    ],
                    creationContext: {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "practice_2",
                            "challenge_2"
                        ]
                    },
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "phys19_a7_q5",
                    contentType: "isaacQuestionPage",
                    title: "Essential Pre-Uni Physics A7.5",
                    uri: "/isaac-api/api/pages/questions/phys19_a7_q5",
                    tags: [
                        "skills",
                        "graphs",
                        "book",
                        "physics",
                        "physics_skills_19"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "challenge_1"
                            ]
                        },
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "challenge_2"
                            ]
                        }
                    ],
                    creationContext: {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "practice_2",
                            "challenge_2"
                        ]
                    },
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "gcse_ch6_58_q1",
                    contentType: "isaacQuestionPage",
                    title: "Essential GCSE Physics 58.1",
                    uri: "/isaac-api/api/pages/questions/gcse_ch6_58_q1",
                    tags: [
                        "phys_book_gcse",
                        "book",
                        "physics",
                        "waves_particles",
                        "nuclear"
                    ],
                    audience: [
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "challenge_2"
                            ]
                        },
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_2"
                            ]
                        }
                    ],
                    creationContext: {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "practice_2",
                            "challenge_2"
                        ]
                    },
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "value_units_Efield",
                    contentType: "isaacQuestionPage",
                    title: "Breakdown Field Strength",
                    uri: "/isaac-api/api/pages/questions/value_units_Efield",
                    tags: [
                        "maths",
                        "problem_solving",
                        "algebra",
                        "manipulation"
                    ],
                    audience: [
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_2"
                            ]
                        },
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "practice_2",
                            "challenge_2"
                        ]
                    },
                    level: 1,
                    questionPartStates: []
                }
            ],
            wildCard: {
                id: "wildcard_mentor_scheme",
                title: "Mentoring",
                type: "isaacWildcard",
                author: "allydavies",
                canonicalSourceFile: "content/wildcards/mentor_scheme.json",
                children: [],
                published: true,
                tags: [
                    "maths",
                    "physics"
                ],
                description: "Isaac Mentor Scheme",
                url: "/pages/isaac_mentor"
            },
            wildCardPosition: 5,
            creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
            gameFilter: {
                subjects: [
                    "physics",
                    "maths",
                    "chemistry"
                ],
                stages: [
                    "gcse"
                ],
                difficulties: [
                    "practice_2",
                    "challenge_2"
                ],
                questionCategories: [
                    "quick_quiz",
                    "problem_solving",
                    "book"
                ]
            },
            ownerId: mockUser.id,
            tags: [],
            creationMethod: "FILTER",
            percentageCompleted: 0,
            lastVisited: 1638804925183,
            startedQuestion: false,
            savedToCurrentUser: true
        },
        {
            id: "test-gameboard-7",
            title: "Test Gameboard 7",
            contents: [
                {
                    id: "chem_16_d4_1",
                    contentType: "isaacQuestionPage",
                    title: "Essential Pre-Uni Chemistry D4.1",
                    uri: "/isaac-api/api/pages/questions/chem_16_d4_1",
                    tags: [
                        "chemistry",
                        "chemistry_16",
                        "book",
                        "foundations",
                        "atomic_structure"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "chem_16_d4_2",
                    contentType: "isaacQuestionPage",
                    title: "Essential Pre-Uni Chemistry D4.2",
                    uri: "/isaac-api/api/pages/questions/chem_16_d4_2",
                    tags: [
                        "chemistry",
                        "chemistry_16",
                        "book",
                        "foundations",
                        "atomic_structure"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "chem_21_d4_3",
                    contentType: "isaacQuestionPage",
                    title: "Essential Pre-Uni Chemistry D4.3",
                    uri: "/isaac-api/api/pages/questions/chem_21_d4_3",
                    tags: [
                        "chemistry",
                        "chemistry_16",
                        "book",
                        "foundations",
                        "atomic_structure"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "challenge_2"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "electron_configurations_d1_1",
                    contentType: "isaacQuestionPage",
                    title: "Electron Configurations (D1.1)",
                    uri: "/isaac-api/api/pages/questions/electron_configurations_d1_1",
                    tags: [
                        "chemistry",
                        "problem_solving",
                        "foundations",
                        "atomic_structure"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "electron_configurations_d1_4",
                    contentType: "isaacQuestionPage",
                    title: "Electron Configurations (D1.4)",
                    uri: "/isaac-api/api/pages/questions/electron_configurations_d1_4",
                    tags: [
                        "chemistry",
                        "problem_solving",
                        "foundations",
                        "atomic_structure"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "chem_21_d1_7",
                    contentType: "isaacQuestionPage",
                    title: "Essential Pre-Uni Chemistry D1.7",
                    uri: "/isaac-api/api/pages/questions/chem_21_d1_7",
                    tags: [
                        "chemistry",
                        "chemistry_16",
                        "book",
                        "foundations",
                        "atomic_structure"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "chem_16_d1_8",
                    contentType: "isaacQuestionPage",
                    title: "Essential Pre-Uni Chemistry D1.8",
                    uri: "/isaac-api/api/pages/questions/chem_16_d1_8",
                    tags: [
                        "chemistry",
                        "chemistry_16",
                        "book",
                        "foundations",
                        "atomic_structure"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_2"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "electron_configuration",
                    contentType: "isaacQuestionPage",
                    title: "Electron Configuration",
                    uri: "/isaac-api/api/pages/questions/electron_configuration",
                    tags: [
                        "chemistry",
                        "problem_solving",
                        "foundations",
                        "atomic_structure"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartStates: []
                },
                {
                    id: "periodic_table",
                    contentType: "isaacQuestionPage",
                    title: "Periodic Table",
                    uri: "/isaac-api/api/pages/questions/periodic_table",
                    tags: [
                        "chemistry",
                        "problem_solving",
                        "foundations",
                        "atomic_structure"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    questionPartStates: []
                }
            ],
            wildCard: {
                id: "rsc_periodic_table",
                title: "Periodic Table",
                type: "isaacWildcard",
                author: "nh357",
                children: [],
                published: true,
                tags: [
                    "chemistry"
                ],
                description: "Explore the elements",
                url: "http://www.rsc.org/periodic-table"
            },
            wildCardPosition: 1,
            creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
            gameFilter: {
                subjects: [
                    "chemistry"
                ],
                fields: [],
                topics: [],
                levels: [],
                stages: [
                    "a_level"
                ],
                difficulties: [],
                examBoards: [],
                questionCategories: []
            },
            ownerId: mockUser.id,
            tags: [
                "ISAAC_BOARD"
            ],
            creationMethod: "BUILDER",
            percentageCompleted: 0,
            lastVisited: 1636111693926,
            startedQuestion: false,
            savedToCurrentUser: true
        }
    ],
    totalNotStarted: 7,
    totalInProgress: 0,
    totalCompleted: 0,
    totalResults: 7
};

export const mockGameboardsShort = {
    results: mockGameboards.results.slice(0, 6),
    totalResults: 6,
};

export const mockRubrics = recordOf<string, DetailedQuizSummaryDTO>()({
    a_level_1d_motion_test: {
        id: "a_level_1d_motion_test",
        title: "A Level 1-d Motion Test",
        type: "isaacQuiz",
        tags: ["physics", "mechanics"],
        url: "/isaac-api/api/quiz/a_level_1d_motion_test",
        hiddenFromRoles: [USER_ROLES[0], USER_ROLES[1]],
        rubric: {
            type: "content",
            encoding: "markdown",
            children: [
                {
                    type:"content",
                    encoding:"markdown",
                    children:[],
                    value:"We recommend completing this test after studying the relevant concepts Equations of Motion, either in school or by doing the appropriate sections in the Essential Pre-Uni Physics book.\\n\\nFor this test make sure to follow the Isaac Physics rules for significant figures.",
                    tags:[]
                }
            ],
            tags:[]
        }
    }
});

export const mockAttempts = recordOf<string, QuizAttemptDTO>()({
    a_level_1d_motion_test: {
        id: 4,
        userId: 1,
        quizId: "a_level_1d_motion_test",
        startDate: new Date(1744125060688),
        quiz: {
            id: "a_level_1d_motion_test",
            title: "A Level 1-d Motion Test",
            type: "isaacQuiz",
            encoding: "markdown",
            canonicalSourceFile: "content/questions/physics/tests/unpublished_tests/a_level_1d_motion_test.json",
            children: [{
                id: "a_level_1d_motion_test|6a5e50ef",
                title: "Velocity & Acceleration",
                type: "isaacQuizSection",
                encoding: "markdown",
                children: [{
                    id:"a_level_1d_motion_test|6a5e50ef|a15b8ea9-603a-445c-b792-aa17430d578d",
                    type: "isaacNumericQuestion",
                    encoding: "markdown",
                    children: [],
                    value: "If an object accelerates from rest at $\\\\quantity{2.5}{m\\\\\\\\,s^{-2}}$, what will be its speed after $\\\\quantity{8.0}{s}$?",
                    published:false,
                }],
                published: false,
                tags: []
            }, {
                id: "a_level_1d_motion_test|b76267ab",
                title: "Problems involving Distance",
                type: "isaacQuizSection",
                encoding: "markdown",
                children:[{
                    id: "a_level_1d_motion_test|b76267ab|aa19154e-228a-4b94-b8e3-55fcbd708c5a",
                    type: "isaacNumericQuestion",
                    encoding: "markdown",
                    children:[],
                    value: "If an object accelerates from rest at $\\\\quantity{1.8}{m\\\\\\\\,s^{-2}}$, how far does it travel in the first $\\\\quantity{7.0}{s}$ of its motion?",
                    published: false,
                }],
                published:false,
                tags:[]
            }],
            tags: ["physics", "mechanics"],
            hiddenFromRoles: [
                "STUDENT",
                "TUTOR"
            ],
            rubric: {
                type: "content",
                encoding: "markdown",
                children: [
                    {
                        type: "content",
                        encoding: "markdown",
                        children: [],
                        value: "We recommend completing this test after studying the relevant concepts (Equations of Motion), either in school or by doing the appropriate sections in the Essential Pre-Uni Physics book.",
                        tags: []
                    }
                ],
                tags: []
            },
            published: false
        }
    }
});

export const mockPreviews = recordOf<string, IsaacQuizDTO>()({
    a_level_1d_motion_test: {
        id: "a_level_1d_motion_test",
        title: "A Level 1-d Motion Test",
        type: "isaacQuiz",
        encoding: "markdown",
        canonicalSourceFile: "content/questions/physics/tests/unpublished_tests/a_level_1d_motion_test.json",
        children: [{
            id: "a_level_1d_motion_test|6a5e50ef",
            title: "Velocity & Acceleration",
            type: "isaacQuizSection",
            encoding: "markdown",
            children: [{
                id:"a_level_1d_motion_test|6a5e50ef|a15b8ea9-603a-445c-b792-aa17430d578d",
                type: "isaacNumericQuestion",
                encoding: "markdown",
                children: [],
                value: "If an object accelerates from rest at $\\\\quantity{2.5}{m\\\\\\\\,s^{-2}}$, what will be its speed after $\\\\quantity{8.0}{s}$?",
                published:false,
            }],
            published: false,
            tags: []
        }, {
            id: "a_level_1d_motion_test|b76267ab",
            title: "Problems involving Distance",
            type: "isaacQuizSection",
            encoding: "markdown",
            children:[{
                id: "a_level_1d_motion_test|b76267ab|aa19154e-228a-4b94-b8e3-55fcbd708c5a",
                type: "isaacNumericQuestion",
                encoding: "markdown",
                children:[],
                value: "If an object accelerates from rest at $\\\\quantity{1.8}{m\\\\\\\\,s^{-2}}$, how far does it travel in the first $\\\\quantity{7.0}{s}$ of its motion?",
                published: false,
            }],
            published:false,
            tags:[]
        }],
        tags: ["physics", "mechanics"],
        hiddenFromRoles: [
            "STUDENT",
            "TUTOR"
        ],
        rubric: {
            type: "content",
            encoding: "markdown",
            children: [
                {
                    type: "content",
                    encoding: "markdown",
                    children: [],
                    value: "We recommend completing this test after studying the relevant concepts (Equations of Motion), either in school or by doing the appropriate sections in the Essential Pre-Uni Physics book.",
                    tags: []
                }
            ],
            tags: []
        },
        published: false
    }
});

export const mockMyAssignments = [
    {
        id: 37,
        gameboardId: "test-gameboard-2",
        gameboard: {
            id: "test-gameboard-2",
            title: "Test Gameboard 2",
            contents: [
                {
                    id: "phys19_a1_q1",
                    contentType: "isaacQuestionPage",
                    title: "Essential Pre-Uni Physics A1.1",
                    uri: "/isaac-api/api/pages/questions/phys19_a1_q1",
                    tags: [
                        "maths",
                        "book",
                        "physics_skills_19",
                        "algebra",
                        "manipulation"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartsCorrect: 0,
                    questionPartsIncorrect: 0,
                    questionPartsNotAttempted: 2,
                    questionPartsTotal: 2,
                    passMark: 75.0,
                    state: "NOT_ATTEMPTED",
                    questionPartStates: [
                        "NOT_ATTEMPTED",
                        "NOT_ATTEMPTED"
                    ]
                },
                {
                    id: "phys19_a1_q2",
                    contentType: "isaacQuestionPage",
                    title: "Essential Pre-Uni Physics A1.2",
                    uri: "/isaac-api/api/pages/questions/phys19_a1_q2",
                    tags: [
                        "maths",
                        "book",
                        "physics_skills_19",
                        "algebra",
                        "manipulation"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartsCorrect: 0,
                    questionPartsIncorrect: 0,
                    questionPartsNotAttempted: 1,
                    questionPartsTotal: 1,
                    passMark: 75.0,
                    state: "NOT_ATTEMPTED",
                    questionPartStates: [
                        "NOT_ATTEMPTED"
                    ]
                },
                {
                    id: "phys19_a1_q3",
                    contentType: "isaacQuestionPage",
                    title: "Essential Pre-Uni Physics A1.3",
                    uri: "/isaac-api/api/pages/questions/phys19_a1_q3",
                    tags: [
                        "maths",
                        "book",
                        "physics_skills_19",
                        "algebra",
                        "manipulation"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartsCorrect: 0,
                    questionPartsIncorrect: 0,
                    questionPartsNotAttempted: 1,
                    questionPartsTotal: 1,
                    passMark: 75.0,
                    state: "NOT_ATTEMPTED",
                    questionPartStates: [
                        "NOT_ATTEMPTED"
                    ]
                },
                {
                    id: "phys19_a1_q4",
                    contentType: "isaacQuestionPage",
                    title: "Essential Pre-Uni Physics A1.4",
                    uri: "/isaac-api/api/pages/questions/phys19_a1_q4",
                    tags: [
                        "maths",
                        "book",
                        "physics_skills_19",
                        "algebra",
                        "manipulation"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartsCorrect: 0,
                    questionPartsIncorrect: 0,
                    questionPartsNotAttempted: 1,
                    questionPartsTotal: 1,
                    passMark: 75.0,
                    state: "NOT_ATTEMPTED",
                    questionPartStates: [
                        "NOT_ATTEMPTED"
                    ]
                },
                {
                    id: "phys19_a1_q5",
                    contentType: "isaacQuestionPage",
                    title: "Essential Pre-Uni Physics A1.5",
                    uri: "/isaac-api/api/pages/questions/phys19_a1_q5",
                    tags: [
                        "maths",
                        "book",
                        "physics_skills_19",
                        "algebra",
                        "manipulation"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartsCorrect: 0,
                    questionPartsIncorrect: 0,
                    questionPartsNotAttempted: 2,
                    questionPartsTotal: 2,
                    passMark: 75.0,
                    state: "NOT_ATTEMPTED",
                    questionPartStates: [
                        "NOT_ATTEMPTED",
                        "NOT_ATTEMPTED"
                    ]
                }
            ],
            wildCard: {
                id: "aboutUsWildCard",
                title: "About Us",
                type: "isaacWildcard",
                canonicalSourceFile: "content/wildcards/aboutUs.json",
                children: [],
                published: true,
                tags: [
                    "maths",
                    "physics"
                ],
                description: "Who created Isaac Physics?",
                url: "/about"
            },
            wildCardPosition: 0,
            creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
            gameFilter: {
                subjects: [
                    "maths"
                ],
                fields: [],
                topics: [],
                levels: [],
                stages: [],
                difficulties: [],
                examBoards: [],
                concepts: [],
                questionCategories: []
            },
            ownerId: mockUser.id,
            tags: [
                "ISAAC_BOARD"
            ],
            creationMethod: "BUILDER",
            percentageCompleted: 0,
            startedQuestion: false
        },
        groupId: 2,
        groupName: "Test Group 1",
        ownerId: mockUser.id,
        assignerSummary: buildMockUserSummary(mockUser, false),
        creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
        dueDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -5),
        //scheduledStartDate: undefined,
    },
    {
        id: 38,
        gameboardId: "test-gameboard-2",
        gameboard: {
            id: "test-gameboard-2",
            title: "Test Gameboard 2",
            contents: [
                {
                    id: "phys19_a1_q1",
                    contentType: "isaacQuestionPage",
                    title: "Essential Pre-Uni Physics A1.1",
                    uri: "/isaac-api/api/pages/questions/phys19_a1_q1",
                    tags: [
                        "maths",
                        "book",
                        "physics_skills_19",
                        "algebra",
                        "manipulation"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartsCorrect: 0,
                    questionPartsIncorrect: 0,
                    questionPartsNotAttempted: 2,
                    questionPartsTotal: 2,
                    passMark: 75.0,
                    state: "NOT_ATTEMPTED",
                    questionPartStates: [
                        "NOT_ATTEMPTED",
                        "NOT_ATTEMPTED"
                    ]
                },
                {
                    id: "phys19_a1_q2",
                    contentType: "isaacQuestionPage",
                    title: "Essential Pre-Uni Physics A1.2",
                    uri: "/isaac-api/api/pages/questions/phys19_a1_q2",
                    tags: [
                        "maths",
                        "book",
                        "physics_skills_19",
                        "algebra",
                        "manipulation"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartsCorrect: 0,
                    questionPartsIncorrect: 0,
                    questionPartsNotAttempted: 1,
                    questionPartsTotal: 1,
                    passMark: 75.0,
                    state: "NOT_ATTEMPTED",
                    questionPartStates: [
                        "NOT_ATTEMPTED"
                    ]
                },
                {
                    id: "phys19_a1_q3",
                    contentType: "isaacQuestionPage",
                    title: "Essential Pre-Uni Physics A1.3",
                    uri: "/isaac-api/api/pages/questions/phys19_a1_q3",
                    tags: [
                        "maths",
                        "book",
                        "physics_skills_19",
                        "algebra",
                        "manipulation"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartsCorrect: 0,
                    questionPartsIncorrect: 0,
                    questionPartsNotAttempted: 1,
                    questionPartsTotal: 1,
                    passMark: 75.0,
                    state: "NOT_ATTEMPTED",
                    questionPartStates: [
                        "NOT_ATTEMPTED"
                    ]
                },
                {
                    id: "phys19_a1_q4",
                    contentType: "isaacQuestionPage",
                    title: "Essential Pre-Uni Physics A1.4",
                    uri: "/isaac-api/api/pages/questions/phys19_a1_q4",
                    tags: [
                        "maths",
                        "book",
                        "physics_skills_19",
                        "algebra",
                        "manipulation"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartsCorrect: 0,
                    questionPartsIncorrect: 0,
                    questionPartsNotAttempted: 1,
                    questionPartsTotal: 1,
                    passMark: 75.0,
                    state: "NOT_ATTEMPTED",
                    questionPartStates: [
                        "NOT_ATTEMPTED"
                    ]
                },
                {
                    id: "phys19_a1_q5",
                    contentType: "isaacQuestionPage",
                    title: "Essential Pre-Uni Physics A1.5",
                    uri: "/isaac-api/api/pages/questions/phys19_a1_q5",
                    tags: [
                        "maths",
                        "book",
                        "physics_skills_19",
                        "algebra",
                        "manipulation"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartsCorrect: 0,
                    questionPartsIncorrect: 0,
                    questionPartsNotAttempted: 2,
                    questionPartsTotal: 2,
                    passMark: 75.0,
                    state: "NOT_ATTEMPTED",
                    questionPartStates: [
                        "NOT_ATTEMPTED",
                        "NOT_ATTEMPTED"
                    ]
                }
            ],
            wildCard: {
                id: "aboutUsWildCard",
                title: "About Us",
                type: "isaacWildcard",
                canonicalSourceFile: "content/wildcards/aboutUs.json",
                children: [],
                published: true,
                tags: [
                    "maths",
                    "physics"
                ],
                description: "Who created Isaac Physics?",
                url: "/about"
            },
            wildCardPosition: 0,
            creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
            gameFilter: {
                subjects: [
                    "maths"
                ],
                fields: [],
                topics: [],
                levels: [],
                stages: [],
                difficulties: [],
                examBoards: [],
                concepts: [],
                questionCategories: []
            },
            ownerId: mockUser.id,
            tags: [
                "ISAAC_BOARD"
            ],
            creationMethod: "BUILDER",
            percentageCompleted: 0,
            startedQuestion: false
        },
        groupId: 6,
        groupName: "Test Group 2",
        ownerId: mockUser.id,
        assignerSummary: buildMockUserSummary(mockUser, false),
        creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
        dueDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -5),
        scheduledStartDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 1),
    },
    {
        id: 40,
        gameboardId: "test-gameboard-1",
        gameboard: {
            id: "test-gameboard-1",
            title: "Test Gameboard 1",
            contents: [
                {
                    id: "phys_linking_17_q1",
                    contentType: "isaacQuestionPage",
                    title: "Banked Tracks for Turning 17.1",
                    uri: "/isaac-api/api/pages/questions/phys_linking_17_q1",
                    tags: [
                        "circular_motion",
                        "book",
                        "physics",
                        "physics_linking_concepts",
                        "mechanics"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_2"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartsCorrect: 0,
                    questionPartsIncorrect: 0,
                    questionPartsNotAttempted: 6,
                    questionPartsTotal: 6,
                    passMark: 75.0,
                    state: "NOT_ATTEMPTED",
                    questionPartStates: [
                        "NOT_ATTEMPTED",
                        "NOT_ATTEMPTED",
                        "NOT_ATTEMPTED",
                        "NOT_ATTEMPTED",
                        "NOT_ATTEMPTED",
                        "NOT_ATTEMPTED"
                    ]
                },
                {
                    id: "phys_linking_17_q2",
                    contentType: "isaacQuestionPage",
                    title: "Banked Tracks for Turning 17.2",
                    uri: "/isaac-api/api/pages/questions/phys_linking_17_q2",
                    tags: [
                        "circular_motion",
                        "book",
                        "physics",
                        "physics_linking_concepts",
                        "mechanics"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_2"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartsCorrect: 0,
                    questionPartsIncorrect: 0,
                    questionPartsNotAttempted: 3,
                    questionPartsTotal: 3,
                    passMark: 75.0,
                    state: "NOT_ATTEMPTED",
                    questionPartStates: [
                        "NOT_ATTEMPTED",
                        "NOT_ATTEMPTED",
                        "NOT_ATTEMPTED"
                    ]
                }
            ],
            wildCard: {
                id: "sig_figs_wildcard",
                title: "Significant Figures",
                type: "isaacWildcard",
                author: "mjc209",
                canonicalSourceFile: "content/wildcards/sig_figs.json",
                children: [],
                published: true,
                tags: [
                    "chemistry",
                    "maths",
                    "physics"
                ],
                description: "How to use significant figures",
                url: "/solving_problems#acc_solving_problems_sig_figs"
            },
            wildCardPosition: 0,
            creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
            gameFilter: {
                subjects: [
                    "physics"
                ],
                fields: [],
                topics: [],
                levels: [],
                stages: [],
                difficulties: [],
                examBoards: [],
                concepts: [],
                questionCategories: []
            },
            ownerId: mockUser.id,
            tags: [
                "ISAAC_BOARD"
            ],
            creationMethod: "BUILDER",
            percentageCompleted: 0,
            startedQuestion: false
        },
        groupId: 2,
        groupName: "Test Group 1",
        ownerId: mockUser.id,
        assignerSummary: buildMockUserSummary(mockUser, false),
        creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
        dueDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -5),
        scheduledStartDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 1),
    },
    {
        id: 45,
        gameboardId: "test-gameboard-3",
        gameboard: {
            id: "test-gameboard-3",
            title: "Test Gameboard 3",
            contents: [
                {
                    id: "gravitational_stability",
                    contentType: "isaacQuestionPage",
                    title: "Gravitational Stability",
                    uri: "/isaac-api/api/pages/questions/gravitational_stability",
                    tags: [
                        "physics",
                        "fields",
                        "gravitational"
                    ],
                    creationContext: {},
                    level: 6,
                    questionPartsCorrect: 0,
                    questionPartsIncorrect: 0,
                    questionPartsNotAttempted: 3,
                    questionPartsTotal: 3,
                    passMark: 75.0,
                    state: "NOT_ATTEMPTED",
                    questionPartStates: [
                        "NOT_ATTEMPTED",
                        "NOT_ATTEMPTED",
                        "NOT_ATTEMPTED"
                    ]
                },
                {
                    id: "gcse_maths_ch3_15_q4",
                    contentType: "isaacQuestionPage",
                    title: "Essential GCSE Maths 15.4",
                    uri: "/isaac-api/api/pages/questions/gcse_maths_ch3_15_q4",
                    tags: [
                        "maths",
                        "book",
                        "maths_book_gcse",
                        "algebra",
                        "manipulation"
                    ],
                    audience: [
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "challenge_1"
                            ]
                        },
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartsCorrect: 0,
                    questionPartsIncorrect: 0,
                    questionPartsNotAttempted: 3,
                    questionPartsTotal: 3,
                    passMark: 75.0,
                    state: "NOT_ATTEMPTED",
                    questionPartStates: [
                        "NOT_ATTEMPTED",
                        "NOT_ATTEMPTED",
                        "NOT_ATTEMPTED"
                    ]
                },
                {
                    id: "gcse_ch1_3_q2",
                    contentType: "isaacQuestionPage",
                    title: "Essential GCSE Physics  3.2",
                    uri: "/isaac-api/api/pages/questions/gcse_ch1_3_q2",
                    tags: [
                        "skills",
                        "relationships",
                        "phys_book_gcse",
                        "book",
                        "physics"
                    ],
                    audience: [
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_2"
                            ]
                        },
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartsCorrect: 0,
                    questionPartsIncorrect: 0,
                    questionPartsNotAttempted: 5,
                    questionPartsTotal: 5,
                    passMark: 75.0,
                    state: "NOT_ATTEMPTED",
                    questionPartStates: [
                        "NOT_ATTEMPTED",
                        "NOT_ATTEMPTED",
                        "NOT_ATTEMPTED",
                        "NOT_ATTEMPTED",
                        "NOT_ATTEMPTED"
                    ]
                },
                {
                    id: "gcse_ch4_30_q16_es",
                    contentType: "isaacQuestionPage",
                    title: "Essential GCSE Physics 30.16",
                    uri: "/isaac-api/api/pages/questions/gcse_ch4_30_q16_es",
                    tags: [
                        "phys_book_gcse",
                        "physics",
                        "book"
                    ],
                    audience: [
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "challenge_2"
                            ]
                        },
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_2"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartsCorrect: 0,
                    questionPartsIncorrect: 0,
                    questionPartsNotAttempted: 1,
                    questionPartsTotal: 1,
                    passMark: 75.0,
                    state: "NOT_ATTEMPTED",
                    questionPartStates: [
                        "NOT_ATTEMPTED"
                    ]
                },
                {
                    id: "gcse_ch3_26_q8_es",
                    contentType: "isaacQuestionPage",
                    title: "Essential GCSE Physics 26.8",
                    uri: "/isaac-api/api/pages/questions/gcse_ch3_26_q8_es",
                    tags: [
                        "phys_book_gcse",
                        "physics",
                        "book"
                    ],
                    audience: [
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "year_9"
                            ],
                            difficulty: [
                                "challenge_2"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartsCorrect: 0,
                    questionPartsIncorrect: 0,
                    questionPartsNotAttempted: 1,
                    questionPartsTotal: 1,
                    passMark: 75.0,
                    state: "NOT_ATTEMPTED",
                    questionPartStates: [
                        "NOT_ATTEMPTED"
                    ]
                },
                {
                    id: "gcse_ch1_5_q3",
                    contentType: "isaacQuestionPage",
                    title: "Skills - Variables and Constants 5.3",
                    uri: "/isaac-api/api/pages/questions/gcse_ch1_5_q3",
                    tags: [
                        "phys_book_gcse",
                        "physics",
                        "thermal",
                        "gases"
                    ],
                    audience: [
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_2"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartsCorrect: 0,
                    questionPartsIncorrect: 0,
                    questionPartsNotAttempted: 3,
                    questionPartsTotal: 3,
                    passMark: 75.0,
                    state: "NOT_ATTEMPTED",
                    questionPartStates: [
                        "NOT_ATTEMPTED",
                        "NOT_ATTEMPTED",
                        "NOT_ATTEMPTED"
                    ]
                },
                {
                    id: "gcse_ch2_8_q7_es",
                    contentType: "isaacQuestionPage",
                    title: "Essential GCSE Physics  8.7",
                    uri: "/isaac-api/api/pages/questions/gcse_ch2_8_q7_es",
                    tags: [
                        "phys_book_gcse",
                        "physics",
                        "book"
                    ],
                    audience: [
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "year_7_and_8"
                            ],
                            difficulty: [
                                "challenge_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartsCorrect: 0,
                    questionPartsIncorrect: 0,
                    questionPartsNotAttempted: 1,
                    questionPartsTotal: 1,
                    passMark: 75.0,
                    state: "NOT_ATTEMPTED",
                    questionPartStates: [
                        "NOT_ATTEMPTED"
                    ]
                },
                {
                    id: "manipulation_4_4",
                    contentType: "isaacQuestionPage",
                    title: "Algebraic Manipulation 4.4",
                    uri: "/isaac-api/api/pages/questions/manipulation_4_4",
                    tags: [
                        "maths",
                        "problem_solving",
                        "algebra",
                        "manipulation"
                    ],
                    audience: [
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "challenge_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 4,
                    questionPartsCorrect: 0,
                    questionPartsIncorrect: 0,
                    questionPartsNotAttempted: 4,
                    questionPartsTotal: 4,
                    passMark: 75.0,
                    state: "NOT_ATTEMPTED",
                    questionPartStates: [
                        "NOT_ATTEMPTED",
                        "NOT_ATTEMPTED",
                        "NOT_ATTEMPTED",
                        "NOT_ATTEMPTED"
                    ]
                },
                {
                    id: "step_up_39_q9",
                    contentType: "isaacQuestionPage",
                    title: "Step up to GCSE Electricity Calculation Practice 39.9",
                    uri: "/isaac-api/api/pages/questions/step_up_39_q9",
                    tags: [
                        "resistors",
                        "book",
                        "physics",
                        "electricity",
                        "phys_book_step_up"
                    ],
                    audience: [
                        {
                            stage: [
                                "year_9"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartsCorrect: 0,
                    questionPartsIncorrect: 0,
                    questionPartsNotAttempted: 1,
                    questionPartsTotal: 1,
                    passMark: 75.0,
                    state: "NOT_ATTEMPTED",
                    questionPartStates: [
                        "NOT_ATTEMPTED"
                    ]
                },
                {
                    id: "gcse_ch6_52_q3",
                    contentType: "isaacQuestionPage",
                    title: "Essential GCSE Physics 52.3",
                    uri: "/isaac-api/api/pages/questions/gcse_ch6_52_q3",
                    tags: [
                        "phys_book_gcse",
                        "book",
                        "physics",
                        "waves_particles",
                        "nuclear"
                    ],
                    audience: [
                        {
                            stage: [
                                "gcse"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        },
                        {
                            stage: [
                                "a_level"
                            ],
                            difficulty: [
                                "practice_1"
                            ]
                        }
                    ],
                    creationContext: {},
                    level: 0,
                    questionPartsCorrect: 0,
                    questionPartsIncorrect: 0,
                    questionPartsNotAttempted: 1,
                    questionPartsTotal: 1,
                    passMark: 75.0,
                    state: "NOT_ATTEMPTED",
                    questionPartStates: [
                        "NOT_ATTEMPTED"
                    ]
                }
            ],
            wildCard: {
                id: "wildcard_mentor_scheme",
                title: "Mentoring",
                type: "isaacWildcard",
                author: "allydavies",
                canonicalSourceFile: "content/wildcards/mentor_scheme.json",
                children: [],
                published: true,
                tags: [
                    "maths",
                    "physics"
                ],
                description: "Isaac Mentor Scheme",
                url: "/pages/isaac_mentor"
            },
            wildCardPosition: 7,
            creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
            gameFilter: {
                subjects: [
                    "physics",
                    "maths"
                ]
            },
            ownerId: mockUser.id,
            tags: [],
            creationMethod: "FILTER",
            percentageCompleted: 0,
            startedQuestion: false
        },
        groupId: 2,
        groupName: "Test Group 1",
        ownerId: mockUser.id,
        notes: "This is cool ",
        assignerSummary: buildMockUserSummary(mockUser, false),
        creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
        dueDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -5),
        scheduledStartDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 1),
    }
];

export const mockRegressionTestQuestions = {
    "id": "_regression_test_",
    "title": "Regression Test Page",
    "subtitle": "Testing123",
    "type": "isaacQuestionPage",
    "encoding": "markdown",
    "canonicalSourceFile": "content/_regression_test/_regression_test_.json",
    "children": [
        {
            "type": "content",
            "encoding": "markdown",
            "children": [],
            "value": "This page is to speed up testing of question behaviors. **Changing anything on this page is liable to break the automated testing**.\n\nYou may find this page useful to see what content looks like in the editor, then you can click the blue \"Preview on Staging\" button to see what it would look like on the Isaac site.",
            "tags": []
        },
        {
            "type": "content",
            "layout": "accordion",
            "children": [
                {
                    "id": "_regression_test_|acc_quick_q",
                    "type": "content",
                    "children": [
                        {
                            "id": "_regression_test_|acc_quick_q|_regression_test_quick_",
                            "type": "isaacQuestion",
                            "title": "Quick Question",
                            "encoding": "markdown",
                            "children": [],
                            "value": "This is a quick question.",
                            "published": true,
                            "answer": {
                                "type": "content",
                                "encoding": "markdown",
                                "children": [],
                                "value": "This is the answer. It will be shown to students when they click the \"Show/Hide\" button.",
                                "tags": []
                            },
                            "hints": [
                                {
                                    "type": "content",
                                    "children": [
                                        {
                                            "type": "content",
                                            "encoding": "markdown",
                                            "children": [],
                                            "value": "This is a Hint on a Quick Question. It will never be used.",
                                            "tags": []
                                        }
                                    ],
                                    "tags": []
                                }
                            ],
                            "showConfidence": false
                        }
                    ],
                    "published": true,
                    "tags": []
                },
                {
                    "id": "_regression_test_|acc_multi_q",
                    "type": "content",
                    "children": [
                        {
                            "id": "_regression_test_|acc_multi_q|_regression_test_multi_",
                            "type": "isaacMultiChoiceQuestion",
                            "title": "Multiple Choice",
                            "encoding": "markdown",
                            "children": [],
                            "value": "This is a multiple choice question. The correct answer is $42$.",
                            "published": true,
                            "hints": [
                                {
                                    "type": "content",
                                    "children": [
                                        {
                                            "type": "content",
                                            "encoding": "markdown",
                                            "children": [],
                                            "value": "This is Hint 1.",
                                            "tags": []
                                        }
                                    ],
                                    "tags": []
                                },
                                {
                                    "type": "content",
                                    "children": [
                                        {
                                            "type": "content",
                                            "encoding": "markdown",
                                            "children": [],
                                            "value": "This is Hint 2. It contains a figure!",
                                            "tags": []
                                        },
                                        {
                                            "id": "_regression_test_|acc_multi_q|_regression_test_multi_|_regression_test_figure_",
                                            "type": "figure",
                                            "encoding": "markdown",
                                            "children": [],
                                            "value": "This is a figure caption!",
                                            "published": true,
                                            "src": "content/questions/physics/mechanics/dynamics/level4/figures/Dynamics_Spouting_Can3.svg",
                                            "altText": "This is figure AltText."
                                        }
                                    ],
                                    "tags": []
                                }
                            ],
                            "choices": [
                                {
                                    "type": "choice",
                                    "encoding": "markdown",
                                    "children": [],
                                    "value": "$42$"
                                },
                                {
                                    "type": "choice",
                                    "encoding": "markdown",
                                    "children": [],
                                    "value": "$69$"
                                }
                            ]
                        }
                    ],
                    "published": true,
                    "tags": []
                },
                {
                    "id": "_regression_test_|acc_numeric_q",
                    "type": "content",
                    "children": [
                        {
                            "id": "_regression_test_|acc_numeric_q|_regresssion_test_numeric_",
                            "type": "isaacNumericQuestion",
                            "title": "Numeric Question",
                            "encoding": "markdown",
                            "children": [],
                            "value": "The answer to this question is $\\quantity{2.01}{m\\\\,s^{-1}}$. The wrong answer is $\\quantity{5.00}{m\\\\,s^{-1}}$. A known wrong answer to the wrong number of sig figs is $\\quantity{42}{m\\\\,s^{-1}}$, it should say \"Hello\" on selecting it, not a sig fig warning. The answer $999$ requires no units. The units $\\units{m\\\\,s^{-1}}$ are not in `availableUnits`, so if they appear the selection code works correctly!",
                            "relatedContent": [
                                {
                                    "id": "_regression_test_",
                                    "title": "Regression Test Page",
                                    "subtitle": "Testing123",
                                    "type": "isaacQuestionPage",
                                    "level": "0",
                                    "tags": [
                                        "regression_test"
                                    ],
                                    "state": "NOT_ATTEMPTED",
                                    "audience": [
                                        {
                                            "stage": [
                                                "a_level"
                                            ],
                                            "examBoard": [
                                                "aqa",
                                                "ocr"
                                            ]
                                        },
                                        {
                                            "stage": [
                                                "advanced"
                                            ],
                                            "examBoard": [
                                                "ada"
                                            ]
                                        }
                                    ]
                                }
                            ],
                            "published": true,
                            "hints": [
                                {
                                    "type": "content",
                                    "children": [
                                        {
                                            "type": "content",
                                            "encoding": "markdown",
                                            "children": [],
                                            "value": "This is Hint 1.\n\n**Concepts**\n\n- [Text files](/concepts/fileprog_text)\n- [Text files](/concepts/fileprog_text)\n- [Text files](/concepts/fileprog_text)\n",
                                            "tags": []
                                        }
                                    ],
                                    "tags": []
                                },
                                {
                                    "type": "content",
                                    "children": [
                                        {
                                            "type": "content",
                                            "encoding": "markdown",
                                            "children": [],
                                            "value": "This is Hint 2.",
                                            "tags": []
                                        }
                                    ],
                                    "tags": []
                                },
                                {
                                    "type": "content",
                                    "children": [
                                        {
                                            "type": "content",
                                            "encoding": "markdown",
                                            "children": [],
                                            "value": "This is Hint 3.",
                                            "tags": []
                                        }
                                    ],
                                    "tags": []
                                },
                                {
                                    "id": "_regression_test_|acc_numeric_q|_regresssion_test_numeric_|isaac_anvil_info",
                                    "type": "content",
                                    "children": [
                                        {
                                            "type": "content",
                                            "encoding": "markdown",
                                            "children": [],
                                            "value": "This is Hint 4.",
                                            "tags": []
                                        },
                                        {
                                            "type": "anvilApp",
                                            "children": [],
                                            "appId": "EW6Q7UNQQT3HIJ3W",
                                            "appAccessKey": "EMAJA6ZMDQT764TGQNW2DTJF"
                                        }
                                    ],
                                    "published": true,
                                    "tags": []
                                }
                            ],
                            "requireUnits": true,
                            "disregardSignificantFigures": false,
                            "availableUnits": [
                                "K ",
                                " J ",
                                " mW ",
                                " m\\,s^{-2} ",
                                " J ",
                                " km ",
                                " T ",
                                " km\\,s^{-1} ",
                                " nJ ",
                                " J ",
                                " GY"
                            ],
                            "knownUnits": [
                                "m\\,s^{-1}",
                                "m\\,s^{-1}",
                                "m\\,s^{-1}"
                            ]
                        }
                    ],
                    "published": true,
                    "tags": []
                },
                {
                    "id": "_regression_test_|acc_symbolic_q",
                    "type": "content",
                    "children": [
                        {
                            "id": "_regression_test_|acc_symbolic_q|_regression_test_symbolic_",
                            "type": "isaacSymbolicQuestion",
                            "title": "Symbolic Question",
                            "encoding": "markdown",
                            "children": [
                                {
                                    "type": "content",
                                    "encoding": "markdown",
                                    "children": [],
                                    "value": "This is a symbolic question. The answer is $x$.",
                                    "tags": []
                                }
                            ],
                            "published": true,
                            "hints": [
                                {
                                    "type": "content",
                                    "children": [
                                        {
                                            "type": "content",
                                            "encoding": "markdown",
                                            "children": [],
                                            "value": "This is Hint 1.",
                                            "tags": []
                                        }
                                    ],
                                    "tags": []
                                }
                            ],
                            "formulaSeed": "[{\"type\":\"Symbol\",\"position\":{\"x\":1193.12,\"y\":518},\"expression\":{\"latex\":\"x\",\"python\":\"x\"},\"properties\":{\"letter\":\"x\"}}]",
                            "availableSymbols": [
                                "x   ",
                                "   y ",
                                "v ",
                                "   sin()   ",
                                "   >=   ",
                                "   arccos()  ",
                                "   Derivative(;x)  ",
                                "  Deltax ",
                                "  Deltat ",
                                "  x_prime ",
                                "  deltax ",
                                "  dx"
                            ]
                        }
                    ],
                    "published": true,
                    "tags": []
                },
                {
                    "id": "_regression_test_|acc_chemistry_q",
                    "type": "content",
                    "children": [
                        {
                            "id": "_regression_test_|acc_chemistry_q|_regression_test_chemistry_",
                            "type": "isaacSymbolicChemistryQuestion",
                            "title": "Chemistry Question",
                            "encoding": "markdown",
                            "children": [],
                            "value": "This is a chemistry question. The correct answer is $\\ce{H + Cl}$, an incorrect answer is $\\ce{H}$.",
                            "published": true,
                            "hints": [
                                {
                                    "type": "content",
                                    "children": [
                                        {
                                            "type": "content",
                                            "encoding": "markdown",
                                            "children": [],
                                            "value": "This is Hint 1.",
                                            "tags": []
                                        }
                                    ],
                                    "tags": []
                                }
                            ],
                            "availableSymbols": [
                                "H",
                                " Cl"
                            ],
                            "allowPermutations": false,
                            "allowScalingCoefficients": false,
                            "nuclear": false,
                            "isNuclear": false
                        }
                    ],
                    "published": true,
                    "tags": []
                },
                {
                    "id": "_regression_test_|acc_stringmatch_q",
                    "type": "content",
                    "children": [
                        {
                            "id": "_regression_test_|acc_stringmatch_q|_regression_test_stringmatch_",
                            "type": "isaacStringMatchQuestion",
                            "title": "String Match Question",
                            "encoding": "markdown",
                            "children": [],
                            "value": "This is a string matching question. Type the value `hello` for a correct answer, `Hello` for a known wrong answer, and `any case` for a case-insensitive match.",
                            "published": true,
                            "hints": [
                                {
                                    "type": "content",
                                    "children": [
                                        {
                                            "type": "content",
                                            "encoding": "markdown",
                                            "children": [],
                                            "value": "This is Hint 1.",
                                            "tags": []
                                        }
                                    ],
                                    "tags": []
                                }
                            ]
                        }
                    ],
                    "published": true,
                    "tags": []
                },
                {
                    "id": "_regression_test_|acc_freetext_q",
                    "type": "content",
                    "children": [
                        {
                            "id": "_regression_test_|acc_freetext_q|_regression_test_freetext_",
                            "type": "isaacFreeTextQuestion",
                            "title": "Free Text Question",
                            "encoding": "markdown",
                            "children": [],
                            "value": "This is a free text question. It is slightly more forgiving for longer text than String Match.\n\nTry answering \"Why did the chicken cross the road?\" below, and so long as your answer contains 'get to' and 'other side' it should be correct. It will be incorrect with custom feedback if you include 'did not' or 'didn't'.",
                            "published": true
                        }
                    ],
                    "published": true,
                    "tags": []
                },
                {
                    "id": "_regression_test_|acc_logic_question",
                    "type": "content",
                    "children": [
                        {
                            "id": "_regression_test_|acc_logic_question|_regression_test_logic_",
                            "type": "isaacSymbolicLogicQuestion",
                            "title": "Logic Question",
                            "encoding": "markdown",
                            "children": [],
                            "value": "Convert `(NOT A) OR (NOT B)` into boolean logic syntax:",
                            "published": true,
                            "hints": [
                                {
                                    "type": "content",
                                    "children": [
                                        {
                                            "type": "content",
                                            "encoding": "markdown",
                                            "children": [],
                                            "value": "Example hint!",
                                            "tags": []
                                        }
                                    ],
                                    "tags": []
                                }
                            ],
                            "availableSymbols": [
                                "A",
                                "B"
                            ]
                        }
                    ],
                    "published": true,
                    "tags": []
                },
                {
                    "id": "_regression_test_|acc_item_q",
                    "type": "content",
                    "children": [
                        {
                            "id": "_regression_test_|acc_item_q|_regression_test_item_",
                            "type": "isaacItemQuestion",
                            "title": "Item Question",
                            "encoding": "markdown",
                            "children": [],
                            "value": "Which of the following sentences are true?",
                            "published": true,
                            "items": [
                                {
                                    "id": "c953",
                                    "type": "item",
                                    "children": [],
                                    "value": "This sentence is not true."
                                },
                                {
                                    "id": "f213",
                                    "type": "item",
                                    "children": [],
                                    "value": "This sentence is true."
                                },
                                {
                                    "id": "7897",
                                    "type": "item",
                                    "children": [],
                                    "value": "Both the above sentences are true."
                                },
                                {
                                    "id": "bcd3",
                                    "type": "item",
                                    "children": [],
                                    "value": "None of these sentences are true."
                                }
                            ]
                        }
                    ],
                    "published": true,
                    "tags": []
                },
                {
                    "id": "_regression_test_|acc_parsons_q",
                    "type": "content",
                    "children": [
                        {
                            "id": "_regression_test_|acc_parsons_q|_regression_test_parsons_",
                            "type": "isaacParsonsQuestion",
                            "title": "Parsons Question",
                            "encoding": "markdown",
                            "children": [],
                            "value": "Order the following sections alphabetically, indenting the letter `C` once!\n\n```\nA\nB\n    C\nD\n```",
                            "published": true,
                            "items": [
                                {
                                    "id": "aaaa",
                                    "type": "parsonsItem",
                                    "children": [],
                                    "value": "A",
                                    "indentation": 0
                                },
                                {
                                    "id": "cccc",
                                    "type": "parsonsItem",
                                    "children": [],
                                    "value": "C",
                                    "indentation": 0
                                },
                                {
                                    "id": "dddd",
                                    "type": "parsonsItem",
                                    "children": [],
                                    "value": "D",
                                    "indentation": 0
                                },
                                {
                                    "id": "bbbb",
                                    "type": "parsonsItem",
                                    "children": [],
                                    "value": "B",
                                    "indentation": 0
                                }
                            ]
                        }
                    ],
                    "published": true,
                    "tags": []
                },
                {
                    "id": "_regression_test_|acc_cloze_q",
                    "type": "content",
                    "children": [
                        {
                            "id": "_regression_test_|acc_cloze_q|3562dfe3-fb1d-42ef-941d-41bd672aa57b",
                            "type": "isaacClozeQuestion",
                            "title": "Cloze Question",
                            "encoding": "markdown",
                            "children": [],
                            "value": "Drag \"a\" here: [drop-zone], \"b\" here: [drop-zone], and \"d\" and \"c\" should be dropped in alphabetical order below:\n<table class=\"expandable\">\n\t<tbody>\n\t\t<tr>\n    \t\t<td>[drop-zone]</td>\n            <td>[drop-zone]</td>\n        </tr>\n   \t</tbody>\n</table>\nAlso put \\(1\\) in this integral limit for fun:\n\\[ \\int^{\\text{[drop-zone|w-30]}}_0 \\sin x \\]",
                            "published": true,
                            "items": [
                                {
                                    "id": "eaf1",
                                    "type": "item",
                                    "children": [],
                                    "value": "a"
                                },
                                {
                                    "id": "f534",
                                    "type": "item",
                                    "children": [],
                                    "value": "b"
                                },
                                {
                                    "id": "1ea9",
                                    "type": "item",
                                    "children": [],
                                    "value": "c"
                                },
                                {
                                    "id": "a2d2",
                                    "type": "item",
                                    "children": [],
                                    "value": "d"
                                },
                                {
                                    "id": "6a27",
                                    "type": "item",
                                    "children": [],
                                    "value": "\\(1\\)"
                                }
                            ]
                        }
                    ],
                    "published": true,
                    "tags": []
                },
                {
                    "id": "_regression_test_|acc_inline_q",
                    "type": "content",
                    "children": [
                        {
                            "id": "_regression_test_|acc_inline_q|727260a8-891f-4e5e-98ae-0e0aa96bf287",
                            "type": "isaacInlineRegion",
                            "encoding": "markdown",
                            "children": [
                                {
                                    "type": "content",
                                    "encoding": "markdown",
                                    "children": [],
                                    "value": "<table>\n  <thead style=\"background-color: #ddd\">\n    <td>x</td>\n    <td>2x</td>\n    <td>1/x</td>\n  </thead>\n  <tbody>\n    <tr>\n      <td>5</td>\n      <td>[inline-question:maths1]</td>\n      <td>0.2</td>\n    </tr>\n    <tr>\n      <td>[inline-question:maths2]</td>\n      <td>20</td>\n      <td>[inline-question:maths3]</td>\n    </tr>\n  </tbody>\n</table>",
                                    "tags": []
                                },
                                {
                                    "type": "content",
                                    "encoding": "markdown",
                                    "layout": "accordion",
                                    "children": [
                                        {
                                            "title": "Accordion Test",
                                            "type": "content",
                                            "children": [
                                                {
                                                    "type": "content",
                                                    "encoding": "markdown",
                                                    "children": [],
                                                    "value": "The answer to this question is 'accordion': [inline-question:accordion]",
                                                    "tags": []
                                                }
                                            ],
                                            "tags": []
                                        }
                                    ],
                                    "tags": []
                                }
                            ],
                            "published": true,
                            "inlineQuestions": [
                                {
                                    "id": "_regression_test_|acc_inline_q|727260a8-891f-4e5e-98ae-0e0aa96bf287|inline-question:maths1",
                                    "type": "isaacNumericQuestion",
                                    "children": [],
                                    "published": true,
                                    "requireUnits": false,
                                    "disregardSignificantFigures": false,
                                    "availableUnits": [],
                                    "displayUnit": "\\text{Display Unit}"
                                },
                                {
                                    "id": "_regression_test_|acc_inline_q|727260a8-891f-4e5e-98ae-0e0aa96bf287|inline-question:maths2",
                                    "type": "isaacNumericQuestion",
                                    "children": [],
                                    "published": true,
                                    "requireUnits": false,
                                    "disregardSignificantFigures": false,
                                    "availableUnits": []
                                },
                                {
                                    "id": "_regression_test_|acc_inline_q|727260a8-891f-4e5e-98ae-0e0aa96bf287|inline-question:maths3",
                                    "type": "isaacNumericQuestion",
                                    "children": [],
                                    "published": true,
                                    "requireUnits": true,
                                    "disregardSignificantFigures": false,
                                    "availableUnits": [
                                        "ms^-1"
                                    ]
                                },
                                {
                                    "id": "_regression_test_|acc_inline_q|727260a8-891f-4e5e-98ae-0e0aa96bf287|inline-question:accordion",
                                    "type": "isaacStringMatchQuestion",
                                    "children": [],
                                    "published": true
                                }
                            ]
                        }
                    ],
                    "published": true,
                    "tags": []
                },
                {
                    "id": "_regression_test_|acc_figure_numbering",
                    "type": "content",
                    "children": [
                        {
                            "type": "content",
                            "encoding": "markdown",
                            "children": [],
                            "value": "This is a test for whether \\ref{fig2}, \\ref{fig3} and \\ref{fig4} are referenced correctly!",
                            "tags": []
                        },
                        {
                            "type": "content",
                            "encoding": "markdown",
                            "layout": "horizontal",
                            "children": [
                                {
                                    "id": "_regression_test_|acc_figure_numbering|fig2",
                                    "type": "figure",
                                    "encoding": "markdown",
                                    "children": [],
                                    "value": "This should be Figure 2.",
                                    "published": true,
                                    "src": "content/_regression_test/figures/ada_cs_person.svg",
                                    "altText": "This is figure AltText."
                                },
                                {
                                    "id": "_regression_test_|acc_figure_numbering|fig3",
                                    "type": "figure",
                                    "encoding": "markdown",
                                    "children": [],
                                    "value": "This should be Figure 3.",
                                    "published": true,
                                    "src": "content/_regression_test/figures/ada_cs_person.svg",
                                    "altText": "This is figure AltText."
                                }
                            ],
                            "tags": []
                        },
                        {
                            "id": "_regression_test_|acc_figure_numbering|fig4",
                            "type": "figure",
                            "encoding": "markdown",
                            "children": [],
                            "value": "This should be Figure 4.",
                            "published": true,
                            "src": "content/_regression_test/figures/ada_cs_person.svg",
                            "altText": "This is figure AltText."
                        },
                        {
                            "type": "content",
                            "layout": "tabs",
                            "children": [
                                {
                                    "id": "_regression_test_|acc_figure_numbering|tab_fig5",
                                    "title": "Figure 5",
                                    "type": "content",
                                    "children": [
                                        {
                                            "id": "_regression_test_|acc_figure_numbering|tab_fig5|fig5",
                                            "type": "figure",
                                            "encoding": "markdown",
                                            "children": [],
                                            "value": "This should be Figure 5.",
                                            "published": true,
                                            "src": "content/_regression_test/figures/ada_cs_person.svg",
                                            "altText": "This is figure AltText."
                                        }
                                    ],
                                    "published": true,
                                    "tags": []
                                },
                                {
                                    "title": "Figure 6",
                                    "type": "content",
                                    "children": [
                                        {
                                            "id": "_regression_test_|acc_figure_numbering|fig6",
                                            "type": "figure",
                                            "encoding": "markdown",
                                            "children": [],
                                            "value": "This should be Figure 6.",
                                            "published": true,
                                            "src": "content/_regression_test/figures/ada_cs_person.svg",
                                            "altText": "This is figure AltText."
                                        }
                                    ],
                                    "tags": []
                                },
                                {
                                    "title": "Figure 7",
                                    "type": "content",
                                    "children": [
                                        {
                                            "id": "_regression_test_|acc_figure_numbering|quick_question_fig7",
                                            "type": "isaacQuestion",
                                            "encoding": "markdown",
                                            "children": [],
                                            "value": "This should contain \\ref{fig7}.",
                                            "published": true,
                                            "answer": {
                                                "type": "content",
                                                "encoding": "markdown",
                                                "children": [
                                                    {
                                                        "id": "_regression_test_|acc_figure_numbering|quick_question_fig7|fig7",
                                                        "type": "figure",
                                                        "encoding": "markdown",
                                                        "children": [],
                                                        "value": "This should be Figure 7.",
                                                        "published": true,
                                                        "src": "content/_regression_test/figures/ada_cs_person.svg",
                                                        "altText": "This is figure AltText."
                                                    }
                                                ],
                                                "tags": []
                                            },
                                            "showConfidence": true
                                        }
                                    ],
                                    "tags": []
                                }
                            ],
                            "tags": []
                        },
                        {
                            "id": "_regression_test_|acc_figure_numbering|fig8",
                            "type": "figure",
                            "encoding": "markdown",
                            "children": [],
                            "value": "This should be Figure 8.",
                            "published": true,
                            "src": "content/_regression_test/figures/ada_cs_person.svg",
                            "altText": "This is figure AltText."
                        }
                    ],
                    "published": true,
                    "tags": []
                },
                {
                    "id": "_regression_test_|acc_drag_and_drop",
                    "type": "content",
                    "children": [
                        {
                            "type": "isaacDndQuestion",
                            "encoding": "markdown",
                            "id": "3d927959-a943-4c09-a39a-5fc406b14da1",
                            "choices": [
                                {
                                    "encoding": "markdown",
                                    "value": "",
                                    "explanation": {
                                        "type": "content",
                                        "children": []
                                    },
                                    "type": "dndChoice",
                                    "children": [],
                                    "correct": true,
                                    "items": [
                                        {
                                            "type": "dndItem",
                                            "dropZoneId": "A1",
                                            "id": "eb00"
                                        },
                                        {
                                            "type": "dndItem",
                                            "dropZoneId": "F-0",
                                            "id": "d39b"
                                        },
                                        {
                                            "type": "dndItem",
                                            "dropZoneId": "F1",
                                            "id": "afab"
                                        },
                                        {
                                            "type": "dndItem",
                                            "dropZoneId": "F-2",
                                            "id": "9d81"
                                        }
                                    ]
                                }
                            ],
                            "answer": {
                                "type": "content",
                                "encoding": "markdown",
                                "value": ""
                            },
                            "children": [
                                {
                                    "type": "content",
                                    "encoding": "markdown",
                                    "value": "This is a drag and drop question. This is a [drop-zone:A1|w-100h-27]."
                                },
                                {
                                    "type": "figure",
                                    "encoding": "markdown",
                                    "src": "figures/sketch_beta_quad_sketch.svg",
                                    "value": "test figure",
                                    "figureRegions": [
                                        {
                                            "id": "F-0",
                                            "minWidth": "100px",
                                            "width": 15,
                                            "left": 50,
                                            "top": 50
                                        },
                                        {
                                            "id": "F1",
                                            "minWidth": "100px",
                                            "width": 15,
                                            "left": 18.8,
                                            "top": 35.8
                                        },
                                        {
                                            "id": "F-2",
                                            "minWidth": "100px",
                                            "width": 15,
                                            "left": 75.2,
                                            "top": 35.5
                                        }
                                    ],
                                    "condensedMaxWidth": "500px"
                                }
                            ],
                            "items": [
                                {
                                    "type": "item",
                                    "id": "eb00",
                                    "value": "graph"
                                },
                                {
                                    "type": "item",
                                    "id": "d39b",
                                    "value": "origin"
                                },
                                {
                                    "type": "item",
                                    "id": "9d81",
                                    "value": "$x > 0$"
                                },
                                {
                                    "type": "item",
                                    "id": "afab",
                                    "value": "$x < 0$"
                                }
                            ]
                        }
                    ]
                }
            ],
            "tags": []
        }
    ],
    "relatedContent": [
        {
            "id": "_regression_test_",
            "title": "Regression Test Page",
            "subtitle": "Testing123",
            "type": "isaacQuestionPage",
            "level": "0",
            "tags": [
                "regression_test"
            ],
            "state": "NOT_ATTEMPTED" ,
            "audience": [
                {
                    "stage": [
                        "a_level"
                    ],
                    "examBoard": [
                        "aqa",
                        "ocr"
                    ]
                },
                {
                    "stage": [
                        "advanced"
                    ],
                    "examBoard": [
                        "ada"
                    ]
                }
            ]
        }
    ],
    "published": true,
    "tags": [
        "regression_test"
    ],
    "level": 0,
    "audience": [
        {
            "stage": [
                "a_level"
            ],
            "examBoard": [
                "aqa",
                "ocr"
            ]
        },
        {
            "stage": [
                "advanced"
            ],
            "examBoard": [
                "ada"
            ]
        }
    ]
};

export const mockLLMMarkedRegressionTestQuestion = {
    "type": "isaacQuestionPage",
    "encoding": "markdown",
    "title": "LLM-Marked Regression Test Page",
    "children": [
        {
            "type": "content",
            "encoding": "markdown",
            "value": "This note should appear under the LLM info banner."
        },
        {
            "type": "isaacLLMFreeTextQuestion",
            "encoding": "markdown",
            "id": "_regression_test_llm_",
            "children": [
                {
                    "type": "content",
                    "encoding": "markdown",
                    "value": "Any answer to this question will receive one out of two marks."
                }
            ],
            "title": "LLM-Marked Question",
            "maxMarks": 2,
            "hints": [
                {
                    "type": "content",
                    "children": [
                        {
                            "type": "content",
                            "encoding": "markdown",
                            "value": "Answer the question to receive one mark."
                        }
                    ]
                }
            ]
        }
    ],
    "author": "sjd210",
    "id": "_llm_marked_regression_test_",
    "tags": [
        "physics"
    ],
    "audience": [
        {
            "stage": [
                "a_level"
            ],
            "difficulty": [
                "challenge_1"
            ]
        }
    ]
};

export const mockLLMMarkedValidationResponse = {
    "questionId": "_llm_marked_regression_test_|_regression_test_llm_",
    "answer": {
        "type": "llmFreeTextChoice",
        "children": [],
        "value": "hello"
    },
    "correct": true,
    "dateAttempted": 1760018609128,
    "marks": 1,
    "markBreakdown": [
        {
            "jsonField": "unreceivedMark0",
            "shortDescription": "The student will not receive this mark.",
            "marks": 0
        },
        {
            "jsonField": "receivedMark0",
            "shortDescription": "The student will receive this mark.",
            "marks": 1
        },
        {
            "jsonField": "unreceivedMark1",
            "shortDescription": "The student will not receive this mark either.",
            "marks": 0
        }
    ]
};

export const mockQuestionFinderResults = {
    "results": [
        {
            "id": "itsp24_weight_class_q6",
            "title": "A Bag of Flour",
            "subtitle": "Step into Physics: Weight 6",
            "type": "isaacQuestionPage",
            "level": "0",
            "tags": [
                "physics",
                "problem_solving",
                "mechanics"
            ],
            "url": "/api/pages/questions/itsp24_weight_class_q6",
            "state": CompletionState.NOT_ATTEMPTED,
            "audience": [
                {
                    "stage": [
                        "year_7_and_8"
                    ],
                    "difficulty": [
                        "practice_1"
                    ]
                },
                {
                    "stage": [
                        "year_9"
                    ],
                    "difficulty": [
                        "practice_1"
                    ]
                },
                {
                    "stage": [
                        "gcse"
                    ],
                    "difficulty": [
                        "practice_1"
                    ]
                }
            ]
        },
        {
            "id": "itsp24_forcemotion_hw_q9",
            "title": "A Bungee Jumper",
            "subtitle": "Step into Physics: Force and Motion Practice 9",
            "type": "isaacQuestionPage",
            "level": "0",
            "tags": [
                "physics",
                "problem_solving",
                "mechanics"
            ],
            "url": "/api/pages/questions/itsp24_forcemotion_hw_q9",
            "state": CompletionState.ALL_CORRECT,
            "audience": [
                {
                    "stage": [
                        "year_7_and_8"
                    ],
                    "difficulty": [
                        "practice_2"
                    ]
                },
                {
                    "stage": [
                        "year_9"
                    ],
                    "difficulty": [
                        "practice_1"
                    ]
                },
                {
                    "stage": [
                        "gcse"
                    ],
                    "difficulty": [
                        "practice_1"
                    ]
                }
            ]
        },
        {
            "id": "itsp24_accel_class_q11",
            "title": "A Car Leaving Town",
            "subtitle": "Step into Physics: Acceleration 11",
            "type": "isaacQuestionPage",
            "level": "0",
            "tags": [
                "physics",
                "problem_solving",
                "mechanics"
            ],
            "url": "/api/pages/questions/itsp24_accel_class_q11",
            "state": CompletionState.IN_PROGRESS,
            "audience": [
                {
                    "stage": [
                        "year_7_and_8"
                    ],
                    "difficulty": [
                        "practice_3"
                    ]
                },
                {
                    "stage": [
                        "year_9"
                    ],
                    "difficulty": [
                        "practice_2"
                    ]
                },
                {
                    "stage": [
                        "gcse"
                    ],
                    "difficulty": [
                        "practice_1"
                    ]
                }
            ]
        },
        {
            "id": "itsp24_calcspeed_class_q3",
            "title": "A Car on a Motorway",
            "subtitle": "Step into Physics: Calculating Speed 3",
            "type": "isaacQuestionPage",
            "level": "0",
            "tags": [
                "physics",
                "problem_solving",
                "mechanics"
            ],
            "url": "/api/pages/questions/itsp24_calcspeed_class_q3",
            "state": CompletionState.ALL_INCORRECT,
            "audience": [
                {
                    "stage": [
                        "year_7_and_8"
                    ],
                    "difficulty": [
                        "practice_1"
                    ]
                },
                {
                    "stage": [
                        "year_9"
                    ],
                    "difficulty": [
                        "practice_1"
                    ]
                },
                {
                    "stage": [
                        "gcse"
                    ],
                    "difficulty": [
                        "practice_1"
                    ]
                }
            ]
        },
        {
            "id": "itsp24_accel_hw_q1",
            "title": "A Cat, Cyclist, Aeroplane and Cow",
            "subtitle": "Step into Physics: Acceleration Practice 1",
            "type": "isaacQuestionPage",
            "level": "0",
            "tags": [
                "physics",
                "problem_solving",
                "mechanics"
            ],
            "url": "/api/pages/questions/itsp24_accel_hw_q1",
            "state": CompletionState.NOT_ATTEMPTED,
            "audience": [
                {
                    "stage": [
                        "year_7_and_8"
                    ],
                    "difficulty": [
                        "practice_3"
                    ]
                },
                {
                    "stage": [
                        "year_9"
                    ],
                    "difficulty": [
                        "practice_2"
                    ]
                },
                {
                    "stage": [
                        "gcse"
                    ],
                    "difficulty": [
                        "practice_1"
                    ]
                }
            ]
        },
    ],
    "nextSearchOffset": 5,
    "totalResults": 5
} satisfies SearchResultsWrapper<ContentSummaryDTO>;

export const mockQuestionFinderResultsWithMultipleStages = {
    "results": [
        {
            "id": "phys_linking_22_q5",
            "title": "Induction in a Rotating Coil 5",
            "subtitle": "Linking Concepts in Pre-Uni Physics 22.5",
            "type": "isaacQuestionPage",
            "tags": [
                "book",
                "physics",
                "physics_linking_concepts",
                "magnetic",
                "fields"
            ],
            "url": "/api/pages/questions/phys_linking_22_q5",
            "state": CompletionState.NOT_ATTEMPTED,
            "audience": [
                {
                    "stage": [
                        "a_level"
                    ],
                    "difficulty": [
                        "practice_2"
                    ]
                }
            ]
        },
        {
            "id": "gcse_ch2_13_q12",
            "title": "Resultant Force and Acceleration 12",
            "subtitle": "Essential GCSE Physics 13.12",
            "type": "isaacQuestionPage",
            "tags": [
                "dynamics",
                "phys_book_gcse",
                "book",
                "physics",
                "mechanics"
            ],
            "url": "/api/pages/questions/gcse_ch2_13_q12",
            "state": CompletionState.NOT_ATTEMPTED,
            "audience": [
                {
                    "stage": [
                        "gcse"
                    ],
                    "difficulty": [
                        "challenge_1"
                    ]
                },
                {
                    "stage": [
                        "a_level"
                    ],
                    "difficulty": [
                        "practice_1"
                    ]
                }
            ]
        },
        {
            "id": "phys19_k1_q4",
            "title": "Red Shift and Hubble's Law 4",
            "subtitle": "Essential Pre-Uni Physics K1.4",
            "type": "isaacQuestionPage",
            "tags": [
                "book",
                "physics",
                "physics_skills_19",
                "waves_particles",
                "wave_motion"
            ],
            "url": "/api/pages/questions/phys19_k1_q4",
            "state": CompletionState.NOT_ATTEMPTED,
            "audience": [
                {
                    "stage": [
                        "a_level"
                    ],
                    "difficulty": [
                        "practice_3"
                    ]
                }
            ]
        },
        {
            "id": "step_up_35_q7",
            "title": "Frequency 7",
            "subtitle": "Step Up to GCSE Physics 35.7",
            "type": "isaacQuestionPage",
            "tags": [
                "book",
                "physics",
                "waves_particles",
                "wave_motion",
                "phys_book_step_up"
            ],
            "url": "/api/pages/questions/step_up_35_q7",
            "state": CompletionState.NOT_ATTEMPTED,
            "audience": [
                {
                    "stage": [
                        "year_9"
                    ],
                    "difficulty": [
                        "practice_2"
                    ]
                },
                {
                    "stage": [
                        "gcse"
                    ],
                    "difficulty": [
                        "practice_1"
                    ]
                }
            ]
        },
        {
            "id": "phys_linking_33_q1",
            "title": "Capacitors and Resistors 1",
            "subtitle": "Linking Concepts in Pre-Uni Physics 33.1",
            "type": "isaacQuestionPage",
            "tags": [
                "capacitors",
                "book",
                "physics",
                "physics_linking_concepts",
                "electricity"
            ],
            "url": "/api/pages/questions/phys_linking_33_q1",
            "state": CompletionState.NOT_ATTEMPTED,
            "audience": [
                {
                    "stage": [
                        "a_level"
                    ],
                    "difficulty": [
                        "practice_3"
                    ]
                }
            ]
        },
        {
            "id": "gcse_ch6_51_q2_r1",
            "title": "Atomic Numbers and Nomenclature 2",
            "subtitle": "Essential GCSE Physics 51.2",
            "type": "isaacQuestionPage",
            "tags": [
                "phys_book_gcse",
                "book",
                "physics",
                "waves_particles",
                "nuclear"
            ],
            "url": "/api/pages/questions/gcse_ch6_51_q2_r1",
            "state": CompletionState.NOT_ATTEMPTED,
            "audience": [
                {
                    "stage": [
                        "gcse"
                    ],
                    "difficulty": [
                        "practice_1"
                    ]
                },
                {
                    "stage": [
                        "a_level"
                    ],
                    "difficulty": [
                        "practice_1"
                    ]
                }
            ]
        },
    ],
    "nextSearchOffset": 6,
    "totalResults": 6
} satisfies SearchResultsWrapper<ContentSummaryDTO>;

export const mockConceptsResults = {
    results: [{
        id: "phys_step_up_1_concept",
        title: "1. Displacement",
        subtitle: "Step Up to GCSE Physics",
        type: "isaacConceptPage",
        tags: ["physics", "skills"],
        url: "/api/pages/concepts/phys_step_up_1_concept"
    }, {
        id: "gcse_maths_ch1_1_concept",
        title: "1. Solving Maths Problems",
        subtitle: "Using Essential GCSE Maths",
        type: "isaacConceptPage",
        tags: [ "maths", "number"],
        audience: [{ stage: ["a_level"]}],
        url: "/api/pages/concepts/gcse_maths_ch1_1_concept"
    }, {
        id: "gcse_maths_ch1_2_concept",
        title: "2. Solving Maths Problems",
        subtitle: "Using Essential GCSE Maths",
        type: "isaacConceptPage",
        tags: [ "maths", "geometry"],
        audience: [{ stage: ["a_level"]}],
        url: "/api/pages/concepts/gcse_maths_ch1_1_concept"
    }],
    get totalResults() {
        return this.results.length;
    }
};

export const mockConceptPage =
    {
        "type": "isaacConceptPage",
        "encoding": "markdown",
        "title": "Mock concept page",
        "children": [
            {
                "type": "content",
                "encoding": "markdown",
                "value": "This is some text on a concept page."
            },
            {
                "type": "content",
                "layout": "accordion",
                "children": [
                    {
                        "type": "content",
                        "children": [
                            {
                                "type": "content",
                                "value": "This is some text within an accordion on a concept page.",
                                "encoding": "markdown"
                            }
                        ],
                        "level": "2",
                        "title": "Accordion",
                        "id": "_mock_accordion_",
                        "audience": [
                            {
                                "examBoard": [
                                    "aqa"
                                ],
                                "stage": [
                                    "a_level"
                                ]
                            }
                        ]
                    }
                ]
            }
        ],
        "id": "_mock_concept_page_",
        "summary": "A mock concept page",
        "tags": [
            "physics",
            "chemistry",
            "thermal"
        ],
        "published": false,
        "relatedContent": [
            "cc_ideal_gas"
        ],
        "subtitle": "Mock concept page"
    };

export const mockSearchResults = {
    results: [{
        id: "cooling_excalibur",
        title: "Cooling Excalibur",
        type: "isaacQuestionPage",
        level: 6,
        tags: ["chemistry", "entropy", "problem_solving", "physical"],
        url: "/isaac-api/api/pages/questions/cooling_excalibur",
        audience: [{"stage": ["university"], "difficulty": ["challenge_3"]}]
    }, {
        id: "cp_force",
        title: "Force",
        subtitle: "Newton's 2nd law, change in momentum, vectors",
        type: "isaacConceptPage",
        tags: ["dynamics", "physics", "mechanics"],
        audience: [{ stage: ["a_level"]}, { stage: ["gcse"]}],
        url: "/isaac-api/api/pages/concepts/cp_force"
    }, {
        id: "book_physics_skills_19",
        title: "Essential Pre-University Physics",
        subtitle: "By A. C. Machacek and J. J. Crowter, with extra questions written by L. C. Phillips",
        type: "isaacBookIndexPage",
        tags: ["physics", "physics_skills_19"],
        url: "/isaac-api/api/pages/book_physics_skills_19"
    }, {
        id: "book_physics_skills_19__a1",
        title: "Using and Rearranging Equations",
        subtitle: "A1",
        type: "isaacBookDetailPage",
        tags: ["physics", "physics_skills_19"],
        url: "/isaac-api/api/pages/book_physics_skills_19__a1"
    }, {
        id: "spc",
        title: "Senior Physics Challenge (SPC)",
        summary: "Learn more about our summer school for UK Y12 students.",
        type: "page",
        tags: ["search_result"],
        url: "/isaac-api/api/pages/spc"
    }, {
        id: "d57ad3a6-6656-4ed7-81df-8d3f680839a6",
        title: "Event regression test",
        subtitle: "Open event with free spaces",
        type: "isaacEventPage",
        tags: ["regression_test", "student"],
        url: "/isaac-api/api/pages/d57ad3a6-6656-4ed7-81df-8d3f680839a6"
    }, {
        id: "topic_summary_number_representation",
        title: "Representation of numbers",
        type: "isaacTopicSummaryPage",
        tags: ["computer_systems", "computer_science", "number_representation"],
        url: "/isaac-api/api/pages/topic_summary_number_representation"
    }],
    get totalResults() {
        return this.results.length;
    }
};

const gameboardContents = {
    37: {
        id: "test-gameboard-2",
        title: "Test Gameboard 2",
        contents: [
            {
                id: "phys19_a1_q1",
                contentType: "isaacQuestionPage",
                title: "Essential Pre-Uni Physics A1.1",
                uri: "/isaac-api/api/pages/questions/phys19_a1_q1",
                tags: [
                    "maths",
                    "book",
                    "physics_skills_19",
                    "algebra",
                    "manipulation"
                ],
                audience: [
                    {
                        stage: [
                            "a_level"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    },
                    {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    }
                ],
                creationContext: {},
                level: 0,
                questionPartsCorrect: 0,
                questionPartsIncorrect: 0,
                questionPartsNotAttempted: 2,
                questionPartsTotal: 2,
                passMark: 75.0,
                state: "NOT_ATTEMPTED",
                questionPartStates: [
                    "NOT_ATTEMPTED",
                    "NOT_ATTEMPTED"
                ]
            },
            {
                id: "phys19_a1_q2",
                contentType: "isaacQuestionPage",
                title: "Essential Pre-Uni Physics A1.2",
                uri: "/isaac-api/api/pages/questions/phys19_a1_q2",
                tags: [
                    "maths",
                    "book",
                    "physics_skills_19",
                    "algebra",
                    "manipulation"
                ],
                audience: [
                    {
                        stage: [
                            "a_level"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    },
                    {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    }
                ],
                creationContext: {},
                level: 0,
                questionPartsCorrect: 0,
                questionPartsIncorrect: 0,
                questionPartsNotAttempted: 1,
                questionPartsTotal: 1,
                passMark: 75.0,
                state: "NOT_ATTEMPTED",
                questionPartStates: [
                    "NOT_ATTEMPTED"
                ]
            },
            {
                id: "phys19_a1_q3",
                contentType: "isaacQuestionPage",
                title: "Essential Pre-Uni Physics A1.3",
                uri: "/isaac-api/api/pages/questions/phys19_a1_q3",
                tags: [
                    "maths",
                    "book",
                    "physics_skills_19",
                    "algebra",
                    "manipulation"
                ],
                audience: [
                    {
                        stage: [
                            "a_level"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    },
                    {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    }
                ],
                creationContext: {},
                level: 0,
                questionPartsCorrect: 0,
                questionPartsIncorrect: 0,
                questionPartsNotAttempted: 1,
                questionPartsTotal: 1,
                passMark: 75.0,
                state: "NOT_ATTEMPTED",
                questionPartStates: [
                    "NOT_ATTEMPTED"
                ]
            },
            {
                id: "phys19_a1_q4",
                contentType: "isaacQuestionPage",
                title: "Essential Pre-Uni Physics A1.4",
                uri: "/isaac-api/api/pages/questions/phys19_a1_q4",
                tags: [
                    "maths",
                    "book",
                    "physics_skills_19",
                    "algebra",
                    "manipulation"
                ],
                audience: [
                    {
                        stage: [
                            "a_level"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    },
                    {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    }
                ],
                creationContext: {},
                level: 0,
                questionPartsCorrect: 0,
                questionPartsIncorrect: 0,
                questionPartsNotAttempted: 1,
                questionPartsTotal: 1,
                passMark: 75.0,
                state: "NOT_ATTEMPTED",
                questionPartStates: [
                    "NOT_ATTEMPTED"
                ]
            },
            {
                id: "phys19_a1_q5",
                contentType: "isaacQuestionPage",
                title: "Essential Pre-Uni Physics A1.5",
                uri: "/isaac-api/api/pages/questions/phys19_a1_q5",
                tags: [
                    "maths",
                    "book",
                    "physics_skills_19",
                    "algebra",
                    "manipulation"
                ],
                audience: [
                    {
                        stage: [
                            "a_level"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    },
                    {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    }
                ],
                creationContext: {},
                level: 0,
                questionPartsCorrect: 0,
                questionPartsIncorrect: 0,
                questionPartsNotAttempted: 2,
                questionPartsTotal: 2,
                passMark: 75.0,
                state: "NOT_ATTEMPTED",
                questionPartStates: [
                    "NOT_ATTEMPTED",
                    "NOT_ATTEMPTED"
                ]
            }
        ],
        wildCard: {
            id: "aboutUsWildCard",
            title: "About Us",
            type: "isaacWildcard",
            canonicalSourceFile: "content/wildcards/aboutUs.json",
            children: [],
            published: true,
            tags: [
                "maths",
                "physics"
            ],
            description: "Who created Isaac Physics?",
            url: "/about"
        },
        wildCardPosition: 0,
        creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
        gameFilter: {
            subjects: [
                "maths"
            ],
            fields: [],
            topics: [],
            levels: [],
            stages: [],
            difficulties: [],
            examBoards: [],
            concepts: [],
            questionCategories: []
        },
        ownerId: mockUser.id,
        tags: [
            "ISAAC_BOARD"
        ],
        creationMethod: "BUILDER",
        percentageCompleted: 0,
        startedQuestion: false
    },
    38: {
        id: "test-gameboard-2",
        title: "Test Gameboard 2",
        contents: [
            {
                id: "phys19_a1_q1",
                contentType: "isaacQuestionPage",
                title: "Essential Pre-Uni Physics A1.1",
                uri: "/isaac-api/api/pages/questions/phys19_a1_q1",
                tags: [
                    "maths",
                    "book",
                    "physics_skills_19",
                    "algebra",
                    "manipulation"
                ],
                audience: [
                    {
                        stage: [
                            "a_level"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    },
                    {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    }
                ],
                creationContext: {},
                level: 0,
                questionPartsCorrect: 0,
                questionPartsIncorrect: 0,
                questionPartsNotAttempted: 2,
                questionPartsTotal: 2,
                passMark: 75.0,
                state: "NOT_ATTEMPTED",
                questionPartStates: [
                    "NOT_ATTEMPTED",
                    "NOT_ATTEMPTED"
                ]
            },
            {
                id: "phys19_a1_q2",
                contentType: "isaacQuestionPage",
                title: "Essential Pre-Uni Physics A1.2",
                uri: "/isaac-api/api/pages/questions/phys19_a1_q2",
                tags: [
                    "maths",
                    "book",
                    "physics_skills_19",
                    "algebra",
                    "manipulation"
                ],
                audience: [
                    {
                        stage: [
                            "a_level"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    },
                    {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    }
                ],
                creationContext: {},
                level: 0,
                questionPartsCorrect: 0,
                questionPartsIncorrect: 0,
                questionPartsNotAttempted: 1,
                questionPartsTotal: 1,
                passMark: 75.0,
                state: "NOT_ATTEMPTED",
                questionPartStates: [
                    "NOT_ATTEMPTED"
                ]
            },
            {
                id: "phys19_a1_q3",
                contentType: "isaacQuestionPage",
                title: "Essential Pre-Uni Physics A1.3",
                uri: "/isaac-api/api/pages/questions/phys19_a1_q3",
                tags: [
                    "maths",
                    "book",
                    "physics_skills_19",
                    "algebra",
                    "manipulation"
                ],
                audience: [
                    {
                        stage: [
                            "a_level"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    },
                    {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    }
                ],
                creationContext: {},
                level: 0,
                questionPartsCorrect: 0,
                questionPartsIncorrect: 0,
                questionPartsNotAttempted: 1,
                questionPartsTotal: 1,
                passMark: 75.0,
                state: "NOT_ATTEMPTED",
                questionPartStates: [
                    "NOT_ATTEMPTED"
                ]
            },
            {
                id: "phys19_a1_q4",
                contentType: "isaacQuestionPage",
                title: "Essential Pre-Uni Physics A1.4",
                uri: "/isaac-api/api/pages/questions/phys19_a1_q4",
                tags: [
                    "maths",
                    "book",
                    "physics_skills_19",
                    "algebra",
                    "manipulation"
                ],
                audience: [
                    {
                        stage: [
                            "a_level"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    },
                    {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    }
                ],
                creationContext: {},
                level: 0,
                questionPartsCorrect: 0,
                questionPartsIncorrect: 0,
                questionPartsNotAttempted: 1,
                questionPartsTotal: 1,
                passMark: 75.0,
                state: "NOT_ATTEMPTED",
                questionPartStates: [
                    "NOT_ATTEMPTED"
                ]
            },
            {
                id: "phys19_a1_q5",
                contentType: "isaacQuestionPage",
                title: "Essential Pre-Uni Physics A1.5",
                uri: "/isaac-api/api/pages/questions/phys19_a1_q5",
                tags: [
                    "maths",
                    "book",
                    "physics_skills_19",
                    "algebra",
                    "manipulation"
                ],
                audience: [
                    {
                        stage: [
                            "a_level"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    },
                    {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    }
                ],
                creationContext: {},
                level: 0,
                questionPartsCorrect: 0,
                questionPartsIncorrect: 0,
                questionPartsNotAttempted: 2,
                questionPartsTotal: 2,
                passMark: 75.0,
                state: "NOT_ATTEMPTED",
                questionPartStates: [
                    "NOT_ATTEMPTED",
                    "NOT_ATTEMPTED"
                ]
            }
        ],
        wildCard: {
            id: "aboutUsWildCard",
            title: "About Us",
            type: "isaacWildcard",
            canonicalSourceFile: "content/wildcards/aboutUs.json",
            children: [],
            published: true,
            tags: [
                "maths",
                "physics"
            ],
            description: "Who created Isaac Physics?",
            url: "/about"
        },
        wildCardPosition: 0,
        creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
        gameFilter: {
            subjects: [
                "maths"
            ],
            fields: [],
            topics: [],
            levels: [],
            stages: [],
            difficulties: [],
            examBoards: [],
            concepts: [],
            questionCategories: []
        },
        ownerId: mockUser.id,
        tags: [
            "ISAAC_BOARD"
        ],
        creationMethod: "BUILDER",
        percentageCompleted: 0,
        startedQuestion: false
    },
    40: {
        id: "test-gameboard-1",
        title: "Test Gameboard 1",
        contents: [
            {
                id: "phys_linking_17_q1",
                contentType: "isaacQuestionPage",
                title: "Banked Tracks for Turning 17.1",
                uri: "/isaac-api/api/pages/questions/phys_linking_17_q1",
                tags: [
                    "circular_motion",
                    "book",
                    "physics",
                    "physics_linking_concepts",
                    "mechanics"
                ],
                audience: [
                    {
                        stage: [
                            "a_level"
                        ],
                        difficulty: [
                            "practice_2"
                        ]
                    }
                ],
                creationContext: {},
                level: 0,
                questionPartsCorrect: 0,
                questionPartsIncorrect: 0,
                questionPartsNotAttempted: 6,
                questionPartsTotal: 6,
                passMark: 75.0,
                state: "NOT_ATTEMPTED",
                questionPartStates: [
                    "NOT_ATTEMPTED",
                    "NOT_ATTEMPTED",
                    "NOT_ATTEMPTED",
                    "NOT_ATTEMPTED",
                    "NOT_ATTEMPTED",
                    "NOT_ATTEMPTED"
                ]
            },
            {
                id: "phys_linking_17_q2",
                contentType: "isaacQuestionPage",
                title: "Banked Tracks for Turning 17.2",
                uri: "/isaac-api/api/pages/questions/phys_linking_17_q2",
                tags: [
                    "circular_motion",
                    "book",
                    "physics",
                    "physics_linking_concepts",
                    "mechanics"
                ],
                audience: [
                    {
                        stage: [
                            "a_level"
                        ],
                        difficulty: [
                            "practice_2"
                        ]
                    }
                ],
                creationContext: {},
                level: 0,
                questionPartsCorrect: 0,
                questionPartsIncorrect: 0,
                questionPartsNotAttempted: 3,
                questionPartsTotal: 3,
                passMark: 75.0,
                state: "NOT_ATTEMPTED",
                questionPartStates: [
                    "NOT_ATTEMPTED",
                    "NOT_ATTEMPTED",
                    "NOT_ATTEMPTED"
                ]
            }
        ],
        wildCard: {
            id: "sig_figs_wildcard",
            title: "Significant Figures",
            type: "isaacWildcard",
            author: "mjc209",
            canonicalSourceFile: "content/wildcards/sig_figs.json",
            children: [],
            published: true,
            tags: [
                "chemistry",
                "maths",
                "physics"
            ],
            description: "How to use significant figures",
            url: "/solving_problems#acc_solving_problems_sig_figs"
        },
        wildCardPosition: 0,
        creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
        gameFilter: {
            subjects: [
                "physics"
            ],
            fields: [],
            topics: [],
            levels: [],
            stages: [],
            difficulties: [],
            examBoards: [],
            concepts: [],
            questionCategories: []
        },
        ownerId: mockUser.id,
        tags: [
            "ISAAC_BOARD"
        ],
        creationMethod: "BUILDER",
        percentageCompleted: 0,
        startedQuestion: false
    },
    45: {
        id: "test-gameboard-3",
        title: "Test Gameboard 3",
        contents: [
            {
                id: "gravitational_stability",
                contentType: "isaacQuestionPage",
                title: "Gravitational Stability",
                uri: "/isaac-api/api/pages/questions/gravitational_stability",
                tags: [
                    "physics",
                    "fields",
                    "gravitational"
                ],
                creationContext: {},
                level: 6,
                questionPartsCorrect: 0,
                questionPartsIncorrect: 0,
                questionPartsNotAttempted: 3,
                questionPartsTotal: 3,
                passMark: 75.0,
                state: "NOT_ATTEMPTED",
                questionPartStates: [
                    "NOT_ATTEMPTED",
                    "NOT_ATTEMPTED",
                    "NOT_ATTEMPTED"
                ]
            },
            {
                id: "gcse_maths_ch3_15_q4",
                contentType: "isaacQuestionPage",
                title: "Essential GCSE Maths 15.4",
                uri: "/isaac-api/api/pages/questions/gcse_maths_ch3_15_q4",
                tags: [
                    "maths",
                    "book",
                    "maths_book_gcse",
                    "algebra",
                    "manipulation"
                ],
                audience: [
                    {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "challenge_1"
                        ]
                    },
                    {
                        stage: [
                            "a_level"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    }
                ],
                creationContext: {},
                level: 0,
                questionPartsCorrect: 0,
                questionPartsIncorrect: 0,
                questionPartsNotAttempted: 3,
                questionPartsTotal: 3,
                passMark: 75.0,
                state: "NOT_ATTEMPTED",
                questionPartStates: [
                    "NOT_ATTEMPTED",
                    "NOT_ATTEMPTED",
                    "NOT_ATTEMPTED"
                ]
            },
            {
                id: "gcse_ch1_3_q2",
                contentType: "isaacQuestionPage",
                title: "Essential GCSE Physics  3.2",
                uri: "/isaac-api/api/pages/questions/gcse_ch1_3_q2",
                tags: [
                    "skills",
                    "relationships",
                    "phys_book_gcse",
                    "book",
                    "physics"
                ],
                audience: [
                    {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "practice_2"
                        ]
                    },
                    {
                        stage: [
                            "a_level"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    }
                ],
                creationContext: {},
                level: 0,
                questionPartsCorrect: 0,
                questionPartsIncorrect: 0,
                questionPartsNotAttempted: 5,
                questionPartsTotal: 5,
                passMark: 75.0,
                state: "NOT_ATTEMPTED",
                questionPartStates: [
                    "NOT_ATTEMPTED",
                    "NOT_ATTEMPTED",
                    "NOT_ATTEMPTED",
                    "NOT_ATTEMPTED",
                    "NOT_ATTEMPTED"
                ]
            },
            {
                id: "gcse_ch4_30_q16_es",
                contentType: "isaacQuestionPage",
                title: "Essential GCSE Physics 30.16",
                uri: "/isaac-api/api/pages/questions/gcse_ch4_30_q16_es",
                tags: [
                    "phys_book_gcse",
                    "physics",
                    "book"
                ],
                audience: [
                    {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "challenge_2"
                        ]
                    },
                    {
                        stage: [
                            "a_level"
                        ],
                        difficulty: [
                            "practice_2"
                        ]
                    }
                ],
                creationContext: {},
                level: 0,
                questionPartsCorrect: 0,
                questionPartsIncorrect: 0,
                questionPartsNotAttempted: 1,
                questionPartsTotal: 1,
                passMark: 75.0,
                state: "NOT_ATTEMPTED",
                questionPartStates: [
                    "NOT_ATTEMPTED"
                ]
            },
            {
                id: "gcse_ch3_26_q8_es",
                contentType: "isaacQuestionPage",
                title: "Essential GCSE Physics 26.8",
                uri: "/isaac-api/api/pages/questions/gcse_ch3_26_q8_es",
                tags: [
                    "phys_book_gcse",
                    "physics",
                    "book"
                ],
                audience: [
                    {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    },
                    {
                        stage: [
                            "year_9"
                        ],
                        difficulty: [
                            "challenge_2"
                        ]
                    }
                ],
                creationContext: {},
                level: 0,
                questionPartsCorrect: 0,
                questionPartsIncorrect: 0,
                questionPartsNotAttempted: 1,
                questionPartsTotal: 1,
                passMark: 75.0,
                state: "NOT_ATTEMPTED",
                questionPartStates: [
                    "NOT_ATTEMPTED"
                ]
            },
            {
                id: "gcse_ch1_5_q3",
                contentType: "isaacQuestionPage",
                title: "Skills - Variables and Constants 5.3",
                uri: "/isaac-api/api/pages/questions/gcse_ch1_5_q3",
                tags: [
                    "phys_book_gcse",
                    "physics",
                    "thermal",
                    "gases"
                ],
                audience: [
                    {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    },
                    {
                        stage: [
                            "a_level"
                        ],
                        difficulty: [
                            "practice_2"
                        ]
                    }
                ],
                creationContext: {},
                level: 0,
                questionPartsCorrect: 0,
                questionPartsIncorrect: 0,
                questionPartsNotAttempted: 3,
                questionPartsTotal: 3,
                passMark: 75.0,
                state: "NOT_ATTEMPTED",
                questionPartStates: [
                    "NOT_ATTEMPTED",
                    "NOT_ATTEMPTED",
                    "NOT_ATTEMPTED"
                ]
            },
            {
                id: "gcse_ch2_8_q7_es",
                contentType: "isaacQuestionPage",
                title: "Essential GCSE Physics  8.7",
                uri: "/isaac-api/api/pages/questions/gcse_ch2_8_q7_es",
                tags: [
                    "phys_book_gcse",
                    "physics",
                    "book"
                ],
                audience: [
                    {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    },
                    {
                        stage: [
                            "year_7_and_8"
                        ],
                        difficulty: [
                            "challenge_1"
                        ]
                    }
                ],
                creationContext: {},
                level: 0,
                questionPartsCorrect: 0,
                questionPartsIncorrect: 0,
                questionPartsNotAttempted: 1,
                questionPartsTotal: 1,
                passMark: 75.0,
                state: "NOT_ATTEMPTED",
                questionPartStates: [
                    "NOT_ATTEMPTED"
                ]
            },
            {
                id: "manipulation_4_4",
                contentType: "isaacQuestionPage",
                title: "Algebraic Manipulation 4.4",
                uri: "/isaac-api/api/pages/questions/manipulation_4_4",
                tags: [
                    "maths",
                    "problem_solving",
                    "algebra",
                    "manipulation"
                ],
                audience: [
                    {
                        stage: [
                            "a_level"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    },
                    {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "challenge_1"
                        ]
                    }
                ],
                creationContext: {},
                level: 4,
                questionPartsCorrect: 0,
                questionPartsIncorrect: 0,
                questionPartsNotAttempted: 4,
                questionPartsTotal: 4,
                passMark: 75.0,
                state: "NOT_ATTEMPTED",
                questionPartStates: [
                    "NOT_ATTEMPTED",
                    "NOT_ATTEMPTED",
                    "NOT_ATTEMPTED",
                    "NOT_ATTEMPTED"
                ]
            },
            {
                id: "step_up_39_q9",
                contentType: "isaacQuestionPage",
                title: "Step up to GCSE Electricity Calculation Practice 39.9",
                uri: "/isaac-api/api/pages/questions/step_up_39_q9",
                tags: [
                    "resistors",
                    "book",
                    "physics",
                    "electricity",
                    "phys_book_step_up"
                ],
                audience: [
                    {
                        stage: [
                            "year_9"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    },
                    {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    }
                ],
                creationContext: {},
                level: 0,
                questionPartsCorrect: 0,
                questionPartsIncorrect: 0,
                questionPartsNotAttempted: 1,
                questionPartsTotal: 1,
                passMark: 75.0,
                state: "NOT_ATTEMPTED",
                questionPartStates: [
                    "NOT_ATTEMPTED"
                ]
            },
            {
                id: "gcse_ch6_52_q3",
                contentType: "isaacQuestionPage",
                title: "Essential GCSE Physics 52.3",
                uri: "/isaac-api/api/pages/questions/gcse_ch6_52_q3",
                tags: [
                    "phys_book_gcse",
                    "book",
                    "physics",
                    "waves_particles",
                    "nuclear"
                ],
                audience: [
                    {
                        stage: [
                            "gcse"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    },
                    {
                        stage: [
                            "a_level"
                        ],
                        difficulty: [
                            "practice_1"
                        ]
                    }
                ],
                creationContext: {},
                level: 0,
                questionPartsCorrect: 0,
                questionPartsIncorrect: 0,
                questionPartsNotAttempted: 1,
                questionPartsTotal: 1,
                passMark: 75.0,
                state: "NOT_ATTEMPTED",
                questionPartStates: [
                    "NOT_ATTEMPTED"
                ]
            }
        ],
        wildCard: {
            id: "wildcard_mentor_scheme",
            title: "Mentoring",
            type: "isaacWildcard",
            author: "allydavies",
            canonicalSourceFile: "content/wildcards/mentor_scheme.json",
            children: [],
            published: true,
            tags: [
                "maths",
                "physics"
            ],
            description: "Isaac Mentor Scheme",
            url: "/pages/isaac_mentor"
        },
        wildCardPosition: 7,
        creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
        gameFilter: {
            subjects: [
                "physics",
                "maths"
            ]
        },
        ownerId: mockUser.id,
        tags: [],
        creationMethod: "FILTER",
        percentageCompleted: 0,
        startedQuestion: false
    },
};

export const mockSetAssignments = [
    {
        id: 37,
        gameboardId: "test-gameboard-2",
        groupId: 2,
        groupName: "Test Group 1",
        ownerId: mockUser.id,
        creationDate: new Date(SOME_FIXED_PAST_DATE),
        dueDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -5),
        scheduledStartDate: new Date(SOME_FIXED_PAST_DATE),
        gameboard: gameboardContents[37],
    },
    {
        id: 38,
        gameboardId: "test-gameboard-3",
        groupId: 6,
        groupName: "Test Group 2",
        ownerId: mockUser.id,
        creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
        dueDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -5),
        scheduledStartDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 1),
        gameboard: gameboardContents[38],
    },
    {
        id: 40,
        gameboardId: "test-gameboard-1",
        groupId: 2,
        groupName: "Test Group 1",
        ownerId: mockUser.id,
        creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
        dueDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -5),
        scheduledStartDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 1),
        gameboard: gameboardContents[40],
    },
    {
        id: 45,
        gameboardId: "test-gameboard-3",
        groupId: 2,
        groupName: "Test Group 1",
        ownerId: mockUser.id,
        notes: "This is cool ",
        creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
        dueDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -5),
        scheduledStartDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 1),
        gameboard: gameboardContents[45],
    }
];

export const mockQuizAssignments = [
    {
        id: 9,
        quizId: "test-quiz-assignment-1",
        groupId: 2,
        ownerId: mockUser.id,
        assignerSummary: buildMockUserSummary(mockUser, false),
        creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 5),
        dueDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -5),
        quizFeedbackMode: "DETAILED_FEEDBACK",
        attempt: {
            id: 6,
            userId: 1,
            quizId: "test-quiz-assignment-1",
            quizAssignmentId: 9,
            startDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
            completedDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 2)
        },
        quizSummary: {
            id: "test-quiz-assignment-1",
            title: "Test Quiz Assignment 1",
            type: "isaacQuiz",
            tags: [],
            url: "/isaac-api/api/quiz/test-quiz-assignment-1",
            visibleToStudents: false,
            hiddenFromRoles: [
                "TEACHER",
                "STUDENT"
            ]
        }
    },
    {
        id: 10,
        quizId: "test-quiz-assignment-2",
        quizSummary: {
            id: "test-quiz-assignment-2",
            title: "Test Quiz Assignment 2",
            type: "isaacQuiz",
            tags: [],
            url: "/isaac-api/api/quiz/test-quiz-assignment-2",
            visibleToStudents: false,
            hiddenFromRoles: [
                "TEACHER",
                "STUDENT"
            ]
        },
        groupId: 2,
        ownerId: mockUser.id,
        assignerSummary: buildMockUserSummary(mockUser, false),
        creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 5),
        dueDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -5),
        quizFeedbackMode: "DETAILED_FEEDBACK",
        attempt: {
            id: 7,
            userId: 1,
            quizId: "test-quiz-assignment-2",
            quizAssignmentId: 10,
            startDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
            completedDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 2)
        }
    },
    {
        id: 11,
        quizId: "test-quiz-assignment-3",
        quizSummary: {
            id: "test-quiz-assignment-3",
            title: "Test Quiz Assignment 3",
            type: "isaacQuiz",
            tags: [],
            url: "/isaac-api/api/quiz/test-quiz-assignment-3",
            visibleToStudents: false,
            hiddenFromRoles: [
                "TEACHER",
                "STUDENT"
            ]
        },
        groupId: 2,
        ownerId: mockUser.id,
        assignerSummary: buildMockUserSummary(mockUser, false),
        creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 5),
        dueDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -5),
        quizFeedbackMode: "DETAILED_FEEDBACK",
    }
];

export const mockFreeAttempts = [
    {
        "id": 8,
        "userId": 9,
        "quizId": "test-free-attempt-1",
        "quizSummary": {
            "id": "test-free-attempt-1",
            "title": "Practice Quiz 1",
            "type": "isaacQuiz",
            "tags": [],
            "url": "/isaac-api/api/quiz/test-free-attempt-1",
            "audience": [
                {
                    "stage": [
                        "a_level"
                    ]
                },
                {
                    "stage": [
                        "university"
                    ]
                }
            ],
            "hiddenFromRoles": []
        },
        "startDate": DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 5),
    },
    {
        "id": 9,
        "userId": 9,
        "quizId": "test-free-attempt-2",
        "quizSummary": {
            "id": "test-free-attempt-2",
            "title": "Practice Quiz 2",
            "type": "isaacQuiz",
            "tags": [],
            "url": "/isaac-api/api/quiz/test-free-attempt-2",
            "audience": [
                {
                    "stage": [
                        "a_level"
                    ]
                },
                {
                    "stage": [
                        "university"
                    ]
                }
            ],
            "hiddenFromRoles": []
        },
        "startDate": DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 5),
        "completedDate": DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 2)
    },
];

export const mockGroups = [
    {
        id: 2,
        groupName: "Test Group 1",
        ownerId: mockUser.id,
        created: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -20),
        lastUpdated: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -20),
        archived: false,
        ownerSummary: buildMockUserSummary(mockUser, false),
        additionalManagers: [],
    },
    {
        id: 6,
        groupName: "Test Group 2",
        ownerId: mockUser.id,
        created: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -25),
        lastUpdated: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -25),
        archived: false,
        ownerSummary: buildMockUserSummary(mockUser, false),
        additionalManagers: [],
    },
    {
        id: 7,
        groupName: "Test Group 3",
        ownerId: mockUser.id,
        created: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -50),
        lastUpdated: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -30),
        archived: true,
        ownerSummary: buildMockUserSummary(mockUser, false),
        additionalManagers: [],
    },
];
export const mockActiveGroups = mockGroups.filter(g => !g.archived);
export const mockArchivedGroups = mockGroups.filter(g => g.archived);

export const mockAssignmentsGroup2 = [
    mockSetAssignments.find(a => a.id === 37),
    mockSetAssignments.find(a => a.id === 40),
    mockSetAssignments.find(a => a.id === 45),
].filter(isDefined);

export const mockAssignmentsGroup6 = [
    mockSetAssignments.find(a => a.id === 38)!,
].filter(isDefined);

export const mockUserPreferences = {
    EMAIL_PREFERENCE: {
        EVENTS: false,
        NEWS_AND_UPDATES: false,
        ASSIGNMENTS: true
    },
    BOOLEAN_NOTATION: {
        MATH: true,
        ENG: false
    },
    DISPLAY_SETTING: {
        HIDE_QUESTION_ATTEMPTS: true
    }
};

export const mockProgress = {
    40: [
        {
            "user": {
                "givenName": "unauthorised",
                "familyName": "account",
                "role": "STUDENT",
                "authorisedFullAccess": false,
                "emailVerificationStatus": "NOT_VERIFIED",
                "registeredContexts": [],
                "id": 19
            },
            "correctPartResults": null,
            "incorrectPartResults": null,
            "questionResults": null,
            "questionPartResults": null,
        },
        {
            "user": {
                "givenName": "test",
                "familyName": "student 1",
                "role": "ADMIN",
                "authorisedFullAccess": true,
                "emailVerificationStatus": "VERIFIED",
                "registeredContexts": [
                    {
                        "stage": "a_level"
                    }
                ],
                "id": 9
            },
            "correctPartResults": [
                6,
                1
            ],
            "incorrectPartResults": [
                0,
                2
            ],
            "questionResults": [
                "ALL_CORRECT",
                "ALL_ATTEMPTED"
            ],
            "questionPartResults": [
                [
                    "CORRECT",
                    "CORRECT",
                    "CORRECT",
                    "CORRECT",
                    "CORRECT",
                    "CORRECT"
                ],
                [
                    "CORRECT",
                    "INCORRECT",
                    "INCORRECT"
                ]
            ]
        },
        {
            "user": {
                "givenName": "student",
                "familyName": "name",
                "role": "STUDENT",
                "authorisedFullAccess": true,
                "emailVerificationStatus": "NOT_VERIFIED",
                "registeredContexts": [
                    {
                        "stage": "gcse"
                    }
                ],
                "id": 8
            },
            "correctPartResults": [
                0,
                0
            ],
            "incorrectPartResults": [
                6,
                0
            ],
            "questionResults": [
                "ALL_INCORRECT",
                "NOT_ATTEMPTED"
            ],
            "questionPartResults": [
                [
                    "INCORRECT",
                    "INCORRECT",
                    "INCORRECT",
                    "INCORRECT",
                    "INCORRECT",
                    "INCORRECT"
                ],
                [
                    "NOT_ATTEMPTED",
                    "NOT_ATTEMPTED",
                    "NOT_ATTEMPTED"
                ]
            ]
        },
    ]
};

export const mockUserAuthSettings = {
    linkedAccounts: [],
    hasSegueAccount: true,
    mfaStatus: true,
    id: mockUser.id
};

const newsPodTag = siteSpecific("physics", "news");
export const mockNewsPods = {
    results: [
        {
            id: "test-news-pod-1",
            title: "Test News Pod 1",
            type: "isaacPod",
            encoding: "markdown",
            children: [],
            value: "Isaac provides a free topic-based learning plan for Yr 10-13 students working independently from home and for schools offering support.",
            tags: [
                newsPodTag
            ],
            image: {
                type: "image",
                children: [],
                published: false,
                src: "/assets/phy/events/teacher.jpg",
                altText: "Image of students problem solving together."
            },
            url: "/pages/summer_programmes_2021",
            published: true
        },
        {
            id: "test-news-pod-2",
            title: "Test News Pod 2",
            type: "isaacPod",
            encoding: "markdown",
            children: [],
            value: "These quizzes will help you to revise, rearrange equations, change units and practise extracting the correct information from a question.",
            tags: [
                newsPodTag,
                FEATURED_NEWS_TAG
            ],
            image: {
                type: "image",
                children: [],
                published: false,
                src: "/assets/phy/events/teacher.jpg",
                altText: "Image of students problem solving together."
            },
            url: "/pages/gcse_quizzes",
            published: true
        },
        {
            id: "test-news-pod-3",
            title: "Test News Pod 3",
            type: "isaacPod",
            encoding: "markdown",
            children: [],
            value: "Use these boards as they are, customise them, or create your own boards to meet your own needs.",
            tags: [
                newsPodTag
            ],
            image: {
                type: "image",
                children: [],
                published: false,
                src: "/assets/phy/events/teacher.jpg",
                altText: "Image of students problem solving together."
            },
            url: "/pages/pre_made_gameboards#gcse_example",
            published: true
        },
        {
            id: "test-news-pod-4",
            title: "Test News Pod 4",
            type: "isaacPod",
            encoding: "markdown",
            children: [],
            value: "Announcing our new computer science collaboration!",
            tags: [
                newsPodTag,
                FEATURED_NEWS_TAG
            ],
            image: {
                type: "image",
                children: [],
                published: false,
                src: "/assets/phy/events/teacher.jpg",
                altText: "Image of students problem solving together."
            },
            url: "/pages/isaac_computer_science",
            published: true
        },
        {
            id: "test-news-pod-5",
            title: "Test News Pod 5",
            type: "isaacPod",
            encoding: "markdown",
            children: [],
            value: "Order and explore our new books for GCSE Maths, pre-GCSE Physics, and linking concepts at A Level Physics.",
            tags: [
                newsPodTag
            ],
            image: {
                type: "image",
                children: [],
                published: false,
                src: "/assets/phy/events/teacher.jpg",
                altText: "Image of students problem solving together."
            },
            url: "/pages/book_launch_2022",
            published: true
        }
    ],
    totalResults: 5
};

export const mockFragment = (pageId: string) => ({
    id: pageId,
    type: "isaacPageFragment",
    canonicalSourceFile: `content/mocks/${pageId}.json`,
    title: `Mock page fragment: ${pageId}`,
    subtitle: "",
    encoding: "markdown",
    children: [
        {
            id: `${pageId}|inner-content`,
            title: "Mock page fragment inner",
            type: "isaacFeaturedProfile",
            encoding: "markdown",
            children: [
                {
                    type: "content",
                    encoding: "markdown",
                    children: [],
                    value: "This is some mock content. Yay!",
                    published: false,
                    tags: []
                }
            ],
            tags: [],
            image: {
                type: "image",
                children: [],
                published: false,
                src: "content/mock/doesnt_exist.png",
                altText: "Mock image that doesn't exist"
            },
            homepage: "/",
            published: true
        }
    ],
    published: true
});

export const buildMockPage = (pageId: string) => ({
    "id": pageId,
    "title": `Mock page: ${pageId}`,
    "type": "page",
    "encoding": "markdown",
    "canonicalSourceFile": `content/mocks/${pageId}.json`,
    "children": [
        {
            "type": "content",
            "encoding": "markdown",
            "children": [],
            "value": "On this page, we have a mock.",
            "tags": []
        },
    ],
    "published": true,
    "tags": []
});

export const mockSchool: School = {
    name: "University of Cambridge",
    urn: "133801",
    postcode: "CB2 1TN",
    closed: false,
    dataSource: "somewhere-over-the-rainbow",
};

export const buildMockEvent = (eventId: string, eventStatus: EventStatus, userBookingStatus?: BookingStatus) => ({
    title: `Test Event ${eventId}`,
    subtitle: "Test event",
    id: eventId,
    type: "isaacEventPage",
    children: [
        {
            type: "content",
            encoding: "markdown",
            children: [],
            value: `Slow TV with isaacphysics.org (test event ${eventId})`,
            published: false,
            tags: []
        }
    ],
    numberOfPlaces: 10,
    allowGroupReservations: true,
    eventStatus,
    placesAvailable: 10,
    userBookingStatus,
    date: 1458003600000,
    bookingDeadline: 4613418000000,
    location: {
        "address": {}
    },
    endDate: 4613677200000
});

export const buildMockQuestions = (n: number) => {
    return Array(n).fill(null).map((_, i) => ({ ...mockQuestionFinderResults.results[0], id: `q${i}`, title: `Question ${i}` }));
};

export const buildMockQuestionFinderResults = (questions: typeof mockQuestionFinderResults.results, start: number) => ({
    results: questions.slice(start, start + 31),
    nextSearchOffset: start + 31,
    totalResults: questions.length
});
