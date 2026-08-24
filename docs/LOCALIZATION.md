# Localization Architecture

## V0 decision

BrahminBooking uses `next-intl` and repository-owned catalogues for English,
Hindi, Gujarati, and Kannada. The selected locale is stored only in the browser,
applied to the document `lang` attribute, and shared across discovery, Panchang,
booking, registration, privacy, and sign-in. This keeps the existing stable URLs
and remains compatible with the static GitHub Pages export.

The production site does not call a translation service at runtime. A missing
or failed external service therefore cannot change religious, privacy, consent,
or transactional copy. English is the canonical source; all supported
catalogues and translated approved-guide records are versioned and tested for
completeness in the repository.

## Free tool review

| Tool | Cost and role | Decision |
| --- | --- | --- |
| [next-intl](https://next-intl.dev/) | MIT-licensed application localization, ICU messages, formatting, and React/Next.js integration | Selected runtime library. Already installed and requires no hosted service. |
| [Tolgee](https://tolgee.io/pricing) | Free cloud tier for small projects and open-source self-hosted core; in-context review and translation workflow | Optional translation-management workspace when catalogue editing by coordinators/native reviewers begins. Do not add it to the public runtime. |
| [Weblate](https://weblate.org/) | Free and open-source when self-hosted; free hosted service is intended for qualifying libre projects | Good alternative if the project is operated as a qualifying open-source translation project. Not needed for V0. |
| [LibreTranslate](https://docs.libretranslate.com/) | Free/open-source self-hosted machine-translation API | May be used offline to draft low-risk copy. Never publish its output without repository review, and never use it live for religious or legal copy. |

Tolgee or Weblate would improve reviewer workflow, but neither is required for
deployment. GitHub remains the translation source of truth.

## Adding another language

1. Add the locale code, native label, and `Intl` language tag in
   `src/i18n/config.ts`.
2. Add matching registration/privacy and site catalogues.
3. Add complete translations for every approved puja and festival guide.
4. Run catalogue-key and approved-content coverage tests.
5. Review consent, privacy, validation, religious guidance, layout wrapping, and
   script rendering before enabling the locale in the switcher.

“Every language” means every language explicitly enabled and reviewed through
this process. Automatic support for all world languages would create unsafe,
unreviewed religious and consent copy and is not a V0 feature.
