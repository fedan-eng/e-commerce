"use client";

import { useEffect, useState } from "react";

const DEFAULT_CLASS = "block bg-[#f6f6f6] mt-2 px-3 py-3 rounded-md outline-0 w-full text-sm";

export default function RegionSelect({ value, onChange, disabled, id, className = DEFAULT_CLASS }) {
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await fetch("/api/delivery/regions");
        const data = await res.json();
        setRegions(data);
      } catch (err) {
        console.error("Failed to fetch regions", err);
      }
    };

    fetchRegions();
  }, []);

  return (
    <select
      id={id}
      name="region"
      value={value?.name || ""}
      onChange={(e) => {
        const selected = regions.find((r) => r.region === e.target.value);
        onChange(
          selected
            ? { name: selected.region, fee: selected.fee }
            : { name: "", fee: 0 }
        );
      }}
      disabled={disabled}
      className={className}
    >
      <option value="">-- Select Region --</option>
      {regions.map((region) => (
        <option
          key={region.region}
          value={region.region}
        >
          {region.region}
        </option>
      ))}
    </select>
  );
}
