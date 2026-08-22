"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { IdentityPreview } from "./identity-preview";
import { PhoneField } from "./phone-field";
import { DEFAULT_COUNTRY, findCountry } from "@/lib/countries";
import { loginSchema, type LoginFormValues } from "@/lib/auth-schema";
import { NAME_MAX, toE164, validatePhone } from "@/lib/phone";
import { setToken } from "@/lib/auth-token";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/api-error";
import { API_ROOT } from "@/lib/api-config";
import { useLoginMutation } from "@/redux/api/auth-api";

/** Only same-origin paths are followed back after signing in. */
function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//"))
    return "/chat";
  return value;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [login, { isLoading }] = useLoginMutation();

  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      countryIso2: DEFAULT_COUNTRY.iso2,
      phone: "",
      name: "",
    },
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });

  const [countryIso2, phone, name] = useWatch({
    control,
    name: ["countryIso2", "phone", "name"],
  });
  const country = findCountry(countryIso2) ?? DEFAULT_COUNTRY;
  const phoneIsComplete = validatePhone(country, phone) === null;

  useEffect(() => {
    if (!API_ROOT) return;
    const controller = new AbortController();
    fetch(`${API_ROOT}/health`, { signal: controller.signal }).catch(() => {});
    return () => controller.abort();
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    const selected = findCountry(values.countryIso2) ?? DEFAULT_COUNTRY;

    try {
      const { token } = await login({
        phone: toE164(selected, values.phone),
        name: values.name.trim(),
      }).unwrap();

      setToken(token);
      router.replace(safeNext(searchParams.get("next")));
      router.refresh();
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error);
      if (fieldErrors.phone) {
        setError("phone", { message: fieldErrors.phone });
      }
      if (fieldErrors.name) {
        setError("name", { message: fieldErrors.name });
      }
      setError("root", { message: getApiErrorMessage(error) });
    }
  });

  return (
    <div className="w-full max-w-100 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_1px_2px_oklch(0.245_0.022_252/0.06),0_16px_40px_-16px_oklch(0.245_0.022_252/0.22)] sm:p-7">
        <Logo className="text-sm" markClassName="size-7" />

        <div className="mt-6">
          <IdentityPreview
            name={name}
            phone={phoneIsComplete ? toE164(country, phone) : null}
          />
        </div>

        <form onSubmit={onSubmit} noValidate className="mt-7">
          <FieldGroup>
            <Field data-invalid={Boolean(errors.phone)}>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <PhoneField
                    id="phone"
                    inputRef={field.ref}
                    country={country}
                    onCountryChange={(next) => {
                      setValue("countryIso2", next.iso2);
                      if (errors.phone) void trigger("phone");
                    }}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    invalid={Boolean(errors.phone)}
                    describedBy={errors.phone ? "phone-error" : undefined}
                    disabled={isLoading}
                  />
                )}
              />
              <FieldError id="phone-error">{errors.phone?.message}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="name">Display name</FieldLabel>
              <Input
                id="name"
                autoComplete="name"
                maxLength={NAME_MAX}
                placeholder="How you'll appear in chats"
                disabled={isLoading}
                aria-invalid={Boolean(errors.name) || undefined}
                aria-describedby={errors.name ? "name-error" : "name-hint"}
                className="h-10"
                {...register("name")}
              />
              {errors.name ? (
                <FieldError id="name-error">{errors.name.message}</FieldError>
              ) : (
                <FieldDescription id="name-hint" className="text-xs">
                  Signing in with a number you&apos;ve used before updates this
                  name everywhere.
                </FieldDescription>
              )}
            </Field>

            {errors.root && (
              <p
                role="alert"
                className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {errors.root.message}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="h-10 w-full"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Signing in…
                </>
              ) : (
                "Start chatting"
              )}
            </Button>
          </FieldGroup>
        </form>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        New number? We create your account automatically.
      </p>
    </div>
  );
}
