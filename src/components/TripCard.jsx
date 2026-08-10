import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { MapPin, Calendar, Phone } from 'lucide-react';

const PLACEHOLDER_IMAGE = '/placeholder.jpg';
const HK = "'Hanken Grotesk', sans-serif";

// Brand colors — matched to Trek Premi logo
const GOLD       = '#F5B301';   // logo gold/yellow
const GOLD_HOVER = '#e0a300';   // slightly deeper yellow hover
const DARK       = '#111111';   // near-black text
const MUTED      = '#6b7280';   // secondary text
const LIGHT      = '#f9f9f9';   // card background accent

const TripCard = ({ trip }) => {
  const [imageError, setImageError] = useState(false);
  const { id, title, price, images = [], nights = 1, days = nights + 1, location, availableDates = [], pickupLocations = [] } = trip;

  const imageUrl = (!imageError && images && images[0]) ? images[0] : PLACEHOLDER_IMAGE;

  const formatDateList = () => {
    const rawDates = [
      ...(availableDates || []),
      ...(pickupLocations || []).filter(p => p && p.date).map(p => p.date)
    ];

    if (rawDates.length === 0) return 'Dates available';

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const validDates = [...new Set(rawDates)]
      .map(dStr => {
        const dObj = new Date(dStr);
        return { raw: dStr, obj: dObj };
      })
      .filter(item => !isNaN(item.obj.getTime()) && item.obj >= now)
      .sort((a, b) => a.obj - b.obj);

    const targetList = validDates.length > 0
      ? validDates
      : [...new Set(rawDates)].map(dStr => ({ raw: dStr, obj: new Date(dStr) }));

    const formatted = targetList.slice(0, 3).map(item => {
      try {
        return new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric' }).format(item.obj);
      } catch { return item.raw; }
    });

    return targetList.length > 3 ? `${formatted.join(', ')}...` : formatted.join(', ');
  };

  const displayDates = formatDateList();
  const originalPrice = Math.round(price * 1.15);

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 12px 32px rgba(0,0,0,0.14)' }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        cursor: 'pointer',
        position: 'relative',
        fontFamily: HK,
        width: '100%',
        background: '#ffffff',
        borderRadius: '14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── IMAGE SECTION ── */}
      <Link
        to={`/trip/${id}`}
        style={{ display: 'block', position: 'relative', width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', lineHeight: 0, flexShrink: 0 }}
      >
        <motion.img
          src={imageUrl}
          alt={title}
          onError={() => setImageError(true)}
          loading="lazy"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />

        {/* GROUP TOUR BADGE */}
        <div style={{
          position: 'absolute', top: '10px', left: '10px',
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
          color: '#ffffff', padding: '7.5px 14px', borderRadius: '20px',
          fontFamily: HK, fontSize: '10px', fontWeight: '700', zIndex: 5,
          letterSpacing: '0.5px', lineHeight: '1',
        }}>
          Group Tour
        </div>
      </Link>

      {/* ── DAYS/NIGHTS BADGE – straddles image/content border ── */}
      <div style={{ position: 'relative', marginTop: '-15px', marginLeft: '10px', width: 'fit-content', zIndex: 6 }}>
        <div style={{
          background: GOLD, color: DARK,
          padding: '5px 12px', borderRadius: '20px',
          fontFamily: HK, fontSize: '11px', fontWeight: '800',
          boxShadow: '0 2px 8px rgba(245,179,1,0.35)',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          ⏱ {nights}N / {days}D
        </div>
      </div>

      {/* ── TITLE – single line with ellipsis ── */}
      <Link to={`/trip/${id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <h3 style={{
          margin: '12px 12px 0 12px',
          fontFamily: HK,
          fontSize: '16px',
          fontWeight: '800',
          color: DARK,
          lineHeight: '1.3',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {title}
        </h3>
      </Link>

      {/* ── INFO ROW: left (location / dates) | right (price) ── */}
      <div style={{
        display: 'flex', gap: '10px',
        padding: '10px 12px 12px 12px',
        alignItems: 'center',
        flex: 1,
      }}>
        {/* LEFT */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={15} style={{ color: GOLD, flexShrink: 0 }} />
            <span style={{
              fontFamily: HK, fontSize: '13px', fontWeight: '700', color: '#111111',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {location || 'Location'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={15} style={{ color: GOLD, flexShrink: 0 }} />
            <span style={{
              fontFamily: HK, fontSize: '13px', fontWeight: '600', color: '#222222',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {displayDates}
            </span>
          </div>
        </div>

        {/* DIVIDER */}
        <div style={{ width: '1px', height: '44px', background: '#ebebeb', flexShrink: 0 }} />

        {/* RIGHT – price */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0 }}>
          <span style={{
            fontFamily: HK, fontSize: '11px', fontWeight: '600',
            color: '#b0b0b0', textDecoration: 'line-through', textDecorationColor: '#e53935',
          }}>
            ₹{originalPrice.toLocaleString('en-IN')}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1px' }}>
            <span style={{ fontFamily: HK, fontSize: '12px', fontWeight: '700', color: DARK }}>₹</span>
            <span style={{ fontFamily: HK, fontSize: '20px', fontWeight: '900', color: DARK, lineHeight: 1 }}>
              {price?.toLocaleString('en-IN') || '0'}
            </span>
          </div>
          <span style={{ fontFamily: HK, fontSize: '10px', fontWeight: '500', color: '#aaa' }}>per person</span>
        </div>
      </div>

      {/* ── ACTION BUTTONS ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '0 12px 12px 12px',
      }}>
        {/* Call Button */}
        <a
          href="tel:+919156434444"
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '38px', height: '38px', borderRadius: '8px',
            background: '#ffffff', border: `2px solid ${GOLD}`, color: GOLD,
            cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
            textDecoration: 'none',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = GOLD; e.currentTarget.style.color = DARK; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = GOLD; }}
          title="Call us"
        >
          <Phone size={17} />
        </a>

        {/* More Details Button */}
        <Link to={`/trip/${id}`} style={{ textDecoration: 'none', flex: 1 }}>
          <button
            style={{
              width: '100%', padding: '10px 12px', borderRadius: '8px',
              background: GOLD, color: DARK, border: 'none',
              fontFamily: HK, fontSize: '12px', fontWeight: '800',
              cursor: 'pointer', transition: 'all 0.2s',
              letterSpacing: '0.3px',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = GOLD_HOVER; }}
            onMouseLeave={e => { e.currentTarget.style.background = GOLD; }}
          >
            More Details
          </button>
        </Link>
      </div>
    </motion.div>
  );
};

export default TripCard;
