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
  Eye,
  Zap,
  Grid,
  RefreshCw,
  CheckSquare,
  DollarSign
} from "lucide-react";
import { api } from "@/lib/api";

interface VariantItem {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  imageFile?: File | null;
  imageFiles?: File[];
  existingImages?: string[];
  imagePreview?: string;
  sku: string;
  price: string;
  originalPrice: string;
  stock: string;
}

interface PresetColor {
  name: string;
  hex: string;
}

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

const PRESET_COLORS: PresetColor[] = [
  { name: "Ivory", hex: "#FDFBF7" },
  { name: "Crimson Maroon", hex: "#6B1929" },
  { name: "Royal Emerald", hex: "#046A38" },
  { name: "Rose Dust", hex: "#C88A8A" },
  { name: "Midnight Black", hex: "#1A1A1A" },
  { name: "Champagne Gold", hex: "#B8963E" },
  { name: "Sapphire Blue", hex: "#0F4C81" },
  { name: "Plum Purple", hex: "#4A154B" }
];

export default function AddProductPage() {
  const router = useRouter();

  // Basic Details State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("1");
  const [tag, setTag] = useState("suits");
  const [badge, setBadge] = useState("New");
  const [productType, setProductType] = useState<"readymade" | "unstitched">("readymade");
  const [price, setPrice] = useState("18500");
  const [originalPrice, setOriginalPrice] = useState("22000");

  // Descriptions State (3 Tabs)
  const [activeTab, setActiveTab] = useState<"details" | "materials" | "shipping">("details");
  const [description, setDescription] = useState("");
  const [materials, setMaterials] = useState("100% Pure Lawn Cotton & Silk Dupatta. Handcrafted threadwork & tilla embroidery. Dry clean only.");
  const [shipping, setShipping] = useState("Free delivery on orders over ₹5,000. 7-day hassle-free return window and quick exchanges.");

  // Images State
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Matrix Generator Selection State
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["S", "M", "L"]);
  const [availableColors, setAvailableColors] = useState<PresetColor[]>(PRESET_COLORS);
  const [selectedColors, setSelectedColors] = useState<PresetColor[]>([
    { name: "Ivory", hex: "#FDFBF7" },
    { name: "Crimson Maroon", hex: "#6B1929" }
  ]);
  const [customColorName, setCustomColorName] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#B8963E");

  // Bulk Apply Input State
  const [bulkPrice, setBulkPrice] = useState("18500");
  const [bulkOriginalPrice, setBulkOriginalPrice] = useState("22000");
  const [bulkStock, setBulkStock] = useState("10");

  // Generated Variants State
  const [variants, setVariants] = useState<VariantItem[]>([
    { id: "v_1", size: "S", color: "Ivory", colorHex: "#FDFBF7", imageFile: null, sku: "RWW-SU-S-IVR", price: "18500", originalPrice: "22000", stock: "10" },
    { id: "v_2", size: "M", color: "Ivory", colorHex: "#FDFBF7", imageFile: null, sku: "RWW-SU-M-IVR", price: "18500", originalPrice: "22000", stock: "10" },
    { id: "v_3", size: "L", color: "Ivory", colorHex: "#FDFBF7", imageFile: null, sku: "RWW-SU-L-IVR", price: "18500", originalPrice: "22000", stock: "10" },
    { id: "v_4", size: "S", color: "Crimson Maroon", colorHex: "#6B1929", imageFile: null, sku: "RWW-SU-S-MAR", price: "18500", originalPrice: "22000", stock: "10" },
    { id: "v_5", size: "M", color: "Crimson Maroon", colorHex: "#6B1929", imageFile: null, sku: "RWW-SU-M-MAR", price: "18500", originalPrice: "22000", stock: "10" },
    { id: "v_6", size: "L", color: "Crimson Maroon", colorHex: "#6B1929", imageFile: null, sku: "RWW-SU-L-MAR", price: "18500", originalPrice: "22000", stock: "10" }
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

  // Matrix Generator Logic (Sizes x Colors)
  const toggleSizeSelection = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(prev => prev.filter(s => s !== size));
    } else {
      setSelectedSizes(prev => [...prev, size]);
    }
  };

  const toggleColorSelection = (preset: PresetColor) => {
    if (selectedColors.some(c => c.name.toLowerCase() === preset.name.toLowerCase())) {
      setSelectedColors(prev => prev.filter(c => c.name.toLowerCase() !== preset.name.toLowerCase()));
    } else {
      setSelectedColors(prev => [...prev, preset]);
    }
  };

  const handleAddCustomColor = () => {
    const nameTrimmed = customColorName.trim();
    if (!nameTrimmed) return;
    const newColorObj = { name: nameTrimmed, hex: customColorHex };
    
    // Add to available color list if not already present
    if (!availableColors.some(c => c.name.toLowerCase() === nameTrimmed.toLowerCase())) {
      setAvailableColors(prev => [...prev, newColorObj]);
    }
    // Select the new custom color
    if (!selectedColors.some(c => c.name.toLowerCase() === nameTrimmed.toLowerCase())) {
      setSelectedColors(prev => [...prev, newColorObj]);
    }
    setCustomColorName("");
  };

  const generateVariantMatrix = () => {
    const targetSizes = productType === "unstitched" ? ["Unstitched"] : selectedSizes;
    if (targetSizes.length === 0 || selectedColors.length === 0) {
      setFormError("Please select at least one Size and one Color to generate matrix.");
      return;
    }
    setFormError("");

    const basePrice = price || "18500";
    const baseOrigPrice = originalPrice || "22000";

    setVariants((prevVariants) => {
      const merged: VariantItem[] = [];

      targetSizes.forEach((sz) => {
        selectedColors.forEach((col) => {
          const existing = prevVariants.find(
            (v) => (v.size || "").toUpperCase() === sz.toUpperCase() && (v.color || "").toLowerCase() === col.name.toLowerCase()
          );

          if (existing) {
            merged.push({
              ...existing,
              colorHex: col.hex || existing.colorHex || "#B8963E"
            });
          } else {
            const colorAbbr = col.name.slice(0, 3).toUpperCase();
            const skuCode = `RWW-${tag.toUpperCase().slice(0, 2)}-${sz}-${colorAbbr}-${Math.floor(10 + Math.random() * 89)}`;
            merged.push({
              id: `var_${Date.now()}_${sz}_${colorAbbr}_${Math.random().toString(36).substr(2, 4)}`,
              size: sz,
              color: col.name,
              colorHex: col.hex,
              imageFile: null,
              sku: skuCode,
              price: basePrice,
              originalPrice: baseOrigPrice,
              stock: bulkStock || "10"
            });
          }
        });
      });

      prevVariants.forEach((pv) => {
        const matchesSelection = selectedSizes.includes(pv.size) && selectedColors.some(c => c.name.toLowerCase() === (pv.color || "").toLowerCase());
        if (!matchesSelection && !merged.some(m => m.id === pv.id)) {
          merged.push(pv);
        }
      });

      return merged;
    });
  };

  // Bulk Apply Logic
  const handleApplyBulkToAll = () => {
    setVariants(prev => prev.map(v => ({
      ...v,
      price: bulkPrice || v.price,
      originalPrice: bulkOriginalPrice || v.originalPrice,
      stock: bulkStock || v.stock
    })));
  };

  const addSingleCustomVariant = () => {
    const nextSize = "M";
    const newV: VariantItem = {
      id: `v_${Date.now()}`,
      size: nextSize,
      color: "Ivory",
      colorHex: "#FDFBF7",
      imageFile: null,
      sku: `RWW-${nextSize}-${Math.floor(100 + Math.random() * 900)}`,
      price: price || "18500",
      originalPrice: originalPrice || "22000",
      stock: "10"
    };
    setVariants((prev) => [...prev, newV]);
  };

  const removeVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const updateVariant = (id: string, field: keyof VariantItem, value: any) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const updated = { ...v, [field]: value };
          if (field === "color") {
            const matchedColor = availableColors.find(c => c.name.toLowerCase() === String(value).toLowerCase());
            if (matchedColor) {
              updated.colorHex = matchedColor.hex;
            }
          }
          return updated;
        }
        return v;
      })
    );
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) {
      setFormError("Product title and narrative description are required.");
      return;
    }
    if (variants.length === 0) {
      setFormError("Product must have at least one variant. Use the Matrix Generator above to generate variants.");
      return;
    }

    setFormError("");
    setSubmitting(true);

    try {
      let uploadedUrls: string[] = ["/assets/1540aab590cd7d478ad01cdb1a615d469ef2a808.png"];
      let imageKeys: string[] = [];

      // 1. Upload main product gallery images
      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach((file) => formData.append("images", file));
        try {
          const uploadRes = await api.post<any>("/products/upload", formData);
          if (uploadRes) {
            if (Array.isArray(uploadRes.urls) && uploadRes.urls.length > 0) {
              uploadedUrls = uploadRes.urls;
            }
            if (Array.isArray(uploadRes.keys) && uploadRes.keys.length > 0) {
              imageKeys = uploadRes.keys;
            }
          }
        } catch (uploadErr) {
          console.error("Main images upload error:", uploadErr);
        }
      }

      // 2. Upload per-variant images if provided
      const rawProcessed = await Promise.all(variants.map(async (v) => {
        let vKeys: string[] = [];
        let vUrls: string[] = v.existingImages || [];

        const variantFiles = v.imageFiles && v.imageFiles.length > 0 
          ? v.imageFiles 
          : (v.imageFile ? [v.imageFile] : []);

        if (variantFiles.length > 0) {
          const imageData = new FormData();
          variantFiles.forEach((file) => imageData.append("images", file));
          try {
            const vUpload = await api.post<any>("/products/upload", imageData);
            if (vUpload) {
              if (Array.isArray(vUpload.keys)) vKeys = vUpload.keys;
              if (Array.isArray(vUpload.urls)) vUrls = [...vUrls, ...vUpload.urls];
            }
          } catch (e) {
            console.error("Variant image upload failed:", e);
          }
        }
        return {
          size: v.size,
          color: v.color,
          colorHex: v.colorHex || "#B8963E",
          sku: v.sku,
          price: parseFloat(v.price || price || "18500"),
          originalPrice: parseFloat(v.originalPrice || originalPrice || "22000"),
          stock: parseInt(v.stock || "10"),
          imageKeys: vKeys.length > 0 ? vKeys : undefined,
          images: vUrls.length > 0 ? vUrls : undefined
        };
      }));

      // Myntra-Style Color Image Sharing: Group images by color name
      const colorImagesMap: Record<string, string[]> = {};
      const colorKeysMap: Record<string, string[]> = {};

      rawProcessed.forEach(v => {
        const cName = (v.color || "").toLowerCase();
        if (cName) {
          if (v.images && v.images.length > 0) {
            colorImagesMap[cName] = Array.from(new Set([...(colorImagesMap[cName] || []), ...v.images]));
          }
          if (v.imageKeys && v.imageKeys.length > 0) {
            colorKeysMap[cName] = Array.from(new Set([...(colorKeysMap[cName] || []), ...v.imageKeys]));
          }
        }
      });

      const variantsProcessed = rawProcessed.map(v => {
        const cName = (v.color || "").toLowerCase();
        const sharedImages = (v.images && v.images.length > 0) ? v.images : (colorImagesMap[cName] || undefined);
        const sharedKeys = (v.imageKeys && v.imageKeys.length > 0) ? v.imageKeys : (colorKeysMap[cName] || undefined);
        return {
          ...v,
          images: sharedImages,
          imageKeys: sharedKeys
        };
      });

      // 3. Post payload to API
      await api.post("/products", {
        name,
        price: parseFloat(price || "18500"),
        originalPrice: parseFloat(originalPrice || price || "18500"),
        category,
        tag,
        badge,
        productType,
        product_type: productType,
        publishMode: "single_product",
        description,
        materials,
        shipping,
        images: uploadedUrls,
        imageKeys: imageKeys.length > 0 ? imageKeys : undefined,
        variants: variantsProcessed
      });

      router.push("/products");
    } catch (err: any) {
      console.error("Create product failed:", err);
      setFormError(err.message || "Failed to create product listing. Please check required fields.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalStockCount = variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);

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
              Configure luxury atelier details, rich media gallery, and batch variant inventory matrix
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
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Top 2-Column Section: Basic Details & Media (Left) + Sidebar (Right) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>
          
          {/* Left Column */}
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

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px" }}>
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
                  <label htmlFor="productType">Product Type / Stitching *</label>
                  <select
                    id="productType"
                    value={productType}
                    onChange={(e) => {
                      const val = e.target.value as "readymade" | "unstitched";
                      setProductType(val);
                      if (val === "unstitched") {
                        setSelectedSizes(["Unstitched"]);
                      } else {
                        setSelectedSizes(["S", "M", "L"]);
                      }
                    }}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "#ffffff", color: "var(--text-primary)", fontSize: "0.92rem", fontWeight: "600" }}
                  >
                    <option value="readymade">Readymade / Stitched (Has Sizes S, M, L...)</option>
                    <option value="unstitched">Unstitched / Fabric (No Sizes Needed)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="price">Base Selling Price (INR) *</label>
                  <input
                    id="price"
                    type="number"
                    required
                    placeholder="18500"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      setBulkPrice(e.target.value);
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="originalPrice">Original Price / MRP (INR)</label>
                  <input
                    id="originalPrice"
                    type="number"
                    min="0"
                    placeholder="22000"
                    value={originalPrice}
                    onChange={(e) => {
                      setOriginalPrice(e.target.value);
                      setBulkOriginalPrice(e.target.value);
                    }}
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
                  {imagePreviews.length} photos uploaded
                </span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
                Upload studio imagery (JPEG, PNG, WEBP). First image will serve as main storefront cover.
              </p>

              {/* Myntra & Flipkart Photography Guidelines */}
              <div style={{
                background: "rgba(99, 102, 241, 0.08)",
                border: "1px solid rgba(99, 102, 241, 0.25)",
                borderRadius: "10px",
                padding: "12px 16px",
                marginBottom: "16px",
                display: "flex",
                gap: "12px",
                alignItems: "flex-start"
              }}>
                <Sparkles size={20} color="#6366f1" style={{ flexShrink: 0, marginTop: "2px" }} />
                <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                  <strong style={{ color: "#ffffff", display: "block", marginBottom: "2px" }}>
                    ✦ Myntra & Flipkart Industry Photography Guidelines:
                  </strong>
                  • <strong>Portrait Ratio:</strong> Upload photos in 3:4 portrait format (e.g. 900 x 1200 px).<br />
                  • <strong>Smart Top Alignment:</strong> Product photos automatically render with top-center focal point on mobile & desktop so necklines and embroidery are never cropped.
                </div>
              </div>

              {/* Drag & Drop Zone */}
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
                          Cover Photo
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

          </div>

          {/* Right Sidebar Column (340px) */}
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
                Real-time preview of how customers view this item on mobile & desktop grids.
              </p>

              <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "12px", border: "1px solid var(--border-color)", overflow: "hidden" }}>
                <div style={{ position: "relative", width: "100%", height: "220px", background: "rgba(255,255,255,0.02)" }}>
                  {imagePreviews.length > 0 ? (
                    <img src={imagePreviews[0]} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} />
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
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                    <span style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--color-accent)" }}>
                      ₹{parseFloat(price || "18500").toLocaleString()}
                    </span>
                    {originalPrice && parseFloat(originalPrice) > parseFloat(price) && (
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textDecoration: "line-through" }}>
                        ₹{parseFloat(originalPrice).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div style={{ marginTop: "8px", fontSize: "0.75rem", color: "var(--color-primary)" }}>
                    ✓ {variants.length} Sizes/Colors Available
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* FULL WIDTH BOTTOM SECTION: Industry Variant Matrix Builder (100% Width) */}
        <div className="card" style={{ border: "1px solid var(--border-color)", background: "#ffffff", width: "100%", boxShadow: "var(--shadow-md)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "12px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
              <Grid size={22} color="var(--color-primary)" /> Industry Variant Matrix Builder (Approach B Color-Grouped)
            </h3>
            <span className="badge badge-success" style={{ fontSize: "0.82rem", padding: "6px 12px" }}>
              {variants.length} Variants Generated ({totalStockCount} Units Total Stock)
            </span>
          </div>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
            Batch generate all Size × Color SKU combinations. Published with Approach B linked color product cards on storefront!
          </p>

          {/* Step A: Select Sizes */}
          <div style={{ background: "rgba(184, 150, 62, 0.05)", padding: "18px", borderRadius: "12px", border: "1px solid rgba(184, 150, 62, 0.25)", marginBottom: "20px" }}>
            <label style={{ fontWeight: "700", color: "var(--color-primary)", fontSize: "0.92rem", display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <CheckSquare size={18} color="var(--color-primary)" /> 1. Select Sizes for Matrix:
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {PRESET_SIZES.map((sz) => {
                const active = selectedSizes.includes(sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => toggleSizeSelection(sz)}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "20px",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      border: active ? "1px solid var(--color-primary)" : "1px solid var(--border-color)",
                      background: active ? "var(--color-primary)" : "#ffffff",
                      color: active ? "#ffffff" : "var(--text-primary)",
                      boxShadow: active ? "0 2px 6px rgba(107, 25, 41, 0.2)" : "none",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {active ? `✓ ${sz}` : sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step B: Select Colors */}
          <div style={{ background: "rgba(184, 150, 62, 0.05)", padding: "18px", borderRadius: "12px", border: "1px solid rgba(184, 150, 62, 0.25)", marginBottom: "20px" }}>
            <label style={{ fontWeight: "700", color: "var(--color-primary)", fontSize: "0.92rem", display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <CheckSquare size={18} color="var(--color-primary)" /> 2. Select Colors for Matrix:
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
              {availableColors.map((preset) => {
                const active = selectedColors.some(c => c.name.toLowerCase() === preset.name.toLowerCase());
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => toggleColorSelection(preset)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "20px",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      border: active ? "1px solid var(--color-primary)" : "1px solid var(--border-color)",
                      background: active ? "var(--color-primary)" : "#ffffff",
                      color: active ? "#ffffff" : "var(--text-primary)",
                      boxShadow: active ? "0 2px 6px rgba(107, 25, 41, 0.2)" : "none",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <span style={{ width: "14px", height: "14px", borderRadius: "50%", background: preset.hex, border: active ? "1px solid #ffffff" : "1px solid rgba(0,0,0,0.3)" }} />
                    {active ? `✓ ${preset.name}` : preset.name}
                  </button>
                );
              })}
            </div>

            {/* Add Custom Color Section */}
            <div style={{ background: "#ffffff", border: "1px solid rgba(184, 150, 62, 0.35)", padding: "16px 18px", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <span style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--text-primary)", display: "block", marginBottom: "10px" }}>
                ➕ Add New Custom Color Swatch:
              </span>
              <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "600" }}>Color Name:</span>
                  <input
                    type="text"
                    placeholder="e.g. Dusty Rose, Sage Green, Rust Gold"
                    value={customColorName}
                    onChange={(e) => setCustomColorName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomColor();
                      }
                    }}
                    style={{ width: "260px", padding: "8px 12px", fontSize: "0.88rem", background: "#ffffff", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "600" }}>Color Hex:</span>
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "1px solid rgba(184, 150, 62, 0.5)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: customColorHex,
                    cursor: "pointer"
                  }}>
                    <input
                      type="color"
                      value={customColorHex}
                      onChange={(e) => setCustomColorHex(e.target.value)}
                      style={{ width: "160%", height: "160%", border: "none", padding: "0", cursor: "pointer", background: "none" }}
                    />
                  </div>
                  <span style={{ fontSize: "0.85rem", fontFamily: "monospace", color: "var(--color-primary)", fontWeight: "700" }}>
                    {customColorHex.toUpperCase()}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  style={{ fontSize: "0.85rem", padding: "8px 16px" }}
                  onClick={handleAddCustomColor}
                >
                  <Plus size={16} /> Add Color Swatch
                </button>
              </div>
            </div>
          </div>

          {/* Matrix Action Button */}
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center", marginBottom: "20px" }}>
            <button
              type="button"
              className="btn-primary"
              style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, #8b6b24 100%)", padding: "12px 22px", fontSize: "0.95rem", fontWeight: "700" }}
              onClick={generateVariantMatrix}
            >
              <Zap size={20} /> Generate Variant Matrix ({selectedSizes.length} Sizes × {selectedColors.length} Colors = {selectedSizes.length * selectedColors.length} SKUs)
            </button>
            
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: "0.85rem", padding: "12px 18px" }}
              onClick={addSingleCustomVariant}
            >
              <Plus size={16} /> Add Custom Variant Row
            </button>
          </div>

          {/* Step C: Bulk Apply Toolbar */}
          {variants.length > 0 && (
            <div style={{
              background: "rgba(107, 25, 41, 0.04)",
              border: "1px solid rgba(107, 25, 41, 0.2)",
              borderRadius: "10px",
              padding: "14px 18px",
              marginBottom: "20px",
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              alignItems: "center"
            }}>
              <span style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <DollarSign size={18} color="var(--color-primary)" /> Bulk Apply to All Variants:
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "600" }}>Price (INR):</span>
                <input
                  type="number"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  style={{ width: "120px", padding: "6px 10px", fontSize: "0.88rem", background: "#ffffff", color: "var(--text-primary)", border: "1px solid var(--border-color)", fontWeight: "600" }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "600" }}>MRP (INR):</span>
                <input
                  type="number"
                  value={bulkOriginalPrice}
                  onChange={(e) => setBulkOriginalPrice(e.target.value)}
                  style={{ width: "120px", padding: "6px 10px", fontSize: "0.88rem", background: "#ffffff", color: "var(--text-primary)", border: "1px solid var(--border-color)", fontWeight: "600" }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "600" }}>Stock:</span>
                <input
                  type="number"
                  value={bulkStock}
                  onChange={(e) => setBulkStock(e.target.value)}
                  style={{ width: "100px", padding: "6px 10px", fontSize: "0.88rem", background: "#ffffff", color: "var(--text-primary)", border: "1px solid var(--border-color)", fontWeight: "600" }}
                />
              </div>

              <button
                type="button"
                className="btn-primary"
                style={{ padding: "8px 18px", fontSize: "0.85rem" }}
                onClick={handleApplyBulkToAll}
              >
                <RefreshCw size={15} /> Apply to All {variants.length} Variants
              </button>
            </div>
          )}

          {/* High Density Full-Width Variants Data Grid Table */}
          <div style={{ overflowX: "auto", borderRadius: "10px", border: "1px solid var(--border-color)", background: "#ffffff", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <table style={{ width: "100%", minWidth: "1150px", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(107, 25, 41, 0.05)", borderBottom: "2px solid rgba(184, 150, 62, 0.3)", textAlign: "left", fontSize: "0.82rem", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "700" }}>
                  <th style={{ padding: "14px 16px", width: "100px" }}>Size</th>
                  <th style={{ padding: "14px 16px", width: "220px" }}>Color & Swatch</th>
                  <th style={{ padding: "14px 16px", width: "200px" }}>SKU Code</th>
                  <th style={{ padding: "14px 16px", width: "140px" }}>Price (INR)</th>
                  <th style={{ padding: "14px 16px", width: "140px" }}>MRP (INR)</th>
                  <th style={{ padding: "14px 16px", width: "110px" }}>Stock Qty</th>
                  <th style={{ padding: "14px 16px", width: "230px" }}>Variant Photo</th>
                  <th style={{ padding: "14px 16px", textAlign: "right", width: "80px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => (
                  <tr key={v.id} style={{ borderBottom: "1px solid rgba(184, 150, 62, 0.15)" }}>
                    <td style={{ padding: "10px 14px" }}>
                      <select 
                        style={{ padding: "8px 10px", fontSize: "0.88rem", fontWeight: "600", background: "#ffffff", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "8px", width: "100%" }}
                        value={v.size}
                        onChange={(e) => updateVariant(v.id, "size", e.target.value)}
                      >
                        {PRESET_SIZES.map(s => <option key={s} value={s} style={{ color: "#1c1917", background: "#ffffff" }}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <div style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          overflow: "hidden",
                          border: "1px solid rgba(184, 150, 62, 0.5)",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: v.colorHex || "#B8963E",
                          cursor: "pointer"
                        }}>
                          <input 
                            type="color"
                            value={v.colorHex || "#B8963E"}
                            onChange={(e) => updateVariant(v.id, "colorHex", e.target.value)}
                            title="Click to edit color hex"
                            style={{
                              width: "160%",
                              height: "160%",
                              border: "none",
                              padding: "0",
                              margin: "0",
                              cursor: "pointer",
                              background: "none"
                            }}
                          />
                        </div>
                        <input 
                          type="text" 
                          style={{ padding: "8px 10px", fontSize: "0.88rem", width: "100%", background: "#ffffff", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "8px", fontWeight: "500" }} 
                          placeholder="Color Name"
                          value={v.color} 
                          onChange={(e) => updateVariant(v.id, "color", e.target.value)} 
                        />
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <input 
                        type="text" 
                        style={{ padding: "8px 10px", fontSize: "0.88rem", fontFamily: "monospace", fontWeight: "600", width: "100%", background: "#ffffff", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "8px" }}
                        value={v.sku}
                        onChange={(e) => updateVariant(v.id, "sku", e.target.value)}
                      />
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <input 
                        type="number" 
                        style={{ padding: "8px 10px", fontSize: "0.88rem", fontWeight: "600", width: "100%", background: "#ffffff", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "8px" }}
                        value={v.price}
                        onChange={(e) => updateVariant(v.id, "price", e.target.value)}
                      />
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <input 
                        type="number" 
                        style={{ padding: "8px 10px", fontSize: "0.88rem", fontWeight: "600", width: "100%", background: "#ffffff", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "8px" }}
                        value={v.originalPrice}
                        onChange={(e) => updateVariant(v.id, "originalPrice", e.target.value)}
                      />
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <input 
                        type="number" 
                        style={{ padding: "8px 10px", fontSize: "0.88rem", fontWeight: "600", width: "100%", background: "#ffffff", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "8px" }}
                        value={v.stock}
                        onChange={(e) => updateVariant(v.id, "stock", e.target.value)}
                      />
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        {v.imageFiles && v.imageFiles.length > 0 ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                            {v.imageFiles.slice(0, 3).map((file, idx) => (
                              <img 
                                key={idx}
                                src={URL.createObjectURL(file)} 
                                alt="Variant thumbnail" 
                                style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "cover", border: "1px solid var(--color-primary)", flexShrink: 0 }} 
                              />
                            ))}
                            <span style={{ fontSize: "0.75rem", color: "var(--color-success)", fontWeight: "600" }}>✓ {v.imageFiles.length} photos</span>
                          </div>
                        ) : v.imageFile ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                            <img 
                              src={URL.createObjectURL(v.imageFile)} 
                              alt="Variant preview" 
                              style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "cover", border: "1px solid var(--color-primary)", flexShrink: 0 }} 
                            />
                            <span style={{ fontSize: "0.75rem", color: "var(--color-success)", fontWeight: "600" }}>✓ 1 photo</span>
                          </div>
                        ) : v.existingImages && v.existingImages.length > 0 ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                            {v.existingImages.slice(0, 3).map((url, idx) => (
                              <img 
                                key={idx}
                                src={url} 
                                alt="Existing variant preview" 
                                style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "cover", border: "1px solid var(--border-color)", flexShrink: 0 }} 
                              />
                            ))}
                            <span style={{ fontSize: "0.75rem", color: "var(--color-primary)", fontWeight: "600" }}>({v.existingImages.length} saved)</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontStyle: "italic" }}>No photos</span>
                        )}

                        <label 
                          className="btn-secondary" 
                          style={{ 
                            padding: "6px 12px", 
                            fontSize: "0.78rem", 
                            cursor: "pointer", 
                            borderRadius: "6px",
                            whiteSpace: "nowrap"
                          }}
                        >
                          <Upload size={13} /> {(v.imageFiles?.length || (v.imageFile ? 1 : 0) || (v.existingImages?.length || 0)) > 0 ? "+ Add Photos" : "Choose Photos"}
                          <input 
                            type="file" 
                            multiple
                            accept="image/*" 
                            onChange={(e) => {
                              const selectedFiles = Array.from(e.target.files || []);
                              if (selectedFiles.length > 0) {
                                const currentFiles = v.imageFiles || (v.imageFile ? [v.imageFile] : []);
                                updateVariant(v.id, "imageFiles", [...currentFiles, ...selectedFiles]);
                              }
                            }} 
                            style={{ display: "none" }} 
                          />
                        </label>
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right" }}>
                      <button 
                        type="button" 
                        className="btn-danger"
                        style={{ padding: "8px 12px", fontSize: "0.8rem", borderRadius: "8px" }}
                        onClick={() => removeVariant(v.id)}
                        title="Remove variant SKU row"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 4: Detailed Specifications (3 Tabs) */}
        <div className="card" style={{ width: "100%" }}>
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

      </form>
    </div>
  );
}
