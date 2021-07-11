import React from "react";
import {ContentDTO} from "../../../IsaacApiTypes";
import {Accordion} from "../elements/Accordion";
import {IsaacContent} from "./IsaacContent";
import {isIntendedAudience, useUserContext} from "../../services/userContext";
import {useSelector} from "react-redux";
import {selectors} from "../../state/selectors";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";

export const IsaacAccordion = ({doc: {children}}: {doc: ContentDTO}) => {
    const user = useSelector(selectors.user.orNull);
    const userContext = useUserContext();
    return <div className="isaac-accordion">
        {(children as ContentDTO[] | undefined)

            // We take the doc's children's index as a key for each section so that react is not confused between filtering/reordering
            ?.map((section, index) => ({...section, sectionIndex: index}))

            // For CS we want relevant sections to appear first
            .sort((section) => !(SITE_SUBJECT === SITE.CS && isIntendedAudience(section.audience, userContext, user)) ? 1 : -1)

            .map((section , index) =>
                <Accordion key={section.sectionIndex} trustedTitle={section?.title || ""} id={section.id} index={index}>
                    <IsaacContent doc={section} />
                </Accordion>
            )}
    </div>;
};
