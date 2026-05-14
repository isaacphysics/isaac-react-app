import React from "react";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {PageFragment} from "../elements/PageFragment";
import {Col, Container, Row} from "reactstrap";
import {IconCard} from "../elements/cards/IconCard";
import {useLinkableSetting} from "../../services/linkableSetting";
import {selectors, useAppSelector, useGetPageFragmentQuery} from "../../state";
import { useTranslation } from 'react-i18next'

export const StudentChallenges = () => {
    const { t } = useTranslation()

    const userPreferences = useAppSelector(selectors.user.preferences);
    const {setLinkedSetting} = useLinkableSetting();
    const liveChallengeId = "live_challenge";
    const {isError} = useGetPageFragmentQuery(liveChallengeId);

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={"Student challenges"} />
        <Row>
            <Col lg={{size: 8, offset: 2}}>
                <PageFragment fragmentId={"student_challenges_intro"} />
                {!isError ?
                    <PageFragment fragmentId={liveChallengeId} />
                    :
                    <>
                        {userPreferences?.EMAIL_PREFERENCE?.EVENTS ?
                            <IconCard
                                card={{
                                    title: t('theNextChallenge', 'The next challenge'),
                                    icon: {name: "icon-events", color: "tertiary"},
                                    bodyText: t('thereAreNoChallengesRunningAtTheMomentButYoureSubscribedTo', 'There are no challenges running at the moment, but you\'re subscribed to ') +
                                        t('ourMailingListAndWillBeTheFirstToKnowAboutTheNextOne', 'our mailing list and will be the first to know about the next one!'),
                                }}
                                className={"mx-n3"}
                            />
                            :
                            <IconCard
                                card={{
                                    title: t('theNextChallenge', 'The next challenge'),
                                    icon: {name: "icon-events", color: "tertiary"},
                                    bodyText: t('thereAreNoChallengesRunningAtTheMomentUpdateYourCommunication', 'There are no challenges running at the moment. Update your communication') +
                                        t('preferencesToBeTheFirstToKnowAboutTheNextChallenge', ' preferences to be the first to know about the next challenge.'),
                                    clickUrl: "/account#notifications",
                                    buttonText: t('notifyMe', 'Notify me'),
                                    onButtonClick: () => {setLinkedSetting("events-preference");}
                                }}
                                className={"mx-n3"}
                            />
                        }
                    </>
                }
            </Col>
        </Row>
    </Container>;
};
