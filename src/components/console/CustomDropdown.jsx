import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * CustomPitchBlackDropdown
 * Premium Vercel/Linear-inspired dropdown replacing raw browser <select> elements.
 * Pitch-black background (#000000), subtle border (#1F1F1F), zero default OS blue selection.
 */
export default function CustomDropdown({
  value,
  onChange,
  options = [],
  placeholder = '',
  style = {},
  menuStyle = {},
  isRtl = false,
  minWidth = '160px',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'relative',
        display: 'inline-block',
        minWidth: minWidth,
        ...style,
      }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          backgroundColor: '#000000',
          border: isOpen ? '1px solid #383838' : '1px solid #1F1F1F',
          color: '#EDEDED',
          fontSize: '0.75rem',
          padding: '6px 10px',
          borderRadius: '6px',
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 120ms ease',
          fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
          direction: isRtl ? 'rtl' : 'ltr',
          textAlign: isRtl ? 'right' : 'left',
          userSelect: 'none',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.borderColor = '#2A2A2A';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.borderColor = '#1F1F1F';
        }}
      >
        <span
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: selectedOption ? '#EDEDED' : '#888888',
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={13}
          color="#888888"
          style={{
            flexShrink: 0,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 150ms ease',
          }}
        />
      </button>

      {/* Floating Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            [isRtl ? 'right' : 'left']: 0,
            minWidth: '100%',
            width: 'max-content',
            maxWidth: '320px',
            backgroundColor: '#000000',
            border: '1px solid #1F1F1F',
            borderRadius: '6px',
            padding: '4px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.04)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
            direction: isRtl ? 'rtl' : 'ltr',
            ...menuStyle,
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  color: isSelected ? '#10B981' : '#EDEDED',
                  backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                  fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'background-color 100ms ease, color 100ms ease',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#111111';
                    e.currentTarget.style.color = '#FFFFFF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#EDEDED';
                  }
                }}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={12} color="#10B981" style={{ flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
