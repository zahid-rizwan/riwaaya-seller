"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Printer, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Package, 
  Receipt, 
  AlertCircle, 
  Loader2, 
  FileText,
  Calendar,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { api, getValidImageUrl } from "@/lib/api";

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

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const router = useRouter();

  const [order, setOrder] = useState<SellerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const data = await api.get<SellerOrder>(`/seller/orders/${orderId}`).catch(() => null);

      if (data && (data.id || data._id)) {
        setOrder(data);
      } else {
        // Fallback Mock Order for Preview / Demo
        setOrder({
          id: orderId.toUpperCase(),
          status: "PROCESSING",
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          customer_name: "Mariam Khan",
          customer_email: "mariam.khan@example.com",
          totalAmount: 32700,
          subtotal: 32700,
          shipping_cost: 0,
          shippingAddress: {
            recipientName: "Mariam Khan",
            phone: "+91 9876543210",
            address: "House 45, Block 4, Clifton Atelier",
            city: "Karachi",
            state: "Sindh",
            postalCode: "75600"
          },
          sellerItems: [
            {
              id: "1",
              product_title: "Gulzar Ivory Velvet Suit",
              sku: "SKU-GUL-IVR-M",
              quantity: 1,
              price: 18500,
              size: "M",
              color: "Ivory",
              image: "/assets/1540aab590cd7d478ad01cdb1a615d469ef2a808.png"
            },
            {
              id: "2",
              product_title: "Amber Heritage Lawn Suit",
              sku: "SKU-AMB-GLD-M",
              quantity: 1,
              price: 14200,
              size: "M",
              color: "Gold",
              image: "/assets/8cd274c8adf8a9367c11b2f398e872089e3379a0.png"
            }
          ],
          sellerEarnings: 32700
        });
      }
    } catch (err) {
      console.error("Failed to load order details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const formatCurrency = (val: number | string) => {
    const num = typeof val === "number" ? val : parseFloat(val) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return;
    setUpdatingStatus(true);
    try {
      await api.put(`/seller/orders/${order.id || order._id}/status`, { status: newStatus }).catch(() => null);
      setOrder(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePrintInvoice = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "65vh", flexDirection: "column", gap: "12px" }}>
        <Loader2 className="animate-spin text-[#6b1929]" size={36} />
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Loading Order #{orderId} Details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="card" style={{ padding: "60px 20px", textAlign: "center", maxWidth: "600px", margin: "40px auto" }}>
        <AlertCircle size={48} color="#b8963e" style={{ margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)", fontWeight: 700 }}>Order Not Found</h2>
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "6px" }}>
          We could not locate order details for ID `<span className="font-mono">{orderId}</span>`.
        </p>
        <Link href="/orders" className="btn-primary" style={{ marginTop: "16px", display: "inline-block", textDecoration: "none" }}>
          Return to Orders List
        </Link>
      </div>
    );
  }

  const currentStatus = (order.status || "PENDING").toUpperCase();
  const recipientName = order.shippingAddress?.recipientName || order.shipping_address?.recipient_name || order.customer_name || "Customer";
  const phoneStr = order.shippingAddress?.phone || order.shipping_address?.phone || "+91 9876543210";
  const addressStr = order.shippingAddress?.address || order.shipping_address?.street_address || "Standard Express Address";
  const cityStr = order.shippingAddress?.city || order.shipping_address?.city || "City";
  const stateStr = order.shippingAddress?.state || order.shipping_address?.state || "State";
  const postalStr = order.shippingAddress?.postalCode || order.shipping_address?.postal_code || "000000";
  const items = order.sellerItems || [];

  const steps = [
    { key: "PENDING", label: "Order Placed", desc: "Order received from buyer" },
    { key: "PROCESSING", label: "Processing", desc: "Boutique tailored & packed" },
    { key: "SHIPPED", label: "Shipped", desc: "In transit with express courier" },
    { key: "DELIVERED", label: "Delivered", desc: "Successfully delivered to customer" }
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case "PENDING": return 0;
      case "PROCESSING": case "CONFIRMED": case "PACKED": return 1;
      case "SHIPPED": return 2;
      case "DELIVERED": case "COMPLETED": return 3;
      case "CANCELLED": case "REJECTED": return -1;
      default: return 0;
    }
  };

  const activeStepIdx = getStepIndex(currentStatus);

  return (
    <div style={{ paddingBottom: "60px" }}>
      {/* 1. Breadcrumbs Navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "16px", fontWeight: 600 }}>
        <Link href="/orders" style={{ color: "var(--text-secondary)", textDecoration: "none" }} className="hover:text-[#6b1929]">
          Retail Orders
        </Link>
        <ChevronRight size={14} />
        <span style={{ color: "#6b1929", fontWeight: 700 }}>Order #{order.id.toUpperCase()}</span>
      </div>

      {/* 2. Top Header & Action Controls */}
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button 
            onClick={() => router.push("/orders")}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              border: "1px solid var(--border-color)",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-primary)"
            }}
            title="Back to Orders"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 className="page-title" style={{ fontSize: "1.5rem" }}>Order #{order.id.toUpperCase()}</h1>
              {currentStatus === "CANCELLED" ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">CANCELLED</span>
              ) : currentStatus === "DELIVERED" ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">DELIVERED</span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">{currentStatus}</span>
              )}
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              Placed on {new Date(order.createdAt || order.created_at || Date.now()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <button 
            className="btn-secondary" 
            onClick={handlePrintInvoice}
            style={{ fontSize: "0.825rem", padding: "8px 16px", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Printer size={15} /> Print Invoice
          </button>

          {/* Status Change Selector */}
          <select
            disabled={updatingStatus}
            value={currentStatus}
            onChange={(e) => handleUpdateStatus(e.target.value)}
            style={{
              padding: "8px 16px",
              fontSize: "0.825rem",
              fontWeight: 700,
              borderRadius: "8px",
              border: "1px solid var(--color-gold)",
              background: "#6b1929",
              color: "#ffffff",
              cursor: "pointer"
            }}
          >
            <option value="PENDING" style={{ background: "#ffffff", color: "#000" }}>Set Status: PENDING</option>
            <option value="PROCESSING" style={{ background: "#ffffff", color: "#000" }}>Set Status: PROCESSING</option>
            <option value="SHIPPED" style={{ background: "#ffffff", color: "#000" }}>Set Status: SHIPPED</option>
            <option value="DELIVERED" style={{ background: "#ffffff", color: "#000" }}>Set Status: DELIVERED</option>
            <option value="CANCELLED" style={{ background: "#ffffff", color: "#000" }}>Set Status: CANCELLED</option>
          </select>
        </div>
      </div>

      {/* 3. Order Progress Stepper Timeline Card */}
      {currentStatus !== "CANCELLED" && (
        <div style={{
          background: "#ffffff",
          border: "1px solid var(--border-color)",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
          boxShadow: "var(--shadow-sm)"
        }}>
          <h3 style={{ fontSize: "0.825rem", fontWeight: 800, color: "var(--color-gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>
            ✦ Order Fulfillment Progress
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", position: "relative" }}>
            {steps.map((step, idx) => {
              const isDone = activeStepIdx >= idx;
              const isCurrent = activeStepIdx === idx;

              return (
                <div key={step.key} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: isDone ? "#6b1929" : "#f0f0f0",
                      color: isDone ? "#ffffff" : "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      boxShadow: isCurrent ? "0 0 0 4px rgba(107, 25, 41, 0.2)" : "none"
                    }}>
                      {isDone ? "✓" : idx + 1}
                    </div>
                    {idx < steps.length - 1 && (
                      <div style={{
                        flex: 1,
                        height: "3px",
                        background: activeStepIdx > idx ? "#6b1929" : "var(--border-color)",
                        borderRadius: "2px"
                      }} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.875rem", color: isDone ? "var(--text-primary)" : "var(--text-muted)" }}>
                      {step.label}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                      {step.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Two-Column Workspace Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: "24px", alignItems: "start" }}>
        
        {/* LEFT COLUMN: Items Table & Financial Breakdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Ordered Products Card */}
          <div style={{
            background: "#ffffff",
            border: "1px solid var(--border-color)",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "var(--shadow-sm)"
          }}>
            <div style={{ padding: "16px 20px", background: "#fdfbf7", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#6b1929", display: "flex", alignItems: "center", gap: "8px" }}>
                <Package size={16} /> Boutique Line Items ({items.length})
              </h3>
              <span style={{ fontSize: "0.775rem", color: "var(--color-gold)", fontWeight: 700 }}>
                {items.reduce((s, i) => s + i.quantity, 0)} Total Quantity
              </span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#ffffff", borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)", fontSize: "0.725rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    <th style={{ padding: "12px 18px" }}>Item Details</th>
                    <th style={{ padding: "12px 18px" }}>Specs</th>
                    <th style={{ padding: "12px 18px" }}>Unit Price</th>
                    <th style={{ padding: "12px 18px" }}>Qty</th>
                    <th style={{ padding: "12px 18px", textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const priceNum = typeof item.price === "number" ? item.price : parseFloat(item.price) || 0;
                    const lineTotal = priceNum * item.quantity;

                    return (
                      <tr key={idx} style={{ borderBottom: "1px solid rgba(184, 150, 62, 0.15)" }}>
                        <td style={{ padding: "14px 18px", verticalAlign: "middle" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ width: "48px", height: "60px", borderRadius: "8px", overflow: "hidden", background: "#f0f0f0", flexShrink: 0, border: "1px solid var(--border-color)" }}>
                              {/* eslint-disable-next-html-element-replacement */}
                              <img 
                                src={getValidImageUrl(item.image)} 
                                alt={item.product_title} 
                                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                                onError={(e) => {
                                  (e.target as HTMLElement).setAttribute('src', '/assets/1540aab590cd7d478ad01cdb1a615d469ef2a808.png');
                                }}
                              />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem" }}>
                                {item.product_title || 'Embroidered Suit'}
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                                SKU: <span className="font-mono">{item.sku || 'SKU-STANDARD'}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: "14px 18px", verticalAlign: "middle" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {item.color && (
                              <span style={{ fontSize: "0.725rem", fontWeight: 700, color: "#6b1929", background: "rgba(107, 25, 41, 0.06)", padding: "2px 8px", borderRadius: "6px", width: "fit-content" }}>
                                Color: {item.color}
                              </span>
                            )}
                            {item.size && (
                              <span style={{ fontSize: "0.725rem", fontWeight: 700, color: "var(--color-gold)", background: "rgba(184, 150, 62, 0.1)", padding: "2px 8px", borderRadius: "6px", width: "fit-content" }}>
                                Size: {item.size}
                              </span>
                            )}
                          </div>
                        </td>

                        <td style={{ padding: "14px 18px", verticalAlign: "middle", fontWeight: 600, color: "var(--text-primary)" }}>
                          {formatCurrency(priceNum)}
                        </td>

                        <td style={{ padding: "14px 18px", verticalAlign: "middle", fontWeight: 700, color: "var(--text-primary)" }}>
                          x{item.quantity}
                        </td>

                        <td style={{ padding: "14px 18px", verticalAlign: "middle", fontWeight: 800, color: "#6b1929", textAlign: "right" }}>
                          {formatCurrency(lineTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment & Earnings Summary Card */}
          <div style={{
            background: "#ffffff",
            border: "1px solid var(--border-color)",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "var(--shadow-sm)"
          }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#6b1929", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <Receipt size={16} /> Financial Breakdown & Payout
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                <span>Items Subtotal:</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{formatCurrency(order.subtotal || order.totalAmount || 18500)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                <span>Shipping Fee:</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{order.shipping_cost ? formatCurrency(order.shipping_cost) : "FREE Express Shipping"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                <span>Platform Fee / Commission (0% Promo):</span>
                <span style={{ fontWeight: 600, color: "#059669" }}>₹0</span>
              </div>
              
              <div style={{ height: "1px", background: "var(--border-color)", margin: "6px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-primary)" }}>Net Seller Payout:</span>
                <span style={{ fontWeight: 800, fontSize: "1.35rem", color: "#6b1929" }}>
                  {formatCurrency(order.sellerEarnings || order.totalAmount || 18500)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Customer & Fulfillment Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Customer Profile Card */}
          <div style={{
            background: "#ffffff",
            border: "1px solid var(--border-color)",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "var(--shadow-sm)"
          }}>
            <h3 style={{ fontSize: "0.825rem", fontWeight: 800, color: "var(--color-gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
              <User size={14} /> Customer Information
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
              <div>
                <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.95rem" }}>{recipientName}</div>
                <div style={{ fontSize: "0.775rem", color: "var(--text-muted)", marginTop: "2px" }}>Verified Retail Buyer</div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)" }}>
                <Phone size={14} style={{ color: "#6b1929" }} />
                <a href={`tel:${phoneStr}`} style={{ color: "#6b1929", fontWeight: 600, textDecoration: "none" }}>{phoneStr}</a>
              </div>

              {order.customer_email && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)" }}>
                  <Mail size={14} style={{ color: "#6b1929" }} />
                  <span>{order.customer_email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Address Card */}
          <div style={{
            background: "#ffffff",
            border: "1px solid var(--border-color)",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "var(--shadow-sm)"
          }}>
            <h3 style={{ fontSize: "0.825rem", fontWeight: 800, color: "var(--color-gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
              <MapPin size={14} /> Fulfillment Address
            </h3>

            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{recipientName}</div>
              <p style={{ marginTop: "4px" }}>{addressStr}</p>
              <p>{cityStr}, {stateStr} - {postalStr}</p>
            </div>
          </div>

          {/* Express Shipping Helper Card */}
          <div style={{
            background: "linear-gradient(135deg, #fdfbf7 0%, #f7efe3 100%)",
            border: "1px solid rgba(184, 150, 62, 0.3)",
            borderRadius: "16px",
            padding: "20px"
          }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#6b1929", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Truck size={16} /> Courier Dispatch
            </h4>
            <p style={{ fontSize: "0.775rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Pack items securely in brand packaging and mark status as <strong>SHIPPED</strong> once dispatched with tracking info.
            </p>
            <button 
              className="btn-primary" 
              onClick={handlePrintInvoice}
              style={{ width: "100%", marginTop: "14px", fontSize: "0.8rem", padding: "8px" }}
            >
              <FileText size={14} style={{ marginRight: "6px", display: "inline" }} /> Print Dispatch Label
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
