import React, { useEffect, useState } from "react";
import {
  MyProgressState,
  getMyAnsweredQuestionsByDate,
  getMyProgress,
  getUserAnsweredQuestionsByDate,
  getUserProgress,
  selectors,
  useAppDispatch,
  useAppSelector,
} from "../../state";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import { HUMAN_QUESTION_TYPES, isTeacherOrAbove, safePercentage } from "../../services";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { PotentialUser, UserProgress } from "../../../IsaacAppTypes";
import { Unauthorised } from "./Unauthorised";
import { AggregateQuestionStats } from "../elements/panels/AggregateQuestionStats";
import { Tabs } from "../elements/Tabs";
import { QuestionProgressCharts } from "../elements/views/QuestionProgressCharts";
import { ActivityGraph } from "../elements/views/ActivityGraph";
import { ProgressBar } from "../elements/views/ProgressBar";
import { LinkToContentSummaryList } from "../elements/list-groups/ContentSummaryListGroupItem";
import { UserSummaryDTO } from "../../../IsaacApiTypes";

const statistics = {
  questionTypeStatsList: [
    "isaacMultiChoiceQuestion",
    "isaacItemQuestion",
    "isaacParsonsQuestion",
    "isaacNumericQuestion",
    "isaacStringMatchQuestion",
    "isaacFreeTextQuestion",
    "isaacSymbolicLogicQuestion",
    "isaacClozeQuestion",
  ],
  questionCountByTag: {},
  typeColWidth: "col-lg-4",
  tagColWidth: "col-lg-12",
};

const QuestionParts = ({ progress }: { progress: MyProgressState | undefined }) => (
  <div className="mt-4">
    <h4>Question parts correct by Type</h4>
    <Row>
      {statistics.questionTypeStatsList.map((qType: string) => {
        const correct = progress?.correctByType?.[qType] ?? null;
        const attempts = progress?.attemptsByType?.[qType] ?? null;
        const percentage = safePercentage(correct, attempts);
        return (
          <Col key={qType} className={`${statistics.typeColWidth} mt-2 type-progress-bar`}>
            <div className={"px-2"}>{HUMAN_QUESTION_TYPES[qType]} questions correct</div>
            <div className={"px-2"}>
              <ProgressBar percentage={percentage ?? 0}>
                {percentage == null ? "No data" : `${correct} of ${attempts}`}
              </ProgressBar>
            </div>
          </Col>
        );
      })}
    </Row>
  </div>
);

const getPageTitle = (viewingOwnData: boolean, userDetails?: UserSummaryDTO) => {
  const { givenName, familyName } = userDetails ?? {};
  const nonEmptyNames = [givenName, familyName].filter((name) => name);
  const userName = nonEmptyNames.join(" ") || "user";
  return viewingOwnData ? "My progress" : `Progress for ${userName}`;
};

const getTagData = (subId: string, progress?: UserProgress | null) =>
  progress?.[subId === "attempted" ? "attemptsByTag" : "correctByTag"];

interface MyProgressProps extends RouteComponentProps<{ userIdOfInterest: string }> {
  user: PotentialUser;
}
const MyProgress = withRouter((props: MyProgressProps) => {
  const { user, match } = props;
  const { userIdOfInterest } = match.params;
  const viewingOwnData = userIdOfInterest === undefined || (user.loggedIn && parseInt(userIdOfInterest) === user.id);

  const dispatch = useAppDispatch();
  const myProgress = useAppSelector(selectors.user.progress);
  const userProgress = useAppSelector(selectors.teacher.userProgress);
  const myAnsweredQuestionsByDate = useAppSelector(selectors.user.answeredQuestionsByDate);
  const userAnsweredQuestionsByDate = useAppSelector(selectors.teacher.userAnsweredQuestionsByDate);

  const [subId, setSubId] = useState("correct");

  useEffect(() => {
    if (viewingOwnData && user.loggedIn) {
      dispatch(getMyProgress());
      dispatch(getMyAnsweredQuestionsByDate(user.id as number, 0, Date.now(), false));
    } else if (isTeacherOrAbove(user)) {
      dispatch(getUserProgress(userIdOfInterest));
      dispatch(getUserAnsweredQuestionsByDate(userIdOfInterest, 0, Date.now(), false));
    }
  }, [dispatch, userIdOfInterest, viewingOwnData, user]);

  const teacherViewingAnotherUser = !viewingOwnData && isTeacherOrAbove(user);
  const nonTeacherViewingAnotherUser = !viewingOwnData && !isTeacherOrAbove(user);

  const progressAndQuestions = teacherViewingAnotherUser
    ? { progress: userProgress, answeredQuestionsByDate: userAnsweredQuestionsByDate }
    : { progress: myProgress, answeredQuestionsByDate: myAnsweredQuestionsByDate };

  const { progress, answeredQuestionsByDate } = progressAndQuestions;

  const pageTitle = getPageTitle(viewingOwnData, progress?.userDetails);
  const tagData = getTagData(subId, progress);

  // Only teachers and above can see other users progress. The API checks if the other user has shared data with the current user or not.
  return nonTeacherViewingAnotherUser ? (
    <Unauthorised />
  ) : (
    <Container id="my-progress" className="mb-5">
      <TitleAndBreadcrumb currentPageTitle={pageTitle} disallowLaTeX />
      <Card className="mt-4">
        <CardBody>
          <Tabs>
            {{
              "Question activity": (
                <div>
                  <Row>
                    <Col>
                      <AggregateQuestionStats userProgress={progress} />
                    </Col>
                  </Row>

                  <Card className="mt-4">
                    <CardBody>
                      <Row className="justify-content-center">
                        <Button
                          color="primary"
                          outline={subId === "attempted"}
                          className="mr-2 border-0"
                          onClick={() => setSubId("correct")}
                        >
                          Correct questions
                        </Button>
                        <Button
                          color="primary"
                          className="border-0"
                          outline={subId === "correct"}
                          onClick={() => setSubId("attempted")}
                        >
                          Attempted questions
                        </Button>
                      </Row>
                      <QuestionProgressCharts subId={subId} questionsByTag={tagData ?? {}} />
                    </CardBody>
                  </Card>

                  <QuestionParts progress={progress} />

                  {answeredQuestionsByDate && (
                    <div className="mt-4">
                      <h4>Question attempts over time</h4>
                      <div>
                        <ActivityGraph answeredQuestionsByDate={answeredQuestionsByDate} />
                      </div>
                    </div>
                  )}
                  <Row id="progress-questions">
                    {progress?.mostRecentQuestions && progress?.mostRecentQuestions.length > 0 && (
                      <Col md={12} lg={6} className="mt-4">
                        <h4>Most recently answered questions</h4>
                        <LinkToContentSummaryList items={progress.mostRecentQuestions} />
                      </Col>
                    )}
                    {progress?.oldestIncompleteQuestions && progress?.oldestIncompleteQuestions.length > 0 && (
                      <Col md={12} lg={6} className="mt-4">
                        <h4>Oldest unsolved questions</h4>
                        <LinkToContentSummaryList items={progress.oldestIncompleteQuestions} />
                      </Col>
                    )}
                  </Row>
                </div>
              ),
            }}
          </Tabs>
        </CardBody>
      </Card>
    </Container>
  );
});
export default MyProgress;
