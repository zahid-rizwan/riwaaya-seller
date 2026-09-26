"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Package, 
  X, 
  Loader2, 
  Pencil, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search, 
  Filter, 
  ArrowUpDown, 
  RefreshCw, 
  AlertTriangle, 
  Grid, 
  Zap, 
  LayoutGrid, 
  List,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { api, getValidImageUrl } from "@/lib/api";
import styles from "./products.module.css";

interface VariantItem {
  id: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  originalPrice: number;
  stock: number;
  images?: string[];
}

interface ProductItem {
  _id?: string;
  id: string;
  name: string;
  slug?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  tag: string;
  status: string;
  is_active?: boolean;
  image?: string;
  images?: string[];
  description?: string;
  materials?: string;
  shipping?: string;
  badge?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  variants?: VariantItem[];
  colors?: { name: string; hex: string; inStock?: boolean }[];
}

interface PaginationData {
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const PRESET_COLORS = [
  { name: "Ivory", hex: "#FDFBF7" },
  { name: "Crimson Maroon", hex: "#6B1929" },
  { name: "Royal Emerald", hex: "#046A38" },
  { name: "Rose Dust", hex: "#C88A8A" },
  { name: "Midnight Black", hex: "#1A1A1A" },
  { name: "Champagne Gold", hex: "#B8963E" },
  { name: "Sapphire Blue", hex: "#0F4C81" },
  { name: "Plum Purple", hex: "#4A154B" }
];

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: Table vs Mobile Cards
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  // Backend Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Backend Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    totalPages: 1,
    pageSize: 10,
    hasNext: false,
    hasPrev: false
  });

  // Matrix Generator Modal State
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [matrixProduct, setMatrixProduct] = useState<ProductItem | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["S", "M", "L"]);
  const [availableColors, setAvailableColors] = useState<{ name: string; hex: string }[]>(PRESET_COLORS);
  const [selectedColors, setSelectedColors] = useState<{ name: string; hex: string }[]>([
    { name: "Ivory", hex: "#FDFBF7" },
    { name: "Crimson Maroon", hex: "#6B1929" }
  ]);
  const [customColorName, setCustomColorName] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#B8963E");
  const [bulkPrice, setBulkPrice] = useState("18500");
  const [bulkOriginalPrice, setBulkOriginalPrice] = useState("22000");
  const [bulkStock, setBulkStock] = useState("10");
  const [submitting, setSubmitting] = useState(false);

  const handleAddCustomColor = () => {
    const nameTrimmed = customColorName.trim();
    if (!nameTrimmed) return;
    const newColorObj = { name: nameTrimmed, hex: customColorHex };
    
    // Add to available colors list if not already present
    if (!availableColors.some(c => c.name.toLowerCase() === nameTrimmed.toLowerCase())) {
      setAvailableColors(prev => [...prev, newColorObj]);
    }
    // Select the new custom color
    if (!selectedColors.some(c => c.name.toLowerCase() === nameTrimmed.toLowerCase())) {
      setSelectedColors(prev => [...prev, newColorObj]);
    }
    setCustomColorName("");
  };

  // Fetch backend filtered & paginated data
  const loadData = useCallback(async (targetPage = page) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.set('page', String(targetPage));
      queryParams.set('limit', String(pageSize));
      queryParams.set('pageSize', String(pageSize));

      if (searchQuery.trim()) queryParams.set('search', searchQuery.trim());
      if (categoryFilter !== 'all') queryParams.set('tag', categoryFilter);
      if (stockFilter !== 'all') queryParams.set('stock', stockFilter);
      if (statusFilter !== 'all') queryParams.set('status', statusFilter);
      if (sortBy) queryParams.set('sort', sortBy);

      const endpoint = `/seller/products?${queryParams.toString()}`;
      const res = await api.get<any>(endpoint).catch(async () => {
        return await api.get<any>(`/products?${queryParams.toString()}`);
      });

      if (res) {
        const list = Array.isArray(res) 
          ? res 
          : (res.data && Array.isArray(res.data)) 
          ? res.data 
          : [];
        setProducts(list);

        if (res.pagination) {
          setPagination(res.pagination);
        } else {
          setPagination({
            total: res.count !== undefined ? res.count : list.length,
            page: targetPage,
            totalPages: Math.max(1, Math.ceil((res.count || list.length) / pageSize)),
            pageSize,
            hasNext: (targetPage * pageSize) < (res.count || list.length),
            hasPrev: targetPage > 1
          });
        }
      }
    } catch (err) {
      console.error("Failed to load seller products from backend:", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery, categoryFilter, stockFilter, statusFilter, sortBy]);

  useEffect(() => {
    loadData(1);
    setPage(1);
  }, [searchQuery, categoryFilter, stockFilter, statusFilter, sortBy, pageSize]);

  useEffect(() => {
    loadData(page);
  }, [page]);

  // Inventory Metrics Calculation
  const activeCount = useMemo(() => products.filter(p => p.is_active !== false && p.status !== 'HIDDEN').length, [products]);
  const lowStockCount = useMemo(() => products.filter(p => p.stock <= 5).length, [products]);
  const totalStockUnits = useMemo(() => products.reduce((acc, p) => acc + (p.stock || 0), 0), [products]);

  // Handlers
  const handleToggleSelectAll = () => {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map(p => p.id || p._id || ''));
    }
  };

  const handleToggleSelectProduct = (id: string) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedProductIds(prev => [...prev, id]);
    }
  };

  const handleToggleActive = async (product: ProductItem) => {
    const pId = product.id || product._id;
    if (!pId) return;

    const currentActive = product.is_active !== undefined ? product.is_active : (product.status === 'APPROVED' || product.status === 'ACTIVE');
    const newActive = !currentActive;

    try {
      await api.put(`/seller/products/${pId}`, {
        is_active: newActive,
        status: newActive ? 'APPROVED' : 'HIDDEN'
      }).catch(async () => {
        await api.put(`/products/${pId}`, {
          is_active: newActive,
          status: newActive ? 'APPROVED' : 'HIDDEN'
        });
      });
      await loadData(page);
    } catch (err) {
      console.error("Failed to toggle active status:", err);
    }
  };

  const handleDeleteProduct = async (pId: string) => {
    if (!confirm("Are you sure you want to delete this product listing from your catalog?")) return;
    try {
      await api.delete(`/seller/products/${pId}`).catch(async () => {
        await api.delete(`/products/${pId}`);
      });
      await loadData(page);
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Failed to delete product.");
    }
  };

  // Open Full Edit Page (Matching Create Product Page)
  const handleOpenEditPage = (product: ProductItem) => {
    const pId = product.id || product._id;
    if (pId) {
      router.push(`/products/edit/${pId}`);
    }
  };

  // Open Full Read-Only View Page (Matching Create/Edit Screen in Read-Only Mode)
  const handleOpenViewPage = (product: ProductItem) => {
    const pId = product.id || product._id;
    if (pId) {
      router.push(`/products/edit/${pId}?mode=view`);
    }
  };

  // Open Matrix Generator Modal
  const handleOpenMatrixModal = (product: ProductItem) => {
    setMatrixProduct(product);
    setBulkPrice(String(product.price || "18500"));
    setBulkOriginalPrice(String(product.originalPrice || Math.round((product.price || 18500) * 1.25)));
    setBulkStock("10");
    setShowMatrixModal(true);
  };

  const handleApplyMatrixToProduct = async () => {
    if (!matrixProduct) return;
    const pId = matrixProduct.id || matrixProduct._id;
    if (!pId) return;

    if (selectedSizes.length === 0 || selectedColors.length === 0) {
      alert("Please select at least one Size and one Color to generate matrix.");
      return;
    }

    setSubmitting(true);
    try {
      const newVariantsList: any[] = [];
      const basePrice = parseFloat(bulkPrice || "18500");
      const baseOrigPrice = parseFloat(bulkOriginalPrice || "22000");
      const baseStock = parseInt(bulkStock || "10");

      selectedSizes.forEach((sz) => {
        selectedColors.forEach((col) => {
          const colAbbr = col.name.slice(0, 3).toUpperCase();
          newVariantsList.push({
            sku: `RWW-${sz}-${colAbbr}-${Math.floor(100 + Math.random() * 899)}`,
            size: sz,
            color: col.name,
            price: basePrice,
            originalPrice: baseOrigPrice,
            stock: baseStock
          });
        });
      });

      // Send to backend batch variant endpoint
      await api.post(`/products/${pId}/variants`, {
        variants: newVariantsList
      });

      setShowMatrixModal(false);
      await loadData(page);
    } catch (err: any) {
      console.error("Batch matrix save failed:", err);
      alert(err.message || "Failed to batch create variants.");
    } finally {
      setSubmitting(false);
    }
  };

  const startRecord = (pagination.page - 1) * pagination.pageSize + 1;
  const endRecord = Math.min(pagination.total, pagination.page * pagination.pageSize);

  return (
    <div className={styles.container}>
      
      {/* 1. Page Header & Primary Actions */}
      <div className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.title}>
            <Package size={26} color="var(--color-primary)" /> Product Catalog & Inventory Matrix
          </h1>
          <p className={styles.subtitle}>
            Industry-standard e-commerce management table with backend filters & pagination
          </p>
        </div>

        <div className={styles.headerActions}>
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => loadData(page)}
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button 
            type="button" 
            className="btn-primary"
            onClick={() => router.push('/products/new')}
          >
            <Plus size={16} /> Add New Product
          </button>
        </div>
      </div>

      {/* 2. Responsive Key Inventory Metrics Bar */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Total Products (Backend)</span>
          <div className={styles.metricValue}>{pagination.total}</div>
        </div>
        
        <div className={`${styles.metricCard} ${styles.metricActive}`}>
          <span className={styles.metricLabel}>Active (This Page)</span>
          <div className={styles.metricValue}>{activeCount}</div>
        </div>

        <div className={`${styles.metricCard} ${lowStockCount > 0 ? styles.metricWarning : ''}`}>
          <span className={styles.metricLabel}>Low Stock Warnings</span>
          <div className={styles.metricValue}>
            {lowStockCount} {lowStockCount > 0 && <AlertTriangle size={18} />}
          </div>
        </div>

        <div className={`${styles.metricCard} ${styles.metricGold}`}>
          <span className={styles.metricLabel}>Page Total Units</span>
          <div className={styles.metricValue}>{totalStockUnits.toLocaleString()} <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>Units</span></div>
        </div>
      </div>

      {/* 3. Single-Row Industry Filter & Search Control Panel */}
      <div className={styles.filterCard}>
        <div className={styles.filterBar}>
          
          {/* Search Bar */}
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search title, category, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Compact Dropdown Filters in Single Row */}
          <select
            className={`${styles.filterSelect} ${styles.filterSelectCompact}`}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            title="Filter Category"
          >
            <option value="all">All Categories</option>
            <option value="suits">Pakistani Suits</option>
            <option value="coords">Co-Ord Sets</option>
            <option value="party">Party Wear</option>
            <option value="hampers">Gift Hampers</option>
          </select>

          <select
            className={`${styles.filterSelect} ${styles.filterSelectCompact}`}
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            title="Filter Stock Level"
          >
            <option value="all">All Stock Levels</option>
            <option value="in_stock">In Stock (&gt;0)</option>
            <option value="low_stock">Low Stock (1-5)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>

          <select
            className={`${styles.filterSelect} ${styles.filterSelectCompact}`}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            title="Filter Status"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
          </select>

          <select
            className={`${styles.filterSelect} ${styles.filterSelectCompact}`}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            title="Sort Results"
          >
            <option value="newest">Sort: Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="stock_asc">Stock: Low to High</option>
            <option value="stock_desc">Stock: High to Low</option>
            <option value="name_asc">Title: A-Z</option>
          </select>

          {(searchQuery || categoryFilter !== "all" || stockFilter !== "all" || statusFilter !== "all") && (
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: "0.78rem", height: "38px", padding: "0 10px", color: "var(--color-danger)", borderColor: "rgba(220,38,38,0.3)" }}
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
                setStockFilter("all");
                setStatusFilter("all");
                setSortBy("newest");
              }}
            >
              Reset
            </button>
          )}

          {/* View Mode Switcher */}
          <div className={styles.viewModeGroup}>
            <button
              type="button"
              className={`${styles.viewModeBtn} ${viewMode === 'table' ? styles.viewModeActive : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={14} /> Table
            </button>
            <button
              type="button"
              className={`${styles.viewModeBtn} ${viewMode === 'card' ? styles.viewModeActive : ''}`}
              onClick={() => setViewMode('card')}
              title="Grid Cards View"
            >
              <LayoutGrid size={14} /> Grid
            </button>
          </div>

        </div>
      </div>

      {/* 4. Products View: Table or Mobile Grid Cards */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0", color: "var(--color-primary)" }}>
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : products.length === 0 ? (
        <div className={styles.emptyStateCard}>
          <Package size={48} color="var(--text-muted)" style={{ margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: "600" }}>No matching products found</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "4px" }}>
            Try adjusting your search query or filter settings above.
          </p>
        </div>
      ) : viewMode === "card" ? (
        /* GRID / CARDS VIEW */
        <div className={styles.mobileCardGrid}>
          {products.map((product) => {
            const pId = product.id || product._id || "";
            const isActive = product.is_active !== undefined ? product.is_active : (product.status === 'APPROVED' || product.status === 'ACTIVE');
            const mainImg = getValidImageUrl((product.images && product.images.length > 0) ? product.images[0] : (product.image || "/assets/1540aab590cd7d478ad01cdb1a615d469ef2a808.png"));

            return (
              <div key={pId} className={styles.mobileCard}>
                <div className={styles.mobileCardHeader}>
                  <div className={styles.mobileCardThumb}>
                    <img src={mainImg} alt={product.name} />
                  </div>
                  <div className={styles.mobileCardBody}>
                    <span className={styles.categoryPill}>
                      {product.category?.name || (product.tag === 'coords' ? 'Co-Ord Sets' : product.tag === 'party' ? 'Party Wear' : product.tag === 'hampers' ? 'Gift Hampers' : 'Pakistani Suits')}
                    </span>
                    <span className={styles.productTitleText} style={{ marginTop: "4px" }}>{product.name}</span>
                    <div className={styles.sellingPrice} style={{ marginTop: "4px" }}>₹{product.price.toLocaleString()}</div>
                    <span className={`badge ${product.stock > 5 ? 'badge-success' : product.stock > 0 ? 'badge-pending' : 'badge-rejected'}`} style={{ marginTop: "6px" }}>
                      {product.stock > 5 ? `In Stock (${product.stock})` : product.stock > 0 ? `Low Stock (${product.stock})` : "Out of Stock"}
                    </span>
                  </div>
                </div>

                <div className={styles.mobileCardActions}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: "6px 12px", fontSize: "0.78rem" }}
                    onClick={() => handleOpenViewPage(product)}
                    title="View Product Details (Read-Only Mode)"
                  >
                    <Eye size={14} color="var(--color-info)" /> View
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: "6px 12px", fontSize: "0.78rem" }}
                    onClick={() => handleOpenMatrixModal(product)}
                  >
                    <Grid size={14} color="var(--color-primary)" /> Matrix
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: "6px 12px", fontSize: "0.78rem" }}
                    onClick={() => handleOpenEditPage(product)}
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    style={{ padding: "6px 10px", fontSize: "0.78rem" }}
                    onClick={() => handleDeleteProduct(pId)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* HIGH DENSITY TABLE VIEW */
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>
                    <input
                      type="checkbox"
                      checked={products.length > 0 && selectedProductIds.length === products.length}
                      onChange={handleToggleSelectAll}
                      style={{ cursor: "pointer" }}
                    />
                  </th>
                  <th>Product & Media</th>
                  <th>Category</th>
                  <th>Base Price & MRP</th>
                  <th>Variants & SKUs</th>
                  <th>Total Stock</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const pId = product.id || product._id || "";
                  const isSelected = selectedProductIds.includes(pId);
                  const isActive = product.is_active !== undefined ? product.is_active : (product.status === 'APPROVED' || product.status === 'ACTIVE');
                  const mainImg = getValidImageUrl((product.images && product.images.length > 0) ? product.images[0] : (product.image || "/assets/1540aab590cd7d478ad01cdb1a615d469ef2a808.png"));

                  const origPrice = product.originalPrice || Math.round(product.price * 1.25);
                  const discountPct = origPrice > product.price ? Math.round(((origPrice - product.price) / origPrice) * 100) : 0;

                  const variantsList = Array.isArray(product.variants) ? product.variants : [];
                  const sizesList = Array.from(new Set(variantsList.map(v => v.size).filter(Boolean)));
                  const colorsList = Array.from(new Set(variantsList.map(v => v.color).filter(Boolean)));

                  return (
                    <tr 
                      key={pId} 
                      className={isSelected ? styles.selectedRow : ''}
                    >
                      {/* Checkbox */}
                      <td>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectProduct(pId)}
                          style={{ cursor: "pointer" }}
                        />
                      </td>

                      {/* Product & Media */}
                      <td>
                        <div className={styles.productMetaCell}>
                          <div className={styles.productThumb}>
                            <img src={mainImg} alt={product.name} />
                            {product.badge && (
                              <span className={styles.productBadgeChip}>
                                {product.badge}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className={styles.productTitleText}>
                              {product.name}
                            </span>
                            <span className={styles.productSkuText}>
                              ID: {pId.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span className={styles.categoryPill}>
                          {product.category?.name || (product.tag === 'coords' ? 'Co-Ord Sets' : product.tag === 'party' ? 'Party Wear' : product.tag === 'hampers' ? 'Gift Hampers' : 'Pakistani Suits')}
                        </span>
                      </td>

                      {/* Price & MRP */}
                      <td>
                        <div className={styles.priceGroup}>
                          <span className={styles.sellingPrice}>
                            ₹{product.price.toLocaleString()}
                          </span>
                          {origPrice > product.price && (
                            <div className={styles.mrpPriceRow}>
                              <span className={styles.mrpPrice}>
                                ₹{origPrice.toLocaleString()}
                              </span>
                              <span className={styles.discountBadge}>
                                {discountPct}% OFF
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Variants & SKUs */}
                      <td>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                            <span className="badge badge-info" style={{ fontSize: "0.7rem" }}>
                              {variantsList.length > 0 ? `${variantsList.length} SKUs` : "1 SKU"}
                            </span>
                            {colorsList.length > 0 && (
                              <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                                • {colorsList.length} colors
                              </span>
                            )}
                          </div>
                          
                          <div className={styles.variantBadgeList}>
                            {(sizesList.length > 0 ? sizesList : ["S", "M", "L"]).map((s, idx) => (
                              <span key={idx} className={styles.sizeChip}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Total Stock */}
                      <td>
                        <span 
                          className={`badge ${
                            product.stock > 5 ? 'badge-success' : product.stock > 0 ? 'badge-pending' : 'badge-rejected'
                          }`}
                        >
                          {product.stock > 5 ? `In Stock (${product.stock})` : product.stock > 0 ? `Low Stock (${product.stock})` : "Out of Stock (0)"}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(product)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            cursor: "pointer",
                            border: isActive ? "1px solid rgba(5, 150, 105, 0.4)" : "1px solid rgba(220, 38, 38, 0.4)",
                            background: isActive ? "rgba(5, 150, 105, 0.12)" : "rgba(220, 38, 38, 0.12)",
                            color: isActive ? "#047857" : "#b91c1c",
                            transition: "all 0.15s ease"
                          }}
                        >
                          {isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                          {isActive ? "ACTIVE" : "HIDDEN"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                          
                          {/* Full Read-Only View Button */}
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ padding: "6px 10px", fontSize: "0.75rem" }}
                            onClick={() => handleOpenViewPage(product)}
                            title="View Product Specs & Matrix (Read-Only Mode)"
                          >
                            <Eye size={14} color="var(--color-info)" />
                          </button>

                          {/* Quick Matrix Modal Button */}
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ padding: "6px 10px", fontSize: "0.75rem" }}
                            onClick={() => handleOpenMatrixModal(product)}
                            title="Configure Size x Color Variant Matrix"
                          >
                            <Grid size={14} color="var(--color-primary)" />
                          </button>

                          {/* Full Page Edit Button */}
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ padding: "6px 10px", fontSize: "0.75rem" }}
                            onClick={() => handleOpenEditPage(product)}
                            title="Full Edit Page (Same as Create Product)"
                          >
                            <Pencil size={14} />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            className="btn-danger"
                            style={{ padding: "6px 10px", fontSize: "0.75rem" }}
                            onClick={() => handleDeleteProduct(pId)}
                            title="Delete Product Listing"
                          >
                            <Trash2 size={14} />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 5. BACKEND PAGINATION FOOTER */}
          <div className={styles.paginationBar}>
            <div>
              Showing <strong>{pagination.total > 0 ? startRecord : 0}</strong> to <strong>{endRecord}</strong> of <strong>{pagination.total}</strong> products
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  style={{ fontSize: "0.8rem", padding: "2px 6px", height: "30px", width: "70px" }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className={styles.paginationControls}>
                <button
                  type="button"
                  className={styles.pageBtn}
                  disabled={!pagination.hasPrev && page <= 1}
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                >
                  <ChevronLeft size={14} /> Previous
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).slice(
                  Math.max(0, page - 3),
                  Math.min(pagination.totalPages, page + 2)
                ).map((pNum) => (
                  <button
                    key={pNum}
                    type="button"
                    className={`${styles.pageBtn} ${page === pNum ? styles.pageBtnActive : ''}`}
                    onClick={() => setPage(pNum)}
                  >
                    {pNum}
                  </button>
                ))}

                <button
                  type="button"
                  className={styles.pageBtn}
                  disabled={!pagination.hasNext && page >= pagination.totalPages}
                  onClick={() => setPage(prev => Math.min(pagination.totalPages, prev + 1))}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 6. BATCH VARIANT MATRIX GENERATOR MODAL */}
      {showMatrixModal && matrixProduct && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                <Zap size={20} color="var(--color-primary)" /> Batch Variant Matrix Generator
              </h2>
              <button type="button" className="btn-secondary" style={{ padding: "6px 10px" }} onClick={() => setShowMatrixModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Generating variant matrix for product: <strong style={{ color: "var(--color-primary)" }}>{matrixProduct.name}</strong>
              </p>

              {/* Sizes */}
              <div style={{ background: "var(--bg-main)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                <label style={{ fontWeight: "600", color: "var(--text-primary)", fontSize: "0.85rem", marginBottom: "8px", display: "block" }}>
                  1. Select Sizes for Matrix:
                </label>
                <div className={styles.chipGroup}>
                  {PRESET_SIZES.map(sz => {
                    const active = selectedSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        className={`${styles.chipBtn} ${active ? styles.chipActive : ''}`}
                        onClick={() => setSelectedSizes(prev => active ? prev.filter(s => s !== sz) : [...prev, sz])}
                      >
                        {active ? `✓ ${sz}` : sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colors */}
              <div style={{ background: "var(--bg-main)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                <label style={{ fontWeight: "600", color: "var(--text-primary)", fontSize: "0.85rem", marginBottom: "8px", display: "block" }}>
                  2. Select Colors for Matrix:
                </label>
                <div className={styles.chipGroup}>
                  {availableColors.map(preset => {
                    const active = selectedColors.some(c => c.name.toLowerCase() === preset.name.toLowerCase());
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        className={`${styles.chipBtn} ${active ? styles.chipActive : ''}`}
                        style={{ display: "flex", alignItems: "center", gap: "6px" }}
                        onClick={() => setSelectedColors(prev => active ? prev.filter(c => c.name.toLowerCase() !== preset.name.toLowerCase()) : [...prev, preset])}
                      >
                        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: preset.hex, border: "1px solid rgba(0,0,0,0.2)" }} />
                        {active ? `✓ ${preset.name}` : preset.name}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Color Section */}
                <div style={{ background: "rgba(184, 150, 62, 0.08)", border: "1px solid rgba(184, 150, 62, 0.3)", padding: "12px 14px", borderRadius: "8px", marginTop: "10px" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--color-primary)", display: "block", marginBottom: "6px" }}>
                    ➕ Add Custom Color Swatch:
                  </span>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <input
                      type="text"
                      placeholder="Color Name (e.g. Sage Green)"
                      value={customColorName}
                      onChange={(e) => setCustomColorName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomColor();
                        }
                      }}
                      style={{ width: "180px", padding: "4px 8px", fontSize: "0.82rem" }}
                    />
                    <input
                      type="color"
                      value={customColorHex}
                      onChange={(e) => setCustomColorHex(e.target.value)}
                      style={{ width: "38px", height: "30px", padding: "1px", cursor: "pointer", borderRadius: "4px" }}
                    />
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ fontSize: "0.78rem", padding: "4px 12px" }}
                      onClick={handleAddCustomColor}
                    >
                      <Plus size={13} /> Add Swatch
                    </button>
                  </div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className={`${styles.formGrid} ${styles.formGrid3}`}>
                <div>
                  <label htmlFor="mat_price">Matrix Price (INR)</label>
                  <input id="mat_price" type="number" value={bulkPrice} onChange={(e) => setBulkPrice(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="mat_mrp">Matrix MRP (INR)</label>
                  <input id="mat_mrp" type="number" value={bulkOriginalPrice} onChange={(e) => setBulkOriginalPrice(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="mat_stock">Stock Qty per SKU</label>
                  <input id="mat_stock" type="number" value={bulkStock} onChange={(e) => setBulkStock(e.target.value)} />
                </div>
              </div>

            </div>

            <div className={styles.modalFooter}>
              <button type="button" className="btn-secondary" onClick={() => setShowMatrixModal(false)} disabled={submitting}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={handleApplyMatrixToProduct} disabled={submitting}>
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />} Batch Create {selectedSizes.length * selectedColors.length} SKUs
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
