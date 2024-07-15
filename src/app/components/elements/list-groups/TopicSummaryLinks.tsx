import React from "react";
import * as RS from "reactstrap";
import {ContentSummaryDTO, Stage} from "../../../../IsaacApiTypes";
import {
    above,
    audienceStyle,
    DOCUMENT_TYPE,
    documentTypePathPrefix,
    isAda,
    isIntendedAudience,
    makeIntendedAudienceComparator,
    notRelevantMessage,
    siteSpecific,
    STAGE,
    stageLabelMap,
    stringifyAudience,
    useDeviceSize,
    useUserViewingContext
} from "../../../services";
import {Link} from "react-router-dom";
import {selectors, useAppSelector} from "../../../state";
import classNames from "classnames";
import {Markup} from "../markup";

export function TopicSummaryLinks({items, search}: {items: ContentSummaryDTO[]; search?: string}) {
    const userContext = useUserViewingContext();
    const user = useAppSelector(selectors.user.orNull);
    const deviceSize = useDeviceSize();

    return <RS.ListGroup className="mt-4 link-list list-group-links">
        {items
            // For CS we want relevant sections to appear first
            .sort((itemA, itemB) => {
                if (!isAda) {return 0;}
                return makeIntendedAudienceComparator(user, userContext)(itemA, itemB);
            })

            // Handle conditional display settings
            .map(item => {
                const intendedAudience = isIntendedAudience(item.audience, userContext, user);
                const showOtherContent = userContext.showOtherContent;
                return {...item, deEmphasised: !intendedAudience, hidden: !intendedAudience && !showOtherContent};
            })

            // Filter-out hidden items
            .filter(item => !item.hidden)

            // Render remaining items
            .map((item, index) => {
                const audienceString = stringifyAudience(item.audience, userContext);
                const showAudienceString = !userContext.hasDefaultPreferences && isIntendedAudience(item.audience, userContext, user);

                let stagesSet: Set<Stage>;
                if (!item.audience) {
                    stagesSet = new Set<Stage>([STAGE.ALL]);
                } else {
                    stagesSet = new Set<Stage>();
                    item.audience.forEach(audienceRecord => audienceRecord.stage?.forEach(stage => stagesSet.add(stage)));
                }
                const audienceStages = Array.from(stagesSet);

                const badgeStyle = showAudienceString
                    ? audienceStyle(audienceString)
                    : audienceStages.includes(STAGE.CORE) ? "stage-label-core" : "stage-label-advanced";

                return <RS.ListGroupItem key={item.id} className="topic-summary-link">
                    <RS.Button
                        tag={Link} to={{pathname: `/${documentTypePathPrefix[DOCUMENT_TYPE.CONCEPT]}/${item.id}`, search}}
                        block color="link" className={"d-flex align-items-stretch " + classNames({"de-emphasised": item.deEmphasised})}
                    >
                        <div className={"stage-label badge-primary d-flex align-items-center justify-content-center " + classNames({[badgeStyle]: isAda})}>
                            {siteSpecific(
                            audienceString,
                            showAudienceString
                                ? (above["sm"](deviceSize) ? audienceString : audienceString.replaceAll(",", "\n")).split("\n").map((line, i, arr) => <>
                                    {line}{i < arr.length && <br/>}
                                </>)
                                : audienceStages.includes(STAGE.CORE) ? stageLabelMap[STAGE.CORE] : stageLabelMap[STAGE.ADVANCED]
                        )}
                        </div>
                        <div className="title pl-3 d-flex">
                            <div className="p-3">
                                <Markup encoding={"latex"}>
                                    {item.title}
                                </Markup>
                            </div>
                            {item.deEmphasised && <div className="ml-auto mr-3 d-flex align-items-center">
                                <span id={`audience-help-${index}`} className="icon-help mx-1" />
                                <RS.UncontrolledTooltip placement="bottom" target={`audience-help-${index}`}>
                                    {`This content has ${notRelevantMessage(userContext)}.`}
                                </RS.UncontrolledTooltip>
                            </div>}
                        </div>
                    </RS.Button>
                </RS.ListGroupItem>;
            })
        }
    </RS.ListGroup>;
}
