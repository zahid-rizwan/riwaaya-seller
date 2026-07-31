"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import styles from "../auth.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    business_name: "",
    gst_number: "",
    pan: "",
    business_address: "",
    pickup_address: "",
    contact_phone: "",
    contact_email: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    account_holder: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple Validations
    if (!formData.username || !formData.email || !formData.password || !formData.business_name || !formData.gst_number || !formData.pan) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        business_name: formData.business_name,
        gst_number: formData.gst_number,
        pan: formData.pan,
        business_address: formData.business_address,
        pickup_address: formData.pickup_address || formData.business_address,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        bank_details: {
          bank_name: formData.bank_name,
          account_number: formData.account_number,
          ifsc_code: formData.ifsc_code,
          account_holder: formData.account_holder,
        },
      };

      // API call to register
      await api.post("/accounts/register/seller/", payload);

      // Upon success, redirect to login page with a success query parameter
      router.push("/login?registered=true");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to register. Please check input values.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container} style={{ minHeight: "130vh", padding: "40px 24px" }}>
      <div className={styles.card} style={{ maxWidth: "650px" }}>
        <div className={styles.logoArea}>
          <div className={styles.brand}>Riwaaya</div>
          <h2 className={styles.title}>Seller Registration</h2>
          <p className={styles.subtitle}>Register as a partner boutique to list your products</p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Account Credentials */}
          <h3 className={styles.sectionTitle}>Account Credentials</h3>
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label htmlFor="username">Username *</label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g. jameela_couture"
                required
                disabled={loading}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. seller@brand.com"
                required
                disabled={loading}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password *</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 8 characters"
              required
              disabled={loading}
            />
          </div>

          {/* Business Details */}
          <h3 className={styles.sectionTitle}>Business Details</h3>
          <div className={styles.formGroup}>
            <label htmlFor="business_name">Business Name *</label>
            <input
              id="business_name"
              type="text"
              value={formData.business_name}
              onChange={handleChange}
              placeholder="e.g. Riwaaya Ethnic Wear"
              required
              disabled={loading}
            />
          </div>
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label htmlFor="gst_number">GST Number *</label>
              <input
                id="gst_number"
                type="text"
                value={formData.gst_number}
                onChange={handleChange}
                placeholder="15-digit GSTIN"
                required
                disabled={loading}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="pan">PAN Card Number *</label>
              <input
                id="pan"
                type="text"
                value={formData.pan}
                onChange={handleChange}
                placeholder="10-digit PAN"
                required
                disabled={loading}
              />
            </div>
          </div>
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label htmlFor="contact_phone">Contact Phone *</label>
              <input
                id="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={handleChange}
                placeholder="10-digit phone"
                required
                disabled={loading}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="contact_email">Contact Email *</label>
              <input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={handleChange}
                placeholder="e.g. sales@brand.com"
                required
                disabled={loading}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="business_address">Business Address *</label>
            <textarea
              id="business_address"
              rows={2}
              value={formData.business_address}
              onChange={handleChange}
              placeholder="Full registered address"
              required
              disabled={loading}
            ></textarea>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="pickup_address">Warehouse / Pickup Address (Optional)</label>
            <textarea
              id="pickup_address"
              rows={2}
              value={formData.pickup_address}
              onChange={handleChange}
              placeholder="Leave blank to use Business Address"
              disabled={loading}
            ></textarea>
          </div>

          {/* Bank Details */}
          <h3 className={styles.sectionTitle}>Settlement Bank Details</h3>
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label htmlFor="bank_name">Bank Name</label>
              <input
                id="bank_name"
                type="text"
                value={formData.bank_name}
                onChange={handleChange}
                placeholder="e.g. HDFC Bank"
                disabled={loading}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="account_holder">Account Holder Name</label>
              <input
                id="account_holder"
                type="text"
                value={formData.account_holder}
                onChange={handleChange}
                placeholder="Full name as in bank"
                disabled={loading}
              />
            </div>
          </div>
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label htmlFor="account_number">Account Number</label>
              <input
                id="account_number"
                type="text"
                value={formData.account_number}
                onChange={handleChange}
                placeholder="Bank account number"
                disabled={loading}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="ifsc_code">IFSC Code</label>
              <input
                id="ifsc_code"
                type="text"
                value={formData.ifsc_code}
                onChange={handleChange}
                placeholder="e.g. HDFC0000123"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className={`${styles.submitBtn} btn-primary`}
            disabled={loading}
            style={{ marginTop: "20px" }}
          >
            {loading ? (
              <span className={styles.loadingSpinner}></span>
            ) : (
              "Submit Registration"
            )}
          </button>
        </form>

        <p className={styles.footerText}>
          Already registered?{" "}
          <Link href="/login" className={styles.link}>
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
