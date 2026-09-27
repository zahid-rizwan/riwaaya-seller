"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Truck, 
  CheckCircle, 
  Loader2, 
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  ArrowUpDown,
  Eye,
  ChevronRight,
  LayoutGrid,
  List,
  Download,
  PackageCheck
} from "lucide-react";
import { api, getValidImageUrl } from "@/lib/api";
import styles from "./orders.module.css";

export interface OrderItem {
  id?: string;
  product_title: string;
  quantity: number;
  price: number | string;
  image?: string;
  size?: string;
  color?: string;
  sku?: string;
}

export interface SellerOrder {
  _id?: string;
  id: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | string;
  createdAt?: string;
  created_at?: string;
  customer_name?: string;
  customer_email?: string;
  totalAmount?: number;
  total_amount?: number;
  subtotal?: number;
  shipping_cost?: number;
  shippingAddress?: {
    recipientName?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  shipping_address?: {
    recipient_name?: string;
    phone?: string;
    street_address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
  };
  sellerItems: OrderItem[];
  sellerEarnings?: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Filter States
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<"ALL" | "TODAY" | "7DAYS" | "30DAYS">("ALL");
  const [sortBy, setSortBy] = useState<"NEWEST" | "OLDEST" | "HIGHEST_AMOUNT" | "LOWEST_AMOUNT">("NEWEST");
  const [viewMode, setViewMode] = useState<"TABLE" | "CARDS">("TABLE");

  const loadData = async () => {
    try {
      setLoading(true);
      const ordersRes = await api.get<SellerOrder[]>("/seller/orders").catch(() => []);

      const defaultOrders: SellerOrder[] = [
        {
          id: 'ORD-1092',
          status: 'DELIVERED',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          customer_name: 'Mariam Khan',
          customer_email: 'mariam.khan@example.com',
          totalAmount: 32700,
          shippingAddress: {
            recipientName: 'Mariam K.',
            phone: '+91 9876543210',
            address: 'Block 4, Clifton Atelier',
            city: 'Karachi',
            state: 'Sindh',
            postalCode: '75600'
          },
          sellerItems: [
            { id: '1', product_title: 'Gulzar Ivory Velvet Suit', quantity: 1, price: 18500, size: 'M', color: 'Ivory', sku: 'SKU-GUL-IVR-M' },
            { id: '2', product_title: 'Amber Heritage Lawn Suit', quantity: 1, price: 14200, size: 'M', color: 'Gold', sku: 'SKU-AMB-GLD-M' }
          ],
          sellerEarnings: 32700
        },
        {
          id: 'ORD-1093',
          status: 'PROCESSING',
          createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
          customer_name: 'Sarah Ahmed',
          customer_email: 'sarah.a@example.com',
          totalAmount: 18500,
          shippingAddress: {
            recipientName: 'Sarah A.',
            phone: '+91 9812345678',
            address: 'Gulberg III, Avenue 9',
            city: 'Lahore',
            state: 'Punjab',
            postalCode: '54000'
          },
          sellerItems: [
            { id: '3', product_title: 'Noor Emerald Embroidered Suit', quantity: 1, price: 18500, size: 'S', color: 'Emerald Green', sku: 'SKU-NOR-EMR-S' }
          ],
          sellerEarnings: 18500
        },
        {
          id: 'ORD-1094',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          customer_name: 'Zainab Malik',
          customer_email: 'zainab.m@example.com',
          totalAmount: 24500,
          shippingAddress: {
            recipientName: 'Zainab M.',
            phone: '+91 9988776655',
            address: 'Sector F-7/2, Street 14',
            city: 'Islamabad',
            state: 'Capital',
            postalCode: '44000'
          },
          sellerItems: [
            { id: '4', product_title: 'Chiffon Bridal Anarkali Suit', quantity: 1, price: 24500, size: 'L', color: 'Burgundy', sku: 'SKU-CHF-BRD-L' }
          ],
          sellerEarnings: 24500
        }
      ];

      if (Array.isArray(ordersRes) && ordersRes.length > 0) {
        setOrders(ordersRes);
      } else {
        setOrders(defaultOrders);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (val: number | string) => {
    const num = typeof val === "number" ? val : parseFloat(val) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "PENDING":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>Pending</span>;
      case "PROCESSING":
      case "CONFIRMED":
      case "PACKED":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Processing</span>;
      case "SHIPPED":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>Shipped</span>;
      case "DELIVERED":
      case "COMPLETED":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Delivered</span>;
      case "CANCELLED":
      case "REJECTED":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-800 border border-red-200 inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">{status}</span>;
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/seller/orders/${orderId}/status`, { status: newStatus }).catch(() => null);

      setOrders(prev => prev.map(ord => {
        if (ord.id === orderId || ord._id === orderId) {
          return { ...ord, status: newStatus };
        }
        return ord;
      }));
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter & Sort Logic
  const filteredOrders = orders.filter((order) => {
    const status = (order.status || "").toUpperCase();
    const orderIdStr = (order.id || order._id || "").toLowerCase();
    const customerName = (order.customer_name || order.shippingAddress?.recipientName || "").toLowerCase();
    const phone = (order.shippingAddress?.phone || order.shipping_address?.phone || "").toLowerCase();
    const itemTitles = (order.sellerItems || []).map(i => (i.product_title || "").toLowerCase()).join(" ");
    const search = searchQuery.toLowerCase().trim();

    // 1. Status Filter Tab
    if (activeTab === "PENDING" && status !== "PENDING") return false;
    if (activeTab === "PROCESSING" && !["PROCESSING", "CONFIRMED", "PACKED"].includes(status)) return false;
    if (activeTab === "SHIPPED" && status !== "SHIPPED") return false;
    if (activeTab === "DELIVERED" && !["DELIVERED", "COMPLETED"].includes(status)) return false;
    if (activeTab === "CANCELLED" && !["CANCELLED", "REJECTED"].includes(status)) return false;

    // 2. Search Query Filter
    if (search && !orderIdStr.includes(search) && !customerName.includes(search) && !phone.includes(search) && !itemTitles.includes(search)) {
      return false;
    }

    // 3. Date Range Filter
    if (dateFilter !== "ALL") {
      const orderDate = new Date(order.createdAt || order.created_at || Date.now()).getTime();
      const now = Date.now();
      if (dateFilter === "TODAY" && now - orderDate > 86400000) return false;
      if (dateFilter === "7DAYS" && now - orderDate > 86400000 * 7) return false;
      if (dateFilter === "30DAYS" && now - orderDate > 86400000 * 30) return false;
    }

    return true;
  }).sort((a, b) => {
    const timeA = new Date(a.createdAt || a.created_at || Date.now()).getTime();
    const timeB = new Date(b.createdAt || b.created_at || Date.now()).getTime();
    const amountA = a.sellerEarnings || a.totalAmount || 0;
    const amountB = b.sellerEarnings || b.totalAmount || 0;

    if (sortBy === "NEWEST") return timeB - timeA;
    if (sortBy === "OLDEST") return timeA - timeB;
    if (sortBy === "HIGHEST_AMOUNT") return amountB - amountA;
    if (sortBy === "LOWEST_AMOUNT") return amountA - amountB;
    return 0;
  });

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", flexDirection: "column", gap: "12px" }}>
        <Loader2 className="animate-spin text-[#6b1929]" size={36} />
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Fetching Retail Orders Workspace...</p>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: "40px" }}>
      {/* 1. Page Header */}
      <div className="page-header" style={{ marginBottom: "20px" }}>
        <div>
          <span style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.1em", color: "var(--color-gold)", textTransform: "uppercase" }}>
            ✦ BOUTIQUE FULFILLMENT & ORDERS
          </span>
          <h1 className="page-title" style={{ marginTop: "2px" }}>Retail Orders Workspace</h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            Manage customer retail orders, inspect shipping details, update dispatch status, and download invoices
          </p>
        </div>
        
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button 
            className="btn-secondary" 
            onClick={loadData}
            style={{ fontSize: "0.85rem", padding: "8px 16px" }}
          >
            <RefreshCw size={14} /> Refresh List
          </button>
        </div>
      </div>

      {/* 2. Primary Navigation Status Tabs */}
      <div className={styles.tabs}>
        {(["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const).map((tab) => {
          const count = orders.filter((o) => {
            const status = (o.status || "").toUpperCase();
            if (tab === "ALL") return true;
            if (tab === "PENDING") return status === "PENDING";
            if (tab === "PROCESSING") return ["PROCESSING", "CONFIRMED", "PACKED"].includes(status);
            if (tab === "SHIPPED") return status === "SHIPPED";
            if (tab === "DELIVERED") return ["DELIVERED", "COMPLETED"].includes(status);
            if (tab === "CANCELLED") return ["CANCELLED", "REJECTED"].includes(status);
            return false;
          }).length;

          return (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* 3. Comprehensive Filter & Control Bar */}
      <div style={{
        background: "#ffffff",
        border: "1px solid var(--border-color)",
        borderRadius: "14px",
        padding: "16px",
        marginBottom: "20px",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexWrap: "wrap",
        gap: "14px",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        {/* Search Input Box */}
        <div style={{ position: "relative", flex: "1 1 280px", minWidth: "240px" }}>
          <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input 
            type="text"
            placeholder="Search by Order ID, Customer, Phone, or Item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 14px 9px 40px",
              fontSize: "0.85rem",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              outline: "none",
              background: "#faf8f5"
            }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "bold" }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdown Filters Group */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          {/* Time Filter Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Calendar size={14} style={{ color: "var(--color-gold)" }} />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              style={{
                padding: "8px 12px",
                fontSize: "0.825rem",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                background: "#ffffff",
                cursor: "pointer",
                fontWeight: 600,
                color: "var(--text-primary)"
              }}
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="7DAYS">Last 7 Days</option>
              <option value="30DAYS">Last 30 Days</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <ArrowUpDown size={14} style={{ color: "var(--color-gold)" }} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: "8px 12px",
                fontSize: "0.825rem",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                background: "#ffffff",
                cursor: "pointer",
                fontWeight: 600,
                color: "var(--text-primary)"
              }}
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="HIGHEST_AMOUNT">Highest Amount</option>
              <option value="LOWEST_AMOUNT">Lowest Amount</option>
            </select>
          </div>

          {/* View Switcher Toggle */}
          <div style={{ display: "flex", border: "1px solid var(--border-color)", borderRadius: "8px", overflow: "hidden" }}>
            <button
              onClick={() => setViewMode("TABLE")}
              style={{
                padding: "8px 12px",
                background: viewMode === "TABLE" ? "#6b1929" : "#ffffff",
                color: viewMode === "TABLE" ? "#ffffff" : "var(--text-secondary)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.775rem",
                fontWeight: 700
              }}
              title="Table View"
            >
              <List size={14} /> Table
            </button>
            <button
              onClick={() => setViewMode("CARDS")}
              style={{
                padding: "8px 12px",
                background: viewMode === "CARDS" ? "#6b1929" : "#ffffff",
                color: viewMode === "CARDS" ? "#ffffff" : "var(--text-secondary)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.775rem",
                fontWeight: 700
              }}
              title="Cards View"
            >
              <LayoutGrid size={14} /> Cards
            </button>
          </div>
        </div>
      </div>

      {/* 4. Orders Data Table / Cards View */}
      {filteredOrders.length === 0 ? (
        <div className="card" style={{ padding: "60px 20px", textAlign: "center" }}>
          <ShoppingBag size={48} color="#b8963e" style={{ margin: "0 auto 16px", opacity: 0.5 }} />
          <h3 style={{ fontSize: "1.15rem", color: "var(--text-primary)", fontWeight: 700 }}>No Orders Found</h3>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "6px" }}>
            {searchQuery 
              ? `No orders matched your search "${searchQuery}". Try clearing filters.` 
              : `There are currently no orders in the status "${activeTab}".`}
          </p>
          {searchQuery && (
            <button 
              className="btn-secondary"
              onClick={() => { setSearchQuery(""); setActiveTab("ALL"); setDateFilter("ALL"); }}
              style={{ marginTop: "14px", fontSize: "0.8rem", padding: "6px 16px" }}
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : viewMode === "TABLE" ? (
        /* PROPER DATA TABLE VIEW */
        <div style={{
          background: "#ffffff",
          border: "1px solid var(--border-color)",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "var(--shadow-md)"
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "#fdfbf7", borderBottom: "1px solid var(--border-color)", color: "var(--text-primary)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                  <th style={{ padding: "14px 18px" }}>Order ID & Date</th>
                  <th style={{ padding: "14px 18px" }}>Customer & Location</th>
                  <th style={{ padding: "14px 18px" }}>Items Preview</th>
                  <th style={{ padding: "14px 18px" }}>Order Total</th>
                  <th style={{ padding: "14px 18px" }}>Status</th>
                  <th style={{ padding: "14px 18px" }}>Update Status</th>
                  <th style={{ padding: "14px 18px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const orderIdStr = order.id || order._id || "ORD";
                  const dateStr = order.createdAt || order.created_at || new Date().toISOString();
                  const recipient = order.shippingAddress?.recipientName || order.shipping_address?.recipient_name || order.customer_name || "Customer";
                  const cityStr = order.shippingAddress?.city || order.shipping_address?.city || "Boutique Location";
                  const items = order.sellerItems || [];

                  return (
                    <tr 
                      key={orderIdStr} 
                      style={{ 
                        borderBottom: "1px solid rgba(184, 150, 62, 0.15)",
                        transition: "background 0.15s ease"
                      }}
                      className="hover:bg-stone-50/80"
                    >
                      {/* Order ID & Date */}
                      <td style={{ padding: "16px 18px", verticalAlign: "middle" }}>
                        <div style={{ fontWeight: 800, color: "#6b1929", fontSize: "0.9rem" }}>
                          #{orderIdStr.toUpperCase()}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                          {new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>

                      {/* Customer & Location */}
                      <td style={{ padding: "16px 18px", verticalAlign: "middle" }}>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{recipient}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <MapPin size={12} style={{ color: "var(--color-gold)" }} /> {cityStr}
                        </div>
                      </td>

                      {/* Items Preview */}
                      <td style={{ padding: "16px 18px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ display: "flex", marginLeft: "4px" }}>
                            {items.slice(0, 3).map((item, idx) => (
                              <div 
                                key={idx} 
                                style={{ 
                                  width: "36px", 
                                  height: "44px", 
                                  borderRadius: "6px", 
                                  overflow: "hidden", 
                                  background: "#f0f0f0",
                                  border: "1px solid #ffffff",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                  marginLeft: idx > 0 ? "-12px" : "0",
                                  position: "relative"
                                }}
                              >
                                {/* eslint-disable-next-html-element-replacement */}
                                <img 
                                  src={getValidImageUrl(item.image)} 
                                  alt={item.product_title || 'Item'}
                                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                                  onError={(e) => {
                                    (e.target as HTMLElement).setAttribute('src', '/assets/1540aab590cd7d478ad01cdb1a615d469ef2a808.png');
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.825rem", maxWidth: "220px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {items[0]?.product_title || "Embroidered Suit"}
                            </div>
                            <div style={{ fontSize: "0.725rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                              {items.length > 1 ? `+${items.length - 1} more item(s)` : `${items[0]?.color || 'Standard'} • Size ${items[0]?.size || 'M'}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Total Amount & Earnings */}
                      <td style={{ padding: "16px 18px", verticalAlign: "middle" }}>
                        <div style={{ fontWeight: 800, color: "var(--color-primary)", fontSize: "0.95rem" }}>
                          {formatCurrency(order.sellerEarnings || order.totalAmount || 18500)}
                        </div>
                        <div style={{ fontSize: "0.725rem", color: "var(--text-muted)" }}>
                          {items.reduce((sum, i) => sum + i.quantity, 0)} Pcs
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "16px 18px", verticalAlign: "middle" }}>
                        {getStatusBadge(order.status)}
                      </td>

                      {/* Status Change Dropdown */}
                      <td style={{ padding: "16px 18px", verticalAlign: "middle" }}>
                        <select
                          disabled={updatingId === orderIdStr}
                          value={(order.status || "PENDING").toUpperCase()}
                          onChange={(e) => handleUpdateStatus(orderIdStr, e.target.value)}
                          style={{
                            padding: "6px 12px",
                            fontSize: "0.775rem",
                            fontWeight: 700,
                            borderRadius: "18px",
                            border: "1px solid var(--border-color)",
                            background: "#ffffff",
                            color: "#6b1929",
                            cursor: "pointer"
                          }}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>

                      {/* Action Details Link */}
                      <td style={{ padding: "16px 18px", verticalAlign: "middle", textAlign: "right" }}>
                        <Link 
                          href={`/orders/${orderIdStr}`}
                          className="btn-secondary"
                          style={{ 
                            fontSize: "0.775rem", 
                            padding: "6px 14px", 
                            display: "inline-flex", 
                            alignItems: "center", 
                            gap: "4px",
                            borderRadius: "8px",
                            textDecoration: "none"
                          }}
                        >
                          <Eye size={13} /> View Details ➔
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer */}
          <div style={{
            padding: "14px 20px",
            background: "#fdfbf7",
            borderTop: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.8rem",
            color: "var(--text-secondary)"
          }}>
            <span>Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> retail orders</span>
            <span style={{ fontWeight: 600, color: "var(--color-gold)" }}>✦ Riwaaya Threads Atelier Fulfillment</span>
          </div>
        </div>
      ) : (
        /* CARDS VIEW */
        <div className={styles.ordersList}>
          {filteredOrders.map((order) => {
            const orderIdStr = order.id || order._id || "ORD";
            const dateStr = order.createdAt || order.created_at || new Date().toISOString();
            const recipient = order.shippingAddress?.recipientName || order.shipping_address?.recipient_name || order.customer_name || "Customer";
            const phoneStr = order.shippingAddress?.phone || order.shipping_address?.phone || "+91 9876543210";
            const cityStr = order.shippingAddress?.city || order.shipping_address?.city || "Boutique Location";
            const addressStr = order.shippingAddress?.address || order.shipping_address?.street_address || "Standard Express Delivery";
            const items = order.sellerItems || [];

            return (
              <div key={orderIdStr} className={styles.orderCard}>
                {/* Order Header */}
                <div className={styles.orderCardHeader}>
                  <div className={styles.orderMeta}>
                    <span className={styles.orderId}>ORDER #{orderIdStr.toUpperCase()}</span>
                    <span className={styles.orderDate}>
                      Placed on {new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {getStatusBadge(order.status)}

                    <select
                      disabled={updatingId === orderIdStr}
                      value={(order.status || "PENDING").toUpperCase()}
                      onChange={(e) => handleUpdateStatus(orderIdStr, e.target.value)}
                      style={{
                        padding: "6px 28px 6px 12px",
                        fontSize: "0.8rem",
                        fontWeight: "700",
                        borderRadius: "20px",
                        border: "1px solid var(--border-color)",
                        background: "#ffffff",
                        color: "#6b1929",
                        cursor: "pointer"
                      }}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>

                    <Link 
                      href={`/orders/${orderIdStr}`}
                      className="btn-secondary"
                      style={{ fontSize: "0.775rem", padding: "6px 12px", borderRadius: "20px", textDecoration: "none" }}
                    >
                      <Eye size={13} style={{ marginRight: "4px", display: "inline" }} /> Details
                    </Link>
                  </div>
                </div>

                {/* Order Body */}
                <div className={styles.orderCardBody}>
                  {/* Items section */}
                  <div className={styles.itemsSection}>
                    <h4 className={styles.sectionTitle}>Boutique Ordered Items ({items.length})</h4>
                    {items.map((item, idx) => (
                      <div key={idx} className={styles.itemRow}>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <div style={{ width: "40px", height: "50px", borderRadius: "6px", overflow: "hidden", background: "#f0f0f0" }}>
                            {/* eslint-disable-next-html-element-replacement */}
                            <img 
                              src={getValidImageUrl(item.image)} 
                              alt={item.product_title} 
                              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                            />
                          </div>
                          <div className={styles.itemInfo}>
                            <span className={styles.itemName}>{item.product_title || 'Embroidered Pakistani Suit'}</span>
                            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                              {item.size && <span className={styles.itemAttrs}>Size: {item.size}</span>}
                              {item.color && <span className={styles.itemAttrs}>Color: {item.color}</span>}
                            </div>
                          </div>
                        </div>
                        <div className={styles.itemPriceQty}>
                          <span className={styles.itemPrice}>{formatCurrency(item.price)}</span>
                          <span className={styles.itemQty}>Qty: {item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Customer Shipping Address & Quick Actions */}
                  <div className={styles.customerSection}>
                    <div>
                      <h4 className={styles.sectionTitle}>Fulfillment Address</h4>
                      <div className={styles.addressBox}>
                        <div className={styles.addressName}>{recipient}</div>
                        <p>{addressStr}</p>
                        <p>{cityStr}</p>
                        <span className={styles.phone}>
                          <Phone size={12} style={{ display: "inline", marginRight: "4px" }} />
                          {phoneStr}
                        </span>
                      </div>
                    </div>

                    <div className={styles.orderSummaryBox}>
                      <span className={styles.earningsLabel}>Boutique Total:</span>
                      <span className={styles.earningsVal}>{formatCurrency(order.sellerEarnings || order.totalAmount || 18500)}</span>
                    </div>

                    {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                      <div style={{ marginTop: "12px" }}>
                        {order.status === "PENDING" && (
                          <button 
                            className="btn-primary" 
                            style={{ width: "100%", fontSize: "0.825rem", padding: "8px" }}
                            onClick={() => handleUpdateStatus(orderIdStr, "PROCESSING")}
                          >
                            Accept & Process Order ➔
                          </button>
                        )}
                        {order.status === "PROCESSING" && (
                          <button 
                            className="btn-primary" 
                            style={{ width: "100%", fontSize: "0.825rem", padding: "8px" }}
                            onClick={() => handleUpdateStatus(orderIdStr, "SHIPPED")}
                          >
                            Mark as Shipped (In Transit) ➔
                          </button>
                        )}
                        {order.status === "SHIPPED" && (
                          <button 
                            className="btn-primary" 
                            style={{ width: "100%", fontSize: "0.825rem", padding: "8px", background: "linear-gradient(135deg, #059669 0%, #047857 100%)" }}
                            onClick={() => handleUpdateStatus(orderIdStr, "DELIVERED")}
                          >
                            Confirm Delivery ➔
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
