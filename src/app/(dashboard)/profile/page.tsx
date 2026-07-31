"use client";

import { useEffect, useState } from "react";
import { Loader2, User, Home, Landmark, ShieldCheck, Check } from "lucide-react";
import { api, SellerProfile } from "@/lib/api";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    business_name: "",
    contact_phone: "",
    contact_email: "",
    business_address: "",
    pickup_address: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    account_holder: "",
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await api.get<SellerProfile>("/sellers/me/");
      setProfile(data);
      
      if (data) {
        setFormData({
          business_name: data.business_name || "",
          contact_phone: data.contact_phone || "",
          contact_email: data.contact_email || "",
          business_address: data.business_address || "",
          pickup_address: data.pickup_address || "",
          bank_name: data.bank_details?.bank_name || "",
          account_number: data.bank_details?.account_number || "",
          ifsc_code: data.bank_details?.ifsc_code || "",
          account_holder: data.bank_details?.account_holder || "",
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load seller profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError("");

    try {
      const payload = {
        business_name: formData.business_name,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        business_address: formData.business_address,
        pickup_address: formData.pickup_address,
        bank_details: {
          bank_name: formData.bank_name,
          account_number: formData.account_number,
          ifsc_code: formData.ifsc_code,
          account_holder: formData.account_holder,
        },
      };

      const updated = await api.put<SellerProfile>("/sellers/me/", payload);
      setProfile(updated);
      setSuccess(true);
      
      // Auto-hide success message after 4s
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update profile details.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Loader2 className="animate-spin" size={32} color="#14b8a6" />
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Boutique Profile</h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            Configure your brand details, pickup coordinates, and settlement account
          </p>
        </div>
      </div>

      {success && (
        <div className={styles.noticeBox}>
          <Check size={18} color="var(--color-success)" />
          <span className={styles.noticeText}>Boutique profile has been updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="badge badge-rejected" style={{ width: "100%", padding: "12px", borderRadius: "8px", marginBottom: "20px", textTransform: "none", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        {/* Verification Status (Read-Only) */}
        <div className={styles.cardSection}>
          <h3 className={styles.sectionHeader}>
            <ShieldCheck size={16} style={{ verticalAlign: "middle", marginRight: "8px" }} />
            Regulatory Verification (Read-Only)
          </h3>
          
          <div className={styles.grid2}>
            <div className="formGroup">
              <label>GST Number</label>
              <input
                type="text"
                className={styles.readonlyField}
                value={profile?.gst_number || ""}
                disabled
              />
            </div>
            <div className="formGroup">
              <label>PAN Card</label>
              <input
                type="text"
                className={styles.readonlyField}
                value={profile?.pan || ""}
                disabled
              />
            </div>
          </div>

          <div className={styles.grid2}>
            <div className="formGroup">
              <label>Verification Status</label>
              <input
                type="text"
                className={styles.readonlyField}
                value={profile?.verification_status || ""}
                disabled
              />
            </div>
            <div className="formGroup">
              <label>Commission Rate</label>
              <input
                type="text"
                className={styles.readonlyField}
                value={`${profile?.commission_percentage}% sales commission`}
                disabled
              />
            </div>
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
            * Regulatory GSTIN, PAN, and commissions are locked after registration for tax compliance. Contact support to change these values.
          </p>
        </div>

        {/* Brand Details */}
        <div className={styles.cardSection}>
          <h3 className={styles.sectionHeader}>
            <User size={16} style={{ verticalAlign: "middle", marginRight: "8px" }} />
            Boutique Brand Details
          </h3>
          <div className="formGroup">
            <label htmlFor="business_name">Public Brand Name *</label>
            <input
              id="business_name"
              type="text"
              required
              value={formData.business_name}
              onChange={handleChange}
              disabled={saving}
            />
          </div>
          <div className={styles.grid2}>
            <div className="formGroup">
              <label htmlFor="contact_phone">Contact Phone *</label>
              <input
                id="contact_phone"
                type="text"
                required
                value={formData.contact_phone}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
            <div className="formGroup">
              <label htmlFor="contact_email">Contact Email *</label>
              <input
                id="contact_email"
                type="email"
                required
                value={formData.contact_email}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* Address Details */}
        <div className={styles.cardSection}>
          <h3 className={styles.sectionHeader}>
            <Home size={16} style={{ verticalAlign: "middle", marginRight: "8px" }} />
            Fulfillment Coordinates
          </h3>
          <div className="formGroup">
            <label htmlFor="business_address">Registered Office Address *</label>
            <textarea
              id="business_address"
              required
              rows={3}
              value={formData.business_address}
              onChange={handleChange}
              disabled={saving}
            ></textarea>
          </div>
          <div className="formGroup">
            <label htmlFor="pickup_address">Warehouse Pick-up Address *</label>
            <textarea
              id="pickup_address"
              required
              rows={3}
              value={formData.pickup_address}
              onChange={handleChange}
              disabled={saving}
            ></textarea>
          </div>
        </div>

        {/* Bank Details */}
        <div className={styles.cardSection} style={{ marginBottom: "12px" }}>
          <h3 className={styles.sectionHeader}>
            <Landmark size={16} style={{ verticalAlign: "middle", marginRight: "8px" }} />
            Payout Settlement Bank
          </h3>
          <div className={styles.grid2}>
            <div className="formGroup">
              <label htmlFor="bank_name">Bank Name</label>
              <input
                id="bank_name"
                type="text"
                value={formData.bank_name}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
            <div className="formGroup">
              <label htmlFor="account_holder">Account Holder</label>
              <input
                id="account_holder"
                type="text"
                value={formData.account_holder}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
          </div>
          <div className={styles.grid2}>
            <div className="formGroup">
              <label htmlFor="account_number">Account Number</label>
              <input
                id="account_number"
                type="text"
                value={formData.account_number}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
            <div className="formGroup">
              <label htmlFor="ifsc_code">IFSC Code</label>
              <input
                id="ifsc_code"
                type="text"
                value={formData.ifsc_code}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? <Loader2 className="animate-spin" size={16} /> : "Save Profile Details"}
          </button>
        </div>
      </form>
    </div>
  );
}
