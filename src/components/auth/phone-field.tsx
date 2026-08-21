"use client";

import { COUNTRIES, flagOf, type Country } from "@/lib/countries";
import { formatNational } from "@/lib/phone";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

export function PhoneField({
  id,
  inputRef,
  country,
  onCountryChange,
  value,
  onValueChange,
  invalid,
  describedBy,
  disabled,
  onBlur,
}: {
  id: string;
  inputRef?: React.Ref<HTMLInputElement>;
  country: Country;
  onCountryChange: (country: Country) => void;
  value: string;
  onValueChange: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
  disabled?: boolean;
  onBlur?: () => void;
}) {
  const anchor = useComboboxAnchor();

  return (
    <Combobox
      items={COUNTRIES}
      value={country}
      onValueChange={(next) => next && onCountryChange(next)}
      itemToStringLabel={(item: Country) => `${item.name} +${item.dial}`}
      isItemEqualToValue={(a: Country, b: Country) => a.iso2 === b.iso2}
    >
      <InputGroup ref={anchor} className="h-10">
        <InputGroupAddon align="inline-start" className="pr-0">
          <ComboboxTrigger
            render={<InputGroupButton size="xs" variant="ghost" />}
            disabled={disabled}
            aria-label={`Country code: ${country.name}, plus ${country.dial}`}
            className="h-7 gap-1.5 px-1.5 font-mono text-sm text-foreground tabular-nums"
          >
            <span aria-hidden="true" className="text-base leading-none">
              {flagOf(country.iso2)}
            </span>
            +{country.dial}
          </ComboboxTrigger>

          <span aria-hidden="true" className="h-5 w-px bg-border" />
        </InputGroupAddon>

        <InputGroupInput
          id={id}
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder={country.example}
          value={value}
          disabled={disabled}
          onBlur={onBlur}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(event) => {
            const input = event.currentTarget;

            const atEnd = input.selectionStart === input.value.length;
            onValueChange(
              atEnd ? formatNational(country, input.value) : input.value,
            );
          }}
          className="font-mono tracking-[0.02em] tabular-nums"
        />
      </InputGroup>

      <ComboboxContent anchor={anchor} className="min-w-72">
        <ComboboxInput
          showTrigger={false}
          placeholder="Search by country or code"
        />
        <ComboboxEmpty className="px-3 py-6 text-center text-sm text-muted-foreground">
          No country matches that.
        </ComboboxEmpty>
        <ComboboxList>
          {(item: Country) => (
            <ComboboxItem key={item.iso2} value={item}>
              <span aria-hidden="true" className="text-base leading-none">
                {flagOf(item.iso2)}
              </span>
              <span className="flex-1 truncate">{item.name}</span>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                +{item.dial}
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
