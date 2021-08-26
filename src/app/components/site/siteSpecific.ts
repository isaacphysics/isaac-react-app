import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {HomepageCS} from "./cs/HomepageCS";
import {HeaderCS} from "./cs/HeaderCS";
import {RoutesCS} from "./cs/RoutesCS";
import {HomepagePhy} from "./phy/HomepagePhy";
import {HeaderPhy} from "./phy/HeaderPhy";
import {RoutesPhy} from "./phy/RoutesPhy";

export default {
    [SITE.PHY]: {
        Homepage: HomepagePhy,
        Header: HeaderPhy,
        Routes: RoutesPhy,
    },
    [SITE.CS]: {
        Homepage: HomepageCS,
        Header: HeaderCS,
        Routes: RoutesCS,
    }
}[SITE_SUBJECT];
