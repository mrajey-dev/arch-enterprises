// Utility for Country Codes, International Phone Validation, and Email Validation
// Powered by countriesnow.space API + offline fallback catalog

export const COUNTRY_PHONE_RULES = {
  IN: { min: 10, max: 10, example: '98765 43210', name: 'India' },
  US: { min: 10, max: 10, example: '555 123 4567', name: 'United States' },
  CA: { min: 10, max: 10, example: '555 123 4567', name: 'Canada' },
  GB: { min: 10, max: 10, example: '7911 123456', name: 'United Kingdom' },
  AE: { min: 9, max: 9, example: '50 123 4567', name: 'United Arab Emirates' },
  SA: { min: 9, max: 9, example: '50 123 4567', name: 'Saudi Arabia' },
  QA: { min: 8, max: 8, example: '3312 3456', name: 'Qatar' },
  OM: { min: 8, max: 8, example: '9123 4567', name: 'Oman' },
  KW: { min: 8, max: 8, example: '5123 4567', name: 'Kuwait' },
  BH: { min: 8, max: 8, example: '3612 3456', name: 'Bahrain' },
  SG: { min: 8, max: 8, example: '8123 4567', name: 'Singapore' },
  MY: { min: 9, max: 10, example: '12 345 6789', name: 'Malaysia' },
  AU: { min: 9, max: 9, example: '412 345 678', name: 'Australia' },
  NZ: { min: 9, max: 9, example: '21 123 4567', name: 'New Zealand' },
  DE: { min: 10, max: 11, example: '151 23456789', name: 'Germany' },
  FR: { min: 9, max: 9, example: '6 12 34 56 78', name: 'France' },
  IT: { min: 10, max: 10, example: '312 345 6789', name: 'Italy' },
  ES: { min: 9, max: 9, example: '612 345 678', name: 'Spain' },
  NL: { min: 9, max: 9, example: '6 12345678', name: 'Netherlands' },
  CH: { min: 9, max: 9, example: '78 123 45 67', name: 'Switzerland' },
  SE: { min: 9, max: 9, example: '70 123 45 67', name: 'Sweden' },
  IE: { min: 9, max: 9, example: '83 123 4567', name: 'Ireland' },
  ZA: { min: 9, max: 9, example: '71 123 4567', name: 'South Africa' },
  JP: { min: 10, max: 10, example: '90 1234 5678', name: 'Japan' },
  CN: { min: 11, max: 11, example: '138 0013 8000', name: 'China' },
  HK: { min: 8, max: 8, example: '9123 4567', name: 'Hong Kong' },
  ID: { min: 9, max: 12, example: '812 3456 7890', name: 'Indonesia' },
  PH: { min: 10, max: 10, example: '917 123 4567', name: 'Philippines' },
  TH: { min: 9, max: 9, example: '81 234 5678', name: 'Thailand' },
  VN: { min: 9, max: 10, example: '91 234 5678', name: 'Vietnam' },
  BR: { min: 11, max: 11, example: '11 91234 5678', name: 'Brazil' },
  MX: { min: 10, max: 10, example: '55 1234 5678', name: 'Mexico' },
  EG: { min: 10, max: 10, example: '10 1234 5678', name: 'Egypt' },
  NG: { min: 10, max: 10, example: '802 123 4567', name: 'Nigeria' },
  KE: { min: 9, max: 9, example: '712 345678', name: 'Kenya' },
  BD: { min: 10, max: 10, example: '1712 345678', name: 'Bangladesh' },
  PK: { min: 10, max: 10, example: '300 1234567', name: 'Pakistan' },
  LK: { min: 9, max: 9, example: '71 234 5678', name: 'Sri Lanka' },
  NP: { min: 10, max: 10, example: '984 1234567', name: 'Nepal' },
  TR: { min: 10, max: 10, example: '532 123 4567', name: 'Turkey' },
  RU: { min: 10, max: 10, example: '912 345 67 89', name: 'Russia' }
};

// Convert ISO-2 (e.g. 'IN') to flag emoji (🇮🇳)
export function getFlagEmoji(countryCode) {
  if (!countryCode || typeof countryCode !== 'string' || countryCode.length !== 2) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Built-in curated catalog for instantaneous rendering without network dependency
export const DEFAULT_COUNTRIES = [
  { name: 'India', code: 'IN', dial_code: '+91', flag: '🇮🇳', min: 10, max: 10, example: '98765 43210' },
  { name: 'United States', code: 'US', dial_code: '+1', flag: '🇺🇸', min: 10, max: 10, example: '555 123 4567' },
  { name: 'United Arab Emirates', code: 'AE', dial_code: '+971', flag: '🇦🇪', min: 9, max: 9, example: '50 123 4567' },
  { name: 'United Kingdom', code: 'GB', dial_code: '+44', flag: '🇬🇧', min: 10, max: 10, example: '7911 123456' },
  { name: 'Saudi Arabia', code: 'SA', dial_code: '+966', flag: '🇸🇦', min: 9, max: 9, example: '50 123 4567' },
  { name: 'Canada', code: 'CA', dial_code: '+1', flag: '🇨🇦', min: 10, max: 10, example: '555 123 4567' },
  { name: 'Australia', code: 'AU', dial_code: '+61', flag: '🇦🇺', min: 9, max: 9, example: '412 345 678' },
  { name: 'Singapore', code: 'SG', dial_code: '+65', flag: '🇸🇬', min: 8, max: 8, example: '8123 4567' },
  { name: 'Qatar', code: 'QA', dial_code: '+974', flag: '🇶🇦', min: 8, max: 8, example: '3312 3456' },
  { name: 'Oman', code: 'OM', dial_code: '+968', flag: '🇴🇲', min: 8, max: 8, example: '9123 4567' },
  { name: 'Kuwait', code: 'KW', dial_code: '+965', flag: '🇰🇼', min: 8, max: 8, example: '5123 4567' },
  { name: 'Bahrain', code: 'BH', dial_code: '+973', flag: '🇧🇭', min: 8, max: 8, example: '3612 3456' },
  { name: 'Malaysia', code: 'MY', dial_code: '+60', flag: '🇲🇾', min: 9, max: 10, example: '12 345 6789' },
  { name: 'Germany', code: 'DE', dial_code: '+49', flag: '🇩🇪', min: 10, max: 11, example: '151 23456789' },
  { name: 'France', code: 'FR', dial_code: '+33', flag: '🇫🇷', min: 9, max: 9, example: '6 12 34 56 78' },
  { name: 'Italy', code: 'IT', dial_code: '+39', flag: '🇮🇹', min: 10, max: 10, example: '312 345 6789' },
  { name: 'Spain', code: 'ES', dial_code: '+34', flag: '🇪🇸', min: 9, max: 9, example: '612 345 678' },
  { name: 'Netherlands', code: 'NL', dial_code: '+31', flag: '🇳🇱', min: 9, max: 9, example: '6 12345678' },
  { name: 'Switzerland', code: 'CH', dial_code: '+41', flag: '🇨🇭', min: 9, max: 9, example: '78 123 45 67' },
  { name: 'Sweden', code: 'SE', dial_code: '+46', flag: '🇸🇪', min: 9, max: 9, example: '70 123 45 67' },
  { name: 'Ireland', code: 'IE', dial_code: '+353', flag: '🇮🇪', min: 9, max: 9, example: '83 123 4567' },
  { name: 'New Zealand', code: 'NZ', dial_code: '+64', flag: '🇳🇿', min: 9, max: 9, example: '21 123 4567' },
  { name: 'South Africa', code: 'ZA', dial_code: '+27', flag: '🇿🇦', min: 9, max: 9, example: '71 123 4567' },
  { name: 'Japan', code: 'JP', dial_code: '+81', flag: '🇯🇵', min: 10, max: 10, example: '90 1234 5678' },
  { name: 'China', code: 'CN', dial_code: '+86', flag: '🇨🇳', min: 11, max: 11, example: '138 0013 8000' },
  { name: 'Hong Kong', code: 'HK', dial_code: '+852', flag: '🇭🇰', min: 8, max: 8, example: '9123 4567' },
  { name: 'Indonesia', code: 'ID', dial_code: '+62', flag: '🇮🇩', min: 9, max: 12, example: '812 3456 7890' },
  { name: 'Philippines', code: 'PH', dial_code: '+63', flag: '🇵🇭', min: 10, max: 10, example: '917 123 4567' },
  { name: 'Thailand', code: 'TH', dial_code: '+66', flag: '🇹🇭', min: 9, max: 9, example: '81 234 5678' },
  { name: 'Vietnam', code: 'VN', dial_code: '+84', flag: '🇻🇳', min: 9, max: 10, example: '91 234 5678' },
  { name: 'Brazil', code: 'BR', dial_code: '+55', flag: '🇧🇷', min: 11, max: 11, example: '11 91234 5678' },
  { name: 'Mexico', code: 'MX', dial_code: '+52', flag: '🇲🇽', min: 10, max: 10, example: '55 1234 5678' },
  { name: 'Egypt', code: 'EG', dial_code: '+20', flag: '🇪🇬', min: 10, max: 10, example: '10 1234 5678' },
  { name: 'Nigeria', code: 'NG', dial_code: '+234', flag: '🇳🇬', min: 10, max: 10, example: '802 123 4567' },
  { name: 'Kenya', code: 'KE', dial_code: '+254', flag: '🇰🇪', min: 9, max: 9, example: '712 345678' },
  { name: 'Bangladesh', code: 'BD', dial_code: '+880', flag: '🇧🇩', min: 10, max: 10, example: '1712 345678' },
  { name: 'Pakistan', code: 'PK', dial_code: '+92', flag: '🇵🇰', min: 10, max: 10, example: '300 1234567' },
  { name: 'Sri Lanka', code: 'LK', dial_code: '+94', flag: '🇱🇰', min: 9, max: 9, example: '71 234 5678' },
  { name: 'Nepal', code: 'NP', dial_code: '+977', flag: '🇳🇵', min: 10, max: 10, example: '984 1234567' },
  { name: 'Turkey', code: 'TR', dial_code: '+90', flag: '🇹🇷', min: 10, max: 10, example: '532 123 4567' },
  { name: 'Russia', code: 'RU', dial_code: '+7', flag: '🇷🇺', min: 10, max: 10, example: '912 345 67 89' }
];

/**
 * Fetch country codes from public API (https://countriesnow.space/api/v0.1/countries/codes)
 * Returns merged array of all countries with flags and validation rules.
 */
export async function fetchCountryCodesApi() {
  const CACHE_KEY = 'arch360_country_codes_v2';
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 50) {
        return parsed;
      }
    }
  } catch (e) {}

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://countriesnow.space/api/v0.1/countries/codes', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json && json.data && Array.isArray(json.data)) {
        // Map API data and merge phone length rules
        const apiCountries = json.data
          .filter(c => c.name && c.code && c.dial_code)
          .map(c => {
            const code = c.code.toUpperCase();
            const rule = COUNTRY_PHONE_RULES[code] || { min: 7, max: 15, example: 'Phone number' };
            return {
              name: c.name,
              code: code,
              dial_code: c.dial_code.startsWith('+') ? c.dial_code : '+' + c.dial_code,
              flag: getFlagEmoji(code),
              min: rule.min,
              max: rule.max,
              example: rule.example
            };
          });

        // Ensure India and US are top priorities if present
        const priorityCodes = ['IN', 'US', 'AE', 'GB', 'SA', 'CA', 'AU', 'SG'];
        const priority = [];
        const others = [];

        priorityCodes.forEach(pCode => {
          const found = apiCountries.find(c => c.code === pCode);
          if (found) priority.push(found);
        });

        apiCountries.forEach(c => {
          if (!priorityCodes.includes(c.code)) others.push(c);
        });

        // Sort remainder alphabetically by name
        others.sort((a, b) => a.name.localeCompare(b.name));
        const combined = [...priority, ...others];

        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(combined));
        } catch (e) {}

        return combined;
      }
    }
  } catch (err) {
    // Graceful fallback to default curated list on network failure / offline mode
    console.info('[CountryCodes] API fetch fallback to default catalog:', err.message);
  }

  return DEFAULT_COUNTRIES;
}

/**
 * Validate email address format
 */
export function validateEmail(email) {
  if (!email || !email.trim()) {
    return { isValid: true, message: '' }; // Optional by default
  }
  const trimmed = email.trim();
  // Standard RFC 5322 compatible email regex
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  const isValid = regex.test(trimmed);
  return {
    isValid,
    message: isValid ? '' : 'Please enter a valid email address (e.g. name@company.com)'
  };
}

/**
 * Validate mobile number according to selected country rules
 */
export function validatePhoneNumber(rawNumber, country) {
  if (!rawNumber || !rawNumber.trim()) {
    return { isValid: true, message: '', count: 0, required: 0 }; // Optional by default
  }

  const digits = rawNumber.replace(/\D/g, '');
  const count = digits.length;
  const min = (country && country.min) || 7;
  const max = (country && country.max) || 15;
  const countryName = (country && country.name) || 'selected country';

  if (count === 0) {
    return { isValid: true, message: '', count: 0, min, max };
  }

  if (min === max) {
    if (count < min) {
      return {
        isValid: false,
        message: `Must be ${min} digits for ${countryName} (${count}/${min})`,
        count,
        min,
        max
      };
    }
    if (count > max) {
      return {
        isValid: false,
        message: `Exceeds ${max} digits for ${countryName} (${count}/${max})`,
        count,
        min,
        max
      };
    }
  } else {
    if (count < min) {
      return {
        isValid: false,
        message: `Must be between ${min} and ${max} digits for ${countryName} (${count} entered)`,
        count,
        min,
        max
      };
    }
    if (count > max) {
      return {
        isValid: false,
        message: `Exceeds max ${max} digits for ${countryName}`,
        count,
        min,
        max
      };
    }
  }

  return {
    isValid: true,
    message: `✓ Valid number for ${countryName}`,
    count,
    min,
    max
  };
}

/**
 * Parses an existing phone string into country code and raw number
 */
export function parsePhoneString(fullPhone, countryList = DEFAULT_COUNTRIES) {
  if (!fullPhone || typeof fullPhone !== 'string') {
    return { dialCode: '+91', rawNumber: '', country: countryList[0] || null };
  }

  const trimmed = fullPhone.trim();
  // Check if starts with +
  if (trimmed.startsWith('+')) {
    // Sort countryList by longest dial code first to match +353 before +35 or +1 before etc.
    const sorted = [...countryList].sort((a, b) => b.dial_code.length - a.dial_code.length);
    for (const c of sorted) {
      if (trimmed.startsWith(c.dial_code)) {
        const raw = trimmed.slice(c.dial_code.length).trim().replace(/\D/g, '');
        return { dialCode: c.dial_code, rawNumber: raw, country: c };
      }
    }
  }

  // Fallback: Default to India (+91)
  const defaultCountry = countryList.find(c => c.dial_code === '+91') || countryList[0];
  const digitsOnly = trimmed.replace(/\D/g, '');
  return {
    dialCode: defaultCountry ? defaultCountry.dial_code : '+91',
    rawNumber: digitsOnly,
    country: defaultCountry
  };
}
