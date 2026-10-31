"use client";
// components/profile/DetailsForm.jsx — name, phone and delivery address. Same fields and
// validation as checkout (useCheckoutForm), so what's saved here prefills checkout.
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, Info } from "lucide-react";
import toast from "react-hot-toast";
import { updateUser } from "@/store/features/authSlice";
import { Field, RegionField, TextField, inputClass } from "@/components/checkout/formFields";
import useCheckoutForm, { PROFILE_FIELDS, cleanValues } from "@/components/checkout/useCheckoutForm";

export default function DetailsForm() {
  const dispatch = useDispatch();
  const needsProfileCompletion = useSelector((s) => s.auth.needsProfileCompletion);
  const form = useCheckoutForm();
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.validate([...PROFILE_FIELDS, "addPhone"])) return;
    setSaving(true);
    const v = cleanValues(form.values);
    try {
      await dispatch(
        updateUser({
          firstName: v.firstName,
          lastName: v.lastName,
          phone: v.phone,
          addPhone: v.addPhone,
          region: v.region,
          city: v.city,
          address: v.address,
        })
      ).unwrap();
      toast.success("Your details are saved.");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Couldn't save your details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} noValidate className="rounded-[24px] border border-line p-6 sm:p-8">
      <h2 className="text-xl font-bold text-forest">My details</h2>
      <p className="mt-1 text-sm text-muted">We use these to fill in checkout for you.</p>

      {needsProfileCompletion && (
        <p className="mt-5 flex items-start gap-2.5 rounded-2xl bg-mint px-4 py-3 text-sm text-forest">
          <Info size={17} className="mt-0.5 shrink-0" />
          Add your name, phone and delivery address so checkout takes seconds.
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField form={form} name="firstName" label="First name" required autoComplete="given-name" maxLength={50} />
        <TextField form={form} name="lastName" label="Last name" required autoComplete="family-name" maxLength={50} />
        <Field label="Email" htmlFor="profile-email" className="sm:col-span-2">
          <input id="profile-email" value={form.user?.email || ""} disabled className={inputClass(false)} />
        </Field>
        <TextField form={form} name="phone" label="Phone number" required type="tel" inputMode="tel" autoComplete="tel" placeholder="080 000 0000" maxLength={15} />
        <TextField form={form} name="addPhone" label="Other phone" optional type="tel" inputMode="tel" placeholder="080 000 0000" maxLength={15} />
        <RegionField form={form} />
        <TextField form={form} name="city" label="City" required autoComplete="address-level2" placeholder="e.g. Ikeja" />
        <TextField
          form={form}
          name="address"
          label="Delivery address"
          required
          autoComplete="street-address"
          placeholder="House number, street, landmark"
          className="sm:col-span-2"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-forest px-8 text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:opacity-60 sm:w-auto"
      >
        <Check size={17} /> {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
