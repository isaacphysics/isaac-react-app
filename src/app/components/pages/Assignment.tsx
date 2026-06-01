import React, {useEffect} from "react";
import {
    logAction,
    selectors,
    useAppDispatch,
    useAppSelector,
    useGetGameboardByIdQuery,
    useGetMyAssignmentsQuery
} from "../../state";
import {Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    getThemeFromTags,
    isDefined,
    isFound,
    isTeacherPending,
    isPhy,
    siteSpecific
} from "../../services";
import {useLocation} from "react-router";
import {skipToken} from "@reduxjs/toolkit/query";
import {LoadingPlaceholder, ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import {PageMetadata} from "../elements/PageMetadata";
import { SupersededDeprecatedBoardContentWarning } from "../navigation/SupersededDeprecatedWarning";
import { PageContainer } from "../elements/layout/PageContainer";
import { GameboardContents } from "./Gameboard";
import { GameboardSidebar } from "../elements/sidebar/GameboardSidebar";

// this is fairly similar to <Gameboard />, but coming directly from an assignment URL requires that we load the assignment before
// we can request the gameboard by ID, so the order of operations is a bit different.

export const Assignment = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    // pathname: /assignment/:assignmentId/view
    const user = useAppSelector(selectors.user.orNull);
    const queryArg = user?.loggedIn && !isTeacherPending(user) ? undefined : skipToken;
    const {data: assignments} = useGetMyAssignmentsQuery(queryArg, {refetchOnMountOrArgChange: true, refetchOnReconnect: true});
    const assignmentId = location.pathname.split("/")[2];
    const assignment = assignments?.find(a => a.id?.toString() === assignmentId);

    // TODO (AV2): replace both queries with e.g. getAssignmentQuery that can return both assignment + gameboard together.
    // should also ensure the questions' summary object contains the /assignment/:aid/question/:qid URL.

    const gameboardQuery = useGetGameboardByIdQuery(assignment?.gameboardId || skipToken);
    const { data: gameboard } = gameboardQuery;

    // --- here below is the same as Gameboard

    const questionThemes = gameboard?.contents?.map(q => getThemeFromTags(q.tags)).filter((v, i, a) => a.indexOf(v) === i);
    const singleSubject = questionThemes?.length === 1 ? questionThemes[0] : undefined;

    // Only log a gameboard view when we have a gameboard loaded:
    useEffect(() => {
        if (isDefined(gameboard) && isFound(gameboard)) {
            void dispatch(logAction({type: "VIEW_GAMEBOARD_BY_ID", gameboardId: gameboard.id}));
        }
    }, [dispatch, gameboard]);

    const notFoundComponent = <>
        <TitleAndBreadcrumb
            breadcrumbTitleOverride={siteSpecific("Question deck", "Quiz")}
            currentPageTitle={`${siteSpecific("Question deck", "Quiz")} not found`}
            icon={{type: "icon", icon: "icon-error"}}
        />
        <h3 className="my-4">
            {`We're sorry, we were not able to find a ${siteSpecific("question deck", "quiz")} with the id `}<code>{gameboard?.id}</code>{"."}
        </h3>
    </>;

    return <ShowLoadingQuery
        query={gameboardQuery}
        defaultErrorTitle={`Error fetching ${siteSpecific("question deck", "quiz")} with id: ${gameboard?.id}`}
        ifNotFound={notFoundComponent}
        placeholder={<Container><LoadingPlaceholder /></Container>}
        thenRender={(gameboard) => {
            return <PageContainer className="mb-7" data-bs-theme={singleSubject}
                pageTitle={
                    <TitleAndBreadcrumb
                        currentPageTitle={gameboard && gameboard.title || siteSpecific("Question deck", "Filter Generated Quiz")} icon={{type: "icon", icon: "icon-question-deck"}}
                        intermediateCrumbs={isPhy ? [{title: "Assignments", to: "/assignments"}] : []}
                    />
                }
                sidebar={siteSpecific(
                    <GameboardSidebar gameboard={gameboard} assignments={assignment ? [assignment] : []} hideButton />,
                    undefined
                )}
            >
                <PageMetadata title={gameboard.title} showSidebarButton sidebarButtonText="Details"/>
                <SupersededDeprecatedBoardContentWarning gameboard={gameboard} />
                
                <GameboardContents gameboard={gameboard} />
            </PageContainer>;
        }}
    />;
};
