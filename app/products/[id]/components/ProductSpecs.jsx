import { Check } from "lucide-react";
import { WHATSAPP_URL } from "@/lib/categories";
import ProductHighlights from "./ProductHighlights";

function InTheBox({ items }) {
  return (
    <div className="rounded-[26px] bg-mint p-6 md:p-7">
      <h3 className="text-lg font-semibold text-forest">In the box</h3>
      {items.length > 0 && (
        <ul className="mt-4 flex flex-col gap-3">
          {items.map(({ item, quantity }) => (
            <li key={item} className="flex items-center gap-3 text-base font-medium text-forest">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest text-white">
                <Check size={14} strokeWidth={3} />
              </span>
              {quantity > 1 ? `${quantity} × ${item}` : item}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-5 text-sm text-muted">
        Questions about compatibility?{" "}
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-forest underline underline-offset-2">
          Ask us on WhatsApp
        </a>
      </p>
    </div>
  );
}

// The product itself always comes first, unless the admin already listed it
function getBoxItems(productName, boxContent) {
  const listed = boxContent.filter((b) => b.item?.trim());
  const name = productName.trim().toLowerCase();
  const hasProduct = listed.some((b) => b.item.trim().toLowerCase() === name);
  return hasProduct ? listed : [{ item: productName, quantity: 1 }, ...listed];
}

// Sits under the gallery on desktop and after the buy box on mobile
export default function ProductSpecs({ productName, highlights, boxContent = [] }) {
  const boxItems = getBoxItems(productName, boxContent);

  return (
    <div className="flex flex-col gap-5">
      {highlights.length > 0 && (
        <div>
          <h2 className="mb-4 text-[22px] font-bold leading-tight tracking-tight text-forest">Specifications</h2>
          <ProductHighlights highlights={highlights} />
        </div>
      )}
      <InTheBox items={boxItems} />
    </div>
  );
}
