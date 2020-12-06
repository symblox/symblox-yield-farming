import React, {useState, useEffect} from "react";
import {IntlProvider} from "react-intl";
import enUs from "../language/en_US";
import zhCn from "../language/zh_CN";

import {languageOptions} from "../constants/constants";

export const LanguageContext = React.createContext({});

export const LanguageProvider = ({children}) => {
    const [language, setLanguage] = useState(languageOptions[0]); //default en
    useEffect(() => {
        const browserLang = navigator.language.toLowerCase();
        if (browserLang === "zh-cn") {
            setLanguage(languageOptions[1]);
        } else {
            setLanguage(languageOptions[0]);
        }
    }, [setLanguage]);
    return (
        <LanguageContext.Provider
            value={{
                language,
                setLanguage
            }}
        >
            <IntlProvider
                locale={"en"}
                messages={language.key === "en" ? enUs : zhCn}
            >
                {children}
            </IntlProvider>
        </LanguageContext.Provider>
    );
};
