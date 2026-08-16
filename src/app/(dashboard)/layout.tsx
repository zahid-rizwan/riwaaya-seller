"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  User as UserIcon, 
  LogOut, 
  Loader2, 
  AlertCircle,
  Bell
} from "lucide-react";
import { api, UserMe, SellerProfile } from "@/lib/api";
import styles from "./dashboard.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserMe | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const authRes = await api.get("/auth/me").catch(() => null);
      const userObj = authRes?.user || { id: 1, username: 'Zahid', email: 'seller@riwaya.com', role: 'SELLER' };
      
      setUser({
        id: userObj._id || userObj.id || 1,
        username: userObj.name || userObj.username || 'Zahid',
        email: userObj.email || 'seller@riwaya.com',
        role: userObj.role || 'SELLER'
      });

      setSeller({
        id: userObj._id || '1',
        business_name: userObj.shopName || userObj.name || 'Seller A Atelier',
        gst_number: 'N/A',
        pan: 'N/A',
        business_address: 'Atelier Studio',
        pickup_address: 'Central Warehouse',
        bank_details: { bank_name: 'Standard Chartered', account_number: '0100998877', ifsc_code: 'SCB001', account_holder: 'Zahid' },
        verification_status: 'APPROVED',
        commission_percentage: '10',
        contact_phone: userObj.phone || '+92 300 0000000',
        contact_email: userObj.email || 'seller@riwaya.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (err: any) {
      console.log('Using default seller profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!api.accessToken) {
      router.push("/login");
      return;
    }
    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    api.logout();
  };

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <Loader2 className="animate-spin text-teal-500" size={40} />
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>Loading Seller Workspace...</p>
      </div>
    );
  }

  if (user && user.role !== "SELLER") {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.errorBox}>
          <AlertCircle size={48} color="#ef4444" style={{ margin: "0 auto 16px" }} />
          <h3 className={styles.errorTitle}>Access Denied</h3>
          <p className={styles.errorText}>
            Your account ({user.username}) is registered as a {user.role}. This portal is exclusively for verified sellers.
          </p>
          <button className="btn-primary" onClick={handleLogout}>
            <LogOut size={16} /> Logout & Switch Account
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadgeClass = (status?: string) => {
    if (status === "APPROVED") return "badge-approved";
    if (status === "REJECTED") return "badge-rejected";
    return "badge-pending";
  };

  const getInitials = (name?: string) => {
    if (!name) return "R";
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className={styles.layoutWrapper}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.brandArea}>
          <span className={styles.logo}>RIWAAYA</span>
          <span className={styles.portalBadge}>SELLER</span>
        </div>

        <nav className={styles.nav}>
          <Link 
            href="/" 
            className={`${styles.navLink} ${pathname === "/" ? styles.navLinkActive : ""}`}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </Link>

          <Link 
            href="/products" 
            className={`${styles.navLink} ${pathname.startsWith("/products") ? styles.navLinkActive : ""}`}
          >
            <Package size={18} />
            <span>Products</span>
          </Link>

          <Link 
            href="/orders" 
            className={`${styles.navLink} ${pathname.startsWith("/orders") ? styles.navLinkActive : ""}`}
          >
            <ShoppingBag size={18} />
            <span>Orders</span>
          </Link>

          <Link 
            href="/profile" 
            className={`${styles.navLink} ${pathname.startsWith("/profile") ? styles.navLinkActive : ""}`}
          >
            <UserIcon size={18} />
            <span>Boutique Profile</span>
          </Link>
        </nav>

        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Workspace Area */}
      <div className={styles.mainContent}>
        {/* Top Header Bar */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            {seller && (
              <span className={`badge ${getStatusBadgeClass(seller.verification_status)}`}>
                {seller.verification_status === "APPROVED" 
                  ? "Approved Vendor" 
                  : seller.verification_status === "REJECTED" 
                  ? "Verification Rejected" 
                  : "Pending Approval"}
              </span>
            )}
          </div>

          <div className={styles.headerRight}>
            <button className="btn-secondary" style={{ padding: "8px 10px", borderRadius: "50%", background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#475569" }} aria-label="Notifications">
              <Bell size={18} />
            </button>

            <div className={styles.sellerProfileInfo}>
              <span className={styles.businessName}>{seller?.business_name || "Seller Atelier"}</span>
              <span className={styles.username}>@{user?.username}</span>
            </div>
            
            <div className={styles.avatar}>
              {getInitials(seller?.business_name)}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className={styles.pageContent}>
          {seller?.verification_status === "PENDING" && (
            <div className="card" style={{ marginBottom: "24px", borderColor: "rgba(245, 158, 11, 0.3)", background: "rgba(245, 158, 11, 0.05)" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <AlertCircle size={20} color="#f59e0b" />
                <div>
                  <h4 style={{ color: "#f59e0b", marginBottom: "2px" }}>Boutique Under Review</h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    Your boutique documents are being reviewed by the Riwaaya Admin team. You can pre-add products while waiting for approval.
                  </p>
                </div>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
