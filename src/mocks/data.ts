import {siteSpecific} from "../app/services";
import {FEATURED_NEWS_TAG} from "../app/services";
import {DAYS_AGO, SOME_FIXED_FUTURE_DATE} from "../test/dateUtils";
import {
    BookingStatus,
    EmailVerificationStatus,
    EventStatus,
    UserRole,
    UserSummaryWithGroupMembershipDTO
} from "../IsaacApiTypes";
import {School} from "../IsaacAppTypes";

export const mockUser = {
    givenName: "Test",
    familyName: "Admin",
    email: "test-admin@test.com",
    dateOfBirth: 777777777777,
    gender: "MALE",
    registrationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 100),
    role: "ADMIN" as UserRole,
    schoolOther: "N/A",
    registeredContexts: [
        {
            stage: "all",
            examBoard: "all"
        }
    ],
    registeredContextsLastConfirmed: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -1),
    firstLogin: false,
    lastUpdated: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 1),
    lastSeen: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 1),
    emailVerificationStatus: "VERIFIED" as EmailVerificationStatus,
    id: 1 as const
};

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
        registeredContexts: [{
            stage: "all",
            examBoard: "all"
        }],
        registeredContextsLastConfirmed: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -1),
        firstLogin: false,
        lastUpdated: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 1),
        lastSeen: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 1),
        emailVerificationStatus: "VERIFIED",
        id: id,
    };
};

export const buildMockUserSummary = (user: any, authorisedFullAccess: boolean) => {
    const email = authorisedFullAccess ? user.email : undefined;
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
        _id: 37
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
        _id: 38
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
        _id: 40
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
        _id: 45
    }
];

export const mockSetAssignments = [
    {
        id: 37,
        gameboardId: "test-gameboard-2",
        groupId: 2,
        groupName: "Test Group 1",
        ownerId: mockUser.id,
        creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
        dueDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -5),
        scheduledStartDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 1),
    },
    {
        id: 38,
        gameboardId: "test-gameboard-2",
        groupId: 6,
        groupName: "Test Group 2",
        ownerId: mockUser.id,
        creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
        dueDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -5),
        scheduledStartDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 1),
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
    }
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
        ownerId: mockUser.id,
        creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
        dueDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -5),
        scheduledStartDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 1),
        _id: 37
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
        ownerId: mockUser.id,
        creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
        dueDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -5),
        scheduledStartDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 1),
        _id: 40
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
        ownerId: mockUser.id,
        notes: "This is cool ",
        creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
        dueDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -5),
        scheduledStartDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 1),
        _id: 45
    }
];

export const mockAssignmentsGroup6 = [
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
        ownerId: mockUser.id,
        creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
        dueDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -5),
        scheduledStartDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 1),
        _id: 38
    }
];

export const mockUserPreferences = {
    BETA_FEATURE: {
        HIDE_QUESTION_ATTEMPTS: true
    },
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
                src: "content/pods/figures/consolidation_small.jpg",
                altText: ""
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
                src: "content/pods/figures/eye.png",
                altText: "Image of an eye inside a magnifying glass."
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
                src: "content/pods/figures/isaaccomputerscience.png",
                altText: "Isaac Computer Science Logo."
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
                src: "content/pods/figures/3_books_pod.jpg",
                altText: ""
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