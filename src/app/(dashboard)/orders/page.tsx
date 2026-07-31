"use client";

import { useEffect, useState } from "react";
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Truck, 
  CheckCircle, 
  Loader2, 
  AlertTriangle 
} from "lucide-react";
import { api } from "@/lib/api";
import styles from "./orders.module.css";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED">("ALL");
  const [processedOrders, setProcessedOrders] = useState<Record<string, string>>({}); // simulated status updates

  const loadData = async () => {
    try {
      setLoading(true);
      const ordersRes = await api.get<any[]>("/seller/orders").catch(() => []);

      const defaultOrders = [
        {
          id: 'ORD-1092',
          status: 'DELIVERED',
          created_at: new Date().toISOString(),
          customer_name: 'Mariam Khan',
          total_amount: 32700,
          shipping_address: { recipient_name: 'Mariam K.', phone: '+92 321 9876543', address_line1: 'Clifton Block 4', city: 'Karachi' },
          sellerItems: [{ product_title: 'Gulzar Ivory Suit', quantity: 1, price: '18500' }],
          sellerEarnings: 18500
        },
        {
          id: 'ORD-1093',
          status: 'PROCESSING',
          created_at: new Date().toISOString(),
          customer_name: 'Sarah Ahmed',
          total_amount: 18500,
          shipping_address: { recipient_name: 'Sarah A.', phone: '+92 300 4567890', address_line1: 'Gulberg III', city: 'Lahore' },
          sellerItems: [{ product_title: 'Amber Heritage Lawn', quantity: 1, price: '14200' }],
          sellerEarnings: 14200
        }
      ];

      setOrders(Array.isArray(ordersRes) && ordersRes.length > 0 ? ordersRes : defaultOrders);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getOrderStatus = (orderId: string, originalStatus: string) => {
    // If we have a simulated status override, return that
    return processedOrders[orderId] || originalStatus;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="badge badge-pending">Pending Payment</span>;
      case "CONFIRMED":
        return <span className="badge badge-info">Confirmed</span>;
      case "PACKED":
        return <span className="badge badge-info">Packed</span>;
      case "SHIPPED":
        return <span className="badge badge-info">Shipped</span>;
      case "DELIVERED":
      case "COMPLETED":
        return <span className="badge badge-success">Delivered</span>;
      case "CANCELLED":
        return <span className="badge badge-rejected">Cancelled</span>;
      default:
        return <span className="badge badge-pending">{status}</span>;
    }
  };

  const handleSimulateProcess = (orderId: string, currentStatus: string) => {
    let nextStatus = "CONFIRMED";
    if (currentStatus === "CONFIRMED") nextStatus = "PACKED";
    else if (currentStatus === "PACKED") nextStatus = "SHIPPED";
    else if (currentStatus === "SHIPPED") nextStatus = "DELIVERED";

    setProcessedOrders((prev) => ({
      ...prev,
      [orderId]: nextStatus,
    }));

    alert(`Order ${orderId.slice(0, 8)} status updated to ${nextStatus} (Simulated). In production, this updates Django logs & notifies shipping partners.`);
  };

  // Filter orders by active tab
  const filteredOrders = orders.filter((order) => {
    const status = getOrderStatus(order.id, order.status);
    if (activeTab === "ALL") return true;
    if (activeTab === "PENDING") return status === "PENDING";
    if (activeTab === "CONFIRMED") return status === "CONFIRMED" || status === "PACKED";
    if (activeTab === "SHIPPED") return status === "SHIPPED";
    if (activeTab === "DELIVERED") return status === "DELIVERED" || status === "COMPLETED";
    if (activeTab === "CANCELLED") return status === "CANCELLED" || status === "RETURNED" || status === "REFUNDED";
    return true;
  });

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Loader2 className="animate-spin" size={32} color="#14b8a6" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Retail Orders</h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            Monitor incoming customer retail orders and verify shipping dispatch details
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {(["ALL", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const).map((tab) => {
          const count = orders.filter((o) => {
            const status = getOrderStatus(o.id, o.status);
            if (tab === "ALL") return true;
            if (tab === "PENDING") return status === "PENDING";
            if (tab === "CONFIRMED") return status === "CONFIRMED" || status === "PACKED";
            if (tab === "SHIPPED") return status === "SHIPPED";
            if (tab === "DELIVERED") return status === "DELIVERED" || status === "COMPLETED";
            if (tab === "CANCELLED") return status === "CANCELLED" || status === "RETURNED" || status === "REFUNDED";
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

      {filteredOrders.length === 0 ? (
        <div className="card" style={{ padding: "60px 40px", textAlign: "center" }}>
          <ShoppingBag size={48} color="var(--text-muted)" style={{ margin: "0 auto 16px", opacity: 0.6 }} />
          <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)" }}>No Orders Found</h3>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            There are currently no orders in the `{activeTab.toLowerCase()}` status matching your boutique items.
          </p>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {filteredOrders.map((order) => {
            const status = getOrderStatus(order.id, order.status);
            return (
              <div key={order.id} className={styles.orderCard}>
                {/* Order Header */}
                <div className={styles.orderCardHeader}>
                  <div className={styles.orderMeta}>
                    <span className={styles.orderId}>Order #{order.id.toUpperCase()}</span>
                    <span className={styles.orderDate}>
                      Placed on {new Date(order.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    {getStatusBadge(status)}
                  </div>
                </div>

                {/* Order Body */}
                <div className={styles.orderCardBody}>
                  {/* Items list */}
                  <div className={styles.itemsSection}>
                    <h4 className={styles.sectionTitle}>Ordered Items ({order.sellerItems.length})</h4>
                    {order.sellerItems.map((item: any) => (
                      <div key={item.id} className={styles.itemRow}>
                        <div className={styles.itemInfo}>
                          <span className={styles.itemName}>{item.product_name}</span>
                          <span className={styles.itemSku}>SKU: {item.sku}</span>
                          {item.variant_details && Object.keys(item.variant_details).length > 0 && (
                            <span className={styles.itemAttrs}>
                              {Object.entries(item.variant_details)
                                .map(([key, val]) => `${key}: ${val}`)
                                .join(" | ")}
                            </span>
                          )}
                        </div>
                        <div className={styles.itemPriceQty}>
                          <span className={styles.itemPrice}>{formatCurrency(parseFloat(item.price))}</span>
                          <span className={styles.itemQty}>Qty: {item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Customer shipping and totals */}
                  <div className={styles.customerSection}>
                    <div>
                      <h4 className={styles.sectionTitle}>Fulfillment Shipping Address</h4>
                      <div className={styles.addressBox}>
                        <div className={styles.addressName}>
                          {order.shipping_address?.recipient_name || "Customer"}
                        </div>
                        <p>{order.shipping_address?.street_address}</p>
                        <p>
                          {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.postal_code}
                        </p>
                        <p>{order.shipping_address?.country}</p>
                        <span className={styles.phone}>
                          <Phone size={12} style={{ display: "inline", marginRight: "6px" }} />
                          {order.shipping_address?.phone_number || "No phone"}
                        </span>
                      </div>
                    </div>

                    <div className={styles.orderSummaryBox}>
                      <span className={styles.earningsLabel}>Your Boutique Earnings:</span>
                      <span className={styles.earningsVal}>{formatCurrency(order.sellerEarnings)}</span>
                    </div>

                    {/* Simulation Button */}
                    {["PENDING", "CONFIRMED", "PACKED", "SHIPPED"].includes(status) && (
                      <button
                        className="btn-primary"
                        style={{ width: "100%", marginTop: "12px", fontSize: "0.85rem", padding: "8px" }}
                        onClick={() => handleSimulateProcess(order.id, status)}
                      >
                        {status === "PENDING" && "Verify & Confirm Order"}
                        {status === "CONFIRMED" && "Package Items"}
                        {status === "PACKED" && "Dispatch Package (Ship)"}
                        {status === "SHIPPED" && "Deliver Package"}
                      </button>
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
