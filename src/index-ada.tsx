import "regenerator-runtime/runtime";
import './scss/cs/isaac.scss';
import React from 'react';
import { createRoot } from 'react-dom/client';
import {Provider} from "react-redux";
import {store} from "./app/state";
import {IsaacApp} from './app/components/navigation/IsaacApp';
import {printAsciiArtLogoToConsoleAda} from "./app/services";
import {Helmet} from "react-helmet";
import { useTranslation } from "react-i18next";

printAsciiArtLogoToConsoleAda();

const root = createRoot(document.getElementById('root')!);

const AppHelmet = () => {
    const { t } = useTranslation();
    {/*
        Note: react-helmet's Helmet is the cause of the following StrictMode error for the following components: SideEffect(NullComponent)
        > UNSAFE_componentWillMount in strict mode is not recommended and may indicate bugs in your code. See https://reactjs.org/link/unsafe-component-lifecycles for details.
        We can wait until the library gets updated to not do this.
    */}
    return <Helmet>
        {/* Any meta tags in the HTML marked as data-react-helmet="true" need to be duplicated here
            or else they will be removed on pages that do not override them. But only specifying the
            values here will stop most sites seeing them at all!
            */}
        <meta name="description" content={t('site.description')} />
        <meta property="og:title" content={t('site.title')} />
        <meta property="og:description" content={t('site.description')} />
    </Helmet>;
};

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <AppHelmet />
            <IsaacApp />
        </Provider>
    </React.StrictMode>,
);
