import * as Localization from "expo-localization";
import { I18n } from "i18n-js";

import en from "./en";
import ar from "./ar";

const i18n = new I18n({
  en,
  ar,
});

// ✅ SAFE fallback
const locale = Localization.locale || "en";

i18n.locale = locale.split("-")[0];
i18n.enableFallback = true;

const getLocale = () => {
  if (Localization.locale) return Localization.locale.split("-")[0];
  return "en";
};

i18n.locale = getLocale();
i18n.enableFallback = true;

// ✅ function to change language
export const setLanguage = (lang) => {
  i18n.locale = lang;
};

export { i18n };
