import { Injectable, signal } from '@angular/core';

export type LanguageCode = 'en' | 'ta';

type Dictionary = Record<string, string>;

const STORAGE_KEY = 'tms_language';

const TRANSLATIONS: Record<LanguageCode, Dictionary> = {
  en: {
    'app.name': 'Sentraya Perumal Temple',
    'app.subtitle': 'Temple Management Platform',
    'app.adminUser': 'Admin User',
    'app.administrator': 'Administrator',
    'app.logout': 'Logout',
    'app.language': 'Language',
    'app.ledger': 'Narayana Seva Ledger',

    'nav.main': 'Main',
    'nav.masters': 'Masters',
    'nav.transactions': 'Transactions',
    'nav.reports': 'Reports',
    'nav.dashboard': 'Dashboard',
    'nav.villageMaster': 'Village Master',
    'nav.devotees': 'Devotees',
    'nav.taxMaster': 'Tax Master',
    'nav.donationMaster': 'Donation Master',
    'nav.pettyCashMaster': 'Petty Cash Master',
    'nav.taxEntry': 'Tax Entry',
    'nav.donationScreen': 'Donation Screen',
    'nav.interest': 'Interest',
    'nav.payment': 'Payment',
    'nav.taxReport': 'Tax Report',
    'nav.donationReport': 'Donation Report',
    'nav.paymentReport': 'Payment Report',
    'nav.overallReport': 'Overall Report',

    'route.dashboard': 'Dashboard',
    'route.villageMaster': 'Village Master',
    'route.devotees': 'Devotees',
    'route.taxMaster': 'Tax Master',
    'route.donationMaster': 'Donation Master',
    'route.pettyCashMaster': 'Petty Cash Master',
    'route.taxEntry': 'Tax Entry',
    'route.donationScreen': 'Donation Screen',
    'route.interest': 'Interest',
    'route.payment': 'Payment',
    'route.taxReport': 'Tax Report',
    'route.donationReport': 'Donation Report',
    'route.paymentReport': 'Payment Report',
    'route.overallReport': 'Overall Report',

    'login.om': 'Om Namo Narayanaya',
    'login.title': 'Sentraya Perumal Temple',
    'login.subtitle': 'Temple Management System',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.remember': 'Remember me',
    'login.button': 'Login',
    'login.footer': 'May Lord Perumal Bless You',
    'login.emailPlaceholder': 'Enter admin email',
    'login.passwordPlaceholder': 'Enter password',
    'login.error': 'Login failed. Check Firebase Auth email/password.',

    'language.english': 'English',
    'language.tamil': 'Tamil'
  },
  ta: {
    'app.name': 'சென்றாய பெருமாள் கோவில்',
    'app.subtitle': 'கோவில் நிர்வாக தளம்',
    'app.adminUser': 'நிர்வாக பயனர்',
    'app.administrator': 'நிர்வாகி',
    'app.logout': 'வெளியேறு',
    'app.language': 'மொழி',
    'app.ledger': 'நாராயண சேவை பதிவேடு',

    'nav.main': 'முக்கியம்',
    'nav.masters': 'முதன்மை பதிவுகள்',
    'nav.transactions': 'பரிவர்த்தனைகள்',
    'nav.reports': 'அறிக்கைகள்',
    'nav.dashboard': 'டாஷ்போர்டு',
    'nav.villageMaster': 'ஊர் பதிவு',
    'nav.devotees': 'பக்தர்கள்',
    'nav.taxMaster': 'வரி பதிவு',
    'nav.donationMaster': 'தான பதிவு',
    'nav.pettyCashMaster': 'சிறு செலவு பதிவு',
    'nav.taxEntry': 'வரி பதிவு உள்ளீடு',
    'nav.donationScreen': 'தான உள்ளீடு',
    'nav.interest': 'வட்டி',
    'nav.payment': 'கட்டணம்',
    'nav.taxReport': 'வரி அறிக்கை',
    'nav.donationReport': 'தான அறிக்கை',
    'nav.paymentReport': 'கட்டண அறிக்கை',
    'nav.overallReport': 'மொத்த அறிக்கை',

    'route.dashboard': 'டாஷ்போர்டு',
    'route.villageMaster': 'ஊர் பதிவு',
    'route.devotees': 'பக்தர்கள்',
    'route.taxMaster': 'வரி பதிவு',
    'route.donationMaster': 'தான பதிவு',
    'route.pettyCashMaster': 'சிறு செலவு பதிவு',
    'route.taxEntry': 'வரி பதிவு உள்ளீடு',
    'route.donationScreen': 'தான உள்ளீடு',
    'route.interest': 'வட்டி',
    'route.payment': 'கட்டணம்',
    'route.taxReport': 'வரி அறிக்கை',
    'route.donationReport': 'தான அறிக்கை',
    'route.paymentReport': 'கட்டண அறிக்கை',
    'route.overallReport': 'மொத்த அறிக்கை',

    'login.om': 'ஓம் நமோ நாராயணாய',
    'login.title': 'சென்றாய பெருமாள் கோவில்',
    'login.subtitle': 'கோவில் நிர்வாக அமைப்பு',
    'login.email': 'மின்னஞ்சல்',
    'login.password': 'கடவுச்சொல்',
    'login.remember': 'என்னை நினைவில் கொள்ளவும்',
    'login.button': 'உள்நுழை',
    'login.footer': 'பெருமாள் உங்களை ஆசீர்வதிப்பாராக',
    'login.emailPlaceholder': 'நிர்வாக மின்னஞ்சலை உள்ளிடவும்',
    'login.passwordPlaceholder': 'கடவுச்சொல்லை உள்ளிடவும்',
    'login.error': 'உள்நுழைவு தோல்வி. Firebase Auth விவரங்களை சரிபார்க்கவும்.',

    'language.english': 'ஆங்கிலம்',
    'language.tamil': 'தமிழ்'
  }
};

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly languageSignal = signal<LanguageCode>(this.readStoredLanguage());

  readonly options: Array<{ value: LanguageCode; labelKey: string }> = [
    { value: 'en', labelKey: 'language.english' },
    { value: 'ta', labelKey: 'language.tamil' }
  ];

  currentLanguage() {
    return this.languageSignal();
  }

  setLanguage(language: LanguageCode) {
    this.languageSignal.set(language);
    localStorage.setItem(STORAGE_KEY, language);
  }

  t(key: string): string {
    const lang = this.languageSignal();
    return TRANSLATIONS[lang][key] ?? TRANSLATIONS.en[key] ?? key;
  }

  private readStoredLanguage(): LanguageCode {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'ta' ? 'ta' : 'en';
  }
}
