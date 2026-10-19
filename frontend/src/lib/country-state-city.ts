import { Country, State, City } from 'country-state-city';

export interface DropdownOption {
  value: string;
  label: string;
  sublabel?: string;
}

export function getAllCountriesOptions(): DropdownOption[] {
  return Country.getAllCountries().map((c) => ({
    value: c.isoCode,
    label: `${c.flag ? c.flag + ' ' : ''}${c.name}`,
    sublabel: c.isoCode,
  }));
}

export function getCountryByCode(countryCode: string) {
  if (!countryCode) return undefined;
  return Country.getCountryByCode(countryCode);
}

export function getStatesOfCountryOptions(countryCode: string): DropdownOption[] {
  if (!countryCode) return [];
  const states = State.getStatesOfCountry(countryCode);
  return states.map((s) => ({
    value: s.isoCode,
    label: s.name,
    sublabel: s.isoCode,
  }));
}

export function getCitiesOfStateOptions(countryCode: string, stateCode?: string): DropdownOption[] {
  if (!countryCode) return [];
  if (stateCode) {
    const cities = City.getCitiesOfState(countryCode, stateCode);
    if (cities && cities.length > 0) {
      return cities.map((c) => ({
        value: c.name,
        label: c.name,
      }));
    }
  }
  // Fallback: cities of entire country
  const countryCities = City.getCitiesOfCountry(countryCode) || [];
  return countryCities.slice(0, 500).map((c) => ({
    value: c.name,
    label: c.name,
  }));
}
