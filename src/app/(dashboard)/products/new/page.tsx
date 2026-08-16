"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle, 
  Loader2, 
  Image as ImageIcon,
  Sparkles,
  Layers,
  Truck,
  Tag,
  Package,
  Eye
} from "lucide-react";
import { api } from "@/lib/api";

interface VariantItem {
  id: string;
  size: string;
  sku: string;
  price: string;
  stock: string;
}

export default function AddProductPage() {
  const router = useRouter();

  // Basic Details State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("1");
  const [tag, setTag] = useState("suits");
  const [badge, setBadge] = useState("New");
  const [price, setPrice] = useState("18500");
  const [stock, setStock] = useState("10");

  // Descriptions State (3 Tabs)
  const [activeTab, setActiveTab] = useState<"details" | "materials" | "shipping">("details");
  const [description, setDescription] = useState("");
  const [materials, setMaterials] = useState("100% Pure Lawn Cotton & Silk Dupatta. Handcrafted threadwork & tilla embroidery. Dry clean only.");
  const [shipping, setShipping] = useState("Free delivery on orders over PKR 5,000. 7-day hassle-free return window and quick exchanges.");

  // Images State
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Variants State
  const [variants, setVariants] = useState<VariantItem[]>([
    { id: "v_1", size: "S", sku: "SKU-S-01", price: "18500", stock: "4" },
    { id: "v_2", size: "M", sku: "SKU-M-01", price: "18500", stock: "5" },
    { id: "v_3", size: "L", sku: "SKU-L-01", price: "18500", stock: "3" }
  ]);

  // Form submitting / Feedback state
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Handle Drag & Drop Image Upload
  const handleFilesAdded = (files: FileList | File[]) => {
    const selectedFiles = Array.from(files).filter(file => file.type.startsWith("image/"));
    if (selectedFiles.length === 0) return;

    setImageFiles((prev) => [...prev, ...selectedFiles]);
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Add / Remove Variant
  const addVariant = () => {
    const nextSize = variants.length === 0 ? "S" : variants.length === 1 ? "M" : variants.length === 2 ? "L" : "XL";
    const newV: VariantItem = {
      id: `v_${Date.now()}`,
      size: nextSize,
      sku: `SKU-${nextSize}-${Math.floor(100 + Math.random() * 900)}`,
      price: price || "18500",
      stock: "5"
    };
    setVariants((prev) => [...prev, newV]);
  };

  const removeVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const updateVariant = (id: string, field: keyof VariantItem, value: string) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) {
      setFormError("Product title and description are required.");
      return;
    }

    setFormError("");
    setSubmitting(true);

    try {
      let uploadedUrls: string[] = ["/assets/1540aab590cd7d478ad01cdb1a615d469ef2a808.png"];

      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach((file) => formData.append("images", file));
        try {
          const uploadRes = await api.post("/products/upload", formData);
          if (uploadRes && Array.isArray(uploadRes.urls)) {
            uploadedUrls = uploadRes.urls;
          }
        } catch (uploadErr) {
          console.error("Image upload failed, fallback to defaults:", uploadErr);
        }
      }

      await api.post("/products", {
        name,
        price: parseFloat(price || "18500"),
        stock: parseInt(stock || "10"),
        category,
        tag,
        description,
        materials,
        shipping,
        images: uploadedUrls,
        variants: variants.map(v => ({
          size: v.size,
          sku: v.sku,
          price: parseFloat(v.price || price || "18500"),
          stock: parseInt(v.stock || "5")
        }))
      });

      router.push("/products");
    } catch (err: any) {
      console.error("Create product failed:", err);
      setFormError(err.message || "Failed to create product listing.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ paddingBottom: "64px" }}>
      
      {/* Top Header Action Bar */}
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button 
            type="button"
            className="btn-secondary"
            style={{ padding: "8px 12px" }}
            onClick={() => router.push("/products")}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-title">Create New Product Listing</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "2px" }}>
              Configure luxury details, rich media gallery, and variant inventory
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => router.push("/products")}
            disabled={submitting}
          >
            Discard
          </button>
          <button 
            type="button" 
            className="btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Publishing...
              </>
            ) : (
              <>
                <Check size={16} /> Publish Product
              </>
            )}
          </button>
        </div>
      </div>

      {formError && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#ef4444", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", fontSize: "0.9rem" }}>
          <AlertCircle size={18} />
          <span>{formError}</span>
        </div>
      )}

      {/* Main Workspace Layout */}
      <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", alignItems: "start" }}>
        
        {/* Left Column (2/3 width) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Card 1: Basic Product Details */}
          <div className="card">
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <Package size={20} color="var(--color-primary)" /> Basic Product Details
            </h3>
            
            <div style={{ marginBottom: "16px" }}>
              <label htmlFor="name">Product Title *</label>
              <input
                id="name"
                type="text"
                required
                placeholder="e.g. Gulzar Hand-Embroidered Velvet Suit"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div>
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    const tagVal = e.target.value === "1" ? "suits" : e.target.value === "2" ? "coords" : e.target.value === "3" ? "party" : "hampers";
                    setTag(tagVal);
                  }}
                >
                  <option value="1">Pakistani Suits</option>
                  <option value="2">Co-Ord Sets</option>
                  <option value="3">Party & Formal Wear</option>
                  <option value="4">Gift Hampers</option>
                </select>
              </div>

              <div>
                <label htmlFor="price">Base Retail Price (PKR) *</label>
                <input
                  id="price"
                  type="number"
                  required
                  placeholder="18500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="stock">Total Stock Level *</label>
                <input
                  id="stock"
                  type="number"
                  required
                  placeholder="10"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Card 2: High-Res Media Gallery */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
                <ImageIcon size={20} color="var(--color-primary)" /> High-Res Media Gallery
              </h3>
              <span className="badge badge-info">
                {imagePreviews.length} photos added
              </span>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Upload studio imagery (JPEG, PNG, WEBP). First image will serve as primary storefront cover.
            </p>

            {/* Drag and Drop Zone */}
            <div 
              style={{
                border: "2px dashed var(--border-color)",
                borderRadius: "12px",
                padding: "32px 16px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: isDragging ? "rgba(20, 184, 166, 0.1)" : "rgba(255, 255, 255, 0.02)"
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
                style={{ display: "none" }}
              />
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(20, 184, 166, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <Upload size={22} color="var(--color-primary)" />
              </div>
              <p style={{ fontSize: "0.95rem", color: "var(--text-primary)", fontWeight: "500", marginBottom: "4px" }}>
                Drag & drop product photos here, or <span style={{ color: "var(--color-primary)", textDecoration: "underline", fontWeight: "600" }}>browse files</span>
              </p>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Supports high-res PNG, JPG, WEBP up to 10MB per file</p>
            </div>

            {/* Previews */}
            {imagePreviews.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "12px", marginTop: "16px" }}>
                {imagePreviews.map((previewUrl, index) => (
                  <div key={index} style={{ position: "relative", width: "100%", height: "110px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                    <img src={previewUrl} alt={`Uploaded ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    {index === 0 && (
                      <span className="badge badge-success" style={{ position: "absolute", bottom: "6px", left: "6px", fontSize: "0.65rem" }}>
                        Cover
                      </span>
                    )}
                    <button 
                      type="button"
                      style={{ position: "absolute", top: "6px", right: "6px", width: "22px", height: "22px", borderRadius: "50%", background: "rgba(0,0,0,0.7)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", padding: "0" }}
                      onClick={() => removeImage(index)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 3: Detailed Specifications (3 Tabs) */}
          <div className="card">
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <Layers size={20} color="var(--color-primary)" /> Detailed Specifications (3 Tabs)
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Configure narrative details, fabric composition, and shipping window shown on Storefront tabs.
            </p>

            {/* Tabs Bar */}
            <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-color)", marginBottom: "16px" }}>
              <button 
                type="button"
                className="btn-secondary"
                style={{ 
                  borderRadius: "6px 6px 0 0", 
                  borderBottom: activeTab === "details" ? "2px solid var(--color-primary)" : "none",
                  color: activeTab === "details" ? "var(--color-primary)" : "var(--text-secondary)"
                }}
                onClick={() => setActiveTab("details")}
              >
                <Sparkles size={14} /> 1. DETAILS
              </button>
              <button 
                type="button"
                className="btn-secondary"
                style={{ 
                  borderRadius: "6px 6px 0 0", 
                  borderBottom: activeTab === "materials" ? "2px solid var(--color-primary)" : "none",
                  color: activeTab === "materials" ? "var(--color-primary)" : "var(--text-secondary)"
                }}
                onClick={() => setActiveTab("materials")}
              >
                <Layers size={14} /> 2. MATERIALS & CARE
              </button>
              <button 
                type="button"
                className="btn-secondary"
                style={{ 
                  borderRadius: "6px 6px 0 0", 
                  borderBottom: activeTab === "shipping" ? "2px solid var(--color-primary)" : "none",
                  color: activeTab === "shipping" ? "var(--color-primary)" : "var(--text-secondary)"
                }}
                onClick={() => setActiveTab("shipping")}
              >
                <Truck size={14} /> 3. SHIPPING & RETURNS
              </button>
            </div>

            {/* Active Tab Content */}
            {activeTab === "details" && (
              <div>
                <label htmlFor="description">1. Product Narrative & Design Details *</label>
                <textarea
                  id="description"
                  required
                  rows={5}
                  placeholder="Describe the silhouette, embroidery style, occasion, artisan handwork, and inspiration behind the piece..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            )}

            {activeTab === "materials" && (
              <div>
                <label htmlFor="materials">2. Fabric Composition & Care Instructions</label>
                <textarea
                  id="materials"
                  rows={5}
                  placeholder="Specify fabric materials (e.g. 100% Pure Lawn Cotton, Raw Silk Dupatta), embellishment details, and dry clean instructions..."
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                />
              </div>
            )}

            {activeTab === "shipping" && (
              <div>
                <label htmlFor="shipping">3. Shipping Timelines & Exchange Policy</label>
                <textarea
                  id="shipping"
                  rows={5}
                  placeholder="Detail dispatch timeframe, free shipping threshold, and return/exchange policy window..."
                  value={shipping}
                  onChange={(e) => setShipping(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Card 4: Variant Matrix */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
                <Layers size={20} color="var(--color-primary)" /> Size Variant Matrix
              </h3>
              <button 
                type="button" 
                className="btn-secondary"
                style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                onClick={addVariant}
              >
                <Plus size={14} /> Add Size Variant
              </button>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Configure size options, custom SKUs, specific pricing, and available stock per size.
            </p>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-color)", textAlign: "left", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <th style={{ padding: "8px" }}>Size Option</th>
                    <th style={{ padding: "8px" }}>SKU Code</th>
                    <th style={{ padding: "8px" }}>Price (PKR)</th>
                    <th style={{ padding: "8px" }}>Stock Qty</th>
                    <th style={{ padding: "8px", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => (
                    <tr key={v.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "8px" }}>
                        <select 
                          style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                          value={v.size}
                          onChange={(e) => updateVariant(v.id, "size", e.target.value)}
                        >
                          <option value="XS">XS</option>
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                          <option value="XXL">XXL</option>
                        </select>
                      </td>
                      <td style={{ padding: "8px" }}>
                        <input 
                          type="text" 
                          style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                          value={v.sku}
                          onChange={(e) => updateVariant(v.id, "sku", e.target.value)}
                        />
                      </td>
                      <td style={{ padding: "8px" }}>
                        <input 
                          type="number" 
                          style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                          value={v.price}
                          onChange={(e) => updateVariant(v.id, "price", e.target.value)}
                        />
                      </td>
                      <td style={{ padding: "8px" }}>
                        <input 
                          type="number" 
                          style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                          value={v.stock}
                          onChange={(e) => updateVariant(v.id, "stock", e.target.value)}
                        />
                      </td>
                      <td style={{ padding: "8px", textAlign: "right" }}>
                        <button 
                          type="button" 
                          className="btn-danger"
                          style={{ padding: "6px 10px", fontSize: "0.78rem" }}
                          onClick={() => removeVariant(v.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Organization & Storefront Preview (1/3 width) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Card 5: Organization */}
          <div className="card">
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <Tag size={20} color="var(--color-primary)" /> Organization & Tags
            </h3>

            <div style={{ marginBottom: "16px" }}>
              <label htmlFor="tag">Filter Tag *</label>
              <select 
                id="tag" 
                value={tag} 
                onChange={(e) => setTag(e.target.value)}
              >
                <option value="suits">suits (Pakistani Suits)</option>
                <option value="coords">coords (Co-Ord Sets)</option>
                <option value="party">party (Party & Formal)</option>
                <option value="hampers">hampers (Gift Hampers)</option>
              </select>
            </div>

            <div>
              <label htmlFor="badge">Display Badge</label>
              <select 
                id="badge" 
                value={badge} 
                onChange={(e) => setBadge(e.target.value)}
              >
                <option value="New">New Arrival</option>
                <option value="Bestseller">Bestseller</option>
                <option value="Trending">Trending</option>
                <option value="Limited Edit">Limited Edit</option>
              </select>
            </div>
          </div>

          {/* Card 6: Live Preview */}
          <div className="card">
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <Eye size={20} color="var(--color-primary)" /> Storefront Card Preview
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Real-time preview of how customers view this item in the collection grid.
            </p>

            <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "12px", border: "1px solid var(--border-color)", overflow: "hidden" }}>
              <div style={{ position: "relative", width: "100%", height: "220px", background: "rgba(255,255,255,0.02)" }}>
                {imagePreviews.length > 0 ? (
                  <img src={imagePreviews[0]} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", gap: "8px" }}>
                    <ImageIcon size={36} />
                    <span style={{ fontSize: "0.8rem" }}>No Image Uploaded</span>
                  </div>
                )}
                <span className="badge badge-approved" style={{ position: "absolute", top: "10px", left: "10px", fontSize: "0.68rem" }}>
                  {badge}
                </span>
              </div>
              <div style={{ padding: "16px" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--color-primary)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  RIWAAYA THREADS • {tag.toUpperCase()}
                </span>
                <h4 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-primary)", margin: "4px 0 6px" }}>
                  {name || "Product Title Placeholder"}
                </h4>
                <span style={{ fontSize: "1rem", fontWeight: "700", color: "var(--color-accent)" }}>
                  PKR {parseFloat(price || "18500").toLocaleString()}
                </span>
              </div>
            </div>
          </div>

        </div>

      </form>
    </div>
  );
}
