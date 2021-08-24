import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {HomepageCS} from "./cs/HomepageCS";
import {HeaderCS} from "./cs/HeaderCS";
import {RoutesCS} from "./cs/RoutesCS";
import {HomepagePhy} from "./phy/HomepagePhy";
import {HeaderPhy} from "./phy/HeaderPhy";
import {RoutesPhy} from "./phy/RoutesPhy";
import {STAGES_CS, STAGES_PHY} from "../../services/constants";

export default {
    [SITE.PHY]: {
        Homepage: HomepagePhy,
        Header: HeaderPhy,
        Routes: RoutesPhy,
        Stages: STAGES_PHY,
    },
    [SITE.CS]: {
        Homepage: HomepageCS,
        Header: HeaderCS,
        Routes: RoutesCS,
        Stages: STAGES_CS,
    }
}[SITE_SUBJECT];
