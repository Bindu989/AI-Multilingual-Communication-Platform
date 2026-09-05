// ==========================================
// MULTILINGUAL TRANSLATION SERVICE
// Primary: DeepL
// Fallback: LibreTranslate-compatible endpoint
// ==========================================

const translateText = async (
  sourceText,
  sourceLanguage,
  targetLanguage
) => {
  try {
    if (!sourceText || !sourceText.trim()) {
      throw new Error(
        "Source text is required"
      );
    }

    if (
      !sourceLanguage ||
      !targetLanguage
    ) {
      throw new Error(
        "Source language and target language are required"
      );
    }

    // ==========================================
    // LANGUAGE CODES
    // ==========================================
    const languageCodes = {
      English: "EN",
      Telugu: "TE",
      Hindi: "HI",
      Tamil: "TA",
      Kannada: "KN",
      Malayalam: "ML",
      Bengali: "BN",
      Marathi: "MR",
      Gujarati: "GU",
      Punjabi: "PA",
      Spanish: "ES",
      French: "FR",
      German: "DE",
      Italian: "IT",
      Portuguese: "PT",
      Dutch: "NL",
      Russian: "RU",
      Japanese: "JA",
      Korean: "KO",
      Chinese: "ZH",
    };

    const sourceLang =
      languageCodes[sourceLanguage] ||
      String(sourceLanguage).toUpperCase();

    const targetLang =
      languageCodes[targetLanguage] ||
      String(targetLanguage).toUpperCase();

    // ==========================================
    // NORMALIZE CODES FOR FALLBACK PROVIDER
    // ==========================================
    const fallbackCodes = {
      English: "en",
      Telugu: "te",
      Hindi: "hi",
      Tamil: "ta",
      Kannada: "kn",
      Malayalam: "ml",
      Bengali: "bn",
      Marathi: "mr",
      Gujarati: "gu",
      Punjabi: "pa",
      Spanish: "es",
      French: "fr",
      German: "de",
      Italian: "it",
      Portuguese: "pt",
      Dutch: "nl",
      Russian: "ru",
      Japanese: "ja",
      Korean: "ko",
      Chinese: "zh",
    };

    const fallbackSourceLang =
      fallbackCodes[sourceLanguage] ||
      String(sourceLanguage).toLowerCase();

    const fallbackTargetLang =
      fallbackCodes[targetLanguage] ||
      String(targetLanguage).toLowerCase();

    // ==========================================
    // SPECIAL CASE
    // ==========================================
    if (
      sourceLanguage === targetLanguage
    ) {
      return sourceText.trim();
    }

    // ==========================================
    // TRY DEEPL FIRST
    // ==========================================
    if (process.env.DEEPL_API_KEY) {
      try {
        const deepLResponse =
          await fetch(
            "https://api-free.deepl.com/v2/translate",
            {
              method: "POST",

              headers: {
                Authorization:
                  `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                text: [
                  sourceText.trim(),
                ],
                target_lang: targetLang,
                source_lang: sourceLang,
              }),
            }
          );

        if (deepLResponse.ok) {
          const data =
            await deepLResponse.json();

          if (
            data.translations &&
            data.translations.length > 0 &&
            data.translations[0].text
          ) {
            return data.translations[0].text;
          }
        } else {
          const deepLError =
            await deepLResponse.text();

          console.warn(
            `DeepL translation unavailable for ${targetLanguage}:`,
            deepLError
          );
        }
      } catch (deepLError) {
        console.warn(
          `DeepL failed for ${targetLanguage}:`,
          deepLError.message
        );
      }
    }

    // ==========================================
    // FALLBACK TRANSLATOR
    // ==========================================
    const fallbackResponse =
      await fetch(
        "https://libretranslate.de/translate",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            q: sourceText.trim(),
            source: fallbackSourceLang,
            target: fallbackTargetLang,
            format: "text",
          }),
        }
      );

    if (!fallbackResponse.ok) {
      const fallbackError =
        await fallbackResponse.text();

      throw new Error(
        `Fallback translation failed (${fallbackResponse.status}): ${fallbackError}`
      );
    }

    const fallbackData =
      await fallbackResponse.json();

    if (
      !fallbackData.translatedText
    ) {
      throw new Error(
        "Fallback translator returned no translation"
      );
    }

    return fallbackData.translatedText;
  } catch (error) {
    console.error(
      "Translation Service Error:",
      error.message
    );

    throw error;
  }
};

module.exports = {
  translateText,
};