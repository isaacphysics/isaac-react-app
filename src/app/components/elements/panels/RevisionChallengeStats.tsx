import React from "react";
import { UserProgress } from "../../../../IsaacAppTypes";
import { ProgressBar } from "../views/ProgressBar";
import { isAda } from "../../../services";

interface ProgressChallenge {
    name: string;
    text?: React.ReactNode;
    target: number;
    active: boolean;
    displayed: boolean;
}

const isBetween = (start: Date, end: Date) => {
    const now = new Date();
    return start < now && now < end;
};

const REVISION_CHALLENGES: { [key: string]: ProgressChallenge } = {
    "ada-revision-challenge-2026": {
        name: "Ada Revision Challenge 2026",
        text: <span>
            Visit the <a href="/student_challenges" target="_blank" rel="noopener noreferrer">
                revision challenge page
            </a> for instructions on how to join.
        </span>,
        target: 50,
        active:    isAda && isBetween(new Date("2026-04-01"), new Date("2026-07-01")),
        displayed: isAda && isBetween(new Date("2026-04-01"), new Date("2026-08-01")),
    },
};

export const RevisionChallengeStats = ({userProgress}: {userProgress?: UserProgress | null}) => {
    // assumes there is only one active challenge! (completedQuestionsInChallenge is not challenge-specific)
    const displayedChallenge = Object.values(REVISION_CHALLENGES).find((c) => c.displayed);
    const completedQuestionsInChallenge = userProgress?.totalQuestionPartsCorrectThisRevisionPeriod ?? 0;
    const isComplete = completedQuestionsInChallenge >= (displayedChallenge?.target ?? Infinity);

    return displayedChallenge && <div key={displayedChallenge?.name} className="mb-3 w-50 mx-auto">
        <h5 className="mb-0">{displayedChallenge?.name}:</h5>
        {displayedChallenge?.text}
        {isComplete
            ? <ProgressBar percentage={100} className="mb-5 mt-2">
                {"Challenge complete!"}
            </ProgressBar>
            : <ProgressBar percentage={100 * (completedQuestionsInChallenge / (displayedChallenge?.target ?? 1))} className="mb-5 mt-2">
                {displayedChallenge.active 
                    ? completedQuestionsInChallenge == null ? "No data" : `${completedQuestionsInChallenge} correct, ${displayedChallenge?.target - completedQuestionsInChallenge} to go!`
                    : "Challenge over!"
                }
            </ProgressBar>
        }
    </div>;
};
