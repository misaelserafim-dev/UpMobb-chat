export type FilterChipProps = {
  id: string;
  label: string;
  count?: number;
  dropdown?: boolean;
  active?: boolean;
  wrapSlide?: boolean;
  onClick?: () => void;
};
