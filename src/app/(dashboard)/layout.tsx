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
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
        <Loader2 className="animate-spin" size={40} color="#14b8a6" />
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>Loading Riwaaya dashboard...</p>
      </div>
    );
  }

  // Handle case where user is logged in but is not a seller
  if (user && user.role !== "SELLER") {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.errorBox}>
          <AlertCircle size={48} color="#ef4444" style={{ marginBottom: "16px" }} />
          <h3 className={styles.errorTitle}>Access Denied</h3>
          <p className={styles.errorText}>
            Your account ({user.username}) is registered as a {user.role}. This portal is exclusively for verified boutique partners.
          </p>
          <button className="btn-primary" onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
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
          <span className={styles.logo}>Riwaaya</span>
          <span className={styles.portalBadge}>Partner</span>
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

      {/* Main Panel */}
      <div className={styles.mainContent}>
        {/* Top Header */}
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
            <button style={{ background: "transparent", color: "var(--text-secondary)", border: "none", position: "relative" }}>
              <Bell size={20} />
              <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, background: "var(--color-primary)", borderRadius: "50%" }}></span>
            </button>

            <div style={{ height: "24px", width: "1px", background: "var(--border-color)" }}></div>

            <div className={styles.sellerProfileInfo}>
              <span className={styles.businessName}>{seller?.business_name || "Luxury Boutique"}</span>
              <span className={styles.username}>@{user?.username}</span>
            </div>

            <div className={styles.avatar}>
              {getInitials(seller?.business_name)}
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className={styles.pageContent}>
          {seller?.verification_status === "PENDING" && (
            <div className="card" style={{ borderLeft: "4px solid var(--color-warning)", marginBottom: "24px", display: "flex", gap: "16px", alignItems: "flex-start", background: "rgba(245,158,11,0.03)" }}>
              <AlertCircle color="var(--color-warning)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <h4 style={{ fontWeight: 600, color: "var(--color-warning)", marginBottom: "4px" }}>Boutique Review in Progress</h4>
                <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
                  Your business documents are currently being verified by the Riwaaya Admin team. You can pre-populate your products and configure pricing in the meantime, but they will not be visible on the customer site until your boutique status is approved.
                </p>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
