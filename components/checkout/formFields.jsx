// components/checkout/formFields.jsx — labelled inputs used by checkout and profile completion
import { ChevronDown } from "lucide-react";
import RegionSelect from "@/components/RegionSelect";

export const inputClass = (error) =>
  `w-full rounded-2xl border bg-sage px-4 py-3.5 text-[15px] text-forest outline-none transition-colors placeholder:text-muted/60 focus:border-forest focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 ${
    error ? "border-red-400" : "border-transparent"
  }`;

export function Field({ label, htmlFor, required, optional, error, className = "", children }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-forest">
        {label}
        {required && <span className="text-red-500"> *</span>}
        {optional && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// `form` = { values, errors, onChange } from useCheckoutForm
export function TextField({ form, name, label, required, optional, className, ...inputProps }) {
  const error = form.errors[name];
  return (
    <Field label={label} htmlFor={name} required={required} optional={optional} error={error} className={className}>
      <input
        id={name}
        name={name}
        value={form.values[name]}
        onChange={form.onChange}
        aria-invalid={Boolean(error)}
        className={inputClass(error)}
        {...inputProps}
      />
    </Field>
  );
}

export function TextAreaField({ form, name, label, required, optional, className, ...inputProps }) {
  const error = form.errors[name];
  return (
    <Field label={label} htmlFor={name} required={required} optional={optional} error={error} className={className}>
      <textarea
        id={name}
        name={name}
        value={form.values[name]}
        onChange={form.onChange}
        aria-invalid={Boolean(error)}
        className={`${inputClass(error)} resize-none`}
        {...inputProps}
      />
    </Field>
  );
}

export function RegionField({ form, className }) {
  const error = form.errors.region;
  return (
    <Field label="Region" htmlFor="region" required error={error} className={className}>
      <div className="relative">
        <RegionSelect
          id="region"
          value={form.values.region}
          onChange={(region) => form.setValue("region", region)}
          className={`${inputClass(error)} cursor-pointer appearance-none pr-10`}
        />
        <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-forest" />
      </div>
    </Field>
  );
}
