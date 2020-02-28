import {SITE} from "../../services/siteConstants";

import {HomepageCS} from "./cs/HomepageCS";
import {HeaderCS} from "./cs/HeaderCS";
import {HomepagePhy} from "./phy/HomepagePhy";
import {HeaderPhy} from "./phy/HeaderPhy";

export default {
    [SITE.PHY]: {
        Homepage: HomepagePhy,
        Header: HeaderPhy
    },
    [SITE.CS]: {
        Homepage: HomepageCS,
        Header: HeaderCS
    }
};