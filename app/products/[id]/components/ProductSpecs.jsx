import { Check } from "lucide-react";
import { WHATSAPP_URL } from "@/lib/categories";
import ProductHighlights from "./ProductHighlights";

function BoxCard({ items }) {
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

// Right column, between the price and the colour picker
export function Specifications({ highlights }) {
  if (highlights.length === 0) return null;
  return (
    <div>
      <h2 className="text-[20px] font-medium leading-tight text-forest">Specifications</h2>
      <ProductHighlights highlights={highlights} />
    </div>
  );
}

// Under the gallery on desktop, after the buy box on mobile
export function InTheBox({ productName, boxContent = [] }) {
  return <BoxCard items={getBoxItems(productName, boxContent)} />;
}
