"use client";
// components/checkout/ProfileCompletionModal.jsx — asks new (e.g. Google sign-in) users for
// the details checkout needs: name, phone and delivery address.
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Check } from "lucide-react";
import toast from "react-hot-toast";
import { updateUser } from "@/store/features/authSlice";
import ModalShell from "./ModalShell";
import { RegionField, TextField } from "./formFields";
import useCheckoutForm, { PROFILE_FIELDS, cleanValues } from "./useCheckoutForm";

export default function ProfileCompletionModal({ onClose, onComplete }) {
  const dispatch = useDispatch();
  const form = useCheckoutForm();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.validate(PROFILE_FIELDS)) return;
    setSaving(true);
    const v = cleanValues(form.values);
    try {
      await dispatch(
        updateUser({ firstName: v.firstName, lastName: v.lastName, phone: v.phone, region: v.region, city: v.city, address: v.address })
      ).unwrap();
      toast.success("You're all set!");
      onComplete?.();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Couldn't save your details. Please try again.");
      setSaving(false);
    }
  };

  const footer = (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      <button
        type="button"
        onClick={onClose}
        className="h-[52px] rounded-full px-6 text-[15px] font-semibold text-forest transition-colors hover:bg-sage"
      >
        Maybe later
      </button>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-forest text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:opacity-60"
      >
        <Check size={17} /> {saving ? "Saving…" : "Save my details"}
      </button>
    </div>
  );

  return (
    <ModalShell
      title={`Welcome${form.user?.firstName ? `, ${form.user.firstName}` : ""}!`}
      subtitle="Add a few details so checkout is quick next time."
      onClose={onClose}
      footer={footer}
      labelledBy="profile-title"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField form={form} name="firstName" label="First name" required autoComplete="given-name" placeholder="Ada" maxLength={50} />
        <TextField form={form} name="lastName" label="Last name" required autoComplete="family-name" placeholder="Koleola" maxLength={50} />
        <TextField form={form} name="phone" label="Phone number" required type="tel" inputMode="tel" autoComplete="tel" placeholder="080 000 0000" maxLength={15} />
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
    </ModalShell>
  );
}
