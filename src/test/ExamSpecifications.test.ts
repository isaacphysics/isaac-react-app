import {getFilteredExamBoardsByStage} from "../app/components/pages/ExamSpecifications";
import {EXAM_BOARD, STAGE} from "../app/services";


describe("ExamSpecifications", () => {
    it('should filter the available stage and exam board when a single stage/board pair is provided', async () => {
        // Arrange
        const stageFilter = [STAGE.GCSE];
        const examBoardFilter = [EXAM_BOARD.WJEC];

        const expected = {
            "gcse": [EXAM_BOARD.WJEC]
        };

        // Act
        const actual = getFilteredExamBoardsByStage(stageFilter, examBoardFilter);

        // Assert
        expect(actual).toEqual(expected);
    });

    it('should filter the available stage and exam board when multiple stage/board pairs are provided', async () => {
        // Arrange
        const stageFilter = [STAGE.GCSE, STAGE.A_LEVEL];
        const examBoardFilter = [EXAM_BOARD.WJEC, EXAM_BOARD.AQA];

        const expected = {
            "gcse": [EXAM_BOARD.AQA, EXAM_BOARD.WJEC],
            "a_level": [EXAM_BOARD.AQA, EXAM_BOARD.WJEC]
        };

        // Act
        const actual = getFilteredExamBoardsByStage(stageFilter, examBoardFilter);

        // Assert
        expect(actual).toEqual(expected);
    });
});