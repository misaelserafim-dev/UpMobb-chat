export type DialCode = {
  iso: string;
  name: string;
  dial: string;
  flag: string;
};

export const DIAL_CODES: DialCode[] = [
  { iso: "BR", name: "Brasil", dial: "+55", flag: "🇧🇷" },
  { iso: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
  { iso: "AR", name: "Argentina", dial: "+54", flag: "🇦🇷" },
  { iso: "CL", name: "Chile", dial: "+56", flag: "🇨🇱" },
  { iso: "CO", name: "Colombia", dial: "+57", flag: "🇨🇴" },
  { iso: "MX", name: "Mexico", dial: "+52", flag: "🇲🇽" },
  { iso: "PT", name: "Portugal", dial: "+351", flag: "🇵🇹" },
  { iso: "ES", name: "Spain", dial: "+34", flag: "🇪🇸" },
  { iso: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
  { iso: "DE", name: "Germany", dial: "+49", flag: "🇩🇪" },
  { iso: "IT", name: "Italy", dial: "+39", flag: "🇮🇹" },
  { iso: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
  { iso: "AO", name: "Angola", dial: "+244", flag: "🇦🇴" },
  { iso: "MZ", name: "Mozambique", dial: "+258", flag: "🇲🇿" },
  { iso: "UY", name: "Uruguay", dial: "+598", flag: "🇺🇾" },
  { iso: "PY", name: "Paraguay", dial: "+595", flag: "🇵🇾" },
  { iso: "PE", name: "Peru", dial: "+51", flag: "🇵🇪" },
  { iso: "BO", name: "Bolivia", dial: "+591", flag: "🇧🇴" },
  { iso: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
  { iso: "JP", name: "Japan", dial: "+81", flag: "🇯🇵" },
  { iso: "CN", name: "China", dial: "+86", flag: "🇨🇳" },
  { iso: "IN", name: "India", dial: "+91", flag: "🇮🇳" },
  { iso: "AU", name: "Australia", dial: "+61", flag: "🇦🇺" },
];

export function getDialCode(dial = "+55", iso = "BR"): DialCode {
  return (
    DIAL_CODES.find((c) => c.iso === iso) ||
    DIAL_CODES.find((c) => c.dial === dial) ||
    DIAL_CODES[0]
  );
}
