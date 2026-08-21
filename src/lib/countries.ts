export type Country = {
  iso2: string;
  name: string;
  dial: string;
  digits: number | [number, number];

  example: string;
};

export const COUNTRIES: Country[] = [
  {
    iso2: "BD",
    name: "Bangladesh",
    dial: "880",
    digits: 10,
    example: "1712 345 678",
  },
  { iso2: "IN", name: "India", dial: "91", digits: 10, example: "98765 43210" },
  {
    iso2: "PK",
    name: "Pakistan",
    dial: "92",
    digits: 10,
    example: "300 1234567",
  },
  {
    iso2: "NP",
    name: "Nepal",
    dial: "977",
    digits: 10,
    example: "984 1234567",
  },
  {
    iso2: "LK",
    name: "Sri Lanka",
    dial: "94",
    digits: 9,
    example: "71 234 5678",
  },
  {
    iso2: "US",
    name: "United States",
    dial: "1",
    digits: 10,
    example: "555 123 4567",
  },
  {
    iso2: "CA",
    name: "Canada",
    dial: "1",
    digits: 10,
    example: "555 123 4567",
  },
  {
    iso2: "GB",
    name: "United Kingdom",
    dial: "44",
    digits: 10,
    example: "7400 123456",
  },
  {
    iso2: "IE",
    name: "Ireland",
    dial: "353",
    digits: 9,
    example: "85 123 4567",
  },
  {
    iso2: "DE",
    name: "Germany",
    dial: "49",
    digits: [10, 11],
    example: "1512 3456789",
  },
  {
    iso2: "FR",
    name: "France",
    dial: "33",
    digits: 9,
    example: "6 12 34 56 78",
  },
  {
    iso2: "IT",
    name: "Italy",
    dial: "39",
    digits: [9, 10],
    example: "312 345 6789",
  },
  { iso2: "ES", name: "Spain", dial: "34", digits: 9, example: "612 345 678" },
  {
    iso2: "PT",
    name: "Portugal",
    dial: "351",
    digits: 9,
    example: "912 345 678",
  },
  {
    iso2: "NL",
    name: "Netherlands",
    dial: "31",
    digits: 9,
    example: "6 12345678",
  },
  {
    iso2: "BE",
    name: "Belgium",
    dial: "32",
    digits: 9,
    example: "470 12 34 56",
  },
  {
    iso2: "CH",
    name: "Switzerland",
    dial: "41",
    digits: 9,
    example: "78 123 45 67",
  },
  {
    iso2: "AT",
    name: "Austria",
    dial: "43",
    digits: [10, 11],
    example: "664 1234567",
  },
  { iso2: "PL", name: "Poland", dial: "48", digits: 9, example: "512 345 678" },
  {
    iso2: "SE",
    name: "Sweden",
    dial: "46",
    digits: [7, 9],
    example: "70 123 45 67",
  },
  { iso2: "NO", name: "Norway", dial: "47", digits: 8, example: "406 12 345" },
  {
    iso2: "DK",
    name: "Denmark",
    dial: "45",
    digits: 8,
    example: "20 12 34 56",
  },
  {
    iso2: "FI",
    name: "Finland",
    dial: "358",
    digits: [9, 10],
    example: "41 2345678",
  },
  {
    iso2: "TR",
    name: "Türkiye",
    dial: "90",
    digits: 10,
    example: "532 123 4567",
  },
  {
    iso2: "RU",
    name: "Russia",
    dial: "7",
    digits: 10,
    example: "912 345 6789",
  },
  {
    iso2: "UA",
    name: "Ukraine",
    dial: "380",
    digits: 9,
    example: "50 123 4567",
  },
  {
    iso2: "AE",
    name: "United Arab Emirates",
    dial: "971",
    digits: 9,
    example: "50 123 4567",
  },
  {
    iso2: "SA",
    name: "Saudi Arabia",
    dial: "966",
    digits: 9,
    example: "51 234 5678",
  },
  { iso2: "QA", name: "Qatar", dial: "974", digits: 8, example: "3312 3456" },
  { iso2: "KW", name: "Kuwait", dial: "965", digits: 8, example: "500 12345" },
  { iso2: "OM", name: "Oman", dial: "968", digits: 8, example: "9212 3456" },
  {
    iso2: "EG",
    name: "Egypt",
    dial: "20",
    digits: 10,
    example: "100 123 4567",
  },
  {
    iso2: "NG",
    name: "Nigeria",
    dial: "234",
    digits: 10,
    example: "802 123 4567",
  },
  { iso2: "KE", name: "Kenya", dial: "254", digits: 9, example: "712 345 678" },
  {
    iso2: "ZA",
    name: "South Africa",
    dial: "27",
    digits: 9,
    example: "71 234 5678",
  },
  {
    iso2: "MY",
    name: "Malaysia",
    dial: "60",
    digits: [9, 10],
    example: "12 345 6789",
  },
  {
    iso2: "SG",
    name: "Singapore",
    dial: "65",
    digits: 8,
    example: "8123 4567",
  },
  {
    iso2: "ID",
    name: "Indonesia",
    dial: "62",
    digits: [9, 12],
    example: "812 345 678",
  },
  {
    iso2: "PH",
    name: "Philippines",
    dial: "63",
    digits: 10,
    example: "917 123 4567",
  },
  {
    iso2: "TH",
    name: "Thailand",
    dial: "66",
    digits: 9,
    example: "81 234 5678",
  },
  {
    iso2: "VN",
    name: "Vietnam",
    dial: "84",
    digits: 9,
    example: "91 234 5678",
  },
  {
    iso2: "CN",
    name: "China",
    dial: "86",
    digits: 11,
    example: "131 2345 6789",
  },
  {
    iso2: "HK",
    name: "Hong Kong",
    dial: "852",
    digits: 8,
    example: "5123 4567",
  },
  {
    iso2: "JP",
    name: "Japan",
    dial: "81",
    digits: 10,
    example: "90 1234 5678",
  },
  {
    iso2: "KR",
    name: "South Korea",
    dial: "82",
    digits: [9, 10],
    example: "10 1234 5678",
  },
  {
    iso2: "AU",
    name: "Australia",
    dial: "61",
    digits: 9,
    example: "412 345 678",
  },
  {
    iso2: "NZ",
    name: "New Zealand",
    dial: "64",
    digits: [8, 10],
    example: "21 123 4567",
  },
  {
    iso2: "BR",
    name: "Brazil",
    dial: "55",
    digits: 11,
    example: "11 91234 5678",
  },
  {
    iso2: "MX",
    name: "Mexico",
    dial: "52",
    digits: 10,
    example: "55 1234 5678",
  },
  {
    iso2: "AR",
    name: "Argentina",
    dial: "54",
    digits: 10,
    example: "11 2345 6789",
  },
];

export const DEFAULT_COUNTRY =
  COUNTRIES.find((country) => country.iso2 === "BD") ?? COUNTRIES[0];

export function findCountry(iso2: string): Country | undefined {
  return COUNTRIES.find((country) => country.iso2 === iso2);
}

/** Regional indicator pair — no flag assets, no icon font. */
export function flagOf(iso2: string): string {
  return String.fromCodePoint(
    ...[...iso2.toUpperCase()].map((char) => 0x1f1a5 + char.charCodeAt(0)),
  );
}
