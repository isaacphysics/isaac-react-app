import React from "react";
import {Button, Card, CardBody, CardText, CardTitle, Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {SITE_TITLE} from "../../services";
import { useNavigate } from "react-router";
import { useTranslation, Trans } from 'react-i18next'


export const RegistrationRoleSelect = () => {
    const { t } = useTranslation()
    const navigate = useNavigate();

    const teacherSignUp = (event: React.MouseEvent) => {
        event.preventDefault();
        void navigate("/register/teacher/details");
    };

    const studentSignup = (event: React.MouseEvent) => {
        event.preventDefault();
        void navigate("/register/student/age");
    };

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={t('createAnSite_titleAccount', 'Create an {{SITE_TITLE}} account', { SITE_TITLE })} className="mb-4" icon={{type: "icon", icon: "icon-account"}}/>
        <Card className="my-7">
            <CardBody>
                <h2>{t('areYouAStudentOrATeacher', 'Are you a student or a teacher?')}</h2>
                <p>{t('knowingIfYouAreAStudentOrATeacherMeansWeCanMakeSureYouHaveAccessToTheRightFeatures', 'Knowing if you are a student or a teacher means we can make sure you have access to the right features.')}</p>
                <Row>
                    <Col xs={12} lg={6}>
                        <Card className="h-100">
                            <CardBody className="d-flex flex-column">
                                <CardTitle>
                                    <h3>{t('student', 'Student')}</h3>
                                </CardTitle>
                                <CardText>
                                    <p>{t('withAStudentAccountYouCan', 'With a student account you can:')}</p>
                                    <ul>
                                        <li>{t('setYourPreferencesSoThatYouSeeContentRelevantToYou', 'Set your preferences so that you see content relevant to you')}</li>
                                        <li>{t('trackYourProgressIncludingHowManyQuestionsYouHaveAnsweredByTopic', 'Track your progress, including how many questions you have answered by topic')}</li>
                                        <li>{t('seeAllAssignmentsSetByYourTeachers', 'See all assignments set by your teacher(s)')}</li>
                                    </ul>
                                </CardText>
                                <Button block className="align-self-end mt-auto" onClick={studentSignup}>{t('iAmAStudent', 'I am a student')}</Button>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xs={12} lg={6}>
                        <Card className="h-100">
                            <CardBody className="d-flex flex-column">
                                <CardTitle>
                                    <h3>{t('teacher', 'Teacher')}</h3>
                                </CardTitle>
                                <CardText>
                                    <p>{t('withATeacherAccountYouCan', 'With a teacher account you can:')}</p>
                                    <ul>
                                        <li>{t('createGroupsAndInviteStudentsToJoinThem', 'Create groups and invite students to join them')}</li>
                                        <li>{t('createQuizzesFromTheQuestionsAvailableAndAssignThemToYourGroups', 'Create quizzes from the questions available, and assign them to your groups')}</li>
                                        <li>{t('viewTheProgressOfTheStudentsInYourGroups', 'View the progress of the students in your groups')}</li>
                                    </ul>
                                    <p><Trans i18nKey="teacherAccountsDoNotGiveYouAccessToTheAnswersAHrefsupportteachergenerallearnMorea">Teacher accounts do not give you access to the answers. <a href="/support/teacher/general">Learn more</a></Trans></p>
                                </CardText>
                                <Button block className="align-self-end mt-auto" onClick={teacherSignUp}>{t('iAmATeacher', 'I am a teacher')}</Button>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    </Container>;
};
