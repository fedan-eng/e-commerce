// app/admin_console/products/[id]/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ExternalLink, Package } from "lucide-react";
import ProductForm from "../ProductForm";
import { PageHeader, Card, Button, EmptyState, Spinner } from "@/components/admin/ui";

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`, { cache: "no-store" })
      .then(r => r.json())
      .then(data => setProduct(data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!product || product.message) {
    return (
      <Card>
        <EmptyState
          icon={Package}
          title="Product not found"
          description="It may have been deleted, or the link is wrong."
          action={<Button href="/admin_console/products">Back to products</Button>}
        />
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title={product.name}
        description="Edit the details, then save your changes."
        actions={
          <Button onClick={() => window.open(`/products/${id}`, "_blank", "noopener")}>
            <ExternalLink size={16} aria-hidden /> View in store
          </Button>
        }
      />
      <ProductForm initial={product} isEdit />
    </div>
  );
}
