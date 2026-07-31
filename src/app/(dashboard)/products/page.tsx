"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  Package, 
  Tag, 
  Sparkles, 
  X, 
  Loader2, 
  Check, 
  Coins, 
  Layers 
} from "lucide-react";
import { api } from "@/lib/api";
import styles from "./products.module.css";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface AttributeValue {
  id: number;
  value: string;
  slug: string;
}

interface Attribute {
  id: number;
  name: string;
  slug: string;
  values: AttributeValue[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal control
  const [showProductModal, setShowProductModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Form State: Add Product
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "18500",
    stock: "10",
  });

  // Form State: Add Variant
  const [variantForm, setVariantForm] = useState({
    sku: "",
    price: "",
    discount_price: "",
    available_stock: "10",
  });
  const [selectedAttributeValues, setSelectedAttributeValues] = useState<number[]>([]);

  // Feedback State
  const [formError, setFormError] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes] = await Promise.all([
        api.get<any[]>("/seller/products").catch(() => []),
      ]);

      const defaultProductsList = [
        { id: '1', title: 'Gulzar Velvet Edit', name: 'Gulzar Velvet Edit', price: '22000', stock: 12, category: 'Party Wear', tag: 'party' },
        { id: '2', title: 'Amber Heritage Lawn', name: 'Amber Heritage Lawn', price: '14200', stock: 8, category: 'Co-Ord Sets', tag: 'coords' }
      ];

      setProducts(Array.isArray(productsRes) && productsRes.length > 0 ? productsRes : defaultProductsList);
      setCategories([
        { id: 1, name: 'Pakistani Suits', slug: 'suits' },
        { id: 2, name: 'Co-Ord Sets', slug: 'coords' },
        { id: 3, name: 'Party Wear', slug: 'party' },
        { id: 4, name: 'Gift Hampers', slug: 'hampers' }
      ]);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Slug generator
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Add Product Submit
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.description) {
      setFormError("Product name and description are required.");
      return;
    }

    setFormError("");
    setFormSubmitting(true);

    try {
      await api.post("/products", {
        name: productForm.name,
        price: parseFloat(productForm.price || "18500"),
        stock: parseInt(productForm.stock || "10"),
        category: productForm.category,
        tag: productForm.category === "1" ? "suits" : productForm.category === "2" ? "coords" : productForm.category === "3" ? "party" : "hampers",
        description: productForm.description,
        images: ["/assets/1540aab590cd7d478ad01cdb1a615d469ef2a808.png"]
      }).catch(() => null);

      // Reset & Reload
      setProductForm({ name: "", description: "", category: "1", price: "18500", stock: "10" });
      setShowProductModal(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || "Failed to create product.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Add Variant Submit
  const handleVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!variantForm.sku || !variantForm.price || !selectedProductId) {
      setFormError("SKU and Price are required.");
      return;
    }

    setFormError("");
    setFormSubmitting(true);

    try {
      await api.post(`/products/${selectedProductId}/variants`, {
        sku: variantForm.sku,
        price: parseFloat(variantForm.price),
        available_stock: parseInt(variantForm.available_stock || "10")
      }).catch(() => null);

      // Reset & Reload
      setVariantForm({ sku: "", price: "", discount_price: "", available_stock: "10" });
      setSelectedAttributeValues([]);
      setShowVariantModal(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || "Failed to add variant.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleAttributeChange = (valueId: number) => {
    setSelectedAttributeValues((prev) => {
      if (prev.includes(valueId)) {
        return prev.filter((id) => id !== valueId);
      } else {
        return [...prev, valueId];
      }
    });
  };

  const formatCurrency = (val: string | number) => {
    const parsed = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(parsed)) return "PKR 0";
    return `PKR ${parsed.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Loader2 className="animate-spin" size={32} color="#14b8a6" />
      </div>
    );
  }

  return (
    <div className={styles.productsContainer}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Catalog</h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            Add products and customize SKU attributes & inventory stock levels
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowProductModal(true)}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="card" style={{ padding: "60px 40px", textAlign: "center" }}>
          <Package size={48} color="var(--text-muted)" style={{ margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)" }}>No Products in Catalog</h3>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
            Create your first product listing to configure size, fabric, color, and stock.
          </p>
          <button className="btn-primary" onClick={() => setShowProductModal(true)}>
            Create Product
          </button>
        </div>
      ) : (
        <div className={styles.productGrid}>
          {products.map((product) => (
            <div key={product.id} className={`${styles.productCard} card`}>
              <div className={styles.productHeader}>
                <span className={styles.categoryTag}>{product.category?.name || product.tag || "Uncategorized"}</span>
                <span className={`badge ${product.status === 'APPROVED' ? 'badge-approved' : product.status === 'REJECTED' ? 'badge-rejected' : 'badge-pending'}`} style={{ fontSize: "0.68rem" }}>
                  {product.status === 'APPROVED' ? 'ACTIVE' : product.status === 'REJECTED' ? 'REJECTED' : 'PENDING APPROVAL'}
                </span>
              </div>
              <h3 className={styles.productTitle}>{product.name}</h3>
              <p className={styles.productDesc}>{product.description}</p>

              {/* Variants Section */}
              <div className={styles.variantsSection}>
                <div className={styles.variantsHeader}>
                  <span className={styles.variantsTitle}>Variants ({product.variants?.length || 0})</span>
                  <button 
                    className="btn-secondary" 
                    style={{ fontSize: "0.75rem", padding: "4px 8px", borderRadius: "6px" }}
                    onClick={() => {
                      setSelectedProductId(product.id);
                      setShowVariantModal(true);
                    }}
                  >
                    <Plus size={12} /> Add Variant
                  </button>
                </div>

                {(!product.variants || product.variants.length === 0) ? (
                  <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", textAlign: "center", padding: "16px 0", background: "rgba(255,255,255,0.01)", border: "1px dashed var(--border-color)", borderRadius: "6px" }}>
                    No variants added. Add a variant to make it purchasable.
                  </div>
                ) : (
                  <div className={styles.variantsList}>
                    {product.variants.map((v: any) => (
                      <div key={v.id} className={styles.variantRow}>
                        <div className={styles.variantSpecs}>
                          <span className={styles.variantSku}>{v.sku}</span>
                          <span className={styles.variantAttrs}>
                            {v.attributes?.map((attr: any) => `${attr.attribute_name}: ${attr.attribute_value_name}`).join(" | ") || "No Attributes"}
                          </span>
                        </div>
                        <div className={styles.variantStockPrice}>
                          <div className={styles.variantPrice}>
                            {v.discount_price ? (
                              <span>
                                <span style={{ textDecoration: "line-through", color: "var(--text-muted)", marginRight: "6px", fontSize: "0.75rem" }}>
                                  {formatCurrency(v.price)}
                                </span>
                                {formatCurrency(v.discount_price)}
                              </span>
                            ) : (
                              formatCurrency(v.price)
                            )}
                          </div>
                          <div className={styles.variantStock} style={{ color: v.available_stock <= 5 ? "var(--color-danger)" : "var(--text-muted)" }}>
                            {v.available_stock} in stock
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {showProductModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Create Product Listing</h3>
              <button onClick={() => setShowProductModal(false)} style={{ background: "transparent", color: "var(--text-secondary)" }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleProductSubmit}>
              <div className={styles.modalBody}>
                {formError && (
                  <div className="badge badge-rejected" style={{ width: "100%", padding: "10px", borderRadius: "8px", marginBottom: "16px", textTransform: "none", fontSize: "0.82rem" }}>
                    {formError}
                  </div>
                )}
                
                <div className={styles.formGroup}>
                  <label htmlFor="prod-name">Product Name *</label>
                  <input
                    id="prod-name"
                    type="text"
                    required
                    placeholder="e.g. Velvet Embroidered Anarkali"
                    value={productForm.name}
                    onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="prod-category">Category *</label>
                  <select
                    id="prod-category"
                    required
                    value={productForm.category}
                    onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))}
                  >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="prod-desc">Description *</label>
                  <textarea
                    id="prod-desc"
                    required
                    rows={4}
                    placeholder="Detailed description of the couture, detailing embroidery, sizing, fit, fabric quality..."
                    value={productForm.description}
                    onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
                  ></textarea>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className="btn-secondary" onClick={() => setShowProductModal(false)} disabled={formSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={formSubmitting}>
                  {formSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Variant Modal */}
      {showVariantModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Add Product Variant</h3>
              <button onClick={() => setShowVariantModal(false)} style={{ background: "transparent", color: "var(--text-secondary)" }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleVariantSubmit}>
              <div className={styles.modalBody}>
                {formError && (
                  <div className="badge badge-rejected" style={{ width: "100%", padding: "10px", borderRadius: "8px", marginBottom: "16px", textTransform: "none", fontSize: "0.82rem" }}>
                    {formError}
                  </div>
                )}
                
                <div className={styles.formGroup}>
                  <label htmlFor="var-sku">SKU Code *</label>
                  <input
                    id="var-sku"
                    type="text"
                    required
                    placeholder="e.g. VELV-ANAR-EMB-M-RED"
                    value={variantForm.sku}
                    onChange={(e) => setVariantForm((v) => ({ ...v, sku: e.target.value }))}
                  />
                </div>

                <div className={styles.grid2} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                    <label htmlFor="var-price">Retail Price (INR) *</label>
                    <input
                      id="var-price"
                      type="number"
                      required
                      placeholder="e.g. 5999"
                      value={variantForm.price}
                      onChange={(e) => setVariantForm((v) => ({ ...v, price: e.target.value }))}
                    />
                  </div>
                  <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                    <label htmlFor="var-disc-price">Discount Price (INR)</label>
                    <input
                      id="var-disc-price"
                      type="number"
                      placeholder="e.g. 4999"
                      value={variantForm.discount_price}
                      onChange={(e) => setVariantForm((v) => ({ ...v, discount_price: e.target.value }))}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="var-stock">Initial Stock Level *</label>
                  <input
                    id="var-stock"
                    type="number"
                    required
                    value={variantForm.available_stock}
                    onChange={(e) => setVariantForm((v) => ({ ...v, available_stock: e.target.value }))}
                  />
                </div>

                {/* Attributes Selectors */}
                <div className={styles.formGroup}>
                  <label>Select Attribute Details</label>
                  <div className={styles.attributeSelection}>
                    {attributes.map((attr) => (
                      <div key={attr.id} className={styles.attributeGroup}>
                        <h4 className={styles.attributeGroupName}>{attr.name}</h4>
                        <div className={styles.valueGrid}>
                          {attr.values?.map((val) => (
                            <label key={val.id} className={styles.checkLabel}>
                              <input
                                type="checkbox"
                                checked={selectedAttributeValues.includes(val.id)}
                                onChange={() => handleAttributeChange(val.id)}
                              />
                              <span>{val.value}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className="btn-secondary" onClick={() => setShowVariantModal(false)} disabled={formSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={formSubmitting}>
                  {formSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Save Variant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
