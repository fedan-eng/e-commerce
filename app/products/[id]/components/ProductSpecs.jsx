import { Check } from "lucide-react";
import { WHATSAPP_URL } from "@/lib/categories";
import { Container, SectionHeading } from "./ui";

function SpecTable({ rows }) {
  return (
    <dl className="mt-8 border-t-2 border-forest">
      {rows.map(({ label, value }) => (
        <div key={label} className="grid grid-cols-[minmax(0,46%)_1fr] gap-4 border-b border-line py-4 text-[15px] md:text-base">
          <dt className="text-muted">{label}</dt>
          <dd className="font-medium text-forest">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

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

export default function ProductSpecs({ productName, rows, boxContent = [] }) {
  const boxItems = getBoxItems(productName, boxContent);

  return (
    <section className="py-14 md:py-20">
      <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_470px] lg:gap-20">
        {rows.length > 0 && (
          <div>
            <SectionHeading title="Specifications" />
            <SpecTable rows={rows} />
          </div>
        )}
        <div className="lg:pt-0">
          <InTheBox items={boxItems} />
        </div>
      </Container>
    </section>
  );
}
