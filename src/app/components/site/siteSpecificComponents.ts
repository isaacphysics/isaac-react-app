import {siteSpecific} from "../../services";
import {HomepageCS} from "./cs/HomepageCS";
import {HeaderCS} from "./cs/HeaderCS";
import {RoutesCS} from "./cs/RoutesCS";
import {HomepagePhy} from "./phy/HomepagePhy";
import {HeaderPhy} from "./phy/HeaderPhy";
import {RoutesPhy} from "./phy/RoutesPhy";
import {FooterPhy} from "./phy/FooterPhy";
import {FooterCS} from "./cs/FooterCS";

export default siteSpecific(
    {
        Homepage: HomepagePhy,
        Header: HeaderPhy,
        Footer: FooterPhy,
        Routes: RoutesPhy
    },
    {
        Homepage: HomepageCS,
        Header: HeaderCS,
        Footer: FooterCS,
        Routes: RoutesCS
    }
);
