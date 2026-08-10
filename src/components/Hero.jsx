import { useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Compass, PhoneCall } from 'lucide-react';
import { easings } from './animations';

// Count-up hook
const useCountUp = (target, duration = 2, delay = 1) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      const controls = animate(0, target, {
        duration,
        ease: 'easeOut',
        onUpdate: (v) => setCount(Math.floor(v)),
      });
      return () => controls.stop();
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [target, duration, delay]);
  return count;
};

const formatCount = (n, target) => {
  if (target >= 1000) {
    const k = n / 1000;
    return (k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)) + 'k';
  }
  return n;
};

// Typing animation component
const TypingText = ({ text }) => {
  const [displayed, setDisplayed] = useState('');
  const [phase, setPhase] = useState('typing'); // typing | pause | deleting

  useEffect(() => {
    let timeout;
    if (phase === 'typing') {
      if (displayed.length < text.length) {
        timeout = setTimeout(() => setDisplayed(text.slice(0, displayed.length + 1)), 55);
      } else {
        timeout = setTimeout(() => setPhase('pause'), 2200);
      }
    } else if (phase === 'pause') {
      timeout = setTimeout(() => setPhase('deleting'), 500);
    } else if (phase === 'deleting') {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(text.slice(0, displayed.length - 1)), 28);
      } else {
        timeout = setTimeout(() => setPhase('typing'), 600);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayed, phase, text]);

  return (
    <span>
      {displayed}
      <span className="inline-block w-0.5 h-3.5 sm:h-4 bg-[#F5B301] ml-0.5 align-middle animate-pulse" />
    </span>
  );
};

const StatItem = ({ icon, target, suffix, label, delay }) => {
  const count = useCountUp(target, 2, delay);
  const display = target >= 1000 ? formatCount(count, target) : count;
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2.5 text-center sm:text-left">
      {icon}
      <div>
        <motion.div
          className="text-white font-black text-xs sm:text-base md:text-lg leading-tight tabular-nums"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay, duration: 0.4 }}
        >
          {display}{suffix}
        </motion.div>
        <div className="text-white/75 text-[8px] sm:text-xs font-semibold truncate">{label}</div>
      </div>
    </div>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden pt-16 sm:pt-24 pb-4 sm:pb-6" style={{ background: '#0a0a0a', isolation: 'isolate' }}>

      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1551632811-561732d1e306?w=2070&q=80')",
          willChange: 'transform',
          transform: 'translateZ(0)'
        }}
      />

      {/* Dark Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/85" />

      {/* Center Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-3 sm:px-6 my-auto">

        {/* Brand Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: easings.premium }}
          className="mb-3 sm:mb-5"
        >
          <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 mx-auto rounded-full bg-white p-1.5 shadow-[0_0_35px_rgba(245,179,1,0.5)] border-2 border-amber-400">
            <img src="/trek_premi.png" alt="Trek Premi" className="w-full h-full object-contain" />
          </div>
        </motion.div>

        {/* Headline Tagline */}
        <motion.div
          className="mb-3 sm:mb-4"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.35, ease: easings.premium }}
        >
          <h1 className="leading-tight">
            <span
              className="block text-2xl sm:text-4xl md:text-6xl font-extrabold text-white tracking-tight"
              style={{ textShadow: '0 2px 14px rgba(0,0,0,0.6)' }}
            >
              Discover the
            </span>
            <span
              className="block text-5xl sm:text-7xl md:text-9xl font-black leading-none tracking-tight text-[#F5B301]"
              style={{ textShadow: '0 4px 22px rgba(245,179,1,0.6)' }}
            >
              World
            </span>
            <span
              className="block text-base sm:text-2xl md:text-3xl font-semibold text-white/90 tracking-[0.2em] uppercase mt-0.5"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
            >
              with us
            </span>
          </h1>
        </motion.div>

        {/* Typing Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-[11px] sm:text-sm md:text-base text-white/90 max-w-xs sm:max-w-md mx-auto font-medium tracking-wide leading-relaxed min-h-[2.2em] mb-4 sm:mb-6 px-2"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}
        >
          <TypingText text="Adventure Starts With One Step — Let's Take It Together" />
        </motion.div>

      </div>

      {/* Stats bar (Fits perfectly at bottom on all screens) */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 1.2, ease: easings.premium }}
        className="relative z-10 mx-2 sm:mx-8 md:mx-16 lg:mx-24 mt-3"
      >
        <div
          className="grid grid-cols-3 gap-1 sm:gap-4 rounded-xl sm:rounded-2xl px-2 py-2.5 sm:px-6 sm:py-4 border border-white/10"
          style={{ background: 'rgba(15,60,55,0.94)', backdropFilter: 'blur(14px)' }}
        >
          <StatItem delay={1.3} target={100} suffix="+" label="Google Reviews" icon={
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white flex items-center justify-center shadow flex-shrink-0">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>} />

          <StatItem delay={1.5} target={5300} suffix="+" label="Instagram Followers" icon={
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow flex-shrink-0" style={{ background: 'radial-gradient(circle at 30% 107%, #FDE68A 0%, #FDE68A 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}>
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </div>} />

          <StatItem delay={1.7} target={10000} suffix="+" label="Happy Customers" icon={
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#F5B301] flex items-center justify-center shadow flex-shrink-0">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
              </div>} />
        </div>
      </motion.div>

    </section>
  );
};

export default Hero;
