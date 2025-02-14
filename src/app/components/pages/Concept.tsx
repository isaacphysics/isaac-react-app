import React, {useEffect} from "react";
import {withRouter} from "react-router-dom";
import {AppState, fetchDoc, pageContextSlice, selectors, useAppDispatch, useAppSelector} from "../../state";
import {Col, Container, Row} from "reactstrap";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {IsaacConceptPageDTO} from "../../../IsaacApiTypes";
import {DOCUMENT_TYPE, Subject, above, below, getUpdatedPageContext, isAda, isPhy, useDeviceSize, useNavigation} from "../../services";
import {DocumentSubject, GameboardContext} from "../../../IsaacAppTypes";
import {RelatedContent} from "../elements/RelatedContent";
import {WithFigureNumbering} from "../elements/WithFigureNumbering";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {NavigationLinks} from "../elements/NavigationLinks";
import {UserContextPicker} from "../elements/inputs/UserContextPicker";
import {EditContentButton} from "../elements/EditContentButton";
import {ShareLink} from "../elements/ShareLink";
import {PrintButton} from "../elements/PrintButton";
import {Markup} from "../elements/markup";
import {IntendedAudienceWarningBanner} from "../navigation/IntendedAudienceWarningBanner";
import {SupersededDeprecatedWarningBanner} from "../navigation/SupersededDeprecatedWarningBanner";
import {CanonicalHrefElement} from "../navigation/CanonicalHrefElement";
import {MetaDescription} from "../elements/MetaDescription";
import {ReportButton} from "../elements/ReportButton";
import classNames from "classnames";
import { ConceptSidebar, MainContent, SidebarLayout } from "../elements/layout/SidebarLayout";

interface ConceptPageProps {
    conceptIdOverride?: string;
    match: {params: {conceptId: string}};
    location: {search: string};
    preview?: boolean;
}

export const Concept = withRouter(({match: {params}, location: {search}, conceptIdOverride, preview}: ConceptPageProps) => {
    const dispatch = useAppDispatch();
    const conceptId = conceptIdOverride || params.conceptId;
    const user = useAppSelector(selectors.user.orNull);
    const prevPageContext = useAppSelector(selectors.pageContext.context);
    useEffect(() => {dispatch(fetchDoc(DOCUMENT_TYPE.CONCEPT, conceptId));}, [conceptId]);
    const doc = useAppSelector((state: AppState) => state?.doc || null);
    const navigation = useNavigation(doc);
    const deviceSize = useDeviceSize();

    useEffect(() => {
        if (doc && doc !== 404) {
            const newPageContext = getUpdatedPageContext(prevPageContext, user && user.loggedIn && user.registeredContexts || undefined, doc);
            dispatch(pageContextSlice.actions.updatePageContext(newPageContext));
        }
    }, [dispatch, user, doc]);

    const ManageButtons = () => <div className="no-print d-flex justify-content-end mt-1 ms-2">
        <div className="question-actions">
            <ShareLink linkUrl={`/concepts/${conceptId}${search || ""}`} />
        </div>
        <div className="question-actions not-mobile">
            <PrintButton />
        </div>
        <div className="question-actions">
            <ReportButton pageId={conceptId}/>
        </div>
    </div>;

    return <ShowLoading until={doc} thenRender={supertypedDoc => {
        const doc = supertypedDoc as IsaacConceptPageDTO & DocumentSubject;
        return <GameboardContext.Provider value={navigation.currentGameboard}>
            <Container data-bs-theme={doc.subjectId}>
                <TitleAndBreadcrumb
                    intermediateCrumbs={navigation.breadcrumbHistory}
                    currentPageTitle={doc.title as string}
                    collectionType={navigation.collectionType}
                    subTitle={doc.subtitle as string}
                    preview={preview} 
                    icon={{type: "hex", subject: doc.subjectId as Subject, icon: "page-icon-concept"}}
                />
                {!preview && <>
                    <MetaDescription description={doc.summary} />
                    <CanonicalHrefElement />
                </>}
                <SidebarLayout>
                    <ConceptSidebar relatedContent={doc.relatedContent} />
                    <MainContent>
                        <EditContentButton doc={doc} />

                        {below["sm"](deviceSize) && <ManageButtons />}

                        <div className="d-flex justify-content-end align-items-center me-sm-1 flex-grow-1">
                            <UserContextPicker />
                            {above["md"](deviceSize) && <ManageButtons />}
                        </div>

                        <Row className="concept-content-container">
                            <Col className={classNames("py-4 concept-panel", {"mw-760": isAda})}>

                                <SupersededDeprecatedWarningBanner doc={doc} />

                                {isAda && <IntendedAudienceWarningBanner doc={doc} />}

                                <WithFigureNumbering doc={doc}>
                                    <IsaacContent doc={doc} />
                                </WithFigureNumbering>

                                {doc.attribution && <p className="text-muted">
                                    <Markup trusted-markup-encoding={"markdown"}>
                                        {doc.attribution}
                                    </Markup>
                                </p>}

                                {isAda && doc.relatedContent && <RelatedContent conceptId={conceptId} content={doc.relatedContent} parentPage={doc} />}

                                <NavigationLinks navigation={navigation} />

                                {isPhy && doc.relatedContent && <RelatedContent conceptId={conceptId} content={doc.relatedContent} parentPage={doc} />}
                            </Col>
                        </Row>
                    </MainContent>
                </SidebarLayout>
            </Container>
        </GameboardContext.Provider>;
    }}/>;
});
