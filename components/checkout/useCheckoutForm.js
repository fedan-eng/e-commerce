"use client";
// components/checkout/useCheckoutForm.js — form state, prefill, sanitising and validation
// shared by CheckoutModal and ProfileCompletionModal.
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  sanitizePhone,
  sanitizeEmail,
  sanitizeName,
  sanitizeText,
  sanitizeAddress,
  getPhoneDigits,
  isValidEmail,
  isValidPhone,
} from "@/lib/sanitize";

export const SAVED_INFO_KEY = "savedCheckoutInfo";

const INITIAL = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  addPhone: "",
  region: { name: "", fee: 0 },
  city: "",
  address: "",
  orderNote: "",
  deliveryType: "Regular",
  saveForLater: false,
};

const PREFILL_FIELDS = ["firstName", "lastName", "email", "phone", "addPhone", "region", "city", "address"];

const SANITIZERS = {
  firstName: sanitizeName,
  lastName: sanitizeName,
  city: sanitizeName,
  email: sanitizeEmail,
  phone: sanitizePhone,
  addPhone: sanitizePhone,
  address: sanitizeAddress,
  orderNote: (v) => sanitizeText(v, 500),
};

// ─── Validation rules (each returns an error message or "") ────────────────────

const name = (label) => (v) => (!v.trim() ? `${label} is required` : v.trim().length < 2 ? `${label} is too short` : "");

const RULES = {
  firstName: name("First name"),
  lastName: name("Last name"),
  email: (v) => (!v.trim() ? "Email is required" : !isValidEmail(v) ? "Please enter a valid email address" : ""),
  phone: (v) =>
    !String(v).trim() ? "Phone is required" : !isValidPhone(v) ? "Please enter a valid phone number (10-14 digits)" : "",
  addPhone: (v) => (v && !isValidPhone(v) ? "Please enter a valid alternative number" : ""),
  region: (v) => (!v?.name ? "Region is required" : ""),
  city: (v) => (!v.trim() ? "City is required" : ""),
  address: (v) => (!v.trim() ? "Address is required" : v.trim().length < 5 ? "Please enter a complete address" : ""),
};

export const CONTACT_FIELDS = ["firstName", "lastName", "email", "phone", "addPhone"];
export const DELIVERY_FIELDS = ["region", "city", "address"];
export const PROFILE_FIELDS = ["lastName", "phone", "region", "city", "address"];

// Trimmed, digits-only values ready for the API
export function cleanValues(values) {
  return {
    ...values,
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: sanitizeEmail(values.email),
    phone: getPhoneDigits(values.phone),
    addPhone: values.addPhone ? getPhoneDigits(values.addPhone) : "",
    city: values.city.trim(),
    address: values.address.trim(),
    orderNote: values.orderNote.trim(),
  };
}

export default function useCheckoutForm() {
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const prefilled = useRef(false);

  // Prefill once from the account, or from details a guest saved last time.
  // Only once: saving a step updates `user`, and re-filling would overwrite what's being typed.
  useEffect(() => {
    if (prefilled.current) return;
    let source = null;
    if (user && isAuthenticated) {
      localStorage.removeItem(SAVED_INFO_KEY);
      source = user;
    } else {
      try {
        source = JSON.parse(localStorage.getItem(SAVED_INFO_KEY) || "null");
      } catch {
        source = null;
      }
    }
    if (!source) return;
    prefilled.current = true;
    setValues((prev) => {
      const next = { ...prev };
      PREFILL_FIELDS.forEach((f) => {
        if (source[f]) next[f] = f === "phone" || f === "addPhone" ? String(source[f]) : source[f];
      });
      return next;
    });
  }, [user, isAuthenticated]);

  const setValue = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));
  }, []);

  const onChange = useCallback(
    (e) => {
      const { name: field, value, type, checked } = e.target;
      const sanitize = SANITIZERS[field];
      setValue(field, type === "checkbox" ? checked : sanitize ? sanitize(value) : value);
    },
    [setValue]
  );

  // Validates the given fields, shows their errors and returns true when all pass
  const validate = useCallback(
    (fields) => {
      const found = {};
      fields.forEach((f) => {
        const msg = RULES[f]?.(values[f]);
        if (msg) found[f] = msg;
      });
      setErrors(found);
      return Object.keys(found).length === 0;
    },
    [values]
  );

  const clearErrors = useCallback(() => setErrors({}), []);

  return { values, errors, onChange, setValue, validate, clearErrors, user };
}
