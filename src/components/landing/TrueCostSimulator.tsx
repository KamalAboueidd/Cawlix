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
        background: 'transparent',
        border: 'none',
        borderRadius: 0,
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        boxShadow: 'none',
        width: '100%',
      }}
    >
      {/* Receipt Header */}
      <div
        style={{
          padding: '12px 0',
          background: 'transparent',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <span style={{ color: '#737373', fontSize: '0.6875rem', display: 'block', letterSpacing: '0.04em' }}>
            TRANSACTION AUDIT
          </span>
          <span style={{ color: '#FFFFFF', fontWeight: 500, fontSize: '0.875rem' }}>
            Apple MacBook Pro 14" M3 (16GB / 512GB)
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: '#3ECF8E',
              fontSize: '0.6875rem',
            }}
          >
            <ShieldCheck size={13} />
            Verified Clean
          </span>
        </div>
      </div>

      {/* Interactive Controls */}
      <div
        style={{
          padding: '12px 0',
          background: 'transparent',
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
            background: applyVoucher ? 'rgba(62, 207, 142, 0.12)' : '#141414',
            border: 'none',
            color: applyVoucher ? '#3ECF8E' : '#737373',
            padding: '5px 10px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            cursor: 'pointer',
            transition: 'all 120ms ease',
          }}
        >
          <Tag size={11} />
          Promo Voucher (-4%)
        </button>

        <button
          onClick={() => setApplyCashback((c) => !c)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: applyCashback ? 'rgba(62, 207, 142, 0.12)' : '#141414',
            border: 'none',
            color: applyCashback ? '#3ECF8E' : '#737373',
            padding: '5px 10px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            cursor: 'pointer',
            transition: 'all 120ms ease',
          }}
        >
          <CreditCard size={11} />
          NBE Visa Cashback (5%)
        </button>

        <button
          onClick={() => setPaymentGateway((g) => (g === 'card' ? 'valu' : 'card'))}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: paymentGateway === 'valu' ? '#1A1A1A' : '#141414',
            border: 'none',
            color: '#EDEDED',
            padding: '5px 10px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            cursor: 'pointer',
          }}
        >
          Method: {paymentGateway.toUpperCase()}
        </button>
      </div>

      {/* Ledger Rows */}
      <div style={{ padding: '14px 0', display: 'flex', flexDirection: 'column', gap: '9px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#737373' }}>
          <span>Base Shelf Price</span>
          <span style={{ color: '#D4D4D4' }}>EGP {basePrice.toLocaleString()}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: applyVoucher ? '#3ECF8E' : '#555555' }}>
          <span>Applied Voucher Code (-4%)</span>
          <span>{applyVoucher ? `-EGP ${voucherDiscount.toLocaleString()}` : '— (Disabled)'}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: applyCashback ? '#3ECF8E' : '#555555' }}>
          <span>Card Cashback (NBE Visa Platinum 5%)</span>
          <span>{applyCashback ? `-EGP ${cashbackDiscount.toLocaleString()}` : '— (Disabled)'}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#737373' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Truck size={12} />
            Mandatory Insured Courier
          </span>
          <span style={{ color: '#D4D4D4' }}>+EGP {shippingFee.toLocaleString()}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#737373' }}>
          <span>ValU 0% Admin Processing Surcharge</span>
          <span style={{ color: '#3ECF8E' }}>+EGP 0</span>
        </div>
      </div>

      {/* Execution Summary Footer */}
      <div
        style={{
          padding: '14px 0',
          background: 'transparent',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <div>
          <span style={{ color: '#737373', fontSize: '0.6875rem', display: 'block', textTransform: 'uppercase' }}>
            Final Executed Out-of-Pocket
          </span>
          <span style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
            EGP {finalOutOfPocket.toLocaleString()}
          </span>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ color: '#3ECF8E', fontWeight: 500, fontSize: '0.875rem' }}>
            Net Savings: EGP {netSavings.toLocaleString()}
          </span>
          <span style={{ color: '#666666', fontSize: '0.6875rem', display: 'block', marginTop: '2px' }}>
            148ms avg response
          </span>
        </div>
      </div>
    </div>
  );
}
