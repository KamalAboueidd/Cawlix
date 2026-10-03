import React, { useState } from 'react';
import { CreditCard, Tag, ShieldCheck, Truck, Check } from 'lucide-react';

export default function TrueCostSimulator() {
  const [applyVoucher, setApplyVoucher] = useState(true);
  const [applyCashback, setApplyCashback] = useState(true);
  const [paymentGateway, setPaymentGateway] = useState<'card' | 'valu'>('card');

  const basePrice = 94500;
  const voucherDiscount = applyVoucher ? 3780 : 0;
  const cashbackDiscount = applyCashback ? 4536 : 0;
  const shippingFee = 150;
  const valuSurcharge = paymentGateway === 'valu' ? 0 : 0;

  const finalOutOfPocket = basePrice - voucherDiscount - cashbackDiscount + shippingFee + valuSurcharge;
  const netSavings = basePrice - finalOutOfPocket;

  return (
    <div
      style={{
        background: '#121212',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        overflow: 'hidden',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        boxShadow: '0 20px 48px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Receipt Header */}
      <div
        style={{
          padding: '14px 18px',
          background: '#161616',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <span style={{ color: '#888888', fontSize: '0.6875rem', display: 'block', letterSpacing: '0.04em' }}>
            TRANSACTION AUDIT
          </span>
          <span style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.8125rem' }}>
            Apple MacBook Pro 14" M3 (16GB / 512GB)
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '4px',
              background: 'rgba(62, 207, 142, 0.1)',
              color: '#3ECF8E',
              border: '1px solid rgba(62, 207, 142, 0.25)',
              fontSize: '0.6875rem',
            }}
          >
            <ShieldCheck size={11} />
            RECONCILED
          </span>
        </div>
      </div>

      {/* Interactive Controls */}
      <div
        style={{
          padding: '12px 18px',
          background: '#0E0E0E',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setApplyVoucher((v) => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: applyVoucher ? 'rgba(62, 207, 142, 0.12)' : '#161616',
            border: '1px solid',
            borderColor: applyVoucher ? 'rgba(62, 207, 142, 0.4)' : 'rgba(255, 255, 255, 0.08)',
            color: applyVoucher ? '#3ECF8E' : '#777777',
            padding: '4px 10px',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            cursor: 'pointer',
            transition: 'all 120ms ease',
          }}
        >
          <Tag size={11} />
          PROMO VOUCHER (-4%)
        </button>

        <button
          onClick={() => setApplyCashback((c) => !c)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: applyCashback ? 'rgba(62, 207, 142, 0.12)' : '#161616',
            border: '1px solid',
            borderColor: applyCashback ? 'rgba(62, 207, 142, 0.4)' : 'rgba(255, 255, 255, 0.08)',
            color: applyCashback ? '#3ECF8E' : '#777777',
            padding: '4px 10px',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            cursor: 'pointer',
            transition: 'all 120ms ease',
          }}
        >
          <CreditCard size={11} />
          NBE VISA CASHBACK (5%)
        </button>

        <button
          onClick={() => setPaymentGateway((g) => (g === 'card' ? 'valu' : 'card'))}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: paymentGateway === 'valu' ? '#1E1E1E' : '#161616',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#EDEDED',
            padding: '4px 10px',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            cursor: 'pointer',
          }}
        >
          METHOD: {paymentGateway.toUpperCase()}
        </button>
      </div>

      {/* Ledger Rows */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888888' }}>
          <span>Base Shelf Price</span>
          <span style={{ color: '#D4D4D4' }}>EGP {basePrice.toLocaleString()}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: applyVoucher ? '#3ECF8E' : '#555555' }}>
          <span>Applied Voucher Code (-4%)</span>
          <span>{applyVoucher ? `-EGP ${voucherDiscount.toLocaleString()}` : '— (DISABLED)'}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: applyCashback ? '#3ECF8E' : '#555555' }}>
          <span>Card Cashback (NBE Visa Platinum 5%)</span>
          <span>{applyCashback ? `-EGP ${cashbackDiscount.toLocaleString()}` : '— (DISABLED)'}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888888' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Truck size={12} />
            Mandatory Insured Courier
          </span>
          <span style={{ color: '#D4D4D4' }}>+EGP {shippingFee.toLocaleString()}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888888' }}>
          <span>ValU 0% Admin Processing Surcharge</span>
          <span style={{ color: '#3ECF8E' }}>+EGP 0</span>
        </div>
      </div>

      {/* Execution Summary Footer */}
      <div
        style={{
          padding: '14px 18px',
          background: '#0B0B0B',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <span style={{ color: '#777777', fontSize: '0.6875rem', display: 'block', textTransform: 'uppercase' }}>
            Final Executed Out-of-Pocket
          </span>
          <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1.0625rem', letterSpacing: '-0.02em' }}>
            EGP {finalOutOfPocket.toLocaleString()}
          </span>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ color: '#3ECF8E', fontWeight: 600, fontSize: '0.8125rem' }}>
            Net Savings: EGP {netSavings.toLocaleString()}
          </span>
          <span style={{ color: '#666666', fontSize: '0.625rem', display: 'block', marginTop: '2px' }}>
            LATENCY: 148MS RECONCILED
          </span>
        </div>
      </div>
    </div>
  );
}
