import {determinePageNavigation, DOCUMENT_TYPE, isPhy, PATHS} from "../../app/services";
import {
    AssignmentDTO,
    ContentDTO,
    ContentSummaryDTO,
    GameboardDTO,
    IsaacTopicSummaryPageDTO
} from "../../IsaacApiTypes";


describe("Breadcrumb trails", () => {
    if (isPhy) {
        it("for question page include Fasttrack gameboard crumb when possible", () => {
            // Arrange
            const gameboard: GameboardDTO = {
                id: "ft_core_2018",
                title: "Maths Stage 1 - Revision & Practice"
            };

            const document: ContentDTO = {
                id: "some_fasttrack_q",
                type: DOCUMENT_TYPE.FAST_TRACK_QUESTION
            };

            // Act
            const actual = determinePageNavigation(document, "some_fasttrack_q", gameboard, "ft_core_2018",
                undefined, null, undefined, undefined, "", {}).breadcrumbHistory;

            // Assert
            const expected = [
                {
                    title: "Maths Stage 1 - Revision & Practice",
                    to: `${PATHS.GAMEBOARD}#ft_core_2018`
                }
            ];

            expect(actual).toEqual(expected);
        });
    }

    if (isPhy) {
        it("for question page include assignments and gameboard crumbs when possible", () => {
            // Arrange
            const gameboard: GameboardDTO = {
                id: "some_gameboard",
                title: "Some gameboard"
            };

            const assignments: AssignmentDTO[] = [
                {
                    gameboard,
                    gameboardId: "some_gameboard"
                }
            ];

            const document: ContentDTO = {
                id: "some_q",
                type: DOCUMENT_TYPE.QUESTION
            };

            // Act
            const actual = determinePageNavigation(document, "some_q", gameboard, "some_gameboard", undefined,
                null, undefined, assignments, "", {}).breadcrumbHistory;

            // Assert
            const expected = [
                {
                    title: "Assignments",
                    to: "/assignments"
                },
                {
                    title: "Some gameboard",
                    to: `${PATHS.GAMEBOARD}#some_gameboard`
                }
            ];

            expect(actual).toEqual(expected);
        });
    }

    it("for question page use gameboard when possible", () => {
        // Arrange
        const gameboard: GameboardDTO = {
            id: "some_gameboard",
            title: "Some gameboard"
        };

        const document: ContentDTO = {
            id: "some_q",
            type: DOCUMENT_TYPE.QUESTION
        };

        // Act
        const actual = determinePageNavigation(document, "some_q", gameboard, "some_gameboard", undefined,
            null, undefined, undefined, "", {}).breadcrumbHistory;

        // Assert
        const expected =  [
            {
                title: "Some gameboard",
                to: `${PATHS.GAMEBOARD}#some_gameboard`
            }
        ];

        expect(actual).toEqual(expected);
    });

    it("for question page use default otherwise", () => {
        // Arrange
        const document: ContentDTO = {
            id: "some_question",
            type: DOCUMENT_TYPE.QUESTION
        };

        // Act
        const actual = determinePageNavigation(document, "some_question", undefined, undefined, undefined,
            null, undefined, undefined, "", {}).breadcrumbHistory;

        // Assert
        const expected = [
            {
                title: "Questions",
                to: "/questions"
            }
        ];

        expect(actual).toEqual(expected);
    });

    it("for concept page use topic when possible", () => {
        // Arrange
        const document: ContentDTO = {
            id: "some_concept",
            type: DOCUMENT_TYPE.CONCEPT
        };

        const topic: IsaacTopicSummaryPageDTO = {
            id: "topic_summary_some_topic",
            title: "Some topic",
            relatedContent: [document as ContentSummaryDTO]
        };

        // Act
        const actual = determinePageNavigation(document, "some_concept", undefined, undefined, undefined,
            topic, "some_topic", undefined, "", {}).breadcrumbHistory;

        // Assert
        const expected =  [
            {
                title: "All topics",
                to: "/topics"
            },
            {
                title: "Some topic",
                to: "/topics/some_topic"
            }
        ];

        expect(actual).toEqual(expected);
    });

    if (isPhy) {
        it("for concept page use default otherwise", () => {
            // Arrange
            const document: ContentDTO = {
                id: "some_concept",
                type: DOCUMENT_TYPE.CONCEPT
            };

            // Act
            const actual = determinePageNavigation(document, "some_concept", undefined, undefined, undefined,
                null, undefined, undefined, "", {}).breadcrumbHistory;

            // Assert
            const expected = [
                {
                    title: "Concepts",
                    to: "/concepts"
                }
            ];

            expect(actual).toEqual(expected);
        });
    }
}
);