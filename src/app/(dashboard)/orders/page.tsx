"use client";

import { useEffect, useState } from "react";
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Truck, 
  CheckCircle, 
  Loader2, 
  AlertTriangle,
  RefreshCw,
  ChevronDown
} from "lucide-react";
import { api } from "@/lib/api";
import styles from "./orders.module.css";

export interface OrderItem {
  id?: string;
  product_title: string;
  quantity: number;
  price: number | string;
  image?: string;
  size?: string;
  color?: string;
}

export interface SellerOrder {
  _id?: string;
  id: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | string;
  createdAt?: string;
  created_at?: string;
  customer_name?: string;
  totalAmount?: number;
  total_amount?: number;
  shippingAddress?: {
    recipientName?: string;
    phone?: string;
    address?: string;
    city?: string;
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
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED">("ALL");

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
          totalAmount: 32700,
          shippingAddress: {
            recipientName: 'Mariam K.',
            phone: '+91 9876543210',
            address: 'Block 4, Clifton Atelier',
            city: 'Karachi',
            postalCode: '75600'
          },
          sellerItems: [{ id: '1', product_title: 'Gulzar Ivory Velvet Suit', quantity: 1, price: 18500, size: 'M', color: 'Ivory' }],
          sellerEarnings: 18500
        },
        {
          id: 'ORD-1093',
          status: 'PROCESSING',
          createdAt: new Date().toISOString(),
          customer_name: 'Sarah Ahmed',
          totalAmount: 18500,
          shippingAddress: {
            recipientName: 'Sarah A.',
            phone: '+91 9812345678',
            address: 'Gulberg III, Avenue 9',
            city: 'Lahore',
            postalCode: '54000'
          },
          sellerItems: [{ id: '2', product_title: 'Amber Heritage Lawn Suit', quantity: 1, price: 14200, size: 'S', color: 'Gold' }],
          sellerEarnings: 14200
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
        return <span className="badge badge-pending">Pending</span>;
      case "PROCESSING":
      case "CONFIRMED":
      case "PACKED":
        return <span className="badge badge-info">Processing</span>;
      case "SHIPPED":
        return <span className="badge badge-info">Shipped</span>;
      case "DELIVERED":
      case "COMPLETED":
        return <span className="badge badge-success">Delivered</span>;
      case "CANCELLED":
      case "REJECTED":
        return <span className="badge badge-danger">Cancelled</span>;
      default:
        return <span className="badge badge-pending">{status}</span>;
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/seller/orders/${orderId}/status`, { status: newStatus }).catch(() => null);

      // Update state locally
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

  const filteredOrders = orders.filter((order) => {
    const status = (order.status || "").toUpperCase();
    if (activeTab === "ALL") return true;
    if (activeTab === "PENDING") return status === "PENDING";
    if (activeTab === "PROCESSING") return status === "PROCESSING" || status === "CONFIRMED" || status === "PACKED";
    if (activeTab === "SHIPPED") return status === "SHIPPED";
    if (activeTab === "DELIVERED") return status === "DELIVERED" || status === "COMPLETED";
    if (activeTab === "CANCELLED") return status === "CANCELLED" || status === "REJECTED";
    return true;
  });

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", flexDirection: "column", gap: "12px" }}>
        <Loader2 className="animate-spin text-[#6b1929]" size={36} />
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Fetching Retail Orders...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Retail Orders</h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            Manage customer retail orders, inspect shipping details, and update dispatch status
          </p>
        </div>
        <button 
          className="btn-secondary" 
          onClick={loadData}
          style={{ fontSize: "0.85rem", padding: "8px 16px" }}
        >
          <RefreshCw size={14} /> Refresh List
        </button>
      </div>

      {/* Navigation Filter Tabs */}
      <div className={styles.tabs}>
        {(["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const).map((tab) => {
          const count = orders.filter((o) => {
            const status = (o.status || "").toUpperCase();
            if (tab === "ALL") return true;
            if (tab === "PENDING") return status === "PENDING";
            if (tab === "PROCESSING") return status === "PROCESSING" || status === "CONFIRMED" || status === "PACKED";
            if (tab === "SHIPPED") return status === "SHIPPED";
            if (tab === "DELIVERED") return status === "DELIVERED" || status === "COMPLETED";
            if (tab === "CANCELLED") return status === "CANCELLED" || status === "REJECTED";
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

      {/* Orders List / Empty State */}
      {filteredOrders.length === 0 ? (
        <div className="card" style={{ padding: "60px 20px", textAlign: "center" }}>
          <ShoppingBag size={48} color="#b8963e" style={{ margin: "0 auto 16px", opacity: 0.5 }} />
          <h3 style={{ fontSize: "1.15rem", color: "var(--text-primary)", fontWeight: 700 }}>No Orders Found</h3>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "6px" }}>
            There are currently no orders in the status `<span className="lowercase">{activeTab}</span>`.
          </p>
        </div>
      ) : (
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

                    {/* Change Status Dropdown Selector */}
                    <div style={{ position: "relative" }}>
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
                    </div>
                  </div>
                </div>

                {/* Order Body */}
                <div className={styles.orderCardBody}>
                  {/* Items section */}
                  <div className={styles.itemsSection}>
                    <h4 className={styles.sectionTitle}>Boutique Ordered Items ({items.length})</h4>
                    {items.map((item, idx) => (
                      <div key={idx} className={styles.itemRow}>
                        <div className={styles.itemInfo}>
                          <span className={styles.itemName}>{item.product_title || 'Embroidered Pakistani Suit'}</span>
                          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                            {item.size && <span className={styles.itemAttrs}>Size: {item.size}</span>}
                            {item.color && <span className={styles.itemAttrs}>Color: {item.color}</span>}
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

                    {/* Quick Step Status Progression Button */}
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
