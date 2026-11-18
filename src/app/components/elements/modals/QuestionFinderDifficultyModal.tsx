import React from "react";
import { Col } from "reactstrap";
import { siteSpecific } from "../../../services";
import { closeActiveModal, store } from "../../../state";
import { ActiveModalProps } from "../../../../IsaacAppTypes";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

const QuestionFinderDifficultyModal = () => {
    const { t } = useTranslation();
    return <Col>
        {siteSpecific(<p>
            {t("sci:questionFinder.difficulty.practiceIntro")}
            <ul>
                <li>
                    {t("sci:questionFinder.difficulty.practiceP1")}
                </li>
                <li>
                    {t("sci:questionFinder.difficulty.practiceP3")}
                </li>
            </ul>
            {t("sci:questionFinder.difficulty.challengeIntro")}
            <ul>
                <li>
                    {t("sci:questionFinder.difficulty.challengeC1")}
                </li>
                <li>
                    {t("sci:questionFinder.difficulty.challengeC3")}
                </li>
            </ul>
        </p>, <p>
            {t("ada:questionFinder.difficulty.categoriesIntro")}
            <ul>
                <li>
                    {t("ada:questionFinder.difficulty.practiceCategory")}
                </li>
                <li>
                    {t("ada:questionFinder.difficulty.challengeCategory")}
                </li>
            </ul>
        </p>)}
    </Col>;
};

export const questionFinderDifficultyModal = () : ActiveModalProps => {
    return {
        closeAction: () => store.dispatch(closeActiveModal()),
        title: i18next.t("site:questionFinder.difficulty.title"),
        body: <QuestionFinderDifficultyModal />,
    };
};
