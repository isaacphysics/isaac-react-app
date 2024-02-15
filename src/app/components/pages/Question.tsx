import React, { useEffect } from "react";
import { Col, Container, Row, Button } from "reactstrap";
import { match, RouteComponentProps, withRouter } from "react-router-dom";
import { fetchDoc, goToSupersededByQuestion, selectors, useAppDispatch, useAppSelector } from "../../state";
import { ShowLoading } from "../handlers/ShowLoading";
import { IsaacQuestionPageDTO } from "../../../IsaacApiTypes";
import { determineAudienceViews, DOCUMENT_TYPE, isStudent, useNavigation } from "../../services";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { EditContentButton } from "../elements/EditContentButton";
import { WithFigureNumbering } from "../elements/WithFigureNumbering";
import { IsaacContent } from "../content/IsaacContent";
import { NavigationLinks } from "../elements/NavigationLinks";
import { RelatedContent } from "../elements/RelatedContent";
import { ShareLink } from "../elements/ShareLink";
import { PrintButton } from "../elements/PrintButton";
import { DocumentSubject, GameboardContext } from "../../../IsaacAppTypes";
import { Markup } from "../elements/markup";
import { IntendedAudienceWarningBanner } from "../navigation/IntendedAudienceWarningBanner";
import { SupersededDeprecatedWarningBanner } from "../navigation/SupersededDeprecatedWarningBanner";
import { CanonicalHrefElement } from "../navigation/CanonicalHrefElement";
import { ReportButton } from "../elements/ReportButton";

interface QuestionPageProps extends RouteComponentProps<{ questionId: string }> {
  questionIdOverride?: string;
  match: match & { params: { questionId: string } };
}

export const Question = withRouter(({ questionIdOverride, match, location }: QuestionPageProps) => {
  const questionId = questionIdOverride || match.params.questionId;
  const doc = useAppSelector(selectors.doc.get);
  const user = useAppSelector(selectors.user.orNull);
  const navigation = useNavigation(doc);

  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchDoc(DOCUMENT_TYPE.QUESTION, questionId));
  }, [dispatch, questionId]);

  return (
    <ShowLoading
      until={doc}
      thenRender={(supertypedDoc) => {
        const doc = supertypedDoc as IsaacQuestionPageDTO & DocumentSubject;

        return (
          <div className={`pattern-01 ${doc.subjectId || ""}`}>
            <GameboardContext.Provider value={navigation.currentGameboard}>
              <Container>
                {/*High contrast option*/}
                <TitleAndBreadcrumb
                  currentPageTitle={doc.title ?? ""}
                  intermediateCrumbs={[...navigation.breadcrumbHistory]}
                  collectionType={navigation.collectionType}
                  audienceViews={determineAudienceViews(doc.audience, navigation.creationContext)}
                ></TitleAndBreadcrumb>
                <CanonicalHrefElement />
                <div className="no-print d-flex align-items-center mt-3">
                  <EditContentButton doc={doc} />
                  <div className="question-actions ml-auto">
                    <ShareLink linkUrl={`/questions/${questionId}${location.search || ""}`} clickAwayClose />
                  </div>
                  <div className="question-actions not-mobile">
                    <PrintButton questionPage />
                  </div>
                  <div className="question-actions">
                    <ReportButton pageId={questionId} />
                  </div>
                </div>
                <Row className="question-content-container">
                  <Col md={{ size: 8, offset: 2 }} className="py-4 question-panel">
                    <SupersededDeprecatedWarningBanner doc={doc} />

                    <IntendedAudienceWarningBanner doc={doc} />

                    <WithFigureNumbering doc={doc}>
                      <IsaacContent doc={doc} />
                    </WithFigureNumbering>

                    {doc.supersededBy && isStudent(user) && (
                      <div className="alert alert-warning">
                        This question{" "}
                        <Button
                          color="link"
                          className="align-baseline"
                          onClick={() => dispatch(goToSupersededByQuestion(doc))}
                        >
                          has been replaced
                        </Button>
                        .<br />
                        However, if you were assigned this version, you should complete it.
                      </div>
                    )}

                    {doc.attribution && (
                      <p className="text-muted">
                        <Markup trusted-markup-encoding={"markdown"}>{doc.attribution}</Markup>
                      </p>
                    )}

                    <NavigationLinks navigation={navigation} />

                    {doc.relatedContent && <RelatedContent content={doc.relatedContent} parentPage={doc} />}
                  </Col>
                </Row>
              </Container>
            </GameboardContext.Provider>
          </div>
        );
      }}
    />
  );
});
