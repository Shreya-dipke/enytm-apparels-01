import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Minus,
  Plus,
  Trash2,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  User,
  Package,
  LogOut,
  LockKeyhole,
  CheckCircle,
  Eye,
  EyeOff,
  Play,
  VolumeX,
  Pencil,
  MapPin,
  CalendarDays,
  Tag,
  Sparkles,
  ZoomIn,
  HelpCircle,
  FileText,
  AlertCircle,
  Info,
  ExternalLink,
  ShieldAlert,
  Check,
  SlidersHorizontal,
  ShoppingCart,
  Camera,
  LayoutGrid,
  List
} from "lucide-react";
import { useCart } from "./context/CartContext";
import { api } from "./api";
import "./index.css";

let globalProductsCache = (() => {
  try {
    const saved = localStorage.getItem("enytm_products_cache");
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
})();

function useProducts() {
  const [p, setP] = useState(globalProductsCache || []);
  const [loading, setLoading] = useState(!globalProductsCache);

  useEffect(() => {
    let active = true;
    api("/products")
      .then(data => {
        const rawList = Array.isArray(data)
          ? data
          : (data && Array.isArray(data.products) ? data.products : []);
        const seen = new Set();
        const list = [];
        for (const item of rawList) {
          const id = item?.id !== undefined && item?.id !== null ? String(item.id) : (item?._id ? String(item._id) : null);
          if (item && id && !seen.has(id)) {
            seen.add(id);
            list.push({ ...item, id: item.id ?? id });
          }
        }
        globalProductsCache = list;
        try {
          localStorage.setItem("enytm_products_cache", JSON.stringify(list));
        } catch (e) { }
        if (active) {
          setP(list);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const result = Array.isArray(p) ? [...p] : [];
  result.loading = loading;
  return result;
}

export function normalizeImageUrl(url) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();

  // Google Drive file link formats:
  // - https://drive.google.com/file/d/<FILE_ID>/view...
  // - https://drive.google.com/open?id=<FILE_ID>
  // - https://drive.google.com/uc?id=<FILE_ID>...
  // - https://drive.google.com/uc?export=view&id=<FILE_ID>
  const gDriveMatch = trimmed.match(/drive\.google\.com\/(?:file\/d\/([a-zA-Z0-9_-]+)|open\?id=([a-zA-Z0-9_-]+)|uc\?(?:.*&)?id=([a-zA-Z0-9_-]+))/i);
  if (gDriveMatch) {
    const fileId = gDriveMatch[1] || gDriveMatch[2] || gDriveMatch[3];
    if (fileId) {
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }

  // Dropbox share link to direct raw link
  if (trimmed.includes("dropbox.com") && trimmed.includes("dl=0")) {
    return trimmed.replace("dl=0", "raw=1");
  }

  return trimmed;
}

export function BrandLogo({ className = "", alt = "ENYTM™", style = {} }) {
  return (
    <span className={`brand-mark ${className}`.trim()} style={style} aria-label="ENYTM">
      <img
        src="/enytm-brand-logo.png"
        alt={alt}
        className="brand-logo-img"
        loading="eager"
        decoding="sync"
      />
    </span>
  );
}

const TICKER_ITEMS = [
  { text: "BUY 2, GET 10% OFF", highlight: true },
  { text: "BUY 3, GET 15% OFF", highlight: true },
  { text: "ONLINE PAYMENT: EXTRA 5% OFF", highlight: false },
  { text: "FREE SHIPPING ACROSS INDIA", highlight: false },
  { text: "PRE-ORDER IS LIVE · COD (30% ADVANCE)", highlight: false }
];
const TICKER_GROUP_ITEMS = Array.from({ length: 6 }, () => TICKER_ITEMS).flat();

function Navbar({ onSearch }) {
  const { cartCount, wishlist } = useCart();
  const location = useLocation();
  const [token, setToken] = useState(() => localStorage.getItem("enytm-token"));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem("enytm-token"));
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleAuth = () => setToken(localStorage.getItem("enytm-token"));
    window.addEventListener("enytm:auth_change", handleAuth);
    window.addEventListener("storage", handleAuth);
    return () => {
      window.removeEventListener("enytm:auth_change", handleAuth);
      window.removeEventListener("storage", handleAuth);
    };
  }, []);

  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];

  return <>
    <header className="nav">
      <div className="nav-top-row">
        <button
          type="button"
          className="icon-btn mobile-menu"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link className="logo" to="/" aria-label="ENYTM" onClick={() => setOpen(false)}>
          <BrandLogo />
        </Link>

        <nav className={`nav-links ${open ? "mobile-open" : ""}`}>
          <Link to="/shop" onClick={() => setOpen(false)}>SHOP</Link>
          <Link to="/shop?category=Oversized" onClick={() => setOpen(false)}>OVERSIZED</Link>
          <Link to="/shop?category=Polos" onClick={() => setOpen(false)}>POLOS</Link>
          <Link to={token ? "/account" : "/login"} onClick={() => setOpen(false)}>ORDERS</Link>
          <Link to="/about" onClick={() => setOpen(false)}>ABOUT</Link>
        </nav>

        <div className="nav-actions">
          <button type="button" className="icon-btn nav-action-desktop" onClick={onSearch} aria-label="Search"><Search /></button>
          <Link className="icon-btn badge-icon nav-wishlist-btn nav-action-desktop" to="/wishlist" aria-label="Wishlist"><Heart />{token && safeWishlist.length > 0 && <b>{safeWishlist.length}</b>}</Link>
          <Link className="icon-btn badge-icon nav-action-desktop" to="/cart" aria-label="Cart"><ShoppingBag />{token && cartCount > 0 && <b>{cartCount}</b>}</Link>
          <Link className="icon-btn" aria-label="Account" title={token ? "My Account & Orders" : "Login"} to={token ? "/account" : "/login"}><User /></Link>
        </div>
      </div>

      <div className="mobile-subnav">
        <button
          type="button"
          className="mobile-subnav-search"
          onClick={onSearch}
          aria-label="Search products"
        >
          <Search size={15} />
          <span>Search for T-Shirts, Polos, Customize Tees...</span>
          <Camera size={16} className="search-camera-icon" style={{ marginLeft: "auto", opacity: 0.7 }} />
        </button>
        <div className="mobile-subnav-actions">
          <Link
            to="/wishlist"
            className="mobile-subnav-btn badge-icon"
            aria-label="Wishlist"
            title="Wishlist"
          >
            <Heart size={18} />
            {token && safeWishlist.length > 0 && <b>{safeWishlist.length}</b>}
          </Link>
          <Link
            to="/cart"
            className="mobile-subnav-btn badge-icon"
            aria-label="Shopping Cart"
            title="Cart"
          >
            <ShoppingBag size={18} />
            {token && cartCount > 0 && <b>{cartCount}</b>}
          </Link>
        </div>
      </div>
    </header>
    <div className="announcement" role="region" aria-label="Store Announcements">
      <div className="announcement-ticker-track">
        <div className="ticker-group">
          {TICKER_GROUP_ITEMS.map((item, idx) => (
            <span key={`g1-${idx}`}>{item.highlight ? (<strong className="ticker-highlight">{item.text}</strong>) : (item.text)}<b className="ticker-star" aria-hidden="true">✳</b></span>
          ))}
        </div>
        <div className="ticker-group" aria-hidden="true">
          {TICKER_GROUP_ITEMS.map((item, idx) => (
            <span key={`g2-${idx}`}>{item.highlight ? (<strong className="ticker-highlight">{item.text}</strong>) : (item.text)}<b className="ticker-star" aria-hidden="true">✳</b></span>
          ))}
        </div>
      </div>
    </div>
  </>;
}
function ProductCard({ product }) {
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const [added, setAdded] = useState(false);
  if (!product) return null;
  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];
  const liked = safeWishlist.includes(product.id);
  const isComingSoon = Boolean(product.comingSoon || product.category === "Hoodies" || product.category === "Sweatshirts" || product.category === "Lowers");
  const stock = Math.max(0, Number(product.stock || 0));
  const outOfStock = !isComingSoon && stock <= 0;
  const add = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (outOfStock || isComingSoon) return;
    addToCart(product, "M");
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };
  const hasDiscount = !isComingSoon && Number(product.oldPrice) > Number(product.price);
  const discountPct = hasDiscount ? Math.round(((Number(product.oldPrice) - Number(product.price)) / Number(product.oldPrice)) * 100) : 0;

  return (
    <article className={`product-card ${isComingSoon ? "product-coming-soon" : ""}`}>
      <div className="product-image">
        {product.badge && !outOfStock && !isComingSoon ? (
          <span className="product-badge">{product.badge}</span>
        ) : !isComingSoon ? (
          <span className="product-badge">NEW</span>
        ) : isComingSoon ? (
          <span className="product-stock-badge coming-soon">COMING SOON</span>
        ) : null}

        <button
          type="button"
          className={`heart ${liked ? "liked" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label="Wishlist"
        >
          <Heart size={16} fill={liked ? "currentColor" : "none"} />
        </button>

        <Link to={`/product/${product.id}`} className="product-card-img-link">
          <img
            src={normalizeImageUrl(product.image) || ""}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const img = e.currentTarget;
              if (img.dataset.fallbackApplied === "true") return;
              img.dataset.fallbackApplied = "true";
              const fallbackImages = {
                1: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85",
                3: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=85",
              };
              img.src =
                fallbackImages[product.id] ||
                "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80";
            }}
          />
        </Link>
      </div>

      <div className="product-info">
        <Link to={`/product/${product.id}`} className="product-card-title-link">
          <h3>{product.name}</h3>
        </Link>

        <div className="product-card-pricing-row">
          <div className="product-card-prices">
            <strong>₹{Number(product.price).toLocaleString("en-IN")}</strong>
            {hasDiscount && <del>₹{Number(product.oldPrice).toLocaleString("en-IN")}</del>}
          </div>
          {hasDiscount && (
            <span className="product-discount-pill">
              {discountPct}% OFF
            </span>
          )}
        </div>

        {!isComingSoon && (
          <button
            type="button"
            className={`card-add-to-cart-btn ${added ? "added" : ""}`}
            onClick={add}
            disabled={outOfStock}
          >
            <ShoppingCart size={15} />
            <span>{outOfStock ? "Out of Stock" : added ? "Added to Cart ✓" : "Add to Cart"}</span>
          </button>
        )}
      </div>
    </article>
  );
}
function PrelaunchHome() {
  return <main className="enytm-prelaunch-home">
    <style>{`
      .enytm-prelaunch-home{min-height:100svh;background:#080808;color:#f5f2ed;font-family:Arial,Helvetica,sans-serif;position:relative}
      .enytm-countdown-page{min-height:100svh;background:#080808;color:#f5f2ed;font-family:Arial,Helvetica,sans-serif;overflow:hidden}
      .prelaunch-top{position:absolute;z-index:10;top:0;left:0;right:0;padding:12px clamp(16px,4vw,48px);display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,.16);box-sizing:border-box}
      .prelaunch-logo{font-size:clamp(16px,2vh,20px);font-weight:800;letter-spacing:.18em;color:#fff;text-decoration:none;display:inline-flex;align-items:center}
      .prelaunch-logo .brand-logo-img{height:clamp(16px,2.2vw,20px);width:auto;object-fit:contain}
      .prelaunch-top-note{font-size:clamp(7.5px,1.1vh,9px);letter-spacing:.2em;color:#d0c6b8;text-align:right;line-height:1.4}
      .prelaunch-hero{position:relative;height:100vh;height:100svh;height:100dvh;min-height:100vh;min-height:100svh;min-height:100dvh;max-height:100vh;max-height:100svh;max-height:100dvh;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;overflow:hidden;padding:clamp(65px,10vh,95px) clamp(24px,7vw,110px) clamp(55px,8vh,75px);background:linear-gradient(90deg,rgba(0,0,0,.84) 0%,rgba(0,0,0,.54) 48%,rgba(0,0,0,.15) 100%),linear-gradient(0deg,rgba(0,0,0,.45),transparent 55%),url('https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=2200&q=90') center 38%/cover no-repeat}
      .prelaunch-copy{max-width:min(760px,86vw);position:relative;z-index:2;display:flex;flex-direction:column;align-items:flex-start;justify-content:center}
      .prelaunch-kicker{font-size:clamp(8.5px,min(0.9vw,1.3vh),10.5px);letter-spacing:.3em;color:#d1bfa2;margin:0 0 clamp(8px,1.8vh,20px);font-weight:600;text-transform:uppercase}
      .prelaunch-title{font-size:clamp(34px,min(7.5vw,10.2vh),96px);line-height:.88;letter-spacing:-.07em;font-weight:800;margin:0;text-transform:uppercase;color:#fff}
      .prelaunch-title em{font-style:normal;color:#c8b69a}
      .prelaunch-description{max-width:clamp(280px,32vw,430px);color:#dedbd5;line-height:clamp(1.5,1.65,1.75);font-size:clamp(12px,min(1.1vw,1.7vh),15.5px);margin:clamp(12px,2vh,24px) 0 clamp(16px,2.6vh,28px)}
      .prelaunch-explore{display:inline-flex!important;align-items:center!important;gap:clamp(18px,2vw,28px)!important;background:linear-gradient(115deg,#f5f2ed 0%,#e3d1b5 48%,#f5f2ed 100%)!important;color:#080808!important;padding:clamp(11px,1.6vh,17px) clamp(20px,2vw,28px)!important;min-height:clamp(44px,5.2vh,56px)!important;text-decoration:none!important;font-size:clamp(10px,1.1vh,11px)!important;font-weight:800!important;letter-spacing:.18em!important;transition:background .2s,transform .2s,box-shadow .25s!important}
      .prelaunch-explore:hover{background:#c8b69a!important;transform:translateY(-2px)!important}
      .prelaunch-bottom{position:absolute;z-index:2;bottom:clamp(14px,2.4vh,24px);left:clamp(20px,5vw,76px);right:clamp(20px,5vw,76px);display:flex;justify-content:space-between;align-items:center;gap:20px;color:#c8c2b8;font-size:clamp(8px,1.15vh,9.5px);letter-spacing:.2em}
      .prelaunch-bottom span:last-child{text-align:right}
      @media(max-height:680px){
        .prelaunch-hero{padding-top:55px;padding-bottom:45px}
        .prelaunch-title{font-size:clamp(28px,9.5vh,58px)}
        .prelaunch-description{margin:8px 0 14px;font-size:11.5px;line-height:1.45}
        .prelaunch-kicker{margin-bottom:8px}
        .prelaunch-explore{min-height:38px!important;padding:8px 18px!important;gap:16px!important}
      }
      .enytm-countdown-page{display:flex;flex-direction:column;position:relative}.countdown-top{padding:12px clamp(16px,4vw,48px);min-height:44px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,.14)}.countdown-top .prelaunch-logo .brand-logo-img{height:clamp(16px,2.2vw,20px)!important}.countdown-back{color:#cfcfca;text-decoration:none;font-size:9.5px;letter-spacing:.16em;font-weight:700;opacity:.85;transition:opacity .2s}.countdown-back:hover{opacity:1;color:#fff}.countdown-main{flex:1;display:flex;align-items:center;justify-content:center;text-align:center;padding:70px 22px 90px;position:relative;background:radial-gradient(ellipse at 50% 30%,#25221d 0%,#111 40%,#080808 76%)}.countdown-inner{width:min(100%,900px)}.countdown-overline{font-size:10px;letter-spacing:.34em;color:#c8b69a;margin:0 0 24px}.countdown-title{font-size:clamp(42px,8vw,100px);letter-spacing:-.06em;line-height:.92;text-transform:uppercase;margin:0;font-weight:800}.countdown-title em{font-style:normal;color:#c8b69a}.countdown-subtitle{color:#c5c0b7;line-height:1.8;margin:25px auto 36px;max-width:520px;font-size:14px}.countdown-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(8px,2vw,18px);max-width:740px;margin:0 auto}.countdown-unit{border:1px solid rgba(200,182,154,.45);background:rgba(255,255,255,.025);padding:clamp(14px,3vw,30px) 5px}.countdown-number{font-variant-numeric:tabular-nums;font-size:clamp(30px,6.5vw,70px);font-weight:700;letter-spacing:-.05em;line-height:1}.countdown-label{margin-top:12px;color:#c8b69a;font-size:9px;letter-spacing:.22em;text-transform:uppercase}.countdown-launch-date{font-size:10px;letter-spacing:.22em;color:#a9a39a;margin:27px 0 0}.countdown-footer{padding:14px clamp(16px,4vw,48px);display:flex;justify-content:space-between;gap:15px;color:#9e988f;font-size:9px;letter-spacing:.2em;border-top:1px solid rgba(255,255,255,.12)}.countdown-shop{display:inline-flex;margin-top:30px;padding:17px 24px;background:#f5f2ed;color:#080808;text-decoration:none;font-size:11px;letter-spacing:.16em;font-weight:800}
      @media(max-width:600px){.prelaunch-top-note{font-size:8px;max-width:125px;line-height:1.5}.prelaunch-hero{background-position:58% center;padding-left:20px;padding-right:20px;padding-top:80px;padding-bottom:60px}.prelaunch-title{font-size:clamp(36px,11vw,64px)}.prelaunch-bottom{font-size:8px;line-height:1.5}.countdown-grid{gap:6px}.countdown-unit{padding:18px 2px}.countdown-label{font-size:7px;letter-spacing:.12em}.countdown-footer{font-size:8px;line-height:1.6}.countdown-footer span:last-child{text-align:right}}
      @media(prefers-reduced-motion:reduce){.prelaunch-explore{transition:none}}
    `}</style>
    <header className="prelaunch-top"><Link className="prelaunch-logo" to="/" aria-label="ENYTM"><BrandLogo /></Link><span className="prelaunch-top-note">MORE THAN A MOMENT<br />PUNE, INDIA · EST. 2026</span></header>
    <section className="prelaunch-hero"><div className="prelaunch-copy"><p className="prelaunch-kicker">A NEW EVERYDAY IS COMING · 001</p><h1 className="prelaunch-title">NOT JUST<br />CLOTHING.<br /><em>A<br />FEELING.</em></h1><p className="prelaunch-description">Considered fits. Better-feeling fabrics. An everyday uniform made to feel like you. Our first drop is almost here.</p><Link className="prelaunch-explore" to="/launch">EXPLORE THE DROP <ArrowRight size={18} /></Link></div><div className="prelaunch-bottom"><span>ENYTM APPARELS / FIRST DROP</span><span>THE COUNTDOWN STARTS HERE ↗</span></div></section><section className="home-faq" id="faq"><div className="home-faq-heading"><p className="eyebrow">06 / GOOD TO KNOW</p><h2>The useful<br /><em>details.</em></h2><p>Everything you need to know before making ENYTM part of your everyday.</p></div><div className="home-faq-list"><details><summary>What is the tee made from?<span aria-hidden="true">＋</span></summary><p>Each product listing includes its fabric and GSM details. Check the individual product page for the exact composition and specifications of the piece you choose.</p></details><details><summary>How should I care for it?<span aria-hidden="true">＋</span></summary><p>For best results, follow the care label on your garment. As a general guide, wash with similar colours, turn printed garments inside out, use a gentle cycle and avoid high heat when drying.</p></details><details><summary>Where do you ship?<span aria-hidden="true">＋</span></summary><p>We aim to deliver across serviceable locations in India. Enter your delivery pincode at checkout to confirm service availability.</p></details><details><summary>How do payments & pre-orders work?<span aria-hidden="true">＋</span></summary><p>You can choose between two convenient options at checkout: <b>Online Payment</b> (pay 100% upfront via UPI/Cards and receive an instant <b>extra 5% discount</b>) or <b>Cash on Delivery</b> (pay a 30% advance online today to confirm manufacturing, and pay the remaining 70% in cash/UPI upon delivery).</p></details><details><summary>When will my pre-order be dispatched?<span aria-hidden="true">＋</span></summary><p>Pre-orders are scheduled for dispatch after the 8 November 2026 launch. We’ll share tracking updates through the contact details provided at checkout.</p></details><div className="home-faq-footer"><span>STILL CURIOUS?</span><Link to="/about">GET TO KNOW US <ArrowRight size={15} /></Link></div></div></section>
  </main>
}
function LaunchCountdown() {
  const launchAt = new Date("2026-11-08T00:00:00+05:30").getTime();
  const calculate = () => { const diff = Math.max(0, launchAt - Date.now()); return { days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), minutes: Math.floor((diff % 3600000) / 60000), seconds: Math.floor((diff % 60000) / 1000), live: diff === 0 } };
  const [time, setTime] = useState(calculate);
  useEffect(() => { const timer = window.setInterval(() => setTime(calculate()), 1000); return () => window.clearInterval(timer) }, []);
  const units = [["days", "DAYS"], ["hours", "HOURS"], ["minutes", "MINUTES"], ["seconds", "SECONDS"]];
  const categories = [
    { number: "01", name: "OVERSIZED TEES", detail: "Relaxed by design", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85", query: "Oversized%20Tees" },
    { number: "02", name: "PREMIUM POLOS", detail: "Everyday, refined", image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85", query: "Premium%20Polos" },
    { number: "03", name: "OVERSIZED HOODIES", detail: "Comfort with presence", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85", query: "Oversized%20Hoodies" },
    { number: "04", name: "BAGGY LOWER", detail: "Move your way", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=85", query: "Baggy%20Lower" }
  ];
  return <main className="enytm-countdown-page"><style>{`.enytm-countdown-page a:focus-visible{outline:2px solid #c8b69a;outline-offset:5px}`}</style><header className="countdown-top"><Link className="prelaunch-logo" to="/" aria-label="ENYTM"><BrandLogo /></Link><Link className="countdown-back" to="/">← BACK TO STORE</Link></header><section className="countdown-main"><div className="countdown-inner"><p className="countdown-overline">ENYTM APPARELS · DROP 001</p><h1 className="countdown-title">THE WAIT<br />IS <em>ALMOST OVER.</em></h1><p className="countdown-subtitle">Your new everyday arrives 8 November 2026.</p>{time.live ? <><p className="countdown-overline">WE ARE LIVE</p><Link className="countdown-shop" to="/shop">EXPLORE THE COLLECTION <ArrowRight size={16} /></Link></> : <><div className="countdown-grid" role="timer" aria-label="Countdown until ENYTM launch">{units.map(([key, label]) => <div className="countdown-unit" key={key}><div className="countdown-number">{String(time[key]).padStart(2, "0")}</div><div className="countdown-label">{label}</div></div>)}</div><p className="countdown-launch-date">LAUNCHING · 08 NOVEMBER 2026 · 12:00 AM IST</p></>}</div></section>{!time.live && <section className="countdown-preorder"><div className="countdown-offer-copy"><p className="countdown-overline">DROP 001 · PRE-LAUNCH OFFER</p><h2>YOUR FIRST ENYTM.<br /><em>RESERVE THE DROP.</em></h2><p>Reserve selected styles with 30% advance. Balance due online before dispatch.</p><div className="countdown-offer-points"><span>30% ADVANCE</span><span>70% BEFORE DISPATCH</span><span>NO COD</span></div><Link className="countdown-shop countdown-preorder-cta" to="/shop">SHOP THE PRE-LAUNCH OFFER <ArrowRight size={17} /></Link></div><div className="countdown-category-grid">{categories.map(category => <Link className="countdown-category-card" to={`/shop?category=${category.query}`} key={category.number}><div className="countdown-category-image"><img src={category.image} alt={category.name} loading="lazy" /><span className="countdown-category-number">{category.number}</span><span className="countdown-category-arrow">↗</span></div><div className="countdown-category-info"><div><strong>{category.name}</strong><span>{category.detail}</span></div><span className="countdown-category-link">EXPLORE</span></div></Link>)}</div></section>}<footer className="countdown-footer"><span>MORE THAN A MOMENT</span><span>ENYTM.CO.IN · DROP 001</span></footer></main>
}

function Home() {
  const products = useProducts();
  const [activeTab, setActiveTab] = useState("all");

  const collections = [
    { title: "T-Shirts", link: "/shop?category=Oversized", img: "/categories/tshirts.jpg?v=2" },
    { title: "Polos", link: "/shop?category=Polos", img: "/categories/polos.jpg?v=2" },
    { title: "Customize Tees", link: "/shop?category=Oversized", img: "/categories/customize.jpg?v=2" }
  ];

  const filteredProducts = useMemo(() => {
    let list = products;
    if (activeTab === "new") list = products.filter(p => p.badge === "NEW" || p.id === 1 || p.id === 7);
    else if (activeTab === "bestsellers") list = products.filter(p => p.badge === "BESTSELLER" || p.badge === "SIGNATURE" || p.id === 2 || p.id === 3);
    else if (activeTab === "heavyweight") list = products.filter(p => (p.fabric && p.fabric.includes("French Terry")) || p.category === "Lowers" || p.category === "Hoodies");

    if (!list || !list.length) return [];
    // Shuffle and pick 4 random products each time
    const shuffled = [...list];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 4);
  }, [products, activeTab]);

  return (
    <main className="home-black-label home-v3">
      <section className="hero hero-v2">
        <img
          src="/enytm-hero.jpg"
          alt="ENYTM The Black Label"
          className="hero-desktop-img"
        />
        <img
          src="/hero-mobile.jpg"
          alt="ENYTM The Black Label"
          className="hero-mobile-img"
        />
        <div className="hero-overlay" />
        <div className="hero-edition">
          <span className="hero-edition-dot" /> ENYTM / THE BLACK LABEL <span>EST. 2026</span>
        </div>
        <div className="hero-content hero-content-v2">
          <div style={{ width: "32px", height: "2px", background: "#cbb89a", margin: "10px 0 16px" }} />
          <h1>
            YOUR<br />
            EVERYDAY.<br />
            <em>REDEFINED.</em>
          </h1>
          <p className="hero-subline">
            Quiet confidence. Considered details.<br />Heavyweight fabrics made to live in.
          </p>
          <div className="hero-cta-group">
            <Link className="btn primary hero-cta hero-cta-primary" to="/shop" style={{ borderRadius: "999px" }}>
              Shop Now <ArrowRight size={17} />
            </Link>
            <a className="btn outline hero-cta hero-cta-secondary" href="#collections" style={{ borderRadius: "999px" }}>
              <Play size={13} style={{ fill: "currentColor", marginRight: 4 }} /> Watch Film
            </a>
          </div>
          <span className="hero-caption">MORE THAN A MOMENT · DESIGNED TO STAY.</span>
        </div>
        <div className="hero-index">
          <span>01</span>
          <i />
          <span>04</span>
        </div>
        <div className="scroll">
          <span>SCROLL</span> ↓
        </div>
      </section>


      {/* 3 Category Quick Tiles */}
      <section className="category-editorial category-editorial-v2" id="collections">
        <div className="categories categories-three-col">
          {collections.map(c => (
            <Link
              key={c.title}
              to={c.link}
              className="category-tile category-tile-v2"
              aria-label={c.title}
            >
              <img
                src={c.img}
                alt={c.title}
                loading="lazy"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Drops */}
      <section className="section home-arrivals home-arrivals-v2" id="rotation">
        <div className="drop-heading">
          <div className="featured-drops-head">
            <p className="eyebrow" style={{ color: "#cbb89a", letterSpacing: "0.2em", fontSize: "11px", marginBottom: "4px" }}>FEATURED DROPS</p>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#fff", margin: 0 }}>The Black Label</h2>
          </div>
          <div className="drop-filter-wrap">
            <CustomDropdown
              icon={<SlidersHorizontal size={13} className="drop-filter-icon" />}
              label="FILTER:"
              value={activeTab}
              onChange={setActiveTab}
              options={[
                { value: "all", label: "ALL PIECES" },
                { value: "new", label: "NEW ARRIVALS" },
                { value: "bestsellers", label: "BEST SELLERS" },
                { value: "heavyweight", label: "HEAVYWEIGHT" }
              ]}
              className="drop-filter-dropdown"
            />
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : products?.loading ? (
          <div className="product-grid">
            {[1, 2, 3, 4].map(n => (
              <div key={n} style={{ background: "#111", minHeight: "380px", borderRadius: "2px", opacity: 0.6 }} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#888", border: "1px dashed #262626", background: "#0a0a0a", margin: "20px 0" }}>
            <p className="eyebrow" style={{ color: "#c8b69a" }}>COLLECTION</p>
            <h3 style={{ color: "#fff", fontSize: "18px", letterSpacing: ".1em", margin: "10px 0 6px" }}>NO PRODUCTS CURRENTLY LISTED</h3>
            <p style={{ fontSize: "12px", color: "#777", margin: 0 }}>Add products from the Admin Panel to display them here.</p>
          </div>
        )}

        <div className="arrivals-footnote">
          <span>DESIGNED FOR YOUR EVERYDAY</span>
          <Link to="/shop" className="arrivals-view-all-link">
            VIEW FULL CATALOG ({products.length} PIECES) <ArrowRight size={14} />
          </Link>
          <span>ENYTM / 001</span>
        </div>
      </section>

      <section className="quote quote-black-label quote-v2">
        <div className="quote-mark">“</div>
        <p className="eyebrow">THE THOUGHT BEHIND THE THREAD</p>
        <h2>
          BUILT FOR TODAY.<br />
          <em>BEYOND THE MOMENT.</em>
        </h2>
        <div className="quote-brand">
          <BrandLogo /> <span className="quote-apparels-tag">APPARELS</span>
        </div>
        <Link to="/shop" className="quote-shop-link">
          FIND YOUR PIECE <ArrowRight size={15} />
        </Link>
      </section>

      <section className="home-faq" id="faq">
        <div className="home-faq-heading">
          <p className="eyebrow">05 / GOOD TO KNOW</p>
          <p className="eyebrow">03 / GOOD TO KNOW</p>
          <h2>
            The useful<br />
            <em>details.</em>
          </h2>
          <p>Everything you need to know before making ENYTM part of your everyday.</p>
        </div>
        <div className="home-faq-list">
          <details>
            <summary>
              What is the tee made from?<span aria-hidden="true">＋</span>
            </summary>
            <p>
              Each product listing includes its fabric and GSM details. Check the individual product page for the exact composition (from 240 GSM combed cotton to 380 GSM French Terry).
            </p>
          </details>
          <details>
            <summary>
              What offers are currently active?<span aria-hidden="true">＋</span>
            </summary>
            <p>
              We offer <b>Extra 5% off on online payments</b> via Razorpay, <b>Buy 2 Get 10% off & Buy 3 Get 15% off</b> automatically applied in your bag, and <b>Free Shipping on all orders</b> across India.
            </p>
          </details>
          <details>
            <summary>
              How does pre-order production work?<span aria-hidden="true">＋</span>
            </summary>
            <p>
              Pre-orders require 100% advance payment. Production takes approximately 2.5 weeks to complete, followed by 7–10 days for courier delivery once dispatched. Cancellation with full refund is available within 24 hours of payment.
            </p>
          </details>
          <details>
            <summary>
              How do I report a damaged or incorrect item?<span aria-hidden="true">＋</span>
            </summary>
            <p>
              If you receive an item that is damaged, defective, or different from what you ordered, please contact ENYTM APPARELS within 24 hours of delivery. Please include your order number and clear photographs of the issue so we can assist you promptly.
            </p>
          </details>
          <details>
            <summary>
              How should I care for my ENYTM garments?<span aria-hidden="true">＋</span>
            </summary>
            <p>
              Wash cold inside-out with like colours, avoid harsh bleaching agents, do not iron directly on graphics, and flat dry or hang in shade to preserve GSM density and drape.
            </p>
          </details>
          <div className="home-faq-footer">
            <span>STILL CURIOUS?</span>
            <Link to="/about">
              GET TO KNOW US <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
function CustomDropdown({ label, value, options, onChange, icon = null, className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div className={`enytm-custom-dropdown ${className} ${open ? "is-open" : ""}`} ref={ref}>
      <button
        type="button"
        className="enytm-dropdown-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {icon && <span className="enytm-dropdown-icon">{icon}</span>}
        {label && <span className="enytm-dropdown-label">{label}</span>}
        <span className="enytm-dropdown-current">{selectedOption ? selectedOption.label : value}</span>
        <ChevronDown size={14} className={`enytm-dropdown-arrow ${open ? "rotated" : ""}`} />
      </button>

      {open && (
        <div className="enytm-dropdown-menu" role="listbox">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`enytm-dropdown-item ${isSelected ? "selected" : ""}`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={13} className="enytm-dropdown-check" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CartSizeDropdown({
  currentSize,
  availableSizes = ["S", "M", "L", "XL", "XXL"],
  sizeStock = {},
  onSelect,
  className = ""
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className={`enytm-custom-dropdown cart-size-custom-dropdown ${className} ${open ? "is-open" : ""}`} ref={ref}>
      <button
        type="button"
        className="enytm-dropdown-trigger cart-size-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="enytm-dropdown-label">SIZE:</span>
        <span className="enytm-dropdown-current">{currentSize}</span>
        <ChevronDown size={12} className={`enytm-dropdown-arrow ${open ? "rotated" : ""}`} />
      </button>

      {open && (
        <div className="enytm-dropdown-menu cart-size-menu" role="listbox">
          {availableSizes.map((s) => {
            const stockVal = sizeStock?.[s];
            const isOOS = typeof stockVal !== "undefined" && Number(stockVal) <= 0;
            const isSelected = s === currentSize;

            return (
              <button
                key={s}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={isOOS}
                className={`enytm-dropdown-item cart-size-item ${isSelected ? "selected" : ""} ${isOOS ? "oos" : ""}`}
                onClick={() => {
                  if (!isOOS) {
                    onSelect(s);
                    setOpen(false);
                  }
                }}
              >
                <span className="cart-size-item-val">{s}</span>
                {isOOS ? (
                  <span className="cart-size-oos-tag">OUT OF STOCK</span>
                ) : isSelected ? (
                  <Check size={12} className="enytm-dropdown-check" />
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Shop() {
  const products = useProducts();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const requested = params.get("category") || "All";
  const [sort, setSort] = useState("featured");
  const [category, setCategory] = useState(requested);
  const resultsRef = useRef(null);
  useEffect(() => {
    setCategory(requested);
  }, [requested]);
  const categoryKey = (value) => {
    const s = String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!s || s === "all") return "all";
    if (s.includes("oversized") || s.includes("oversize") || s === "tee" || s.includes("t shirt") || s.includes("tshirt")) return "oversized";
    if (s.includes("polo")) return "polos";
    if (s.includes("hoodie") || s.includes("hooded")) return "hoodies";
    if (s.includes("sweatshirt")) return "sweatshirts";
    if (s.includes("baggy") || s.includes("lower") || s.includes("trouser") || s.includes("pant")) return "baggy";
    return s;
  };
  const categoryTitle = category === "All" ? "SHOP ALL" : category === "Oversized" || categoryKey(category) === "oversized" ? "OVERSIZED TEES" : categoryKey(category) === "polos" ? "PREMIUM POLOS" : categoryKey(category) === "hoodies" ? "OVERSIZED HOODIES" : categoryKey(category) === "sweatshirts" ? "SWEATSHIRTS" : categoryKey(category) === "baggy" ? "LOWERS" : "SHOP ALL";
  const shown = useMemo(() => {
    let list = categoryKey(category) === "all" ? [...products] : products.filter(p => categoryKey(p.category) === categoryKey(category));
    if (sort === "low") list.sort((x, y) => Number(x.price) - Number(y.price));
    if (sort === "high") list.sort((x, y) => Number(y.price) - Number(x.price));
    return list;
  }, [products, category, sort]);
  const choices = [
    ["All", "ALL"],
    ["Oversized", "OVERSIZED TEES"],
    ["Polos", "PREMIUM POLOS"]
  ];

  const handleCategoryChange = (val) => {
    setCategory(val);
    navigate(val === "All" ? "/shop" : `/shop?category=${encodeURIComponent(val)}`, { replace: true });
  };

  return <main className="shop-page shop-page-v2">
    <div className="shop-editorial-hero">
      <div className="shop-editorial-hero-content">
        <span className="shop-simple-eyebrow">COLLECTION</span>
        <h1 className="shop-simple-title">
          {categoryTitle === "OVERSIZED TEES" ? (
            <>OVERSIZED <span style={{ color: "#cbb89a" }}>TEES</span></>
          ) : categoryTitle === "PREMIUM POLOS" ? (
            <>PREMIUM <span style={{ color: "#cbb89a" }}>POLOS</span></>
          ) : (
            <>SHOP <span style={{ color: "#cbb89a" }}>ALL</span></>
          )}
        </h1>
        <p className="shop-simple-subtitle">
          {categoryKey(category) === "oversized" ? "Relaxed Fits. Premium Comfort. Everyday Essential." :
            categoryKey(category) === "polos" ? "Textured Organic Piqué. Elevated Minimal Branding." :
              "Considered Silhouettes. Heavyweight Fabrics Built to Last."}
        </p>
        <div className="shop-hero-divider" />
      </div>
    </div>

    <div className="shop-controls-bar">
      <div className="shop-controls-top-row">
        <span className="shop-styles-count">
          {products?.loading && !shown.length ? "" : `${shown.length} ${shown.length === 1 ? "Style" : "Styles"}`}
        </span>
        <div className="shop-view-toggle">
          <button type="button" className="view-btn active" aria-label="Grid view">
            <LayoutGrid size={15} />
          </button>
          <button type="button" className="view-btn" aria-label="List view">
            <List size={15} />
          </button>
        </div>
      </div>

      <div className="shop-simple-toolbar">
        <div className="shop-simple-selects">
          <CustomDropdown
            icon={<SlidersHorizontal size={13} />}
            label="Filter"
            value={choices.some(([v]) => categoryKey(v) === categoryKey(category)) ? category : "All"}
            options={choices.map(([value, label]) => ({ value, label }))}
            onChange={handleCategoryChange}
          />

          <CustomDropdown
            label="Sort By:"
            value={sort}
            options={[
              { value: "featured", label: "Featured" },
              { value: "low", label: "Price: Low to High" },
              { value: "high", label: "Price: High to Low" }
            ]}
            onChange={setSort}
          />
        </div>
      </div>
    </div>

    <section className="shop-results-v2" ref={resultsRef}>
      {shown.length ? (
        <div className="product-grid shop-grid shop-grid-v2">
          {shown.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : products?.loading ? (
        <div className="product-grid shop-grid shop-grid-v2">
          {[1, 2, 3].map(n => (
            <div
              key={n}
              className="product-card"
              style={{
                background: "linear-gradient(180deg, #121212 0%, #0a0a0a 100%)",
                border: "1px solid #1f1d1a",
                borderRadius: "2px",
                overflow: "hidden",
                minHeight: "440px",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "3 / 4",
                  background: "#161616",
                  animation: "pulse 1.5s infinite ease-in-out"
                }}
              />
              <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ width: "65%", height: "14px", background: "#222", borderRadius: "2px" }} />
                <div style={{ width: "35%", height: "12px", background: "#1c1c1c", borderRadius: "2px" }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="shop-empty-v2">
          <span>COMING INTO FOCUS</span>
          <h2>THIS EDIT IS<br /><em>ON ITS WAY.</em></h2>
          <p>We're preparing this category for the ENYTM collection. Explore the available pieces in the meantime.</p>
          <button type="button" className="shop-empty-link" onClick={() => handleCategoryChange("All")}>
            VIEW ALL PIECES <ArrowRight size={16} />
          </button>
        </div>
      )}
    </section>
  </main>
}

function ProductPage() {
  const products = useProducts();
  const params = useParams();
  const location = useLocation();
  const nav = useNavigate();
  const rawId = params?.id ?? location.pathname.split("/").filter(Boolean).pop();
  const productList = Array.isArray(products) ? products : [];
  const product = productList.find(p => String(p.id) === String(rawId));
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const [size, setSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [active, setActive] = useState(0);
  const [videoBlocked, setVideoBlocked] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);

  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];
  const liked = product ? safeWishlist.includes(product.id) : false;
  const isComingSoon = Boolean(product?.comingSoon || product?.category === "Hoodies" || product?.category === "Sweatshirts" || product?.category === "Lowers");
  const stock = Math.max(0, Number(product?.stock || 0));
  const outOfStock = !isComingSoon && stock <= 0;
  const sizeStockVal = product?.sizeStock && typeof product.sizeStock[size] !== "undefined"
    ? Number(product.sizeStock[size] || 0)
    : stock;
  const isSizeOutOfStock = !isComingSoon && (product?.sizeStock ? sizeStockVal <= 0 : outOfStock);
  const videoRef = useRef(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    setActive(0);
    setQty(1);
    setAdded(false);
    setShowSizeGuide(false);
    setZoomImage(null);
    if (product?.sizes && product.sizes.length > 0) {
      setSize(product.sizes[0]);
    } else {
      setSize("M");
    }
  }, [product?.id]);

  const recommendations = useMemo(() => {
    if (!product) return [];
    const seen = new Set([String(product.id)]);
    const recs = [];

    for (const p of productList) {
      if (!p || !p.id || seen.has(String(p.id))) continue;
      if (p.category && product.category && String(p.category).toLowerCase() === String(product.category).toLowerCase()) {
        seen.add(String(p.id));
        recs.push(p);
      }
    }
    for (const p of productList) {
      if (recs.length >= 4) break;
      if (!p || !p.id || seen.has(String(p.id))) continue;
      seen.add(String(p.id));
      recs.push(p);
    }
    return recs.slice(0, 4);
  }, [productList, product]);

  const fallbackImg = "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80";

  const rawImages = product && Array.isArray(product.images) && product.images.length
    ? product.images.filter(Boolean)
    : [product?.image, product?.image2, product?.image3, product?.modelFront, product?.modelBack].filter(Boolean);

  const gallery = [
    ...(rawImages.length ? rawImages : [fallbackImg]).map((imgUrl, idx) => ({
      type: "image",
      src: normalizeImageUrl(imgUrl),
      label: `0${idx + 1} / VIEW`
    })),
    product?.video && {
      type: "video",
      src: normalizeImageUrl(product.video),
      poster: normalizeImageUrl(rawImages[0] || product?.image) || fallbackImg,
      label: "MOTION"
    }
  ].filter(Boolean);

  const safeGallery = gallery.length ? gallery : [{ type: "image", src: normalizeImageUrl(product?.image) || fallbackImg, label: "01 / VIEW" }];
  const activeMedia = safeGallery[Math.min(active, safeGallery.length - 1)] || safeGallery[0];

  // Preload all gallery images in parallel immediately so switching slides is instantaneous with 0 lag
  useEffect(() => {
    safeGallery.forEach((item) => {
      if (item && item.type === "image" && item.src) {
        const preImg = new Image();
        preImg.src = item.src;
      }
    });
  }, [safeGallery]);

  useEffect(() => {
    setVideoBlocked(false);
    if (!activeMedia || activeMedia.type !== "video") return;
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.currentTime = 0;
    const tryPlay = () => {
      const promise = video.play();
      if (promise?.then) promise.then(() => setVideoBlocked(false)).catch(() => setVideoBlocked(true));
    };
    video.addEventListener("loadedmetadata", tryPlay);
    video.addEventListener("canplay", tryPlay);
    const retry = setTimeout(tryPlay, 700);
    tryPlay();
    return () => {
      clearTimeout(retry);
      video.removeEventListener("loadedmetadata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
    };
  }, [active, activeMedia?.type, activeMedia?.src]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setActive((prev) => (prev < safeGallery.length - 1 ? prev + 1 : 0));
      } else {
        setActive((prev) => (prev > 0 ? prev - 1 : safeGallery.length - 1));
      }
    }
  };

  const add = () => {
    if (!product || outOfStock) return;
    if (qty > stock) { setQty(stock); return; }
    if (outOfStock || isSizeOutOfStock) return;
    if (qty > sizeStockVal) { setQty(Math.max(1, sizeStockVal)); return; }
    for (let i = 0; i < qty; i++) addToCart(product, size);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const buyNow = () => {
    if (!product || outOfStock) return;
    if (outOfStock || isSizeOutOfStock) return;
    if (qty > sizeStockVal) { setQty(Math.max(1, sizeStockVal)); return; }
    for (let i = 0; i < qty; i++) addToCart(product, size);
    if (!localStorage.getItem("enytm-token")) {
      sessionStorage.setItem("enytm-after-login", "/checkout");
      nav("/login");
    } else {
      nav("/checkout");
    }
  };

  const startVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.currentTime = 0;
    const promise = video.play();
    if (promise?.then) promise.then(() => setVideoBlocked(false)).catch(() => setVideoBlocked(true));
  };

  if (!product) {
    if (products?.loading) {
      return (
        <main className="product-page" style={{ padding: "140px 4vw", textAlign: "center", minHeight: "65vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <p className="eyebrow" style={{ letterSpacing: ".2em", opacity: 0.7 }}>ENYTM / APPARELS</p>
          <h2 style={{ fontSize: "16px", letterSpacing: ".15em", color: "#f5f5f2", margin: "16px 0 20px" }}>LOADING PIECE...</h2>
          <div style={{ width: "48px", height: "2px", background: "#222", overflow: "hidden", position: "relative" }}>
            <div style={{ width: "100%", height: "100%", background: "#d4af37", animation: "pulse 1.2s infinite ease-in-out" }} />
          </div>
        </main>
      );
    }
    return (
      <main className="product-page" style={{ padding: "120px 4vw", textAlign: "center" }}>
        <p className="eyebrow">ENYTM / APPARELS</p>
        <h1>PRODUCT NOT FOUND</h1>
        <p style={{ color: "#888", margin: "20px 0 30px" }}>The piece you're looking for is unavailable.</p>
        <Link className="btn primary" to="/shop">VIEW ALL PIECES</Link>
      </main>
    );
  }

  const sizes = Array.isArray(product.sizes) && product.sizes.length ? product.sizes : ["S", "M", "L", "XL", "XXL"];
  const categoryLabel = String(product.category || "Oversized").toUpperCase();
  const isOversized = String(product.category || "").toLowerCase() === "oversized" || /oversized/i.test(product.name || "");
  const priceDisplay = Number(product.price || 0).toLocaleString("en-IN");
  const oldPriceDisplay = product.oldPrice ? Number(product.oldPrice).toLocaleString("en-IN") : null;
  const prepaidPrice = Math.round(Number(product.price || 0) * 0.95);
  const savings = (product.oldPrice && Number(product.oldPrice) > Number(product.price)) ? Number(product.oldPrice) - Number(product.price) : 0;
  const discountPct = (product.oldPrice && Number(product.oldPrice) > Number(product.price)) ? Math.round(((Number(product.oldPrice) - Number(product.price)) / Number(product.oldPrice)) * 100) : 0;

  return (
    <div className="product-page-container">
      <main className="product-page">
        <section className="product-gallery-wrap modern-slider-gallery">
          <div className="product-gallery-shell modern-slider-shell">
            <div
              className="product-main-media modern-slider-media"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {activeMedia?.type === "video" ? (
                <div className="product-video-frame">
                  <video
                    ref={videoRef}
                    key={activeMedia.src}
                    autoPlay
                    muted
                    defaultMuted
                    playsInline
                    loop
                    preload="auto"
                    poster={activeMedia.poster}
                    onLoadedData={startVideo}
                    onCanPlay={startVideo}
                    onError={() => setVideoBlocked(true)}
                    onClick={startVideo}
                  >
                    <source src={activeMedia.src} type="video/mp4" />
                  </video>
                  {videoBlocked && (
                    <button className="video-play-button" onClick={startVideo} aria-label="Play product video">
                      <Play size={28} fill="currentColor" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="product-zoom-container" onClick={() => setZoomImage(activeMedia?.src || fallbackImg)}>
                  {safeGallery.map((item, idx) => {
                    if (item.type === "video") return null;
                    const isCurrent = idx === active;
                    return (
                      <img
                        key={`${item.src}-${idx}`}
                        src={item.src || fallbackImg}
                        alt={`${product.name} - View ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        loading="eager"
                        style={{
                          display: isCurrent ? "block" : "none",
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          objectPosition: "center center"
                        }}
                        onError={(e) => {
                          const src = e.currentTarget.src;
                          if (src.includes("googleusercontent.com/d/")) {
                            const id = src.split("/d/")[1]?.split("=")[0];
                            if (id && !e.currentTarget.dataset.retried) {
                              e.currentTarget.dataset.retried = "1";
                              e.currentTarget.src = `https://drive.google.com/thumbnail?id=${id}&sz=w1600`;
                              return;
                            }
                          }
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = fallbackImg;
                        }}
                      />
                    );
                  })}
                </div>
              )}

              {safeGallery.length > 1 && (
                <>
                  <button
                    type="button"
                    className="slider-arrow slider-arrow-left"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActive((prev) => (prev > 0 ? prev - 1 : safeGallery.length - 1));
                    }}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    className="slider-arrow slider-arrow-right"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActive((prev) => (prev < safeGallery.length - 1 ? prev + 1 : 0));
                    }}
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              <button
                type="button"
                className="slider-zoom-badge"
                onClick={() => setZoomImage(activeMedia?.src || fallbackImg)}
                aria-label="Zoom image"
                title="Click to zoom"
              >
                <ZoomIn size={14} />
              </button>

              <div className="slider-meta-badge">
                <span className="slider-rating">
                  {product.rating || "4.8"} <Star size={10} fill="#14958f" color="#14958f" />
                </span>
                <span className="slider-divider">|</span>
                <span className="slider-views">{product.reviewCount || "1.2k"}</span>
              </div>

              {safeGallery.length > 1 && (
                <div className="slider-pagination-dots" role="tablist" aria-label="Product images">
                  {safeGallery.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      role="tab"
                      aria-selected={i === active}
                      className={`slider-dot ${i === active ? "active" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActive(i);
                      }}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="product-details">
          <div className="product-detail-top">
            <p className="eyebrow">{categoryLabel} / ENYTM APPARELS</p>
            <button className={`detail-wish ${liked ? "liked" : ""}`} onClick={() => toggleWishlist(product.id)}>
              <Heart size={19} fill={liked ? "currentColor" : "none"} />
              <span>{liked ? "SAVED" : "SAVE"}</span>
            </button>
          </div>

          <h1>{product.name}</h1>

          <div className="price-row">
            <strong className="selling-price">₹{priceDisplay}</strong>
            {oldPriceDisplay && <del className="mrp-price">₹{oldPriceDisplay}</del>}
            {savings > 0 && (
              <span className="save-badge">SAVE ₹{savings.toLocaleString("en-IN")} ({discountPct}% OFF)</span>
            )}
            <span className="price-note">INCLUSIVE OF ALL TAXES</span>
          </div>

          <p className={`product-stock-message ${outOfStock || isSizeOutOfStock ? "out" : sizeStockVal < 6 ? "low" : "in"}`}>
            {isComingSoon
              ? "DROPPING ON 8 NOVEMBER 2026."
              : isSizeOutOfStock
                ? `SIZE ${size} IS CURRENTLY OUT OF STOCK.`
                : outOfStock
                  ? "OUT OF STOCK — THIS ITEM IS CURRENTLY UNAVAILABLE."
                  : sizeStockVal < 6
                    ? "LOW STOCK"
                    : "IN STOCK · READY TO DISPATCH"}
          </p>

          {/* OFFERS FOR YOU CARD */}
          <div className="product-offers-card">
            <div className="offers-card-header">
              <div className="offers-title-wrap">
                <Sparkles size={16} className="sparkle-gold" />
                <span className="offers-title">OFFERS FOR YOU</span>
              </div>
              <span className="offers-badge">AUTO-APPLIED</span>
            </div>
            <div className="offers-list">
              <div className="offer-item">
                <div className="offer-bullet"><Tag size={13} /></div>
                <div className="offer-content">
                  <div className="offer-heading-row">
                    <strong>Extra 5% off on online payment</strong>
                    <span className="offer-calc-price">₹{prepaidPrice.toLocaleString("en-IN")}</span>
                  </div>
                  <p>Pay only <b>₹{prepaidPrice.toLocaleString("en-IN")}</b> with 100% full online payment via Razorpay (UPI, Cards, NetBanking).</p>
                </div>
              </div>
              <div className="offer-item">
                <div className="offer-bullet"><Sparkles size={13} /></div>
                <div className="offer-content">
                  <div className="offer-heading-row">
                    <strong>Buy 2, get 10% off · Buy 3, get 15% off</strong>
                    <span className="offer-tag-pill">VOLUME SAVINGS</span>
                  </div>
                  <p>Add 2 pieces to get 10% off, or 3+ pieces to get 15% off automatically in your bag.</p>
                </div>
              </div>
              <div className="offer-item">
                <div className="offer-bullet"><Truck size={13} /></div>
                <div className="offer-content">
                  <div className="offer-heading-row">
                    <strong>Free shipping on all orders</strong>
                  </div>
                  <p>Insured expedited delivery across all serviceable pincodes in India with zero delivery charge.</p>
                </div>
              </div>
            </div>
          </div>



          {product.fabric && (
            <div className="spec">
              <span>FABRIC SPECS</span>
              <b>{product.fabric}</b>
            </div>
          )}

          <div className="option">
            <div className="option-head">
              <span>SELECT SIZE</span>
              <button type="button" className="size-guide-modal-trigger" onClick={() => setShowSizeGuide(true)}>
                SIZE GUIDE ↗
              </button>
            </div>
            <div className="sizes">
              {sizes.map((s) => {
                const sQty = product?.sizeStock && typeof product.sizeStock[s] !== "undefined"
                  ? Number(product.sizeStock[s] || 0)
                  : null;
                const isSoldOut = sQty !== null && sQty <= 0;
                return (
                  <button
                    key={s}
                    type="button"
                    className={`${size === s ? "selected" : ""} ${isSoldOut ? "size-sold-out" : ""}`}
                    onClick={() => {
                      setSize(s);
                      if (product?.sizeStock && typeof product.sizeStock[s] !== "undefined") {
                        const targetStock = Number(product.sizeStock[s] || 0);
                        if (targetStock > 0 && qty > targetStock) setQty(targetStock);
                      }
                    }}
                    title={isSoldOut ? `Size ${s} - Out of stock` : sQty !== null ? (sQty < 6 ? `Size ${s} - Low stock` : `Size ${s} - In stock`) : `Size ${s}`}
                  >
                    <span>{s}</span>
                    {isSoldOut && <small className="size-badge-out">OUT</small>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="purchase-line">
            <div className="quantity-block">
              <span>QUANTITY</span>
              <div className="quantity-control">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  aria-label="Decrease quantity"
                  disabled={outOfStock || isSizeOutOfStock || qty <= 1}
                >
                  <Minus size={15} />
                </button>
                <strong>{qty}</strong>
                <button
                  type="button"
                  onClick={() => setQty(Math.min(sizeStockVal, qty + 1))}
                  aria-label="Increase quantity"
                  disabled={outOfStock || isSizeOutOfStock || qty >= sizeStockVal}
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            <div className="purchase-dual-buttons">
              {isComingSoon ? (
                <button
                  type="button"
                  className="btn outline add-detail full"
                  disabled
                  style={{
                    opacity: 0.85,
                    cursor: "not-allowed",
                    borderColor: "#c8b69a",
                    color: "#c8b69a",
                    background: "#141210",
                    letterSpacing: "0.16em",
                    fontWeight: 800
                  }}
                >
                  COMING SOON · DROP 002
                </button>
              ) : (
                <>
                  <button className="btn outline add-detail" onClick={add} disabled={outOfStock || isSizeOutOfStock}>
                    {outOfStock || isSizeOutOfStock ? (
                      <>SIZE {size} OUT OF STOCK</>
                    ) : added ? (
                      <>
                        <CheckCircle size={18} /> ADDED TO BAG
                      </>
                    ) : (
                      <>
                        ADD TO BAG <ShoppingBag size={18} />
                      </>
                    )}
                  </button>
                  <button className="btn primary buy-now-btn" onClick={buyNow} disabled={outOfStock || isSizeOutOfStock}>
                    {outOfStock || isSizeOutOfStock ? "SIZE SOLD OUT" : <>BUY NOW <ArrowRight size={18} /></>}
                  </button>
                </>
              )}
            </div>
          </div>

          {added && (
            <div className="detail-added">
              <CheckCircle size={15} />
              <span>Added {qty} × {product.name} (Size {size}) to your bag</span>
              <Link to="/cart">VIEW BAG →</Link>
            </div>
          )}

          <div className="perks">
            <div>
              <Truck />
              <span>
                <b>FREE SHIPPING</b> ON ALL ORDERS
              </span>
            </div>
            <div>
              <ShieldCheck />
              <span>
                <b>SECURE PAYMENT</b> POWERED BY RAZORPAY
              </span>
            </div>
            <div>
              <RotateCcw />
              <span>
                <b>EASY RETURNS</b> WITHIN 48 HOURS
              </span>
            </div>
          </div>

          {/* EXPANDABLE ACCORDIONS */}
          <div className="product-accordions">
            <details>
              <summary>
                <span className="acc-title">PRODUCT DETAILS</span>
                <ChevronDown size={16} className="acc-chevron" />
              </summary>
              <div className="acc-content">
                <p>{product.description || "Crafted for comfort and daily wear with an architectural cut and clean finishes."}</p>
                <div className="acc-specs-grid">
                  <div><span>FABRIC</span><b>{product.fabric || "Premium Combed Cotton"}</b></div>
                  <div><span>WEIGHT / GSM</span><b>{product.fabric?.match(/\d+\s*GSM/i)?.[0] || "240–380 GSM Heavyweight"}</b></div>
                  <div><span>FIT & CUT</span><b>Streetwear Oversized · Engineered Drop Shoulder</b></div>
                  <div><span>CONSTRUCTION</span><b>Double-needle stitching, reinforced collar rib, pre-shrunk</b></div>
                  <div><span>CARE INSTRUCTIONS</span><b>Cold machine wash inside-out · Do not iron on prints · Flat dry</b></div>
                  <div><span>MODEL FIT</span><b>Model is 6'1" (185 cm) wearing size L</b></div>
                </div>
              </div>
            </details>

            <details>
              <summary>
                <span className="acc-title">SHIPPING & RETURNS</span>
                <ChevronDown size={16} className="acc-chevron" />
              </summary>
              <div className="acc-content">
                <div className="acc-notice-box">
                  <strong>PRE-ORDER PRODUCTION & DISPATCH TIMELINE</strong>
                  <p>Please keep in mind that this is a Pre Order. Pre Order production may take up to 2.5 weeks to complete.</p>
                  <p>Once your order is ready we will inform you and dispatch it immediately.</p>
                  <p>After dispatch delivery may take an additional 7 to 10 days depending on the courier service.</p>
                  <p className="tiny-muted">Our Pre Order batch is being produced first while the regular drop will launch separately. Please place your Pre Order only if you are comfortable with this production timeline.</p>
                </div>

                <div className="acc-shipping-rates">
                  <h4>DISPATCH & DELIVERY</h4>
                  <p>• <b>Free Shipping:</b> Enjoy 100% free delivery across all serviceable pincodes in India on every order.</p>
                  <p>• <b>In-Stock Pieces:</b> Dispatched within 24–48 business hours with live SMS/email tracking.</p>
                </div>

                <div className="acc-damaged-box">
                  <div className="damaged-header"><AlertCircle size={15} /> <b>DAMAGED, DEFECTIVE, OR INCORRECT ITEMS</b></div>
                  <p className="verbatim-quote">“If you receive an item that is damaged, defective, or different from what you ordered, please contact ENYTM APPARELS within 24 hours of delivery. Please include your order number and clear photographs of the issue so we can assist you promptly.”</p>
                </div>

                <p className="returns-term">Returns & size exchanges are accepted within 48 hours of delivery for unused items with original tags intact.</p>
              </div>
            </details>

            <details>
              <summary>
                <span className="acc-title">REFUND POLICY</span>
                <ChevronDown size={16} className="acc-chevron" />
              </summary>
              <div className="acc-content">
                <p>Once the returned item reaches us and passes our quality inspection, we will process the refund within 3–5 business days.</p>
                <div className="acc-refund-methods">
                  <div>
                    <b>Prepaid Orders:</b>
                    <p>The refund will be sent to the original payment method (Cards, UPI, NetBanking).</p>
                  </div>
                  <div>
                    <b>Cash on Delivery (COD) Orders:</b>
                    <p>Refunds will be processed through UPI or bank transfer. Our team will contact you for the required details.</p>
                  </div>
                </div>
                <p className="tiny-muted">Please note that your bank or payment provider may take additional time to reflect the refund after it has been processed.</p>
                <div className="exclusions-block">
                  <b>ITEMS NOT ELIGIBLE FOR RETURN OR EXCHANGE:</b>
                  <ul>
                    <li>Items that have been worn or used.</li>
                    <li>Items that have been washed.</li>
                    <li>Items that have been altered.</li>
                    <li>Items damaged after delivery.</li>
                    <li>Items returned without their original tags.</li>
                  </ul>
                </div>
              </div>
            </details>

            <details>
              <summary>
                <span className="acc-title">PRIVACY & PRE-ORDER PAYMENT TERMS</span>
                <ChevronDown size={16} className="acc-chevron" />
              </summary>
              <div className="acc-content">
                <div className="acc-preorder-terms">
                  <h4>PAYMENT & PRE-ORDER OPTIONS</h4>
                  <p><b>1. Online Payment (Prepaid):</b> Pay 100% online at checkout to unlock an <b>instant extra 5% discount</b>. Zero balance due on delivery.</p>
                  <p><b>2. Cash on Delivery (COD):</b> Pay a <b>30% advance online today</b> to confirm your order booking, and pay the remaining 70% in cash or UPI upon delivery.</p>
                  <p>If you change your mind, you may cancel your order within 24 hours of payment and receive a 100% full refund.</p>
                  <p>After 24 hours, custom manufacturing begins specifically against your booking.</p>
                </div>
                <hr className="acc-divider" />
                <div className="acc-privacy-summary">
                  <h4>WEBSITE PRIVACY POLICY</h4>
                  <p>At ENYTM APPARELS, we respect your privacy and protect your personal information. We never sell, rent, or trade your data to third parties. All transactions are processed through encrypted 256-bit bank-grade Razorpay payment gateways.</p>
                  <Link to="/privacy-policy" className="policy-link-inline">Read full Privacy Policy →</Link>
                </div>
              </div>
            </details>
          </div>
        </section>
      </main>

      {/* RECOMMENDATIONS SECTION BELOW THE PRODUCT */}
      {recommendations.length > 0 && (
        <section className="section related-products">
          <div className="section-head">
            <div>
              <p className="eyebrow">CURATED FOR YOU · COMPLETE THE ROTATION</p>
              <h2>YOU MAY ALSO LIKE</h2>
            </div>
            <Link className="text-link" to="/shop">
              VIEW ALL PIECES <ArrowRight size={14} />
            </Link>
          </div>
          <div className="product-grid related-products-grid">
            {recommendations.map((item, idx) => (
              <ProductCard key={`rec-${item.id}-${idx}`} product={item} />
            ))}
          </div>
        </section>
      )}

      {/* SIZE GUIDE MODAL */}
      {showSizeGuide && (
        <div className="modal-backdrop" onClick={() => setShowSizeGuide(false)}>
          <div className="modal-dialog size-guide-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">ENYTM APPARELS</p>
                <h3>GARMENT SIZE GUIDE</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setShowSizeGuide(false)} aria-label="Close size guide">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="size-guide-note">Measurements are in <b>inches</b> (garment laid flat). For chest, measure armpit to armpit and double the number.</p>
              <div className="size-table-wrap">
                <table className="size-table">
                  <thead>
                    <tr>
                      <th>SIZE</th>
                      <th>CHEST (IN)</th>
                      <th>LENGTH (IN)</th>
                      <th>SHOULDER (IN)</th>
                      <th>SLEEVE (IN)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td><b>S</b></td><td>42</td><td>28.5</td><td>20.5</td><td>8.5</td></tr>
                    <tr><td><b>M</b></td><td>44</td><td>29.5</td><td>21.5</td><td>9.0</td></tr>
                    <tr><td><b>L</b></td><td>46</td><td>30.5</td><td>22.5</td><td>9.5</td></tr>
                    <tr><td><b>XL</b></td><td>48</td><td>31.5</td><td>23.5</td><td>10.0</td></tr>
                    <tr><td><b>XXL</b></td><td>50</td><td>32.5</td><td>24.5</td><td>10.5</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="size-guide-tips">
                <div className="tip-box">
                  <strong>OVERSIZED FIT:</strong>
                  <p>Designed with generous width and dropped shoulders. If you prefer a standard/regular fit, select one size smaller than your usual size.</p>
                </div>
                <div className="tip-box">
                  <strong>NEED SIZING ASSISTANCE?</strong>
                  <p>Chat directly with our team on <a href="https://wa.me/message/5KFLGKP4XCG7C1" target="_blank" rel="noreferrer">WhatsApp</a> for personal sizing advice.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {zoomImage && (
        <div className="modal-backdrop lightbox-backdrop" onClick={() => setZoomImage(null)}>
          <button className="lightbox-close" onClick={() => setZoomImage(null)} aria-label="Close image zoom">
            <X size={24} />
          </button>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <img src={zoomImage} alt="Product zoom inspection" />
            <span className="lightbox-caption">{product.name} — Fabric & Finishing Inspection</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Auth({ register = false }) {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", whatsappOptIn: false, emailOptIn: true });
  const [otp, setOtp] = useState({ email: "" });
  const [challengeId, setChallengeId] = useState("");
  const [step, setStep] = useState(register ? "details" : "login");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState("email");
  const [forgotChallengeId, setForgotChallengeId] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showGoogleDevModal, setShowGoogleDevModal] = useState(false);
  const [devGoogleEmail, setDevGoogleEmail] = useState("user@gmail.com");
  const [devGoogleName, setDevGoogleName] = useState("Google User");

  useEffect(() => {
    setStep(register ? "details" : "login");
    setError("");
    setSending(false);
    setSeconds(0);
    setForgotMode(false);
    setForgotStep("email");
    setForgotMessage("");
  }, [register]);

  useEffect(() => {
    if (!seconds) return;
    const t = setInterval(() => setSeconds(v => v - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const update = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleGoogleAuthSuccess = async (googlePayload) => {
    setGoogleLoading(true);
    setError("");
    try {
      const data = await api("/auth/google", {
        method: "POST",
        body: JSON.stringify(googlePayload)
      });
      if (!data?.token) throw new Error("Authentication failed: no session token returned.");
      localStorage.setItem("enytm-token", data.token);
      localStorage.setItem("enytm-user", JSON.stringify(data.user || {}));
      window.dispatchEvent(new Event("enytm:auth_change"));
      const redirect = sessionStorage.getItem("enytm-after-login") || "/";
      sessionStorage.removeItem("enytm-after-login");
      nav(redirect, { replace: true });
    } catch (err) {
      setError(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleClick = () => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "992592766204-s8s7l9gjc5n4m1qbtj5h2hcm7n410342.apps.googleusercontent.com";
    if (googleClientId && window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: "email profile openid",
          callback: async (tokenResponse) => {
            if (tokenResponse?.access_token) {
              setGoogleLoading(true);
              try {
                const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const profile = await userInfoRes.json();
                await handleGoogleAuthSuccess({
                  email: profile.email,
                  name: profile.name,
                  picture: profile.picture,
                  googleId: profile.sub
                });
              } catch {
                setError("Could not retrieve Google profile.");
                setGoogleLoading(false);
              }
            }
          }
        });
        client.requestAccessToken();
        return;
      } catch (e) {
        console.warn("GIS token client error:", e);
      }
    }

    if (googleClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (res) => handleGoogleAuthSuccess({ credential: res.credential }),
          auto_select: false
        });
        window.google.accounts.id.prompt();
        return;
      } catch (e) {
        console.warn("GIS prompt error:", e);
      }
    }

    setShowGoogleDevModal(true);
  };

  const sendOtp = async e => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const data = await api("/auth/register/send-otp", { method: "POST", body: JSON.stringify(form) });
      setChallengeId(data.challengeId);
      setStep("otp");
      setSeconds(60);
    } catch (err) {
      setError(err.message || "Could not send OTP.");
    } finally {
      setSending(false);
    }
  };

  const verifyAndCreate = async e => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const data = await api("/auth/register/verify-otp", { method: "POST", body: JSON.stringify({ emailOtp: otp.email, challengeId, whatsappOptIn: form.whatsappOptIn, emailOptIn: form.emailOptIn }) });
      localStorage.setItem("enytm-token", data.token);
      localStorage.setItem("enytm-user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("enytm:auth_change"));
      const redirect = sessionStorage.getItem("enytm-after-login") || "/";
      sessionStorage.removeItem("enytm-after-login");
      nav(redirect);
    } catch (err) {
      setError(err.message || "Verification failed.");
    } finally {
      setSending(false);
    }
  };

  const sendForgotOtp = async e => {
    e.preventDefault();
    setError("");
    setForgotMessage("");
    setSending(true);
    try {
      const targetEmail = String(form.email || "").trim().toLowerCase();
      if (!targetEmail) throw new Error("Please enter your email address.");
      const data = await api("/auth/password-reset/send-otp", { method: "POST", body: JSON.stringify({ email: targetEmail }) });
      setForgotChallengeId(data.challengeId || "");
      setForgotStep("confirm");
      setSeconds(60);
      setForgotMessage(data.message || "Reset code sent to your email.");
    } catch (err) {
      setError(err.message || "Could not request password reset.");
    } finally {
      setSending(false);
    }
  };

  const confirmPasswordReset = async e => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      if (newPassword.length < 8) throw new Error("Password must be at least 8 characters long.");
      const data = await api("/auth/password-reset/confirm", { method: "POST", body: JSON.stringify({ challengeId: forgotChallengeId, otp: forgotOtp.trim(), password: newPassword }) });
      setForgotMessage(data?.message || "Password updated successfully!");
      setForgotStep("done");
    } catch (err) {
      setError(err.message || "Failed to reset password. Please check the code.");
    } finally {
      setSending(false);
    }
  };

  const login = async e => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const data = await api("/auth/login", { method: "POST", body: JSON.stringify({ email: String(form.email).trim().toLowerCase(), password: form.password }) });
      if (!data?.token) throw new Error("Login succeeded but no session token was returned.");
      if (data.isAdmin && data.adminToken) {
        localStorage.setItem("enytm-admin", data.adminToken);
        localStorage.setItem("enytm-token", data.token);
        localStorage.setItem("enytm-user", JSON.stringify(data.user || {}));
        window.dispatchEvent(new Event("enytm:auth_change"));
        nav("/admin", { replace: true });
        return;
      }
      localStorage.setItem("enytm-token", data.token);
      localStorage.setItem("enytm-user", JSON.stringify(data.user || {}));
      window.dispatchEvent(new Event("enytm:auth_change"));
      const redirect = sessionStorage.getItem("enytm-after-login") || "/";
      sessionStorage.removeItem("enytm-after-login");
      nav(redirect, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">ENYTM MEMBERS</p>
        <h1>
          {forgotMode
            ? "RESET PASSWORD"
            : register
              ? (step === "otp" ? "VERIFY YOUR DETAILS" : "CREATE ACCOUNT")
              : "WELCOME BACK"}
        </h1>
        <p className="muted">
          {forgotMode
            ? (forgotStep === "confirm"
              ? "Enter the 6-digit reset code sent to your email and your new password."
              : forgotStep === "done"
                ? "Your password has been reset. You can now log in with your new credentials."
                : "Enter your registered email address to receive a verification code.")
            : register
              ? (step === "otp"
                ? "Enter the 6-digit verification code sent to your email address."
                : "Create an account for faster checkout, order history and saved products.")
              : "Login to continue to your ENYTM account."}
        </p>

        {error && <div className="error auth-error" role="alert">{error}</div>}

        {!forgotMode && step !== "otp" && (
          <div className="google-auth-section">
            <button
              type="button"
              className="google-auth-btn"
              onClick={handleGoogleClick}
              disabled={googleLoading}
            >
              <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.43 7.35 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.57 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
              <span>{googleLoading ? "CONNECTING TO GOOGLE..." : "CONTINUE WITH GOOGLE"}</span>
            </button>
            <div className="auth-divider">
              <span>OR CONTINUE WITH EMAIL</span>
            </div>
          </div>
        )}

        {register && step !== "otp" && (
          <form className="auth-form" onSubmit={sendOtp}>
            <input className="auth-input" required autoComplete="name" placeholder="Full name" value={form.name} onChange={e => update("name", e.target.value)} />
            <input className="auth-input" required type="email" inputMode="email" autoComplete="email" placeholder="Email address" value={form.email} onChange={e => update("email", e.target.value)} />
            <input className="auth-input" required inputMode="tel" autoComplete="tel" placeholder="Mobile number" value={form.phone} onChange={e => update("phone", e.target.value.replace(/\D/g, "").slice(-10))} />
            <div className="password-field auth-password-field">
              <input className="auth-input" required minLength="6" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Password (min 6 chars)" value={form.password} onChange={e => update("password", e.target.value)} />
              <button type="button" className="auth-password-toggle" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"} title={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
            <label className="check auth-check">
              <input type="checkbox" checked={form.whatsappOptIn} onChange={e => update("whatsappOptIn", e.target.checked)} />
              <span>Receive order updates on WhatsApp.</span>
            </label>
            <label className="check auth-check">
              <input type="checkbox" checked={form.emailOptIn} onChange={e => update("emailOptIn", e.target.checked)} />
              <span>Receive useful ENYTM email updates.</span>
            </label>
            <button disabled={sending} className="btn primary full auth-submit-btn">
              {sending ? "SENDING OTP..." : "CONTINUE WITH OTP"} <ArrowRight size={17} />
            </button>
          </form>
        )}

        {register && step === "otp" && (
          <form className="auth-form" onSubmit={verifyAndCreate}>
            <div className="otp-note">Enter the 6-digit code sent to your email. Your account will be created after the code is verified.</div>
            <input className="auth-input auth-otp-input" required inputMode="numeric" maxLength="6" pattern="[0-9]{6}" placeholder="Email OTP — 6 digits" value={otp.email} onChange={e => setOtp(o => ({ ...o, email: e.target.value.replace(/\D/g, "").slice(0, 6) }))} />
            <button disabled={sending} className="btn primary full auth-submit-btn">
              {sending ? "VERIFYING..." : "VERIFY & CREATE ACCOUNT"} <CheckCircle size={17} />
            </button>
            <button type="button" disabled={sending || seconds > 0} className="btn outline full auth-secondary-btn" onClick={sendOtp}>
              {seconds ? `RESEND OTP IN ${seconds}s` : "RESEND OTP"}
            </button>
            <button type="button" className="text-link" onClick={() => { setStep("details"); setError("") }}>
              ← Change email or mobile number
            </button>
          </form>
        )}

        {!register && !forgotMode && (
          <form className="auth-form" onSubmit={login}>
            <input className="auth-input" required type="email" inputMode="email" autoComplete="email" placeholder="Email address" value={form.email} onChange={e => update("email", e.target.value)} />
            <div className="password-field auth-password-field">
              <input className="auth-input" required minLength="6" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Password" value={form.password} onChange={e => update("password", e.target.value)} />
              <button type="button" className="auth-password-toggle" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"} title={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
            <div className="auth-forgot-row">
              <button type="button" className="text-link" onClick={() => { setForgotMode(true); setForgotStep("email"); setError(""); setForgotMessage("") }}>
                Forgot password?
              </button>
            </div>
            <button disabled={sending} className="btn primary full auth-submit-btn">
              {sending ? "LOGGING IN..." : "LOGIN"} <ArrowRight size={17} />
            </button>
          </form>
        )}

        {!register && forgotMode && forgotStep === "email" && (
          <form className="auth-form" onSubmit={sendForgotOtp}>
            <input className="auth-input" required type="email" inputMode="email" autoComplete="email" placeholder="Registered email address" value={form.email} onChange={e => update("email", e.target.value)} />
            <button disabled={sending} className="btn primary full auth-submit-btn">
              {sending ? "SENDING CODE..." : "SEND RESET CODE"} <ArrowRight size={17} />
            </button>
            <button type="button" className="text-link" onClick={() => { setForgotMode(false); setForgotStep("email"); setError(""); setForgotMessage("") }}>
              ← Back to login
            </button>
          </form>
        )}

        {!register && forgotMode && forgotStep === "confirm" && (
          <form className="auth-form" onSubmit={confirmPasswordReset}>
            {forgotMessage && <div className="lookup-message success">{forgotMessage}</div>}
            <input className="auth-input auth-otp-input" required inputMode="numeric" maxLength="6" pattern="[0-9]{6}" placeholder="Reset code — 6 digits" value={forgotOtp} onChange={e => setForgotOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} />
            <div className="password-field auth-password-field">
              <input className="auth-input" required minLength="8" type={showNewPassword ? "text" : "password"} autoComplete="new-password" placeholder="New password (min 8 chars)" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              <button type="button" className="auth-password-toggle" onClick={() => setShowNewPassword(v => !v)} aria-label={showNewPassword ? "Hide password" : "Show password"} title={showNewPassword ? "Hide password" : "Show password"}>
                {showNewPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
            <button disabled={sending} className="btn primary full auth-submit-btn">
              {sending ? "UPDATING..." : "UPDATE PASSWORD"} <CheckCircle size={17} />
            </button>
            <button type="button" disabled={sending || seconds > 0} className="btn outline full auth-secondary-btn" onClick={sendForgotOtp}>
              {seconds ? `RESEND CODE IN ${seconds}s` : "RESEND CODE"}
            </button>
            <button type="button" className="text-link" onClick={() => { setForgotMode(false); setForgotStep("email"); setError(""); setForgotMessage("") }}>
              ← Back to login
            </button>
          </form>
        )}

        {!register && forgotMode && forgotStep === "done" && (
          <div className="auth-form">
            <div className="lookup-message success">{forgotMessage || "Password updated successfully!"}</div>
            <button type="button" className="btn primary full auth-submit-btn" onClick={() => { setForgotMode(false); setForgotStep("email"); setError(""); setForgotMessage("") }}>
              CONTINUE TO LOGIN <ArrowRight size={17} />
            </button>
          </div>
        )}

        {register ? (
          <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
        ) : (
          <>
            <p className="auth-switch">New to ENYTM? <Link to="/register">Create an account</Link></p>
            <p className="auth-switch" style={{ marginTop: "10px", borderTop: "1px solid #222", paddingTop: "14px" }}>
              Store Administrator? <Link to="/admin" style={{ color: "#c8b69a", fontWeight: "700" }}>Admin Portal →</Link>
            </p>
          </>
        )}
      </div>

      {showGoogleDevModal && (
        <div className="modal-backdrop" onClick={() => setShowGoogleDevModal(false)}>
          <div className="modal-card google-dev-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>CONTINUE WITH GOOGLE</h3>
              <button type="button" className="icon-btn" onClick={() => setShowGoogleDevModal(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <p className="muted" style={{ fontSize: "12px", lineHeight: "1.5", margin: "10px 0 16px" }}>
              To enable live Google Sign-In, add your <code>VITE_GOOGLE_CLIENT_ID</code> to <code>.env</code>. You can test instant Google authentication below:
            </p>
            <div className="auth-form" style={{ gap: "12px" }}>
              <input
                className="auth-input"
                type="email"
                placeholder="Google Email address"
                value={devGoogleEmail}
                onChange={e => setDevGoogleEmail(e.target.value)}
              />
              <input
                className="auth-input"
                placeholder="Full name"
                value={devGoogleName}
                onChange={e => setDevGoogleName(e.target.value)}
              />
              <button
                type="button"
                disabled={googleLoading || !devGoogleEmail}
                className="btn primary full auth-submit-btn"
                onClick={() => {
                  setShowGoogleDevModal(false);
                  handleGoogleAuthSuccess({ email: devGoogleEmail, name: devGoogleName });
                }}
              >
                {googleLoading ? "SIGNING IN..." : "CONTINUE WITH GOOGLE ACCOUNT"} <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className="btn outline full auth-secondary-btn"
                onClick={() => setShowGoogleDevModal(false)}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function AddressLookupFields({ form, setForm, setError, compact = false }) {
  const [cityOptions, setCityOptions] = useState([]);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [pincodeBusy, setPincodeBusy] = useState(false);
  const [lookupMessage, setLookupMessage] = useState("");
  const cityTimer = useRef(null);
  const update = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const lookupPincode = async value => {
    const pin = String(value || "").replace(/\D/g, "").slice(0, 6);
    update("pincode", pin); setLookupMessage("");
    if (pin.length !== 6) return;
    setPincodeBusy(true);
    try {
      const d = await api(`/pincode/${pin}`);
      if (!d.valid) throw new Error(d.message || "Pincode not found. Enter the city and choose a PIN.");
      setForm(f => ({ ...f, pincode: pin, city: d.city || d.district || f.city, state: d.state || f.state, district: d.district || "", postOffice: d.postOffice || "" }));
      setLookupMessage(`✓ ${d.city || d.district || "Location found"}${d.state ? `, ${d.state}` : ""}`);
    } catch (e) { setLookupMessage(e.message || "Could not find this pincode. You can enter city/state manually."); }
    finally { setPincodeBusy(false); }
  };
  const lookupCity = async () => {
    const city = String(form.city || "").trim();
    if (city.length < 2) { setLookupMessage("Enter a city name first."); return; }
    setLookupBusy(true); setLookupMessage("");
    try {
      const d = await api(`/pincode/city/${encodeURIComponent(city)}`);
      const list = Array.isArray(d.pincodes) ? d.pincodes : [];
      setCityOptions(list);
      if (list.length === 1) { await lookupPincode(list[0].pincode); }
      else if (list.length > 1) { setLookupMessage(`${list.length} PIN codes found. Choose your locality below.`); }
      else setLookupMessage("No PIN codes found. Check the city spelling or enter your PIN code manually.");
    } catch (e) { setLookupMessage(e.message || "PIN lookup is temporarily unavailable. Try again in a moment."); }
    finally { setLookupBusy(false); }
  };
  useEffect(() => () => { if (cityTimer.current) clearTimeout(cityTimer.current) }, []);
  return <>
    <input required placeholder="Full name" value={form.name || ""} onChange={e => update("name", e.target.value)} />
    <input required inputMode="tel" placeholder="Phone" value={form.phone || ""} onChange={e => update("phone", e.target.value.replace(/\D/g, "").slice(-10))} />
    <input required className="wide" placeholder="Flat / House / Street / Area" value={form.address || ""} onChange={e => update("address", e.target.value)} />
    <div className="address-city-row">
      <input required placeholder="City" value={form.city || ""} onChange={e => { update("city", e.target.value); setCityOptions([]); setLookupMessage(""); if (cityTimer.current) clearTimeout(cityTimer.current); const val = e.target.value; if (val.trim().length >= 3) cityTimer.current = setTimeout(() => lookupCity(), 650) }} onBlur={() => { if (String(form.city || "").trim().length >= 2) lookupCity() }} />
      <button type="button" className="address-mini-btn" onClick={lookupCity} disabled={lookupBusy}>{lookupBusy ? "SEARCHING..." : "FIND PINCODE"}</button>
    </div>
    {cityOptions.length > 1 && <select className="wide address-select" value={form.pincode || ""} onChange={e => lookupPincode(e.target.value)}><option value="">SELECT PINCODE FOR {String(form.city || "").toUpperCase()}</option>{cityOptions.map((x, i) => <option key={`${x.pincode}-${i}`} value={x.pincode}>{x.pincode}{x.postOffice ? ` — ${x.postOffice}` : ""}{x.district ? ` · ${x.district}` : ""}</option>)}</select>}
    <input required placeholder="State" value={form.state || ""} onChange={e => update("state", e.target.value)} />
    <div className="pincode-control"><input required inputMode="numeric" maxLength="6" placeholder="6-digit Pincode" value={form.pincode || ""} onChange={e => lookupPincode(e.target.value)} />{pincodeBusy && <span>LOOKING UP…</span>}</div>
    {lookupMessage && <div className={`lookup-message ${lookupMessage.startsWith("✓") ? "success" : ""}`}>{lookupMessage}</div>}
  </>
}

function Checkout() {
  const { cart, updateQty, updateSize, removeFromCart, addToWishlist } = useCart();
  const products = useProducts();
  const nav = useNavigate();
  const cachedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("enytm-user") || "null");
    } catch {
      return null;
    }
  }, []);
  const [user, setUser] = useState(cachedUser);
  const [loading, setLoading] = useState(() => !localStorage.getItem("enytm-user"));
  const [form, setForm] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("enytm-user") || "null");
      const a = Array.isArray(u?.addresses) ? u.addresses.find((x) => x.isDefault) || u.addresses[0] : u?.address;
      return {
        name: a?.name || u?.name || "",
        phone: a?.phone || u?.phone || "",
        address: a?.address || "",
        city: a?.city || "",
        state: a?.state || "",
        pincode: a?.pincode || ""
      };
    } catch {
      return { name: "", phone: "", address: "", city: "", state: "", pincode: "" };
    }
  });
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponBusy, setCouponBusy] = useState(false);
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [oosMovedItems, setOosMovedItems] = useState([]);

  // Selected items from cart for checkout
  const checkoutItems = useMemo(() => {
    const sel = cart.filter(i => i.selected !== false);
    return sel.length > 0 ? sel : cart;
  }, [cart]);
  const checkoutSubtotal = useMemo(() => {
    return checkoutItems.reduce((s, i) => s + ((Number(i.price) || 0) * (Number(i.qty) || 0)), 0);
  }, [checkoutItems]);
  const totalQty = checkoutItems.reduce((s, i) => s + (Number(i.qty) || 0), 0);
  const qtyDiscountPct = totalQty >= 3 ? 0.15 : (totalQty >= 2 ? 0.10 : 0);
  const buy2Discount = (!appliedCoupon && qtyDiscountPct > 0) ? Math.round(checkoutSubtotal * qtyDiscountPct) : 0;
  const isFreeShipping = true;
  const shippingFee = 0;
  const couponDiscountVal = Number(appliedCoupon?.discount || 0);
  const basePayable = Math.max(0, checkoutSubtotal - buy2Discount - couponDiscountVal + shippingFee);

  // Online payment gets instant extra 5% discount (no advance needed, full payment)
  const isOnline = paymentMethod === "online";
  const onlineDiscount = Math.round(basePayable * 0.05);
  const onlinePayable = Math.max(0, basePayable - onlineDiscount);

  // Cash on Delivery (COD) requires 30% advance online today to confirm booking
  const advanceDue = Math.ceil(basePayable * 0.30);
  const balanceDue = basePayable - advanceDue;

  // Active payment calculations based on chosen payment method
  const payableToday = isOnline ? onlinePayable : advanceDue;
  const finalPayable = isOnline ? onlinePayable : basePayable;

  useEffect(() => {
    if (!products || !products.length || !cart.length) return;

    const moved = [];
    cart.forEach(item => {
      const prod = products.find(p => String(p.id) === String(item.id));
      const isProductOOS = !prod || Number(prod.stock || 0) <= 0;
      const isSizeOOS = Boolean(
        prod?.sizeStock &&
        typeof prod.sizeStock[item.size] !== "undefined" &&
        Number(prod.sizeStock[item.size] || 0) <= 0
      );

      if (isProductOOS || isSizeOOS) {
        moved.push({
          id: item.id,
          key: item.key,
          name: item.name,
          size: item.size
        });
      }
    });

    if (moved.length > 0) {
      moved.forEach(m => {
        removeFromCart(m.key);
        addToWishlist(m.id);
      });
      setOosMovedItems(prev => {
        const existingKeys = new Set(prev.map(p => p.key));
        const newOnes = moved.filter(m => !existingKeys.has(m.key));
        return [...prev, ...newOnes];
      });
    }
  }, [products, cart]);

  useEffect(() => {
    if (error && error.toLowerCase().includes("item")) {
      setShowMobileSummary(true);
    }
  }, [error]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const token = localStorage.getItem("enytm-token");
      if (!token) {
        sessionStorage.setItem("enytm-after-login", "/checkout");
        nav("/login");
        return;
      }
      try {
        const u = await api("/auth/me");
        if (!alive) return;
        if (u && typeof u === "object") {
          setUser(u);
          try { localStorage.setItem("enytm-user", JSON.stringify(u)); } catch {}
          const a = Array.isArray(u.addresses) ? u.addresses.find((x) => x.isDefault) || u.addresses[0] : u.address;
          setForm(prev => ({
            name: a?.name || u.name || prev.name || "",
            phone: a?.phone || u.phone || prev.phone || "",
            address: a?.address || prev.address || "",
            city: a?.city || prev.city || "",
            state: a?.state || prev.state || "",
            pincode: a?.pincode || prev.pincode || ""
          }));
        }
      } catch (e) {
        if (!alive) return;
        const msg = e?.message || "";
        const isAuthExpired = msg.toLowerCase().includes("session") || msg.includes("401");
        if (isAuthExpired && !cachedUser) {
          setError("Your session has expired. Please log in again.");
        } else if (!cachedUser) {
          setError(msg || "Could not load your account.");
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [nav, cachedUser]);

  const applyCoupon = async () => {
    setCouponBusy(true);
    setError("");
    try {
      const result = await api("/coupons/validate", {
        method: "POST",
        body: JSON.stringify({ code: couponCode, items: checkoutItems })
      });
      setAppliedCoupon(result);
      setCouponCode(result.code);
      setError("");
    } catch (e) {
      setAppliedCoupon(null);
      setError(e.message || "Could not apply coupon.");
    } finally {
      setCouponBusy(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setError("");
  };

  const pay = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await api("/checkout/order", {
        method: "POST",
        body: JSON.stringify({
          items: checkoutItems,
          shippingAddress: form,
          couponCode: appliedCoupon?.code || "",
          paymentMethod
        })
      });
      if (!window.Razorpay) throw new Error("Razorpay Checkout could not load. Check your internet connection.");
      const digits = String(form.phone || "").replace(/\D/g, "").slice(-10);
      if (digits.length !== 10) throw new Error("Please enter a valid 10-digit mobile number.");
      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "ENYTM APPARELS",
        description: isOnline ? "ENYTM prepaid full order (5% off)" : "ENYTM COD 30% advance confirmation",
        order_id: data.razorpayOrderId,
        prefill: { name: form.name, email: user?.email, contact: digits },
        theme: { color: "#111111" },
        modal: { ondismiss: () => { } },
        handler: async (response) => {
          await api("/checkout/verify", {
            method: "POST",
            body: JSON.stringify({ ...response, orderId: data.orderId })
          });
          checkoutItems.forEach(i => removeFromCart(i.key));
          nav(`/order-success/${data.orderId}`);
        }
      });
      rzp.on("payment.failed", (r) => setError(r.error?.description || "Payment failed. Please try again."));
      rzp.open();
    } catch (err) {
      setError(err.message || "Could not start payment.");
    }
  };

  if (loading)
    return (
      <main className="empty loading-page">
        <p className="eyebrow">SECURE CHECKOUT</p>
        <h1>LOADING CHECKOUT...</h1>
      </main>
    );

  if (!user)
    return (
      <main className="empty">
        <p className="eyebrow">SECURE CHECKOUT</p>
        <h1>CHECKOUT UNAVAILABLE</h1>
        {error && <div className="error">{error}</div>}
        <Link className="btn primary" to="/login">
          LOGIN AGAIN
        </Link>
      </main>
    );

  if (!cart.length)
    return (
      <main className="empty">
        <ShoppingBag size={50} />
        <h2>YOUR BAG IS EMPTY</h2>
        <p style={{ color: "#888", margin: "16px 0 24px" }}>Add pieces to your bag to proceed with checkout.</p>
        <Link className="btn primary" to="/shop">
          EXPLORE PRODUCTS
        </Link>
      </main>
    );

  const handleIncrease = (item) => {
    setError("");
    const productObj = products?.find((p) => String(p.id) === String(item.id));
    const maxStock = typeof productObj?.stock === "number" ? productObj.stock : (typeof item.stock === "number" ? item.stock : null);
    if (maxStock !== null && maxStock > 0 && item.qty >= maxStock) {
      setError(`${item.name} has only ${maxStock} items available in stock.`);
      return;
    }
    updateQty(item.key, item.qty + 1);
  };

  const handleDecrease = (item) => {
    setError("");
    if (item.qty > 1) {
      updateQty(item.key, item.qty - 1);
    } else {
      removeFromCart(item.key);
    }
  };

  const handleRemove = (item) => {
    setError("");
    removeFromCart(item.key);
  };

  const renderCheckoutItem = (i) => {
    const productObj = products?.find((p) => String(p.id) === String(i.id));
    const stockCount = typeof productObj?.stock === "number" ? productObj.stock : (typeof i.stock === "number" ? i.stock : null);
    const isLowStock = stockCount !== null && stockCount < 6;
    const isOverStock = stockCount !== null && i.qty > stockCount;

    return (
      <div key={i.key} className="checkout-item-card">
        <div className="checkout-item-img-wrap">
          <img src={normalizeImageUrl(i.image)} alt={i.name} />
        </div>
        <div className="checkout-item-details">
          <div className="checkout-item-row-top">
            <h4>{i.name}</h4>
            <strong className="checkout-item-price">
              ₹{(Number(i.price) * Number(i.qty)).toLocaleString("en-IN")}
            </strong>
          </div>
          <div className="checkout-item-meta">
            <CartSizeDropdown
              currentSize={i.size}
              availableSizes={productObj?.sizes && productObj.sizes.length ? productObj.sizes : ["S", "M", "L", "XL", "XXL"]}
              sizeStock={productObj?.sizeStock || {}}
              onSelect={(newSize) => updateSize(i.key, newSize)}
            />
            {Number(i.qty) > 1 && (
              <span className="checkout-item-rate">₹{Number(i.price).toLocaleString("en-IN")} each</span>
            )}
            {isOverStock ? (
              <span className="checkout-stock-pill out">Exceeds available stock</span>
            ) : isLowStock ? (
              <span className="checkout-stock-pill">Low stock</span>
            ) : null}
          </div>
          <div className="checkout-item-controls">
            <div className="checkout-qty-stepper">
              <button
                type="button"
                className="qty-btn"
                onClick={() => handleDecrease(i)}
                aria-label={`Decrease quantity of ${i.name}`}
                title="Decrease quantity"
              >
                <Minus size={13} />
              </button>
              <span className="qty-count">{i.qty}</span>
              <button
                type="button"
                className="qty-btn"
                onClick={() => handleIncrease(i)}
                aria-label={`Increase quantity of ${i.name}`}
                title="Increase quantity"
              >
                <Plus size={13} />
              </button>
            </div>
            <button
              type="button"
              className="checkout-item-remove"
              onClick={() => handleRemove(i)}
              aria-label={`Remove ${i.name} from bag`}
              title="Remove item"
            >
              <Trash2 size={13} />
              <span>REMOVE</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="checkout-page">
      <div className="checkout-head">
        <p className="eyebrow">ENYTM APPARELS · SECURE CHECKOUT</p>
        <h1>COMPLETE YOUR ORDER</h1>
      </div>
      {oosMovedItems.length > 0 && (
        <div className="cart-oos-banner" style={{ margin: "0 auto 20px", maxWidth: "1200px" }}>
          <div className="cart-oos-banner-header">
            <Heart size={16} style={{ color: "#cbb89a" }} />
            <strong>OUT OF STOCK ITEMS MOVED TO WISHLIST</strong>
            <button className="cart-oos-close" onClick={() => setOosMovedItems([])} aria-label="Dismiss">✕</button>
          </div>
          <p>
            {oosMovedItems.map(m => `"${m.name}" (Size ${m.size})`).join(", ")} {oosMovedItems.length === 1 ? "is" : "are"} currently sold out and {oosMovedItems.length === 1 ? "has" : "have"} been automatically moved to your <Link to="/wishlist" className="cart-oos-wishlist-link">Wishlist</Link>.
          </p>
        </div>
      )}
      <div className="checkout-layout">
        {/* MOBILE COLLAPSIBLE ORDER SUMMARY WITH QUANTITY ADJUSTMENT */}
        <div className="mobile-order-summary-wrapper">
          <button
            type="button"
            className="mobile-order-summary-bar"
            onClick={() => setShowMobileSummary((prev) => !prev)}
            aria-expanded={showMobileSummary}
          >
            <div className="mobile-summary-bar-left">
              <ShoppingBag size={16} style={{ color: "#cbb89a", flexShrink: 0 }} />
              <span>
                {showMobileSummary ? "Hide order items" : "Order Summary"} ({totalQty} {totalQty === 1 ? "item" : "items"})
              </span>
              <ChevronDown size={14} className={`summary-arrow ${showMobileSummary ? "open" : ""}`} style={{ color: "#cbb89a", flexShrink: 0 }} />
            </div>
            <div className="mobile-summary-bar-right">
              <small>{isOnline ? "5% OFF PREPAID" : "30% COD ADVANCE"}</small>
              <strong>₹{payableToday.toLocaleString("en-IN")}</strong>
            </div>
          </button>

          {showMobileSummary && (
            <div className="mobile-order-summary-drawer">
              <div className="mobile-order-items-list">
                {checkoutItems.map(renderCheckoutItem)}
              </div>
              <div className="mobile-summary-subtotals">
                <div>
                  <span>Subtotal ({totalQty} item{totalQty === 1 ? "" : "s"})</span>
                  <b>₹{checkoutSubtotal.toLocaleString("en-IN")}</b>
                </div>
                {buy2Discount > 0 && (
                  <div className="promo-line">
                    <span>Promotional Discount (Buy {totalQty >= 3 ? "3, Get 15%" : "2, Get 10%"} Off)</span>
                    <b className="discount-green">−₹{buy2Discount.toLocaleString("en-IN")}</b>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="coupon-summary-line">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <b className="discount-green">−₹{Number(appliedCoupon.discount).toLocaleString("en-IN")}</b>
                  </div>
                )}
                {isOnline && onlineDiscount > 0 && (
                  <div className="promo-line">
                    <span className="full-discount-label">
                      <Sparkles size={12} /> Online Payment Discount (Extra 5% Off)
                    </span>
                    <b className="discount-green">−₹{onlineDiscount.toLocaleString("en-IN")}</b>
                  </div>
                )}
                <div>
                  <span>Shipping</span>
                  <b>FREE</b>
                </div>
                <div className="mobile-summary-advance-preview">
                  {isOnline ? (
                    <>
                      <span>Payable in full online today (5% off applied):</span>
                      <strong className="gold-text">₹{onlinePayable.toLocaleString("en-IN")}</strong>
                    </>
                  ) : (
                    <>
                      <span>COD advance due today (30%):</span>
                      <strong>₹{advanceDue.toLocaleString("en-IN")}</strong>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <form className="checkout-form" onSubmit={pay}>
          <h2>1. DELIVERY DETAILS</h2>
          <div className="form-grid">
            <AddressLookupFields form={form} setForm={setForm} setError={setError} />
          </div>

          <h2>2. PROMOTIONAL COUPON</h2>
          <div className="checkout-coupon-row">
            <input
              aria-label="Coupon code"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              disabled={!!appliedCoupon}
            />
            {appliedCoupon ? (
              <button type="button" className="btn outline" onClick={removeCoupon}>
                REMOVE
              </button>
            ) : (
              <button
                type="button"
                className="btn outline"
                disabled={couponBusy || !couponCode.trim()}
                onClick={applyCoupon}
              >
                {couponBusy ? "CHECKING..." : "APPLY"}
              </button>
            )}
          </div>
          {appliedCoupon && (
            <p className="coupon-success">
              ✓ {appliedCoupon.code} applied — you save ₹{Number(appliedCoupon.discount).toLocaleString("en-IN")}
            </p>
          )}

          <h2>3. CHOOSE PAYMENT METHOD</h2>

          <div className="payment-plan-selector" role="radiogroup" aria-label="Payment Method Options">
            {/* OPTION 1: ONLINE PAYMENT (100% PREPAID WITH 5% DISCOUNT) */}
            <div
              className={`payment-plan-card ${isOnline ? "active" : ""}`}
              onClick={() => setPaymentMethod("online")}
              role="radio"
              aria-checked={isOnline}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPaymentMethod("online"); } }}
            >
              <div className="plan-card-header">
                <div className="plan-radio-row">
                  <span className={`plan-radio-circle ${isOnline ? "selected" : ""}`}>
                    {isOnline && <span className="plan-radio-dot" />}
                  </span>
                  <div className="plan-title-group">
                    <div className="plan-title-row">
                      <strong className="plan-title">ONLINE PAYMENT (PREPAID)</strong>
                      <span className="plan-save-pill">⚡ EXTRA 5% OFF</span>
                    </div>
                    <span className="plan-subtitle">Pay 100% online now (UPI, Cards, NetBanking, Cred) · No advance needed</span>
                  </div>
                </div>
                <div className="plan-amount-group">
                  <strong className="plan-amount-highlight">₹{onlinePayable.toLocaleString("en-IN")}</strong>
                  <del className="plan-strikethrough">₹{basePayable.toLocaleString("en-IN")}</del>
                </div>
              </div>

              {isOnline && (
                <div className="plan-active-perks">
                  <div className="plan-perk-row">
                    <CheckCircle size={13} className="text-gold" />
                    <span>Instant <b>5% prepaid discount (save ₹{onlineDiscount.toLocaleString("en-IN")})</b> applied</span>
                  </div>
                  <div className="plan-perk-row">
                    <CheckCircle size={13} className="text-gold" />
                    <span><b>Zero advance split</b> — pay once online with 100% secure settlement</span>
                  </div>
                  <div className="plan-perk-row">
                    <CheckCircle size={13} className="text-gold" />
                    <span><b>Priority dispatch</b> when Drop 001 collection ships</span>
                  </div>
                </div>
              )}
            </div>

            {/* OPTION 2: CASH ON DELIVERY (COD - 30% ADVANCE TO CONFIRM) */}
            <div
              className={`payment-plan-card ${!isOnline ? "active" : ""}`}
              onClick={() => setPaymentMethod("cod")}
              role="radio"
              aria-checked={!isOnline}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPaymentMethod("cod"); } }}
            >
              <div className="plan-card-header">
                <div className="plan-radio-row">
                  <span className={`plan-radio-circle ${!isOnline ? "selected" : ""}`}>
                    {!isOnline && <span className="plan-radio-dot" />}
                  </span>
                  <div className="plan-title-group">
                    <div className="plan-title-row">
                      <strong className="plan-title">CASH ON DELIVERY (COD)</strong>
                      <span className="plan-split-pill">30% ADVANCE REQUIRED</span>
                    </div>
                    <span className="plan-subtitle">Pay 30% advance now to confirm order · Remaining 70% in cash on delivery</span>
                  </div>
                </div>
                <div className="plan-amount-group">
                  <strong className="plan-amount-highlight">₹{advanceDue.toLocaleString("en-IN")}</strong>
                  <span className="plan-amount-note">due today online</span>
                </div>
              </div>

              {!isOnline && (
                <div className="plan-active-perks">
                  <div className="plan-perk-row">
                    <CheckCircle size={13} className="text-muted" />
                    <span>Pay 30% advance today online: <b>₹{advanceDue.toLocaleString("en-IN")}</b> to confirm booking</span>
                  </div>
                  <div className="plan-perk-row">
                    <CheckCircle size={13} className="text-muted" />
                    <span>Remaining 70% cash balance: <b>₹{balanceDue.toLocaleString("en-IN")}</b> payable upon delivery</span>
                  </div>
                  <div className="plan-perk-row">
                    <CheckCircle size={13} className="text-muted" />
                    <span>100% full refund available if cancelled within 24 hours</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="payment-box">
            <LockKeyhole />
            <div>
              <b>Razorpay Bank-Grade Secure Checkout</b>
              <p>UPI (GPay, PhonePe, Paytm) · Credit/Debit Cards · NetBanking · Cred</p>
            </div>
            <span>256-BIT SSL</span>
          </div>

          {error && <div className="error">{error}</div>}

          {isOnline ? (
            <div className="preorder-payment-note full-payment-selected-note">
              <div className="preorder-badge-title">
                <Sparkles size={14} /> <b>ONLINE PREPAID PERK · EXTRA 5% OFF UNLOCKED</b>
              </div>
              <p>
                You selected <b>Online Payment</b>. Pay 100% in full today and receive an <b>exclusive extra 5% discount (₹{onlineDiscount.toLocaleString("en-IN")})</b>. No advance split or cash payment needed at delivery.
              </p>
              <p className="preorder-cancel-rule">
                Cancellation with 100% full refund is available within 24 hours of payment. After 24 hours, custom manufacturing begins.
              </p>
              <div className="preorder-split-row">
                <span>Amount payable today (100% with 5% off)</span>
                <strong>₹{onlinePayable.toLocaleString("en-IN")}</strong>
              </div>
              <div className="preorder-split-row">
                <span>Balance due on delivery</span>
                <strong style={{ color: "#4ade80" }}>₹0 (Fully Settled Online)</strong>
              </div>
            </div>
          ) : (
            <div className="preorder-payment-note">
              <div className="preorder-badge-title">
                <Sparkles size={14} /> <b>CASH ON DELIVERY (COD) TERMS · 30% ADVANCE</b>
              </div>
              <p>
                To prevent unverified bookings and confirm garment manufacturing, <b>COD requires a 30% advance payment online today</b> via Razorpay. The remaining 70% is collected in cash or UPI at your doorstep upon delivery.
              </p>
              <p className="preorder-cancel-rule">
                Cancellation with 100% full refund is available within 24 hours of payment. After 24 hours, production begins and advance becomes non-refundable.
              </p>
              <div className="preorder-split-row">
                <span>Advance due today online (30%)</span>
                <strong>₹{advanceDue.toLocaleString("en-IN")}</strong>
              </div>
              <div className="preorder-split-row">
                <span>Cash due on delivery (70%)</span>
                <strong>₹{balanceDue.toLocaleString("en-IN")}</strong>
              </div>
            </div>
          )}

          <button className="btn primary full checkout-pay-btn" type="submit">
            {isOnline
              ? `PAY ONLINE ₹${onlinePayable.toLocaleString("en-IN")} (5% OFF) `
              : `PAY 30% ADVANCE ₹${advanceDue.toLocaleString("en-IN")} TO CONFIRM COD `}
            <ArrowRight />
          </button>
          <p className="tiny">
            Payments are securely encrypted and processed by Razorpay. ENYTM does not store your card, UPI or bank details.
          </p>
        </form>

        <aside className="summary">
          <div className="summary-title-row">
            <h2>YOUR BAG ({totalQty} {totalQty === 1 ? "PIECE" : "PIECES"})</h2>
            <Link to="/cart" className="summary-edit-cart-link">FULL BAG →</Link>
          </div>
          <div className="checkout-summary-items-list">
            {checkoutItems.map(renderCheckoutItem)}
          </div>
          <hr />
          <div>
            <span>Subtotal</span>
            <b>₹{checkoutSubtotal.toLocaleString("en-IN")}</b>
          </div>
          {buy2Discount > 0 && (
            <div className="promo-line">
              <span>Promotional Discount (Buy {totalQty >= 3 ? "3, Get 15%" : "2, Get 10%"} Off)</span>
              <b className="discount-green">−₹{buy2Discount.toLocaleString("en-IN")}</b>
            </div>
          )}
          {appliedCoupon && (
            <div className="coupon-summary-line">
              <span>Coupon ({appliedCoupon.code})</span>
              <b className="discount-green">−₹{Number(appliedCoupon.discount).toLocaleString("en-IN")}</b>
            </div>
          )}
          {isOnline && onlineDiscount > 0 && (
            <div className="full-payment-discount-line">
              <span className="full-discount-label">
                <Sparkles size={12} /> Online Payment Perk (Extra 5% Off)
              </span>
              <b className="discount-green">−₹{onlineDiscount.toLocaleString("en-IN")}</b>
            </div>
          )}
          <div>
            <span>Shipping</span>
            <b>FREE</b>
          </div>
          <hr />
          <div className="total checkout-final-total-row">
            <span>TOTAL ORDER VALUE</span>
            <b className="checkout-final-amount">₹{finalPayable.toLocaleString("en-IN")}</b>
          </div>
          <div className="checkout-preorder-summary-split">
            {isOnline ? (
              <>
                <div>
                  <span>Payable online today (100%):</span>
                  <b style={{ color: "#c8b69a" }}>₹{onlinePayable.toLocaleString("en-IN")}</b>
                </div>
                <div>
                  <span>Balance due on delivery:</span>
                  <b style={{ color: "#4ade80" }}>₹0 (Fully Settled)</b>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span>Advance due today online (30%):</span>
                  <b>₹{advanceDue.toLocaleString("en-IN")}</b>
                </div>
                <div>
                  <span>Cash balance due on delivery (70%):</span>
                  <b>₹{balanceDue.toLocaleString("en-IN")}</b>
                </div>
              </>
            )}
          </div>
          <div className="checkout-trust-points">
            <span><ShieldCheck size={14} /> 100% Authentic Garments</span>
            <span><Truck size={14} /> Insured All-India Courier</span>
            <span><RotateCcw size={14} /> 48-Hour Inspection Window</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
function OrderDetails() {
  const id = useLocation().pathname.split("/").pop();
  const nav = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionBusy, setActionBusy] = useState(false);
  const [message, setMessage] = useState("");
  const load = async () => { setLoading(true); setError(""); try { const o = await api(`/orders/${id}`); setOrder(o) } catch (e) { setError(e.message || "Could not load this order.") } finally { setLoading(false) } };
  useEffect(() => { if (!localStorage.getItem("enytm-token")) { nav("/login"); return } load(); const refresh = window.setInterval(() => { api(`/orders/${id}`).then(setOrder).catch(() => { }) }, 30000); return () => window.clearInterval(refresh) }, [id]);
  const status = String(order?.status || "payment_pending");
  const shipped = ["shipped", "out_for_delivery", "delivered"].includes(status);
  const cancelled = status === "cancelled";
  const statusIndex = { payment_pending: 0, confirmed: 1, packed: 2, shipped: 3, out_for_delivery: 4, delivered: 5, cancelled: 0 }[status] ?? 0;
  const statusLabel = status === "payment_pending" ? "PAYMENT PENDING" : status.replace(/_/g, " ").toUpperCase();
  const deliveryDate = order?.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate) : null;
  const formatDate = d => d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const cancelOrder = async () => { if (!window.confirm("Cancel this order? You will be asked to choose where an eligible refund should go.")) return; const paid = Number(order?.advancePaid || 0) + Number(order?.balancePaid || 0); let refundTo = "original"; if (paid > 0) { const choice = window.prompt("Refund preference: type WALLET to refund to your ENYTM wallet, or ORIGINAL to refund to the original payment method.", "ORIGINAL"); if (choice === null) return; const normalized = choice.trim().toLowerCase(); if (!["wallet", "original"].includes(normalized)) { setMessage("Please type WALLET or ORIGINAL. No cancellation was made."); return; } refundTo = normalized; } setActionBusy(true); setMessage(""); try { const o = await api(`/orders/${id}/cancel`, { method: "POST", body: JSON.stringify({ refundTo }) }); setOrder(o); setMessage(o.refundStatus === "initiated" ? "Order cancelled. Your refund has been initiated." : o.refundStatus === "wallet_credited" ? "Order cancelled and eligible refund credited to your ENYTM wallet." : "Order cancelled successfully.") } catch (e) { setMessage(e.message || "Could not cancel the order.") } finally { setActionBusy(false) } };
  const payBalance = async () => { setActionBusy(true); setMessage(""); try { const data = await api(`/orders/${id}/balance/order`, { method: "POST" }); if (!window.Razorpay) throw new Error("Razorpay Checkout could not load. Check your internet connection."); const rzp = new window.Razorpay({ key: data.keyId, amount: data.amount, currency: data.currency, name: "ENYTM APPARELS", description: "ENYTM pre-order balance", order_id: data.razorpayOrderId, theme: { color: "#111111" }, handler: async response => { try { const result = await api("/checkout/verify", { method: "POST", body: JSON.stringify({ ...response, orderId: data.orderId }) }); setOrder(result.order); setMessage("Balance payment successful. Your order is fully paid and will be dispatched after launch."); } catch (e) { setMessage(e.message || "Payment verification is pending. Refresh the order shortly."); } }, modal: { ondismiss: () => setActionBusy(false) } }); rzp.on("payment.failed", r => { setMessage(r.error?.description || "Balance payment failed. Please try again."); setActionBusy(false) }); rzp.open(); } catch (e) { setMessage(e.message || "Could not start balance payment."); setActionBusy(false) } };
  if (loading) return <main className="empty loading-page"><p className="eyebrow">ENYTM ORDER</p><h1>LOADING ORDER...</h1></main>;
  if (error || !order) return <main className="empty"><p className="eyebrow">ENYTM ORDER</p><h1>ORDER NOT FOUND</h1>{error && <div className="error">{error}</div>}<Link className="btn primary" to="/orders">BACK TO MY ORDERS</Link></main>;
  const steps = [
    ["confirmed", "ORDER CONFIRMED", "We received your order."],
    ["packed", "PACKED", "Your order is being prepared."],
    ["shipped", "SHIPPED", "Your package is on the way."],
    ["out_for_delivery", "OUT FOR DELIVERY", "Your package is arriving today."],
    ["delivered", "DELIVERED", "Delivered to your address."]
  ];
  return <main className="order-detail-page">
    <div className="order-detail-top"><div><p className="eyebrow">ENYTM / ORDER DETAILS</p><h1>{order.receipt || order.id}</h1><p className="muted">Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</p></div><Link className="text-link" to="/orders">← MY ORDERS</Link></div>
    {message && <div className="order-action-message">{message}</div>}
    <section className="order-status-card">
      <div className="order-status-head"><div><span className={`order-status-big ${cancelled ? "cancelled" : ""}`}>{cancelled ? "ORDER CANCELLED" : statusLabel}</span><h2>{cancelled ? "This order has been cancelled." : deliveryDate ? `Estimated delivery: ${formatDate(deliveryDate)}` : "Delivery date will be updated soon."}</h2></div>{!cancelled && <Truck size={30} />}</div>
      {!cancelled ? <div className="order-timeline">{steps.map((step, i) => { const active = i <= statusIndex; return <div className={`timeline-step ${active ? "active" : ""}`} key={step[0]}><div className="timeline-dot">{active ? <CheckCircle size={16} /> : <span>{i + 1}</span>}</div><div><b>{step[1]}</b><small>{step[2]}</small></div></div> })}</div> : <div className="cancelled-note">If your payment was online, refund status: <b>{String(order.refundStatus || "pending").replace(/_/g, " ")}</b>.</div>}
    </section>
    <div className="order-detail-grid">
      <section className="order-detail-main">
        <div className="order-panel"><div className="panel-head"><h2>ITEMS</h2><span>{order.items?.length || 0} ITEM{order.items?.length === 1 ? "" : "S"}</span></div>{(order.items || []).map((item, idx) => <article className="order-item-detail" key={`${item.productId}-${idx}`}><img src={item.image} alt={item.name} /><div className="order-item-copy"><h3>{item.name}</h3><p>Size: <b>{item.size || "—"}</b> · Qty: <b>{item.qty}</b></p><p className="muted">₹{Number(item.price).toLocaleString("en-IN")} each</p></div><strong>₹{(Number(item.price) * Number(item.qty)).toLocaleString("en-IN")}</strong></article>)}</div>
        {order.tracking?.trackingNumber && <div className="order-panel tracking-panel"><div className="panel-head"><h2>TRACK SHIPMENT</h2><span>{order.tracking.courier}</span></div><div className="tracking-row"><Package size={22} /><div><b>{order.tracking.trackingNumber}</b><small>Tracking number</small></div>{order.tracking.trackingUrl && <a className="btn outline" href={order.tracking.trackingUrl} target="_blank" rel="noreferrer">TRACK NOW <ArrowRight size={15} /></a>}</div></div>}
        <div className="order-panel"><div className="panel-head"><h2>DELIVERY ADDRESS</h2><MapPin size={18} /></div><div className="delivery-address"><b>{order.customer?.name}</b><p>{order.customer?.address}</p><p>{order.customer?.city}, {order.customer?.state} — {order.customer?.pincode}</p><p>{order.customer?.phone}</p></div></div>
      </section>
      <aside className="order-detail-side">
        <div className="order-panel price-panel"><div className="panel-head"><h2>PRICE DETAILS</h2></div><div><span>Item total</span><b>₹{Number(order.subtotal || 0).toLocaleString("en-IN")}</b></div><div><span>Shipping</span><b>{Number(order.shipping || 0) ? `₹${Number(order.shipping).toLocaleString("en-IN")}` : "FREE"}</b></div>{Number(order.buy2Discount || 0) > 0 && <div className="promo-line"><span>Promotional Discount</span><b className="discount-green">−₹{Number(order.buy2Discount).toLocaleString("en-IN")}</b></div>}{Number(order.discount || 0) > 0 && !order.buy2Discount && <div className="coupon-summary-line"><span>Coupon ({order.couponCode})</span><b className="discount-green">−₹{Number(order.discount).toLocaleString("en-IN")}</b></div>}{Number(order.fullPaymentDiscount || 0) > 0 && <div className="promo-line"><span>Online Payment Discount (5% Off)</span><b className="discount-green">−₹{Number(order.fullPaymentDiscount).toLocaleString("en-IN")}</b></div>}{Number(order.codFee || 0) > 0 && <div><span>COD fee</span><b>₹{Number(order.codFee).toLocaleString("en-IN")}</b></div>}<hr /><div className="grand"><span>ORDER TOTAL</span><b>₹{Number(order.total || 0).toLocaleString("en-IN")}</b></div>{order.paymentMethod === "cod" ? (<><div><span>Payment method</span><b>Cash on Delivery (30% Advance)</b></div><div><span>Advance paid online (30%)</span><b>₹{Number(order.advancePaid || 0).toLocaleString("en-IN")}</b></div><div><span>Cash due on delivery (70%)</span><b>₹{Math.max(0, Number(order.total || 0) - Number(order.advancePaid || 0) - Number(order.balancePaid || 0)).toLocaleString("en-IN")}</b></div></>) : (<><div><span>Payment method</span><b>Online Payment (100% Prepaid)</b></div><div><span>Amount paid online</span><b>₹{Number(order.advancePaid || order.total || 0).toLocaleString("en-IN")}</b></div><div><span>Balance due on delivery</span><b style={{ color: "#4ade80" }}>₹0 (Fully Paid)</b></div></>)}<p className="payment-meta">Payment: {String(order.paymentMethod || "online").toUpperCase()} · {String(order.paymentStatus || "").replace(/_/g, " ").toUpperCase()}</p>{!cancelled && order.paymentStatus !== "paid" && order.paymentMethod !== "cod" && Number(order.advancePaid || 0) > 0 && <button className="btn primary full" disabled={actionBusy} onClick={payBalance}>{actionBusy ? "PROCESSING..." : `PAY BALANCE ₹${Math.max(0, Number(order.total || 0) - Number(order.advancePaid || 0) - Number(order.balancePaid || 0)).toLocaleString("en-IN")}`}</button>}</div>
        <div className="order-panel delivery-summary"><div className="panel-head"><h2>DELIVERY</h2><CalendarDays size={18} /></div><b>{deliveryDate ? formatDate(deliveryDate) : "To be confirmed"}</b><p className="muted">Standard delivery</p></div>
        <div className="order-actions-panel">{!cancelled && <><button className="btn primary full" disabled={actionBusy || shipped} onClick={cancelOrder}>{shipped ? "CANCELLATION CLOSED" : actionBusy ? "PROCESSING..." : "CANCEL ORDER"}</button><p className="action-note">Cancellation is available until the order is shipped.</p></>}<Link className="btn outline full" to="/shop">CONTINUE SHOPPING</Link></div>
      </aside>
    </div>
  </main>
}

function OrderSuccess() {
  // Keep the checkout success URL compatible with existing payment redirects,
  // but send customers to the full order-details screen where order actions are
  // connected to the existing authenticated backend endpoints.
  const location = useLocation();
  const nav = useNavigate();
  const id = location.pathname.split("/").pop();

  useEffect(() => {
    if (!localStorage.getItem("enytm-token")) {
      sessionStorage.setItem("enytm-after-login", `/order/${id}`);
      nav("/login", { replace: true });
      return;
    }
    nav(`/order/${id}`, { replace: true });
  }, [id, nav]);

  return (
    <main className="empty order-redirect-loading" aria-live="polite">
      <p className="eyebrow">ENYTM ORDER</p>
      <h1>OPENING ORDER DETAILS...</h1>
    </main>
  );
}

function Cart() {
  const {
    cart,
    selectedItems,
    toggleSelectItem,
    selectAll,
    selectedSubtotal,
    updateQty,
    updateSize,
    removeFromCart,
    addToWishlist
  } = useCart();
  const products = useProducts();
  const nav = useNavigate();
  const [oosMovedItems, setOosMovedItems] = useState([]);

  useEffect(() => {
    if (!products || !products.length || !cart.length) return;

    const moved = [];
    cart.forEach(item => {
      const prod = products.find(p => String(p.id) === String(item.id));
      const isProductOOS = !prod || Number(prod.stock || 0) <= 0;
      const isSizeOOS = Boolean(
        prod?.sizeStock &&
        typeof prod.sizeStock[item.size] !== "undefined" &&
        Number(prod.sizeStock[item.size] || 0) <= 0
      );

      if (isProductOOS || isSizeOOS) {
        moved.push({
          id: item.id,
          key: item.key,
          name: item.name,
          size: item.size
        });
      }
    });

    if (moved.length > 0) {
      moved.forEach(m => {
        removeFromCart(m.key);
        addToWishlist(m.id);
      });
      setOosMovedItems(prev => {
        const existingKeys = new Set(prev.map(p => p.key));
        const newOnes = moved.filter(m => !existingKeys.has(m.key));
        return [...prev, ...newOnes];
      });
    }
  }, [products, cart]);

  const totalQty = selectedItems.reduce((s, i) => s + (Number(i.qty) || 0), 0);
  const qtyDiscountPct = totalQty >= 3 ? 0.15 : (totalQty >= 2 ? 0.10 : 0);
  const buy2Discount = Math.round(selectedSubtotal * qtyDiscountPct);
  const isFreeShipping = true;
  const shippingFee = 0;
  const finalPayable = Math.max(0, selectedSubtotal - buy2Discount);
  const neededForFree = 0;
  const progressPct = 100;
  const allSelected = cart.length > 0 && selectedItems.length === cart.length;

  return (
    <main className="cart-page">
      <div className="page-heading compact">
        <p className="eyebrow">YOUR SELECTION · ENYTM APPARELS</p>
        <h1>SHOPPING BAG</h1>
      </div>
      {!cart.length ? (
        <div className="empty">
          <ShoppingBag size={50} />
          <h2>Your bag is empty.</h2>
          <p style={{ color: "#888", margin: "10px 0 25px" }}>Explore our Drop 001 oversized tees, hoodies, and lowers.</p>
          <Link className="btn primary" to="/shop">SHOP NOW</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items-column">
            {/* Free shipping banner */}
            <div className="free-shipping-bar-card">
              <div className="free-shipping-text-row">
                <div className="shipping-icon-label">
                  <Truck size={17} />
                  <span>
                    <span className="shipping-unlocked-text"><b>FREE SHIPPING ACROSS INDIA</b> ON ALL ORDERS</span>
                  </span>
                </div>
                <span className="shipping-pct">FREE</span>
              </div>
            </div>

            {totalQty >= 3 ? (
              <div className="cart-promo-banner active">
                <Sparkles size={16} />
                <span><b>BUY 3, GET 15% OFF UNLOCKED!</b> Automatic 15% volume discount (saving ₹{buy2Discount.toLocaleString("en-IN")}) applied.</span>
              </div>
            ) : totalQty === 2 ? (
              <div className="cart-promo-banner active">
                <Sparkles size={16} />
                <span><b>BUY 2, GET 10% OFF UNLOCKED!</b> Automatic 10% discount (saving ₹{buy2Discount.toLocaleString("en-IN")}) applied — <b>Add 1 more piece to unlock 15% OFF!</b></span>
              </div>
            ) : (
              <div className="cart-promo-banner hint">
                <Tag size={16} />
                <span><b>VOLUME SAVINGS:</b> Buy 2, get <b>10% OFF</b> · Buy 3 or more, get <b>15% OFF</b>! Add pieces to your bag to unlock.</span>
              </div>
            )}

            {oosMovedItems.length > 0 && (
              <div className="cart-oos-banner">
                <div className="cart-oos-banner-header">
                  <Heart size={16} style={{ color: "#cbb89a" }} />
                  <strong>OUT OF STOCK ITEM MOVED TO WISHLIST</strong>
                  <button className="cart-oos-close" onClick={() => setOosMovedItems([])} aria-label="Dismiss">✕</button>
                </div>
                <p>
                  {oosMovedItems.map(m => `"${m.name}" (Size ${m.size})`).join(", ")} {oosMovedItems.length === 1 ? "is" : "are"} currently out of stock and {oosMovedItems.length === 1 ? "has" : "have"} been automatically moved to your <Link to="/wishlist" className="cart-oos-wishlist-link">Wishlist</Link>.
                </p>
              </div>
            )}

            {/* SELECT ALL ITEMS BAR */}
            <div className="cart-select-all-bar">
              <label className="cart-checkbox-label">
                <input
                  type="checkbox"
                  className="cart-native-checkbox"
                  checked={allSelected}
                  onChange={(e) => selectAll(e.target.checked)}
                />
                <span className={`cart-custom-checkbox ${allSelected ? "checked" : ""}`}>
                  {allSelected && <Check size={12} strokeWidth={3} />}
                </span>
                <span className="cart-select-all-text">
                  SELECT ALL ({selectedItems.length}/{cart.length} ITEMS SELECTED)
                </span>
              </label>
              {!allSelected && (
                <button
                  type="button"
                  className="cart-select-all-btn"
                  onClick={() => selectAll(true)}
                >
                  SELECT ALL
                </button>
              )}
            </div>

            <div className="cart-items">
              {cart.map((i) => {
                const prod = products?.find(p => String(p.id) === String(i.id));
                const availableSizes = prod?.sizes && prod.sizes.length ? prod.sizes : ["S", "M", "L", "XL", "XXL"];
                const isItemSelected = i.selected !== false;
                return (
                  <div className={`cart-item ${!isItemSelected ? "unselected" : ""}`} key={i.key}>
                    <div className="cart-item-select-col">
                      <label className="cart-item-select-wrap" title={isItemSelected ? "Deselect item from checkout" : "Select item for checkout"}>
                        <input
                          type="checkbox"
                          className="cart-native-checkbox"
                          checked={isItemSelected}
                          onChange={() => toggleSelectItem(i.key)}
                        />
                        <span className={`cart-custom-checkbox ${isItemSelected ? "checked" : ""}`}>
                          {isItemSelected && <Check size={12} strokeWidth={3} />}
                        </span>
                      </label>
                    </div>
                    <img src={normalizeImageUrl(i.image)} alt={i.name} />
                    <div className="cart-item-info">
                      <div>
                        <h3>{i.name}</h3>
                        <CartSizeDropdown
                          currentSize={i.size}
                          availableSizes={availableSizes}
                          sizeStock={prod?.sizeStock || {}}
                          onSelect={(newSize) => updateSize(i.key, newSize)}
                        />
                      </div>
                      <strong>₹{(i.price * i.qty).toLocaleString("en-IN")}</strong>
                      <div className="cart-bottom">
                        <div className="quantity">
                          <button onClick={() => updateQty(i.key, i.qty - 1)} aria-label="Decrease quantity">
                            <Minus size={14} />
                          </button>
                          <b>{i.qty}</b>
                          <button onClick={() => updateQty(i.key, i.qty + 1)} aria-label="Increase quantity">
                            <Plus size={14} />
                          </button>
                        </div>
                        <button className="remove" onClick={() => removeFromCart(i.key)}>
                          <Trash2 size={15} /> REMOVE
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="summary">
            <h2>ORDER SUMMARY</h2>
            <div>
              <span>Subtotal ({totalQty} selected piece{totalQty === 1 ? "" : "s"})</span>
              <b>₹{selectedSubtotal.toLocaleString("en-IN")}</b>
            </div>
            {buy2Discount > 0 && (
              <div className="promo-line">
                <span>Promotional Offer (Buy {totalQty >= 3 ? "3, Get 15%" : "2, Get 10%"} Off)</span>
                <b className="discount-green">−₹{buy2Discount.toLocaleString("en-IN")}</b>
              </div>
            )}
            <div>
              <span>Shipping</span>
              <b>FREE</b>
            </div>
            <div className="cart-prepaid-hint">
              <Tag size={13} />
              <span>Extra 5% discount applies when paying online via Razorpay at checkout!</span>
            </div>
            <hr />
            <div className="total cart-final-total-row">
              <span>FINAL TOTAL</span>
              <b className="cart-final-amount">₹{finalPayable.toLocaleString("en-IN")}</b>
            </div>
            <button
              className={`btn primary full ${totalQty === 0 ? "btn-disabled-selection" : ""}`}
              disabled={totalQty === 0}
              onClick={() => {
                if (totalQty === 0) return;
                if (!localStorage.getItem("enytm-token")) {
                  sessionStorage.setItem("enytm-after-login", "/checkout");
                  nav("/login");
                } else nav("/checkout");
              }}
            >
              {totalQty === 0 ? "SELECT ITEMS TO CHECKOUT" : `PROCEED TO CHECKOUT (${totalQty})`} <ArrowRight />
            </button>
            <div className="cart-trust-badges">
              <span><ShieldCheck size={14} /> 100% Encrypted Payment</span>
              <span><RotateCcw size={14} /> 48-Hour Easy Returns</span>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
function Account() {
  const { wishlist, logoutUser } = useCart();
  const nav = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname === "/orders") return "orders";
    return null;
  });

  useEffect(() => {
    if (location.pathname === "/orders") {
      setActiveTab("orders");
    }
  }, [location.pathname]);

  const cachedUser = (() => {
    try {
      const saved = localStorage.getItem("enytm-user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const [user, setUser] = useState(cachedUser);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [defaultAddressId, setDefaultAddressId] = useState(null);

  const [loading, setLoading] = useState(!cachedUser);
  const [loadError, setLoadError] = useState("");
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileForm, setProfileForm] = useState({
    name: cachedUser?.name || "",
    phone: cachedUser?.phone || "",
    whatsappOptIn: Boolean(cachedUser?.whatsappOptIn),
    emailOptIn: cachedUser?.emailOptIn !== false
  });

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState("");

  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    label: "Home",
    isDefault: false
  });

  const loadAccount = async () => {
    if (!user) setLoading(true);
    setLoadError("");

    const token = localStorage.getItem("enytm-token");

    if (!token) {
      nav("/login", { replace: true });
      return;
    }

    let accountUser = user || cachedUser;

    try {
      /*
       * IMPORTANT:
       * Do NOT use Promise.all here.
       * If addresses API fails, account should still load.
       */
      const results = await Promise.allSettled([
        api("/auth/me"),
        api("/orders/my"),
        api("/auth/addresses")
      ]);

      const meResult = results[0];
      const ordersResult = results[1];
      const addressesResult = results[2];

      // USER
      if (meResult.status === "rejected") {
        const errorMsg = meResult.reason?.message || "";
        const isAuthExpired = errorMsg.toLowerCase().includes("session") || errorMsg.includes("401");
        if (isAuthExpired && !user && !cachedUser) {
          logoutUser();
          nav("/login", { replace: true });
          return;
        }
      } else if (meResult.value) {
        accountUser = meResult.value;
        setUser(accountUser);
        localStorage.setItem("enytm-user", JSON.stringify(accountUser));
        setProfileForm({
          name: accountUser.name || "",
          phone: accountUser.phone || "",
          whatsappOptIn: Boolean(accountUser.whatsappOptIn),
          emailOptIn: accountUser.emailOptIn !== false
        });
      }

      // ORDERS
      if (ordersResult.status === "fulfilled") {
        setOrders(
          Array.isArray(ordersResult.value)
            ? ordersResult.value
            : []
        );
      } else {
        setOrders([]);
      }

      // ADDRESSES
      if (addressesResult.status === "fulfilled" && addressesResult.value) {
        const data = addressesResult.value;

        setAddresses(
          Array.isArray(data?.addresses)
            ? data.addresses
            : []
        );

        setDefaultAddressId(
          data?.defaultAddressId || null
        );
      } else {
        setAddresses(Array.isArray(accountUser?.addresses) ? accountUser.addresses : []);

        // Preserve legacy single address if available
        if (accountUser && accountUser.address && (!accountUser.addresses || !accountUser.addresses.length)) {
          const legacyAddress = {
            id: "legacy-address",
            label: accountUser.address.label || "Home",
            name: accountUser.address.name || accountUser.name || "",
            phone: accountUser.address.phone || accountUser.phone || "",
            address: accountUser.address.address || "",
            city: accountUser.address.city || "",
            state: accountUser.address.state || "",
            pincode: accountUser.address.pincode || "",
            isDefault: true
          };

          setAddresses([legacyAddress]);
          setDefaultAddressId("legacy-address");
        }
      }

    } catch (error) {
      console.error("ACCOUNT LOAD ERROR:", error);

      if (!user && !cachedUser) {
        setLoadError(
          error?.message?.includes("429")
            ? "Rate limit exceeded. Please wait a few moments and try again."
            : (error?.message || "Could not load your account. Please try again.")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccount();
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileSaving(true);
    setProfileMessage("");
    try {
      const updated = await api("/auth/profile", {
        method: "PUT", body: JSON.stringify({
          name: profileForm.name.trim(), phone: profileForm.phone.trim(),
          whatsappOptIn: profileForm.whatsappOptIn, emailOptIn: profileForm.emailOptIn
        })
      });
      setUser(updated);
      setProfileForm({ name: updated.name || "", phone: updated.phone || "", whatsappOptIn: Boolean(updated.whatsappOptIn), emailOptIn: updated.emailOptIn !== false });
      setProfileEditing(false);
      setProfileMessage("Profile updated successfully.");
    } catch (error) {
      setProfileMessage(error.message || "Could not update your profile.");
    } finally { setProfileSaving(false); }
  };

  const startAddAddress = () => {
    setEditingId(null);
    setAddressError("");

    setAddressForm({
      name: user?.name || "",
      phone: user?.phone || "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      label: "Home",
      isDefault: addresses.length === 0
    });

    setShowAddressForm(true);
  };

  const editAddress = (address) => {
    setEditingId(address.id);
    setAddressError("");

    setAddressForm({
      name: address.name || user?.name || "",
      phone: address.phone || user?.phone || "",
      address: address.address || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      label: address.label || "Home",
      isDefault: Boolean(address.isDefault)
    });

    setShowAddressForm(true);
  };

  const saveAddress = async (e) => {
    e.preventDefault();

    setAddressLoading(true);
    setAddressError("");

    try {
      const endpoint = editingId
        ? `/auth/addresses/${editingId}`
        : "/auth/addresses";

      const method = editingId ? "PUT" : "POST";

      const data = await api(endpoint, {
        method,
        body: JSON.stringify(addressForm)
      });

      setAddresses(
        Array.isArray(data?.addresses)
          ? data.addresses
          : []
      );

      setDefaultAddressId(
        data?.defaultAddressId || null
      );

      setShowAddressForm(false);
      setEditingId(null);

    } catch (error) {
      console.error("SAVE ADDRESS ERROR:", error);

      setAddressError(
        error?.message ||
        "Could not save address."
      );
    } finally {
      setAddressLoading(false);
    }
  };

  const makeDefault = async (id) => {
    try {
      const data = await api(
        `/auth/addresses/${id}/default`,
        {
          method: "POST"
        }
      );

      setAddresses(data.addresses || []);
      setDefaultAddressId(
        data.defaultAddressId || id
      );

    } catch (error) {
      setAddressError(
        error?.message ||
        "Could not change default address."
      );
    }
  };

  const removeAddress = async (id) => {
    if (!window.confirm("Remove this saved address?")) {
      return;
    }

    try {
      const data = await api(
        `/auth/addresses/${id}`,
        {
          method: "DELETE"
        }
      );

      setAddresses(data.addresses || []);
      setDefaultAddressId(
        data.defaultAddressId || null
      );

    } catch (error) {
      setAddressError(
        error?.message ||
        "Could not remove address."
      );
    }
  };

  const logout = () => {
    logoutUser();
    nav("/", { replace: true });
  };

  if (loading && !user) {
    return (
      <main className="empty loading-page">
        <p className="eyebrow">ENYTM MEMBERS</p>
        <h1>LOADING ACCOUNT...</h1>
        <p className="muted">
          Please wait while we load your profile.
        </p>
      </main>
    );
  }

  if (loadError && !user) {
    return (
      <main className="empty">
        <p className="eyebrow">ENYTM MEMBERS</p>

        <h1>ACCOUNT COULD NOT LOAD</h1>

        <div className="error">
          {loadError}
        </div>

        <button
          className="btn primary"
          onClick={loadAccount}
        >
          TRY AGAIN
        </button>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="empty">
        <p className="eyebrow">ENYTM MEMBERS</p>
        <h1>PLEASE LOGIN</h1>

        <button
          className="btn primary"
          onClick={() => nav("/login")}
        >
          LOGIN
        </button>
      </main>
    );
  }

  const paidOrders = orders.filter(
    order =>
      order.paymentStatus === "paid"
  );

  const spent = paidOrders.reduce(
    (sum, order) =>
      sum + Number(order.total || 0),
    0
  );

  return (
    <main className="account-page">

      {/* HERO */}

      <section className="account-hero">

        <div>
          <p className="eyebrow">
            ENYTM MEMBERS /{" "}
            {String(user.name || "").toUpperCase()}
          </p>

          <h1>
            YOUR
            <br />
            <em>ENYTM.</em>
          </h1>

          <p>
            Everything you have ordered,
            saved and built with us —
            in one place.
          </p>
        </div>

        <div className="account-mark" aria-hidden="true">
          <span className="account-mark-bars">
            <span />
            <span />
            <span />
          </span>
          <span>™</span>
        </div>

      </section>




      {/* MAIN GRID */}

      <div className={`account-grid ${!activeTab ? "single-col" : ""}`}>

        {/* PROFILE */}

        <section className="account-card profile-card">

          <div className="card-kicker">
            01 / PROFILE
          </div>

          <div className="profile-avatar">
            {user.name?.charAt(0).toUpperCase()}
          </div>

          <h2>{user.name}</h2>

          <p>{user.email}</p>

          <p>
            {user.phone || "No phone added"}
          </p>

          <button type="button" className="btn outline profile-edit-trigger" onClick={() => { setProfileMessage(""); setProfileEditing(v => !v); }}>
            <Pencil size={14} /> {profileEditing ? "CLOSE EDIT" : "EDIT PROFILE"}
          </button>
          {profileMessage && <p className="profile-feedback" role="status">{profileMessage}</p>}
          {profileEditing && <form className="profile-edit-form" onSubmit={saveProfile}>
            <label>FULL NAME<input required maxLength={80} value={profileForm.name} onChange={e => setProfileForm(v => ({ ...v, name: e.target.value }))} /></label>
            <label>PHONE NUMBER<input inputMode="tel" maxLength={16} value={profileForm.phone} onChange={e => setProfileForm(v => ({ ...v, phone: e.target.value }))} /></label>
            <label className="check"><input type="checkbox" checked={profileForm.whatsappOptIn} onChange={e => setProfileForm(v => ({ ...v, whatsappOptIn: e.target.checked }))} /> Receive order updates on WhatsApp</label>
            <label className="check"><input type="checkbox" checked={profileForm.emailOptIn} onChange={e => setProfileForm(v => ({ ...v, emailOptIn: e.target.checked }))} /> Receive order updates by email</label>
            <button className="btn primary full" type="submit" disabled={profileSaving}>{profileSaving ? "SAVING PROFILE..." : "SAVE PROFILE"}</button>
          </form>}

          <div className="profile-preferences">

            <span className={user.whatsappOptIn ? "on" : ""}>
              WHATSAPP{" "}
              {user.whatsappOptIn ? "ON" : "OFF"}
            </span>

            <span className={user.emailOptIn ? "on" : ""}>
              EMAIL{" "}
              {user.emailOptIn ? "ON" : "OFF"}
            </span>

          </div>

          <div className="profile-menu-section">
            <span className="profile-menu-kicker">ACCOUNT MENU</span>
            <div className="profile-menu-list">
              <button
                type="button"
                className={`profile-menu-item ${activeTab === "orders" ? "active" : ""}`}
                onClick={() => setActiveTab(prev => prev === "orders" ? null : "orders")}
              >
                <div className="profile-menu-item-left">
                  <Package size={15} />
                  <span>ORDERS</span>
                </div>
                <div className="profile-menu-item-right">
                  <span className="profile-menu-badge">{orders.length}</span>
                  <ChevronRight size={13} className={`menu-chevron ${activeTab === "orders" ? "rotated" : ""}`} />
                </div>
              </button>

              <button
                type="button"
                className={`profile-menu-item ${activeTab === "addresses" ? "active" : ""}`}
                onClick={() => setActiveTab(prev => prev === "addresses" ? null : "addresses")}
              >
                <div className="profile-menu-item-left">
                  <MapPin size={15} />
                  <span>SAVED ADDRESSES</span>
                </div>
                <div className="profile-menu-item-right">
                  <span className="profile-menu-badge">{addresses.length}</span>
                  <ChevronRight size={13} className={`menu-chevron ${activeTab === "addresses" ? "rotated" : ""}`} />
                </div>
              </button>

              <Link
                to="/wishlist"
                className="profile-menu-item"
              >
                <div className="profile-menu-item-left">
                  <Heart size={15} />
                  <span>WISHLIST</span>
                </div>
                <div className="profile-menu-item-right">
                  <span className="profile-menu-badge">{wishlist.length}</span>
                  <ChevronRight size={13} />
                </div>
              </Link>
            </div>
          </div>

          <div className="account-actions">

            <button
              className="btn outline full"
              onClick={logout}
            >
              <LogOut size={15} />
              LOG OUT
            </button>

          </div>

        </section>


        {/* ORDERS */}

        {activeTab === "orders" && (
          <section id="account-orders" className="account-card orders-card">

            <div className="card-kicker">
              02 / ORDER HISTORY
            </div>

            <div className="orders-title">

              <h2>YOUR ORDERS</h2>

              <div className="orders-header-actions">
                <Link to="/shop">
                  CONTINUE SHOPPING
                  <ArrowRight size={15} />
                </Link>
                <button
                  type="button"
                  className="card-close-btn"
                  onClick={() => setActiveTab(null)}
                  aria-label="Close orders"
                >
                  <X size={14} /> CLOSE
                </button>
              </div>

            </div>

            {!orders.length ? (

              <div className="empty-orders">

                <Package size={38} />

                <h3>
                  Your story starts here.
                </h3>

                <p>
                  You haven't placed an order yet.
                </p>

                <Link
                  className="btn primary"
                  to="/shop"
                >
                  EXPLORE COLLECTION
                </Link>

              </div>

            ) : (

              orders.map(order => (

                <div
                  className="order-row"
                  key={order.id}
                  role="link"
                  tabIndex={0}
                  aria-label={`Open order ${order.receipt || order.id}`}
                  onClick={() => nav(`/order-success/${order.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      nav(`/order-success/${order.id}`);
                    }
                  }}
                >

                  <div className="order-thumb" aria-hidden="true">
                    {order.items?.[0]?.image ? (
                      <img src={order.items[0].image} alt="" loading="lazy" />
                    ) : (
                      <Package size={22} />
                    )}
                    {order.items?.length > 1 && <span>+{order.items.length - 1}</span>}
                  </div>

                  <div className="order-ref">

                    <b>{order.receipt}</b>

                    <small>
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        }
                      )}
                    </small>

                  </div>

                  <span
                    className={`order-status ${order.paymentStatus
                      }`}
                  >
                    {String(
                      order.status || ""
                    ).replaceAll("_", " ")}
                  </span>

                  <strong>
                    ₹
                    {Number(
                      order.total || 0
                    ).toLocaleString("en-IN")}
                  </strong>

                  <Link
                    to={`/order-success/${order.id}`}
                    aria-label="View order"
                  >
                    <ArrowRight size={16} />
                  </Link>

                </div>

              ))

            )}

          </section>
        )}


        {/* SAVED ADDRESSES */}

        {activeTab === "addresses" && (
          <section id="account-addresses" className="account-card saved-addresses-card">

            <div className="card-kicker">
              03 / DELIVERY
            </div>

            <div className="orders-title">

              <div>
                <h2>SAVED ADDRESSES</h2>
                <p className="muted">
                  Select and manage your delivery addresses.
                </p>
              </div>

              <div className="orders-header-actions">
                <button
                  className="btn primary"
                  onClick={startAddAddress}
                >
                  + ADD ADDRESS
                </button>
                <button
                  type="button"
                  className="card-close-btn"
                  onClick={() => setActiveTab(null)}
                  aria-label="Close saved addresses"
                >
                  <X size={14} /> CLOSE
                </button>
              </div>

            </div>


            {addressError && (
              <div className="error">
                {addressError}
              </div>
            )}


            {showAddressForm && (

              <form
                className="address-form"
                onSubmit={saveAddress}
              >

                <div className="form-grid">

                  <input
                    required
                    placeholder="Full name"
                    value={addressForm.name}
                    onChange={e =>
                      setAddressForm({
                        ...addressForm,
                        name: e.target.value
                      })
                    }
                  />

                  <input
                    required
                    placeholder="Phone"
                    value={addressForm.phone}
                    onChange={e =>
                      setAddressForm({
                        ...addressForm,
                        phone: e.target.value
                      })
                    }
                  />

                  <input
                    required
                    className="wide"
                    placeholder="Complete address"
                    value={addressForm.address}
                    onChange={e =>
                      setAddressForm({
                        ...addressForm,
                        address: e.target.value
                      })
                    }
                  />

                  <input
                    required
                    placeholder="City"
                    value={addressForm.city}
                    onChange={e =>
                      setAddressForm({
                        ...addressForm,
                        city: e.target.value
                      })
                    }
                  />

                  <input
                    required
                    placeholder="State"
                    value={addressForm.state}
                    onChange={e =>
                      setAddressForm({
                        ...addressForm,
                        state: e.target.value
                      })
                    }
                  />

                  <input
                    required
                    inputMode="numeric"
                    maxLength="6"
                    placeholder="Pincode"
                    value={addressForm.pincode}
                    onChange={e =>
                      setAddressForm({
                        ...addressForm,
                        pincode: e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                      })
                    }
                  />

                  <select
                    value={addressForm.label}
                    onChange={e =>
                      setAddressForm({
                        ...addressForm,
                        label: e.target.value
                      })
                    }
                  >
                    <option value="Home">
                      Home
                    </option>

                    <option value="Work">
                      Work
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>

                </div>

                <label className="check">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={e =>
                      setAddressForm({
                        ...addressForm,
                        isDefault: e.target.checked
                      })
                    }
                  />

                  Make this my default address
                </label>

                <div className="account-actions">

                  <button
                    type="submit"
                    className="btn primary"
                    disabled={addressLoading}
                  >
                    {addressLoading
                      ? "SAVING..."
                      : editingId
                        ? "UPDATE ADDRESS"
                        : "SAVE ADDRESS"}
                  </button>

                  <button
                    type="button"
                    className="btn outline"
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingId(null);
                      setAddressError("");
                    }}
                  >
                    CANCEL
                  </button>

                </div>

              </form>

            )}


            {!addresses.length && !showAddressForm ? (

              <div className="empty-orders">

                <MapPin size={38} />

                <h3>
                  No saved addresses yet.
                </h3>

                <p>
                  Add an address so checkout is faster next time.
                </p>

                <button
                  className="btn primary"
                  onClick={startAddAddress}
                >
                  ADD YOUR FIRST ADDRESS
                </button>

              </div>

            ) : (

              <div className="saved-address-grid">

                {addresses.map(address => (

                  <article
                    className={`saved-address ${address.id === defaultAddressId
                      ? "is-default"
                      : ""
                      }`}
                    key={address.id}
                  >

                    <div className="saved-address-top">

                      <strong>
                        {address.label || "Address"}
                      </strong>

                      {address.id === defaultAddressId && (
                        <span className="default-badge">
                          DEFAULT
                        </span>
                      )}

                    </div>

                    <p>
                      {address.name}
                      <br />
                      {address.phone}
                      <br />
                      {address.address}
                      <br />
                      {address.city},{" "}
                      {address.state}{" "}
                      {address.pincode}
                    </p>

                    <div className="saved-address-actions">

                      {address.id !== defaultAddressId && (
                        <button
                          className="text-link"
                          onClick={() =>
                            makeDefault(address.id)
                          }
                        >
                          MAKE DEFAULT
                        </button>
                      )}

                      <button
                        className="text-link"
                        onClick={() =>
                          editAddress(address)
                        }
                      >
                        EDIT
                      </button>

                      {address.id !== "legacy-address" && (
                        <button
                          className="text-link danger"
                          onClick={() =>
                            removeAddress(address.id)
                          }
                        >
                          REMOVE
                        </button>
                      )}

                    </div>

                  </article>

                ))}

              </div>

            )}

          </section>
        )}

      </div>

    </main>
  );
}
function Wishlist() { const products = useProducts(); const { wishlist } = useCart(); const items = products.filter(p => wishlist.includes(p.id)); return <main className="shop-page"><div className="page-heading"><p className="eyebrow">SAVED FOR LATER</p><h1>WISHLIST</h1></div>{items.length ? <div className="product-grid shop-grid">{items.map(p => <ProductCard key={p.id} product={p} />)}</div> : <div className="empty"><Heart size={50} /><h2>Your wishlist is empty.</h2><Link className="btn primary" to="/shop">EXPLORE PRODUCTS</Link></div>}</main> }
function About() { return <main className="enytm-about-page"><section className="about-hero"><img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2200&q=90" alt="A curated clothing store" /><div><p className="eyebrow">THE STORY</p><h1>MORE THAN<br /><em>A MOMENT.</em></h1></div></section><section className="about-quality-section"><div className="about-quality-heading"><p className="eyebrow">THE DETAILS MATTER</p><h2>FEEL THE<br /><em>DIFFERENCE.</em></h2><p>Premium-feeling fabrics. Thoughtful construction. Everyday pieces made to be reached for again and again.</p></div><img className="about-quality-triptych" src="/enytm-quality-triptych.png" alt="Close-up details of ENYTM garment fabric, collar, folded clothing and stitching" /><div className="about-quality-caption"><span>FABRIC, FIT & FINISH</span><span>MADE FOR EVERYDAY WEAR</span></div></section><section className="about-copy"><p className="eyebrow">01 / A LITTLE ABOUT ENYTM</p><h2>MADE FOR THE<br /><em>WAY YOU LIVE.</em></h2><p>ENYTM APPARELS began with a simple belief: what you wear should feel as natural as being yourself. We create everyday streetwear with considered silhouettes, comfortable fabrics and clean details.</p><p>From oversized tees and polos to heavyweight layers, each piece is designed to bring together ease, character and lasting versatility—without unnecessary noise.</p><div className="about-vision"><p className="eyebrow">OUR VISION</p><p>To make everyday clothing feel more personal: pieces that move with you, fit into your life and let your confidence speak quietly.</p></div></section><section className="about-why"><p className="eyebrow">02 / WHY ENYTM</p><h2>LESS NOISE.<br /><em>MORE YOU.</em></h2><div className="about-why-grid"><div><span>01</span><h3>CONSIDERED FITS</h3><p>Relaxed silhouettes and balanced proportions made for everyday movement.</p></div><div><span>02</span><h3>BETTER-FEELING FABRICS</h3><p>We pay attention to fabric weight, texture and the way a garment feels in use.</p></div><div><span>03</span><h3>DETAILS THAT LAST</h3><p>Clean finishes and versatile design, made to be worn, styled and worn again.</p></div></div><Link className="btn outline" to="/shop">EXPLORE THE COLLECTION <ArrowRight size={16} /></Link></section></main> }
function PrivacyPolicyPage() {
  return (
    <main className="policy-page">
      <div className="policy-container">
        <div className="policy-header">
          <p className="eyebrow">LEGAL & COMPLIANCE · ENYTM APPARELS</p>
          <h1>PRIVACY POLICY</h1>
          <p className="policy-date">Last updated: October 2026</p>
        </div>

        <section className="policy-section">
          <h2>1. Introduction</h2>
          <p>
            At ENYTM APPARELS (“ENYTM”, “we”, “our”, or “us”), we respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, store, and safeguard your details when you visit our website or make a purchase.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. Information We Collect</h2>
          <p>We only collect information necessary to fulfill your orders and enhance your shopping journey:</p>
          <ul>
            <li><b>Contact Details:</b> Name, email address, mobile phone number, and delivery address.</li>
            <li><b>Transactional Data:</b> Order ID, items purchased, chosen sizes, and order totals.</li>
            <li><b>Payment Information:</b> Payments are processed directly through 256-bit bank-grade Razorpay encrypted gateways. <b>ENYTM never stores or has access to your credit/debit card numbers, CVVs, UPI PINs, or banking passwords.</b></li>
            <li><b>Device & Usage:</b> IP address, browser type, and anonymous session telemetry to optimize website performance and detect fraud.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. How We Use Your Information</h2>
          <p>We use your personal data strictly for:</p>
          <ul>
            <li>Order verification, garment tailoring, and pre-order batch scheduling.</li>
            <li>Safe and insured dispatch through verified courier partners.</li>
            <li>Sending essential order tracking updates via SMS, email, and WhatsApp (if opted in).</li>
            <li>Processing refunds, exchanges, or customer support queries.</li>
          </ul>
          <p><b>We will never sell, rent, trade, or distribute your personal details to third-party advertisers.</b></p>
        </section>

        <section className="policy-section policy-highlight-box">
          <h2>4. Pre-Order Payment Terms</h2>
          <p className="highlight-lead">The following terms apply specifically to all pre-order reservations placed on ENYTM APPARELS:</p>
          <ul>
            <li><b>All pre-orders require 100% advance payment.</b> (Or specified pre-order deposit configured at checkout).</li>
            <li>After making the payment, please send us a payment screenshot to confirm your order.</li>
            <li>If you change your mind, you may cancel your order within <b>24 hours of payment</b> and receive a full refund.</li>
            <li>After 24 hours, the order will be considered confirmed and the advance payment will become non-refundable, as production will be started specifically against your pre-order.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>5. Data Security & Storage</h2>
          <p>
            We implement industry-standard administrative, technical, and physical security measures to protect your personal information against unauthorized access, destruction, loss, or alteration.
          </p>
        </section>

        <section className="policy-section">
          <h2>6. Your Rights & Contact</h2>
          <p>
            You have the right to request access to the personal data we hold about you, request corrections, or request account deletion. To exercise these rights, please contact our team at:
          </p>
          <div className="policy-contact-box">
            <b>ENYTM APPARELS SUPPORT</b>
            <p>Email: <a href="mailto:support@enytm.co.in">support@enytm.co.in</a></p>
            <p>WhatsApp: <a href="https://wa.me/message/5KFLGKP4XCG7C1" target="_blank" rel="noreferrer">+91 (Official WhatsApp)</a></p>
            <p>Location: Charoli, Pune, Maharashtra 412105, India</p>
          </div>
        </section>
      </div>
    </main>
  );
}

function ShippingReturnsPage() {
  return (
    <main className="policy-page">
      <div className="policy-container">
        <div className="policy-header">
          <p className="eyebrow">DELIVERY & LOGISTICS · ENYTM APPARELS</p>
          <h1>SHIPPING & RETURNS POLICY</h1>
          <p className="policy-date">Applicable to all orders across India</p>
        </div>

        <section className="policy-section policy-highlight-box">
          <h2>1. Pre-Order Production & Delivery Timeline</h2>
          <div className="verbatim-card">
            <p>“Please keep in mind that this is a Pre Order. Pre Order production may take up to 2.5 weeks to complete.</p>
            <p>Once your order is ready we will inform you and dispatch it immediately.</p>
            <p>After dispatch delivery may take an additional 7 to 10 days depending on the courier service.</p>
            <p>Our Pre Order batch is being produced first while the regular drop will launch separately.</p>
            <p>Please place your Pre Order only if you are comfortable with this production timeline.”</p>
          </div>
        </section>

        <section className="policy-section">
          <h2>2. Standard Shipping Rates & Eligibility</h2>
          <div className="rates-table-wrap">
            <table className="policy-table">
              <thead>
                <tr>
                  <th>ORDER VALUE</th>
                  <th>SHIPPING FEE</th>
                  <th>ESTIMATED TRANSIT TIME</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>All Orders (No Minimum Value)</b></td>
                  <td><span className="free-tag">FREE SHIPPING</span></td>
                  <td>7–10 Days after dispatch</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="policy-section policy-damaged-alert">
          <h2>3. Damaged, Defective, or Incorrect Items</h2>
          <div className="damaged-verbatim-container">
            <div className="alert-header">
              <AlertCircle size={18} />
              <strong>OFFICIAL ENYTM 24-HOUR REPORTING CLAUSE</strong>
            </div>
            <p className="damaged-quote">
              “If you receive an item that is damaged, defective, or different from what you ordered, please contact ENYTM APPARELS within 24 hours of delivery. Please include your order number and clear photographs of the issue so we can assist you promptly.”
            </p>
            <div className="how-to-report">
              <b>How to report:</b>
              <ol>
                <li>Reach out to our official <a href="https://wa.me/message/5KFLGKP4XCG7C1" target="_blank" rel="noreferrer">WhatsApp Support</a> or email <a href="mailto:support@enytm.co.in">support@enytm.co.in</a>.</li>
                <li>Share your <b>Order Receipt ID</b> (e.g. ENYTM-XXXX).</li>
                <li>Attach clear photographs or an unboxing video showing the shipping label and the flaw/damage.</li>
                <li>Our team will arrange a priority replacement or full refund within 24–48 hours.</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="policy-section">
          <h2>4. Standard Returns & Size Exchanges</h2>
          <p>
            We want you to love the way ENYTM fits into your everyday rotation. We accept returns or size exchanges within <b>48 hours of delivery</b>, provided the piece meets our eligibility criteria.
          </p>
          <div className="eligibility-notice">
            <b>To be eligible for a return or exchange:</b>
            <ul>
              <li>The garment must be unworn, unwashed, unaltered, and free of fragrances or marks.</li>
              <li>All original ENYTM brand tags and protective packaging must be intact.</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}

function RefundPolicyPage() {
  return (
    <main className="policy-page">
      <div className="policy-container">
        <div className="policy-header">
          <p className="eyebrow">CUSTOMER PROTECTION · ENYTM APPARELS</p>
          <h1>REFUND POLICY</h1>
          <p className="policy-date">Transparent, fair, and reliable processing</p>
        </div>

        <section className="policy-section policy-highlight-box">
          <h2>1. Refund Inspection & Processing Timeline</h2>
          <div className="verbatim-card">
            <p>“Once the returned item reaches us and passes our quality inspection, we will process the refund within 3–5 business days.</p>
            <p>For prepaid orders, the refund will be sent to the original payment method.</p>
            <p>For Cash on Delivery (COD) orders, refunds will be processed through UPI or bank transfer. Our team will contact you for the required details.</p>
            <p>Please note that your bank or payment provider may take additional time to reflect the refund after it has been processed.”</p>
          </div>
        </section>

        <section className="policy-section">
          <h2>2. Items Not Eligible for Return or Exchange</h2>
          <p>In accordance with quality control and hygiene standards, the following items cannot be returned or refunded:</p>
          <ul className="exclusions-list">
            <li><b>Items that have been worn or used.</b></li>
            <li><b>Items that have been washed.</b></li>
            <li><b>Items that have been altered or tailored.</b></li>
            <li><b>Items damaged after delivery.</b></li>
            <li><b>Items returned without their original brand tags.</b></li>
          </ul>
          <p className="tiny-muted">Note: These exclusions do not restrict valid claims for defective, damaged, or incorrect products reported within 24 hours of delivery.</p>
        </section>

        <section className="policy-section policy-damaged-alert">
          <h2>3. Damaged or Defective Items Protocol</h2>
          <p className="damaged-quote">
            “If you receive an item that is damaged, defective, or different from what you ordered, please contact ENYTM APPARELS within 24 hours of delivery. Please include your order number and clear photographs of the issue so we can assist you promptly.”
          </p>
        </section>

        <section className="policy-section">
          <h2>4. Pre-Order Cancellations</h2>
          <p>
            All pre-order reservations can be cancelled with a <b>100% full refund within 24 hours</b> of payment. After 24 hours, production starts specifically against your chosen silhouette and size, making the advance non-refundable.
          </p>
        </section>
      </div>
    </main>
  );
}

function TermsPage() {
  return (
    <main className="policy-page">
      <div className="policy-container">
        <div className="policy-header">
          <p className="eyebrow">TERMS OF SERVICE · ENYTM APPARELS</p>
          <h1>TERMS & CONDITIONS</h1>
          <p className="policy-date">Governing purchases, pre-orders, and site usage</p>
        </div>

        <section className="policy-section">
          <h2>1. Brand & Agreement</h2>
          <p>
            Welcome to ENYTM APPARELS. By accessing our platform or purchasing our products, you agree to comply with and be bound by these Terms & Conditions.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. Pricing & Offers</h2>
          <p>
            All prices are stated in Indian Rupees (₹ INR) and include applicable taxes. We reserve the right to revise pricing or promotional offers (such as 5% online prepaid discount and Buy 2 Get 10% Off / Buy 3 Get 15% Off) without prior notice. Discounts cannot be stacked unless explicitly permitted.
          </p>
        </section>

        <section className="policy-section">
          <h2>3. Pre-Orders & Production</h2>
          <p>
            Pre-order items represent bespoke production runs. Production requires approximately 2.5 weeks, with delivery in 7–10 days post-dispatch. Cancellation for full refund is allowed within 24 hours of payment.
          </p>
        </section>

        <section className="policy-section">
          <h2>4. Intellectual Property</h2>
          <p>
            “ENYTM”, “MORE THAN A MOMENT”, all photography, typography, garment designs, and website code are the exclusive intellectual property of ENYTM APPARELS.
          </p>
        </section>

        <section className="policy-section">
          <h2>5. Governing Jurisdiction</h2>
          <p>
            These terms are governed by and construed in accordance with the laws of India. Any legal proceedings arising from transactions shall fall under the jurisdiction of the courts of Pune, Maharashtra.
          </p>
        </section>
      </div>
    </main>
  );
}

function TrackOrderPage() {
  const [query, setQuery] = useState("");
  const [statusResult, setStatusResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setBusy(true);
    setErr("");
    setStatusResult(null);
    try {
      const token = localStorage.getItem("enytm-token");
      if (token) {
        const res = await api(`/orders/${query.trim()}`);
        if (res && res.id) {
          setStatusResult(res);
          return;
        }
      }
      setStatusResult({
        receipt: query.trim().toUpperCase(),
        status: "Production In Progress",
        note: "Your order is scheduled in the current Drop 001 production batch. Our logistics partner will dispatch once quality inspection is completed."
      });
    } catch {
      setStatusResult({
        receipt: query.trim().toUpperCase(),
        status: "Confirmed · Batch Queued",
        note: "Your pre-order has been logged. Delivery updates will be sent via SMS and WhatsApp once the courier tracking number is assigned."
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="policy-page">
      <div className="policy-container track-page-container">
        <div className="policy-header">
          <p className="eyebrow">ORDER TRACKING · ENYTM APPARELS</p>
          <h1>TRACK YOUR ORDER</h1>
          <p>Enter your Order Receipt ID (e.g. ENYTM-XXXX) or Order ID to check live status.</p>
        </div>

        <form className="track-form" onSubmit={handleTrack}>
          <div className="track-input-group">
            <input
              type="text"
              placeholder="e.g. ENYTM-1791480795215 or Order UUID"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
            />
            <button className="btn primary" type="submit" disabled={busy}>
              {busy ? "CHECKING..." : "TRACK NOW"}
            </button>
          </div>
          {err && <p className="error">{err}</p>}
        </form>

        {statusResult && (
          <div className="track-result-card">
            <div className="track-result-header">
              <div>
                <span className="eyebrow">ORDER REFERENCE</span>
                <h3>{statusResult.receipt || statusResult.id}</h3>
              </div>
              <span className="status-badge live">{statusResult.status || "CONFIRMED"}</span>
            </div>
            <p className="track-note">{statusResult.note || "Garment is currently in production stage."}</p>
            <div className="track-timeline">
              <div className="timeline-step completed">
                <div className="dot">✓</div>
                <span>Order Placed & Confirmed</span>
              </div>
              <div className="timeline-step active">
                <div className="dot">●</div>
                <span>Production & Tailoring (~2.5 weeks)</span>
              </div>
              <div className="timeline-step">
                <div className="dot">○</div>
                <span>Quality Inspection</span>
              </div>
              <div className="timeline-step">
                <div className="dot">○</div>
                <span>Dispatched (7–10 days transit)</span>
              </div>
              <div className="timeline-step">
                <div className="dot">○</div>
                <span>Delivered</span>
              </div>
            </div>
            <div className="track-contact-prompt">
              <span>Need immediate assistance with this order?</span>
              <a
                href={`https://wa.me/message/5KFLGKP4XCG7C1?text=Hi%20ENYTM,%20I'm%20checking%20status%20for%20order%20${encodeURIComponent(query)}`}
                target="_blank"
                rel="noreferrer"
                className="btn outline"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        )}

        <div className="track-footer-card">
          <p>Already have an ENYTM account? View your complete purchase history directly in your profile.</p>
          <Link to="/account" className="btn outline">GO TO ACCOUNT ORDERS</Link>
        </div>
      </div>
    </main>
  );
}

function SizeGuidePage() {
  return (
    <main className="policy-page">
      <div className="policy-container">
        <div className="policy-header">
          <p className="eyebrow">FIT & SILHOUETTE · ENYTM APPARELS</p>
          <h1>GARMENT SIZE GUIDE</h1>
          <p>Architectural streetwear proportions tailored with considered ease.</p>
        </div>

        <section className="policy-section">
          <h2>1. Oversized T-Shirts & Polos (Inches)</h2>
          <p className="size-guide-note">Measurements taken flat across garment. Chest is armpit-to-armpit multiplied by 2.</p>
          <div className="size-table-wrap">
            <table className="size-table">
              <thead>
                <tr>
                  <th>SIZE</th>
                  <th>CHEST (IN)</th>
                  <th>LENGTH (IN)</th>
                  <th>SHOULDER (IN)</th>
                  <th>SLEEVE (IN)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><b>S</b></td><td>42</td><td>28.5</td><td>20.5</td><td>8.5</td></tr>
                <tr><td><b>M</b></td><td>44</td><td>29.5</td><td>21.5</td><td>9.0</td></tr>
                <tr><td><b>L</b></td><td>46</td><td>30.5</td><td>22.5</td><td>9.5</td></tr>
                <tr><td><b>XL</b></td><td>48</td><td>31.5</td><td>23.5</td><td>10.0</td></tr>
                <tr><td><b>XXL</b></td><td>50</td><td>32.5</td><td>24.5</td><td>10.5</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="policy-section">
          <h2>2. Heavyweight French Terry Lowers (Inches)</h2>
          <div className="size-table-wrap">
            <table className="size-table">
              <thead>
                <tr>
                  <th>SIZE</th>
                  <th>WAIST (IN)</th>
                  <th>LENGTH (IN)</th>
                  <th>THIGH (IN)</th>
                  <th>INSEAM (IN)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><b>S</b></td><td>28 – 30</td><td>40.0</td><td>25.0</td><td>29.5</td></tr>
                <tr><td><b>M</b></td><td>31 – 33</td><td>41.0</td><td>26.0</td><td>30.0</td></tr>
                <tr><td><b>L</b></td><td>34 – 36</td><td>42.0</td><td>27.5</td><td>30.5</td></tr>
                <tr><td><b>XL</b></td><td>36 – 38</td><td>43.0</td><td>29.0</td><td>31.0</td></tr>
                <tr><td><b>XXL</b></td><td>38 – 40</td><td>43.5</td><td>30.5</td><td>31.5</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="policy-section">
          <h2>3. Fit Philosophy & Sizing Guidance</h2>
          <div className="fit-tips-grid">
            <div className="tip-card">
              <b>INTENDED FIT:</b>
              <p>Our pieces are cut with an intentional oversized silhouette, drop shoulders, and balanced drape. Choose your standard size for the signature ENYTM streetwear profile.</p>
            </div>
            <div className="tip-card">
              <b>STANDARD / REGULAR FIT:</b>
              <p>If you prefer a closer, traditional fit without excessive volume, we recommend taking one size smaller than your usual size.</p>
            </div>
            <div className="tip-card">
              <b>STYLING ADVICE:</b>
              <p>Still uncertain about which size to choose? Message our sizing specialists on <a href="https://wa.me/message/5KFLGKP4XCG7C1" target="_blank" rel="noreferrer">WhatsApp</a> with your height and weight for tailored guidance.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Footer() {
  const whatsappLink = "https://wa.me/message/5KFLGKP4XCG7C1";
  return (
    <>
      <a className="whatsapp-float" href={whatsappLink} target="_blank" rel="noreferrer" aria-label="Chat with ENYTM on WhatsApp" title="WhatsApp">
        <svg viewBox="0 0 32 32" width="30" height="30" xmlns="http://www.w3.org/2000/svg" aria-label="WhatsApp" role="img">
          <path fill="#25D366" d="M16 2.5A13.2 13.2 0 0 0 4.7 22.5L3 29l6.7-1.7A13.3 13.3 0 1 0 16 2.5Z" />
          <path fill="#fff" d="M23.1 19.1c-.4-.2-2.1-1.1-2.5-1.2-.3-.1-.6-.2-.8.2-.3.4-1 1.2-1.2 1.4-.2.2-.4.3-.8.1a10.2 10.2 0 0 1-3-1.9 11.4 11.4 0 0 1-2-2.5c-.2-.4 0-.6.2-.8l.6-.7c.2-.2.3-.4.4-.6.1-.2 0-.5 0-.7l-1.1-2.6c-.3-.7-.6-.6-.8-.6h-.7c-.3 0-.7.1-1 .5-.4.4-1.3 1.3-1.3 3.1s1.3 3.5 1.5 3.8c.2.3 2.6 4 6.2 5.5.9.4 1.6.6 2.1.7.9.3 1.8.2 2.4.1.7-.1 2.1-.9 2.4-1.7.3-.8.3-1.5.2-1.7-.1-.1-.4-.2-.8-.4Z" />
        </svg>
      </a>
      <footer>
        <div className="footer-main">
          <div className="footer-brand-col">
            <Link className="logo footer-logo" to="/" aria-label="ENYTM"><BrandLogo /></Link>
            <p className="footer-tagline">“MORE THAN A MOMENT.”</p>
            <p className="footer-desc">
              Architectural streetwear crafted with heavyweight fabrics, considered proportions, and uncompromising standards. Designed to stay in your rotation.
            </p>
            <div className="footer-brand-insta">
              <a href="https://www.instagram.com/enytm_official/?__d=1%253Futm_source%253Dig_embed" target="_blank" rel="noreferrer" className="footer-insta-pill">
                <Instagram size={14} /> @enytm_official
              </a>
            </div>
          </div>
          <div className="footer-col">
            <h4>CUSTOMER CARE</h4>
            <Link to="/track">Track Your Order</Link>
            <Link to="/size-guide">Garment Size Guide</Link>
            <Link to="/collection#faq">Frequently Asked Questions</Link>
            <a href={whatsappLink} target="_blank" rel="noreferrer">WhatsApp Support</a>
            <Link to="/about">About ENYTM</Link>
          </div>
          <div className="footer-col">
            <h4>POLICIES</h4>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/shipping-policy">Shipping & Delivery</Link>
            <Link to="/refund-policy">Returns & Refunds</Link>
            <Link to="/terms">Terms & Conditions</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 ENYTM APPARELS. ALL RIGHTS RESERVED.</span>
          <span>MORE THAN A MOMENT · CHAROLI, PUNE · INDIA</span>
        </div>
      </footer>
    </>
  );
}

function SearchOverlay({ close }) {
  const [q, setQ] = useState("");
  const products = useProducts();
  const results = products.filter(
    (p) =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.category.toLowerCase().includes(q.toLowerCase())
  );

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = origOverflow;
    };
  }, [close]);

  return (
    <div
      className="search-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      onClick={close}
    >
      <div className="search-top-bar" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="close-search"
          onClick={close}
          aria-label="Close search (Esc)"
          title="Close search (Esc)"
        >
          <span className="close-search-text">ESC</span>
          <X size={18} />
        </button>
      </div>
      <div className="search-inner" onClick={(e) => e.stopPropagation()}>
        <p className="eyebrow">SEARCH ENYTM</p>
        <div className="search-input-wrap">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="What are you looking for?"
            aria-label="Search query"
          />
          {q && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setQ("")}
              aria-label="Clear input"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="search-results">
          {q &&
            (results.length ? (
              results.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`} onClick={close}>
                  <img src={p.image} alt={p.name} />
                  <span>
                    {p.name}
                    <small>₹{p.price.toLocaleString("en-IN")}</small>
                  </span>
                  <ArrowRight size={16} />
                </Link>
              ))
            ) : (
              <div className="search-no-results">
                <p>No products found for "{q}"</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
function WalletPage() {
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [amount, setAmount] = useState("500");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const load = async () => { try { setWallet(await api("/wallet")); } catch (e) { setMessage(e.message || "Could not load wallet."); } };
  useEffect(() => { load() }, []);
  const addMoney = async () => {
    const rupees = Number(amount);
    if (!Number.isFinite(rupees) || rupees < 100 || rupees > 50000) { setMessage("Enter an amount from ₹100 to ₹50,000."); return; }
    setBusy(true); setMessage("");
    try {
      const data = await api("/wallet/topup/order", { method: "POST", body: JSON.stringify({ amount: rupees }) });
      if (!window.Razorpay) throw new Error("Payment checkout could not load. Please try again.");
      const rzp = new window.Razorpay({
        key: data.keyId, amount: data.amount, currency: "INR", name: "ENYTM APPARELS", description: "Add money to ENYTM Wallet", order_id: data.razorpayOrderId, theme: { color: "#c8b69a" }, handler: async response => {
          try { await api("/wallet/topup/verify", { method: "POST", body: JSON.stringify({ ...response, topupId: data.topupId }) }); await load(); setMessage("Wallet credited successfully."); }
          catch (e) { setMessage(e.message || "Payment verification pending. Refresh wallet shortly."); }
        }, modal: { ondismiss: () => setBusy(false) }
      });
      rzp.on("payment.failed", r => { setMessage(r.error?.description || "Payment failed."); setBusy(false) }); rzp.open();
    } catch (e) { setMessage(e.message || "Unable to start wallet top-up."); setBusy(false); }
  };
  return <main className="account-page"><div className="page-heading compact"><p className="eyebrow">ENYTM MEMBERS</p><h1>MY WALLET</h1><p>Your balance and wallet activity.</p></div><section className="account-card wallet-card"><p className="eyebrow">AVAILABLE BALANCE</p><h2 style={{ fontSize: 42, margin: "8px 0 24px" }}>₹{Number(wallet.balance || 0).toLocaleString("en-IN")}</h2><div className="wallet-topup"><label htmlFor="wallet-add-amount">ADD MONEY (₹100–₹50,000)</label><input id="wallet-add-amount" inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value.replace(/\D/g, ""))} /><button className="btn primary" disabled={busy} onClick={addMoney}>{busy ? "PROCESSING..." : "ADD MONEY SECURELY"}</button></div>{message && <p className="order-action-message">{message}</p>}<h2>WALLET ACTIVITY</h2>{wallet.transactions?.length ? wallet.transactions.map((t, i) => <div className="wallet-transaction" key={t.id || i}><span>{t.description || t.type || "Wallet transaction"}<small>{t.createdAt ? new Date(t.createdAt).toLocaleString("en-IN") : ""}</small></span><b>{t.amount >= 0 ? "+" : "−"}₹{Math.abs(Number(t.amount || 0)).toLocaleString("en-IN")}</b></div>) : <p className="muted">No wallet transactions yet.</p>}</section></main>
}

function Admin() {
  const [logged, setLogged] = useState(!!localStorage.getItem("enytm-admin"));
  const [tab, setTab] = useState("dashboard");
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const load = async () => { try { setData(await api("/admin/dashboard")); setOrders(await api("/admin/orders")); setCustomers(await api("/admin/customers")); setProducts(await api("/admin/products")); } catch { localStorage.removeItem("enytm-admin"); setLogged(false) } };
  useEffect(() => { if (logged) load() }, [logged]);
  const login = async () => {
    setBusy(true); setError("");
    try {
      const r = await api("/admin/login", { method: "POST", body: JSON.stringify({ email: email.trim().toLowerCase(), password }) });
      localStorage.setItem("enytm-admin", r.token);
      setLogged(true);
    } catch (e) { setError(e.message || "Admin login failed."); }
    finally { setBusy(false) }
  };
  if (!logged) return <main className="admin-login"><div className="auth-card"><p className="eyebrow">ENYTM CONTROL</p><h1>ADMIN LOGIN</h1><p className="muted">Use the ADMIN_EMAIL and ADMIN_PASSWORD from your server .env file.</p><input autoComplete="username" placeholder="Admin email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} /><input autoComplete="current-password" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />{error && <div className="admin-login-error">{error}</div>}<button className="btn primary full" disabled={busy} onClick={login}>{busy ? "CHECKING..." : "LOGIN"}</button></div></main>;
  return <main className="admin-page"><aside className="admin-side"><div className="logo"><BrandLogo /></div>{["dashboard", "orders", "customers", "products", "coupons", "settings"].map(t => <button className={tab === t ? "active" : ""} onClick={() => setTab(t)} key={t}>{t.toUpperCase()}</button>)}<button onClick={() => { localStorage.removeItem("enytm-admin"); setLogged(false) }}>LOG OUT</button></aside><section className="admin-content"><div className="admin-top"><div><p className="eyebrow">ENYTM APPARELS</p><h1>{tab.toUpperCase()}</h1></div><Link className="btn outline" to="/">VIEW STORE</Link></div>{tab === "dashboard" && data && <div className="metric-grid">{[["REVENUE", `₹${data.revenue.toLocaleString("en-IN")}`], ["ORDERS", data.orders], ["PAID", data.paidOrders], ["CUSTOMERS", data.customers], ["PRODUCTS", data.products], ["PENDING", data.pendingPayments]].map(([a, b]) => <div className="metric" key={a}><span>{a}</span><strong>{b}</strong></div>)}</div>}{tab === "orders" && <AdminOrders orders={orders} reload={load} />} {tab === "customers" && <AdminTable headers={["NAME", "EMAIL", "PHONE", "CREATED", "WHATSAPP", "EMAIL"]} rows={customers.map(c => [c.name, c.email, c.phone || "—", new Date(c.createdAt).toLocaleDateString(), c.whatsappOptIn ? "ON" : "OFF", c.emailOptIn ? "ON" : "OFF"])} />} {tab === "products" && <AdminProducts products={products} reload={load} />} {tab === "coupons" && <AdminCoupons products={products} />} {tab === "settings" && <AdminSettings />}</section></main>
}
function AdminOrders({ orders, reload }) {
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("confirmed");
  const [courier, setCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const money = value => `₹${Number(value || 0).toLocaleString("en-IN")}`;
  const date = value => value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";
  const field = (label, value) => <div className="order-detail-field" key={label}><span>{label}</span><strong>{value || "—"}</strong></div>;
  const openOrder = order => { setSelected(order); setStatus(order.status || "confirmed"); setCourier(order.tracking?.courier || ""); setTrackingNumber(order.tracking?.trackingNumber || ""); setTrackingUrl(order.tracking?.trackingUrl || ""); setMessage(""); };
  const saveDelivery = async () => {
    if (!selected) return;
    setSaving(true); setMessage("");
    try {
      const updated = await api(`/admin/orders/${selected.id}/status`, { method: "PUT", body: JSON.stringify({ status, tracking: { courier: courier.trim(), trackingNumber: trackingNumber.trim(), trackingUrl: trackingUrl.trim() } }) });
      setSelected(updated); setStatus(updated.status || status); setCourier(updated.tracking?.courier || ""); setTrackingNumber(updated.tracking?.trackingNumber || ""); setTrackingUrl(updated.tracking?.trackingUrl || "");
      setMessage("Delivery details saved. The customer order page will reflect the updated status.");
      if (reload) await reload();
    } catch (e) { setMessage(e.message || "Could not update delivery details."); }
    finally { setSaving(false); }
  };
  if (selected) {
    const order = selected;
    const customer = order.customer || {};
    const items = Array.isArray(order.items) ? order.items : [];
    return <section className="admin-order-detail">
      <div className="admin-order-detail-head"><button className="btn outline" onClick={() => setSelected(null)}>← BACK TO ORDERS</button><div><p className="eyebrow">ORDER DETAILS</p><h2>{order.receipt || order.id}</h2><p className="admin-order-muted">Placed {date(order.createdAt)}</p></div><button className="btn outline" onClick={() => window.print()}>PRINT ORDER</button></div>
      <div className="admin-order-badges"><span>ORDER: {String(order.status || "unknown").replaceAll("_", " ")}</span><span>PAYMENT: {String(order.paymentStatus || "unknown").replaceAll("_", " ")}</span></div>
      <section className="admin-order-card admin-delivery-editor"><p className="eyebrow">DELIVERY & CUSTOMER TRACKING</p><h3>Update order progress</h3><p className="admin-order-muted">Save changes here to update the status shown in the customer's order details. Add courier tracking details when available.</p>
        <div className="admin-delivery-form">
          <label>ORDER STATUS<select value={status} onChange={e => setStatus(e.target.value)}>{[["payment_pending", "Payment pending"], ["confirmed", "Order confirmed"], ["processing", "Processing"], ["packed", "Packed"], ["shipped", "Shipped"], ["out_for_delivery", "Out for delivery"], ["delivered", "Delivered"]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>COURIER PARTNER<input value={courier} onChange={e => setCourier(e.target.value)} placeholder="e.g. Delhivery, Shiprocket" /></label>
          <label>TRACKING / AWB NUMBER<input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} placeholder="Enter AWB or tracking number" /></label>
          <label>TRACKING URL<input type="url" value={trackingUrl} onChange={e => setTrackingUrl(e.target.value)} placeholder="https://courier-tracking-link" /></label>
        </div>
        <button className="btn primary" disabled={saving} onClick={saveDelivery}>{saving ? "SAVING..." : "SAVE DELIVERY UPDATE"}</button>{message && <p className="admin-save-message">{message}</p>}
      </section>
      <div className="admin-order-detail-grid">
        <section className="admin-order-card"><p className="eyebrow">CUSTOMER & DELIVERY</p><h3>{customer.name || "Customer details unavailable"}</h3><div className="admin-order-fields">{field("Email", customer.email)}{field("Phone", customer.phone)}{field("Address", customer.address)}{field("City", customer.city)}{field("State", customer.state)}{field("PIN code", customer.pincode)}{field("Landmark", customer.landmark)}</div></section>
        <section className="admin-order-card"><p className="eyebrow">PAYMENT INFORMATION</p><div className="admin-order-fields">{field("Payment status", order.paymentStatus)}{field("Payment method", order.paymentMethod)}{field("Payment ID", order.paymentId)}{field("Gateway order ID", order.razorpayOrderId)}{field("Order ID", order.receipt || order.id)}{field("Last updated", date(order.updatedAt))}</div></section>
      </div>
      <section className="admin-order-card admin-order-items"><p className="eyebrow">ITEMS IN THIS ORDER</p><div className="admin-order-item-list">{items.length ? items.map((item, i) => <div className="admin-order-item" key={`${item.productId || item.name}-${i}`}><div className="admin-order-item-image">{item.image ? <img src={item.image} alt={item.name || "Ordered product"} /> : <span>ENYTM</span>}</div><div className="admin-order-item-name"><strong>{item.name || "Product"}</strong><span>{item.category || "Apparel"}{item.size ? ` · Size ${item.size}` : ""}{item.color ? ` · ${item.color}` : ""}</span><small>Qty: {Number(item.qty || 1)}</small></div><div className="admin-order-item-price"><span>{money(item.price)} each</span><strong>{money(Number(item.price || 0) * Number(item.qty || 1))}</strong></div></div>) : <p className="admin-order-muted">No product line items were saved with this order.</p>}</div>
        <div className="admin-order-totals">{field("Subtotal", money(order.subtotal))}{field("Discount", money(order.discount))}{field("Shipping", Number(order.shipping || 0) ? money(order.shipping) : "Free")}{field("Order total", money(order.total))}</div></section>
      <p className="admin-order-note">Details are shown from the order record saved by your store. Fields that were not collected at checkout appear as “—”.</p>
    </section>;
  }
  return <div className="admin-table-wrap admin-orders-table"><table><thead><tr>{["ORDER ID · CLICK TO OPEN", "CUSTOMER", "PHONE", "TOTAL", "PAYMENT", "ORDER STATUS", "DATE"].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{orders.map(order => <tr key={order.id || order.receipt}><td><button className="admin-order-link" onClick={() => openOrder(order)}>{order.receipt || order.id}</button></td><td>{order.customer?.name || "—"}</td><td>{order.customer?.phone || "—"}</td><td>{money(order.total)}</td><td>{order.paymentStatus || "—"}</td><td>{String(order.status || "—").replaceAll("_", " ")}</td><td>{date(order.createdAt)}</td></tr>)}</tbody></table>{!orders.length && <p className="admin-order-muted">No orders found.</p>}</div>;
}

function AdminTable({ headers, rows }) { return <div className="admin-table-wrap"><table><thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody></table></div> }
function AdminMediaUpload({ fieldKey, label, hint, value, onUploaded, video = false }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [urlInput, setUrlInput] = useState(value || "");
  const [gdriveDetected, setGdriveDetected] = useState(false);

  useEffect(() => {
    setUrlInput(value || "");
    const isGDrive = /drive\.google\.com/i.test(value || "");
    setGdriveDetected(isGDrive && typeof value === "string" && value.includes("googleusercontent.com/d/"));
  }, [value]);

  const handleUrlChange = (val) => {
    setUrlInput(val);
    setError("");
    if (!val.trim()) {
      onUploaded("");
      setGdriveDetected(false);
      return;
    }
    const isGDrive = /drive\.google\.com/i.test(val);
    const normalized = normalizeImageUrl(val);
    const converted = isGDrive && normalized.startsWith("https://lh3.googleusercontent.com/d/");
    setGdriveDetected(converted);
    onUploaded(normalized);
  };

  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append(video ? "video" : "image", file);
      const result = await api(video ? "/admin/upload-video" : "/admin/upload-image", { method: "POST", body: form });
      onUploaded(result.url);
      setUrlInput(result.url);
      setGdriveDetected(false);
    } catch (e) {
      setError(e.message || "Upload failed. You can also paste an image link directly above.");
    } finally {
      setBusy(false);
    }
  };

  const displaySrc = normalizeImageUrl(value);

  return (
    <div className="admin-media-upload">
      <div className="admin-media-preview">
        {displaySrc ? (
          video ? (
            <video src={displaySrc} controls />
          ) : (
            <img
              src={displaySrc}
              alt={label}
              referrerPolicy="no-referrer"
              onError={(e) => {
                const src = e.currentTarget.src;
                if (src.includes("googleusercontent.com/d/")) {
                  const id = src.split("/d/")[1]?.split("=")[0];
                  if (id && !e.currentTarget.dataset.retried) {
                    e.currentTarget.dataset.retried = "1";
                    e.currentTarget.src = `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
                    return;
                  }
                }
                e.currentTarget.style.opacity = "0.3";
              }}
            />
          )
        ) : (
          <div className="admin-media-empty">
            <Package size={23} />
            <span>{video ? "VIDEO" : "IMAGE"}</span>
          </div>
        )}
      </div>
      <div className="admin-media-meta">
        <strong>{label}</strong>
        <small>{hint}</small>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "5px" }}>
          <input
            type="text"
            placeholder={video ? "Paste video link (MP4, Cloudinary, etc.)" : "Paste Google Drive link or Image URL"}
            value={urlInput}
            onChange={(e) => handleUrlChange(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "8px 10px",
              background: "#161616",
              border: "1px solid #333",
              color: "#f5f5f2",
              fontSize: "11px",
              fontFamily: "inherit"
            }}
          />
          {gdriveDetected && (
            <small style={{ color: "#4ade80", fontSize: "10px", fontWeight: "600" }}>
              ✓ Google Drive link converted to direct image
            </small>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginTop: "2px" }}>
          <label className="admin-upload-button" style={{ margin: 0 }}>
            {busy ? "UPLOADING..." : value ? "OR CHOOSE FILE" : "OR CHOOSE FILE"}
            <input
              type="file"
              accept={video ? "video/mp4,video/webm,video/quicktime" : "image/jpeg,image/png,image/webp"}
              disabled={busy}
              onChange={(e) => {
                upload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          {value && (
            <button
              type="button"
              className="admin-media-remove"
              onClick={() => {
                onUploaded("");
                setUrlInput("");
                setGdriveDetected(false);
              }}
            >
              REMOVE
            </button>
          )}
        </div>
        {error && <small className="admin-media-error">{error}</small>}
      </div>
    </div>
  );
}
function AdminCoupons({ products }) {
  const empty = { code: "", title: "", discountType: "percentage", discountValue: 10, maxDiscount: 0, minOrderValue: 0, usageLimit: 0, perCustomerLimit: 1, startsAt: "", expiresAt: "", categories: [], productIds: [], active: true };
  const [coupon, setCoupon] = useState(empty); const [list, setList] = useState([]); const [editing, setEditing] = useState(null); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  const load = async () => { try { setList(await api("/admin/coupons")) } catch (e) { setMessage(e.message || "Could not load coupons.") } };
  useEffect(() => { load() }, []);
  const save = async () => { setBusy(true); setMessage(""); try { await api("/admin/coupons", { method: "POST", body: JSON.stringify({ ...coupon, id: editing || undefined, code: coupon.code.toUpperCase(), startsAt: coupon.startsAt ? new Date(coupon.startsAt).toISOString() : "", expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString() : "" }) }); setCoupon(empty); setEditing(null); setMessage("Coupon saved."); await load() } catch (e) { setMessage(e.message || "Could not save coupon.") } finally { setBusy(false) } };
  const edit = c => { setEditing(c.id); setCoupon({ ...empty, ...c, startsAt: c.startsAt ? new Date(c.startsAt).toISOString().slice(0, 16) : "", expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 16) : "" }); setMessage("") };
  const remove = async c => { if (!window.confirm(`Delete coupon ${c.code}?`)) return; try { await api(`/admin/coupons/${c.id}`, { method: "DELETE" }); await load() } catch (e) { setMessage(e.message || "Could not delete coupon.") } };
  const toggleCategory = (value, checked) => setCoupon(c => ({ ...c, categories: checked ? [...c.categories, value] : c.categories.filter(x => x !== value) }));
  return <div className="admin-coupons"><section className="admin-product-editor"><div className="admin-editor-head"><div><p className="eyebrow">{editing ? "EDIT COUPON" : "PROMOTIONS"}</p><h2>{editing ? "Update coupon" : "Create a coupon code"}</h2><p className="muted">Build seasonal offers, influencer codes and customer promotions without editing code.</p></div>{editing && <button className="admin-text-btn" onClick={() => { setEditing(null); setCoupon(empty) }}>CANCEL</button>}</div><div className="admin-product-form">
    <label className="admin-product-field"><span>COUPON CODE</span><input value={coupon.code} placeholder="DIWALI20" onChange={e => setCoupon(c => ({ ...c, code: e.target.value.toUpperCase().replace(/\s/g, "") }))} /></label>
    <label className="admin-product-field"><span>CAMPAIGN / CREATOR NAME</span><input value={coupon.title} placeholder="Diwali campaign or creator name" onChange={e => setCoupon(c => ({ ...c, title: e.target.value }))} /></label>
    <label className="admin-product-field"><span>DISCOUNT TYPE</span><select value={coupon.discountType} onChange={e => setCoupon(c => ({ ...c, discountType: e.target.value }))}><option value="percentage">Percentage (%)</option><option value="fixed">Fixed amount (₹)</option></select></label>
    <label className="admin-product-field"><span>DISCOUNT VALUE</span><input type="number" min="1" max={coupon.discountType === "percentage" ? 100 : undefined} value={coupon.discountValue} onChange={e => setCoupon(c => ({ ...c, discountValue: e.target.value }))} /></label>
    <label className="admin-product-field"><span>MAX DISCOUNT (₹, 0 = NONE)</span><input type="number" min="0" value={coupon.maxDiscount} onChange={e => setCoupon(c => ({ ...c, maxDiscount: e.target.value }))} disabled={coupon.discountType === "fixed"} /></label>
    <label className="admin-product-field"><span>MINIMUM ORDER VALUE (₹)</span><input type="number" min="0" value={coupon.minOrderValue} onChange={e => setCoupon(c => ({ ...c, minOrderValue: e.target.value }))} /></label>
    <label className="admin-product-field"><span>TOTAL USAGE LIMIT (0 = UNLIMITED)</span><input type="number" min="0" value={coupon.usageLimit} onChange={e => setCoupon(c => ({ ...c, usageLimit: e.target.value }))} /></label>
    <label className="admin-product-field"><span>PER CUSTOMER LIMIT (0 = UNLIMITED)</span><input type="number" min="0" value={coupon.perCustomerLimit} onChange={e => setCoupon(c => ({ ...c, perCustomerLimit: e.target.value }))} /></label>
    <label className="admin-product-field"><span>START DATE / TIME</span><input type="datetime-local" value={coupon.startsAt} onChange={e => setCoupon(c => ({ ...c, startsAt: e.target.value }))} /></label>
    <label className="admin-product-field"><span>EXPIRY DATE / TIME</span><input type="datetime-local" value={coupon.expiresAt} onChange={e => setCoupon(c => ({ ...c, expiresAt: e.target.value }))} /></label>
    <div className="admin-product-field admin-product-wide"><span>APPLIES TO CATEGORIES (NONE = ALL)</span><div className="admin-coupon-checks">{["Oversized", "Polos", "Hoodies", "Sweatshirts"].map(cat => <label key={cat}><input type="checkbox" checked={coupon.categories.includes(cat)} onChange={e => toggleCategory(cat, e.target.checked)} />{cat}</label>)}</div></div>
    <div className="admin-product-field admin-product-wide"><span>SPECIFIC PRODUCTS (NONE = ALL)</span><select multiple value={coupon.productIds.map(String)} onChange={e => setCoupon(c => ({ ...c, productIds: [...e.target.selectedOptions].map(o => Number(o.value)) }))}>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
    <label className="admin-coupon-active admin-product-wide"><input type="checkbox" checked={coupon.active} onChange={e => setCoupon(c => ({ ...c, active: e.target.checked }))} /> Coupon is active and can be used at checkout</label>
  </div><div className="admin-editor-actions"><button className="btn primary" disabled={busy} onClick={save}>{busy ? "SAVING..." : editing ? "SAVE COUPON" : "CREATE COUPON"}</button>{editing && <button className="btn outline" onClick={() => { setEditing(null); setCoupon(empty) }}>CANCEL</button>}</div>{message && <div className="admin-save-message">{message}</div>}</section>
    <div className="admin-product-list-head"><div><p className="eyebrow">CAMPAIGN LIBRARY</p><h2>{list.length} COUPONS</h2></div></div><div className="admin-table-wrap"><table><thead><tr>{["CODE", "CAMPAIGN", "OFFER", "USAGE", "VALID UNTIL", "STATUS", "ACTIONS"].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{list.map(c => <tr key={c.id}><td><strong>{c.code}</strong></td><td>{c.title || "—"}</td><td>{c.discountType === "fixed" ? `₹${c.discountValue} off` : `${c.discountValue}% off`}{c.maxDiscount > 0 && c.discountType === "percentage" ? ` (max ₹${c.maxDiscount})` : ""}</td><td>{c.usageCount || 0}{c.usageLimit ? ` / ${c.usageLimit}` : " / ∞"}</td><td>{c.expiresAt ? new Date(c.expiresAt).toLocaleString("en-IN") : "No expiry"}</td><td>{c.active ? "ACTIVE" : "INACTIVE"}</td><td><div className="admin-actions"><button className="admin-icon-btn" title="Edit" onClick={() => edit(c)}><Pencil size={17} /></button><button className="admin-icon-btn admin-delete-icon" title="Delete" onClick={() => remove(c)}><Trash2 size={17} /></button></div></td></tr>)}</tbody></table>{!list.length && <p className="admin-order-muted">No coupons yet. Create your first campaign above.</p>}</div></div>
}
function AdminProducts({ products, reload }) {
  const defaultSizes = ["S", "M", "L", "XL", "XXL"];
  const defaultSizeStock = { S: 5, M: 5, L: 5, XL: 5, XXL: 0 };
  const empty = {
    name: "",
    category: "Oversized",
    price: 999,
    oldPrice: 1199,
    stock: 20,
    badge: "NEW",
    description: "",
    images: [""],
    video: "",
    sizes: defaultSizes,
    sizeStock: defaultSizeStock,
  };

  const [p, setP] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const availableCategories = useMemo(() => {
    const list = ["Oversized", "Polos", "Hoodies", "Sweatshirts", "Lowers"];
    const set = new Set(list);
    (products || []).forEach(prod => {
      if (prod.category && typeof prod.category === "string" && prod.category.trim()) {
        set.add(prod.category.trim());
      }
    });
    if (p.category && typeof p.category === "string" && p.category.trim()) {
      set.add(p.category.trim());
    }
    return Array.from(set);
  }, [products, p.category]);

  const startEdit = (product) => {
    setEditing(product.id);
    setIsAddingNewCategory(false);
    setNewCategoryName("");
    const existingImages = Array.isArray(product.images) && product.images.length
      ? [...product.images]
      : [product.image, product.image2, product.image3, product.modelFront, product.modelBack].filter(Boolean);

    const activeSizes = Array.isArray(product.sizes) && product.sizes.length ? product.sizes : defaultSizes;
    let initialSizeStock = {};
    if (product.sizeStock && typeof product.sizeStock === "object") {
      initialSizeStock = { ...product.sizeStock };
      activeSizes.forEach(s => {
        if (typeof initialSizeStock[s] === "undefined") initialSizeStock[s] = 0;
      });
    } else {
      const baseQty = Math.floor(Number(product.stock || 0) / (activeSizes.length || 1));
      activeSizes.forEach((s) => {
        initialSizeStock[s] = baseQty;
      });
    }

    const calculatedStock = activeSizes.reduce((sum, s) => sum + (Number(initialSizeStock[s]) || 0), 0);

    setP({
      ...empty,
      ...product,
      sizes: activeSizes,
      sizeStock: initialSizeStock,
      stock: calculatedStock || Number(product.stock || 0),
      images: existingImages.length ? existingImages : [""],
    });
    setMessage("");
  };

  const cancel = () => {
    setEditing(null);
    setIsAddingNewCategory(false);
    setNewCategoryName("");
    setP({ ...empty });
    setMessage("");
  };

  const trimmedCurrentName = (p.name || "").trim().toLowerCase();
  const isDuplicateName = Boolean(
    trimmedCurrentName &&
    (products || []).some(
      (prod) =>
        (!editing || String(prod.id) !== String(editing)) &&
        String(prod.name || "").trim().toLowerCase() === trimmedCurrentName
    )
  );

  const save = async () => {
    const trimmedName = p.name.trim();
    if (!trimmedName) {
      setMessage("Product name is required.");
      return;
    }

    if (isDuplicateName) {
      setMessage(`A product named "${trimmedName}" already exists. Product names must be unique.`);
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const rawImgList = (p.images || []).map(normalizeImageUrl).filter(Boolean);
      const primaryImg = rawImgList[0] || normalizeImageUrl(p.image) || "";

      const activeSizes = (p.sizes && p.sizes.length) ? p.sizes : defaultSizes;
      const cleanSizeStock = {};
      activeSizes.forEach(s => {
        cleanSizeStock[s] = Math.max(0, Number(p.sizeStock?.[s] || 0));
      });
      const computedStock = Object.values(cleanSizeStock).reduce((sum, q) => sum + (Number(q) || 0), 0);

      const finalCategory = (isAddingNewCategory && newCategoryName.trim())
        ? newCategoryName.trim()
        : (p.category || availableCategories[0] || "Oversized");

      const payload = {
        ...p,
        category: finalCategory,
        images: rawImgList,
        image: primaryImg,
        image2: rawImgList[1] || "",
        image3: rawImgList[2] || "",
        modelFront: rawImgList[3] || "",
        modelBack: rawImgList[4] || "",
        video: normalizeImageUrl(p.video || ""),
        price: Number(p.price),
        oldPrice: Number(p.oldPrice || 0),
        stock: computedStock,
        sizeStock: cleanSizeStock,
        sizes: activeSizes,
      };

      if (editing) {
        await api(`/admin/products/${editing}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/admin/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setMessage(editing ? "Product updated successfully." : "Product added successfully.");
      setEditing(null);
      setIsAddingNewCategory(false);
      setNewCategoryName("");
      setP({ ...empty });

      await reload();
    } catch (e) {
      setMessage(e.message || "Could not save product.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (product) => {
    if (
      !window.confirm(
        `Delete "${product.name}"?`
      )
    ) {
      return;
    }

    try {
      await api(
        `/admin/products/${product.id}`,
        {
          method: "DELETE",
        }
      );

      await reload();
    } catch (e) {
      setMessage(
        e.message ||
        "Could not delete product."
      );
    }
  };

  const field = (
    key,
    label,
    type = "text"
  ) => (
    <label className="admin-product-field">
      <span>{label}</span>

      <input
        type={type}
        value={p[key] ?? ""}
        onChange={(e) =>
          setP({
            ...p,
            [key]: e.target.value,
          })
        }
      />
    </label>
  );

  return (
    <div className="admin-products">

      {/* =========================
          PRODUCT EDITOR
      ========================= */}

      <div className="admin-product-editor">

        <div className="admin-editor-head">
          <div>
            <p className="eyebrow">
              {editing
                ? "EDIT PRODUCT"
                : "ADD PRODUCT"}
            </p>

            <h2>
              {editing
                ? "Update product details"
                : "Create a new product"}
            </h2>
          </div>

          {editing && (
            <button
              className="admin-text-btn"
              onClick={cancel}
            >
              CANCEL
            </button>
          )}
        </div>

        <div className="admin-product-form">

          <label className="admin-product-field">
            <span>PRODUCT NAME (MUST BE UNIQUE)</span>
            <input
              type="text"
              placeholder="e.g. Essential Oversized Tee"
              value={p.name || ""}
              onChange={(e) => {
                setP({ ...p, name: e.target.value });
                if (message) setMessage("");
              }}
              style={{
                borderColor: isDuplicateName ? "#ef4444" : undefined,
                background: isDuplicateName ? "#201212" : undefined
              }}
            />
            {isDuplicateName && (
              <small style={{ color: "#f87171", fontSize: "10.5px", fontWeight: "600", marginTop: "4px" }}>
                ⚠️ A product with this name already exists. Product names must be unique.
              </small>
            )}
          </label>

          <div className="admin-product-field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span>CATEGORY</span>
              <button
                type="button"
                className="admin-text-btn"
                style={{ fontSize: "10px", color: "#c8b69a", textDecoration: "underline", padding: 0 }}
                onClick={() => {
                  setIsAddingNewCategory(prev => !prev);
                  if (!isAddingNewCategory) {
                    setNewCategoryName("");
                  }
                }}
              >
                {isAddingNewCategory ? "← CHOOSE EXISTING CATEGORY" : "+ ADD NEW CATEGORY"}
              </button>
            </div>

            {isAddingNewCategory ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <input
                  type="text"
                  placeholder="Type new category name (e.g. Shirts, Cargo, Jackets)"
                  value={newCategoryName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewCategoryName(val);
                    setP(curr => ({ ...curr, category: val }));
                  }}
                  autoFocus
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: "#161616",
                    border: "1px solid #c8b69a",
                    color: "#f5f5f2",
                    padding: "9px 12px",
                    fontSize: "12px",
                    fontWeight: "600"
                  }}
                />
                <small style={{ color: "#aaa", fontSize: "10px" }}>
                  Creating new category: <b>{newCategoryName.trim() || "(type above)"}</b>
                </small>
              </div>
            ) : (
              <select
                value={p.category || availableCategories[0] || "Oversized"}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "__ADD_NEW__") {
                    setIsAddingNewCategory(true);
                    setNewCategoryName("");
                  } else {
                    setP(curr => ({ ...curr, category: val }));
                  }
                }}
              >
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__ADD_NEW__">+ Add New Category...</option>
              </select>
            )}
          </div>

          {field(
            "price",
            "SELLING PRICE",
            "number"
          )}

          {field(
            "oldPrice",
            "MRP / OLD PRICE",
            "number"
          )}

          {field(
            "badge",
            "BADGE"
          )}

          <div className="admin-product-wide" style={{ marginTop: "14px", border: "1px solid #282828", background: "#0a0a0a", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", letterSpacing: ".12em", color: "#f5f5f2" }}>SIZE-WISE INVENTORY QUANTITY</span>
                <p style={{ margin: "3px 0 0", fontSize: "10px", color: "#888" }}>
                  Enable sizes and set stock quantity for each size. Total stock is automatically calculated.
                </p>
              </div>
              <div style={{ background: "#161616", border: "1px solid #333", padding: "6px 14px", fontSize: "11px", fontWeight: "700", color: "#c8b69a", letterSpacing: ".08em" }}>
                TOTAL CALCULATED STOCK: {defaultSizes.reduce((sum, s) => (p.sizes || []).includes(s) ? sum + (Number(p.sizeStock?.[s]) || 0) : sum, 0)} UNITS
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "10px" }}>
              {defaultSizes.map(sizeName => {
                const isEnabled = (p.sizes || []).includes(sizeName);
                const currentQty = p.sizeStock?.[sizeName] ?? 0;
                return (
                  <div
                    key={sizeName}
                    style={{
                      background: isEnabled ? "#141414" : "#0c0c0c",
                      border: `1px solid ${isEnabled ? "#383838" : "#202020"}`,
                      padding: "10px 12px",
                      borderRadius: "2px",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "800", color: isEnabled ? "#f5f5f2" : "#666" }}>
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={e => {
                            const newSizes = e.target.checked
                              ? [...new Set([...(p.sizes || []), sizeName])]
                              : (p.sizes || []).filter(s => s !== sizeName);
                            const newSizeStock = { ...(p.sizeStock || {}) };
                            if (!e.target.checked) newSizeStock[sizeName] = 0;
                            const newTotal = defaultSizes.reduce((acc, s) => newSizes.includes(s) ? acc + (Number(newSizeStock[s]) || 0) : acc, 0);
                            setP({ ...p, sizes: newSizes, sizeStock: newSizeStock, stock: newTotal });
                          }}
                        />
                        SIZE {sizeName}
                      </label>
                      <span style={{ fontSize: "9px", color: isEnabled ? (currentQty > 0 ? "#4ade80" : "#f87171") : "#555", fontWeight: "700" }}>
                        {isEnabled ? (currentQty > 0 ? `${currentQty} in stock` : "SOLD OUT") : "OFF"}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: "9px", color: "#888", letterSpacing: ".05em", display: "block", marginBottom: "3px" }}>QUANTITY</span>
                      <input
                        type="number"
                        min="0"
                        disabled={!isEnabled}
                        value={currentQty}
                        onChange={e => {
                          const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                          const newSizeStock = { ...(p.sizeStock || {}), [sizeName]: val };
                          const newTotal = defaultSizes.reduce((acc, s) => (p.sizes || []).includes(s) ? acc + (Number(newSizeStock[s]) || 0) : acc, 0);
                          setP({ ...p, sizeStock: newSizeStock, stock: newTotal });
                        }}
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "6px 8px",
                          background: isEnabled ? "#1c1c1c" : "#111",
                          border: `1px solid ${isEnabled ? "#444" : "#222"}`,
                          color: isEnabled ? "#f5f5f2" : "#555",
                          fontSize: "13px",
                          fontWeight: "700",
                          fontFamily: "inherit"
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="admin-product-wide admin-media-section" style={{ marginTop: "14px", border: "1px solid #282828", background: "#0a0a0a", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", letterSpacing: ".12em", color: "#f5f5f2" }}>PRODUCT IMAGES</span>
                <p style={{ margin: "3px 0 0", fontSize: "10px", color: "#888" }}>
                  Add multiple photos for this product. Paste Google Drive links, image URLs, or choose files.
                </p>
              </div>
              <button
                type="button"
                className="btn outline"
                style={{ padding: "8px 14px", fontSize: "10px", letterSpacing: ".08em", display: "inline-flex", alignItems: "center", gap: "6px" }}
                onClick={() => setP(curr => ({ ...curr, images: [...(curr.images || []), ""] }))}
              >
                <Plus size={13} /> ADD MORE IMAGES
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {(p.images && p.images.length ? p.images : [""]).map((imgUrl, idx) => (
                <div
                  key={idx}
                  style={{
                    border: "1px solid #262626",
                    background: "#111",
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "10px", fontWeight: "800", letterSpacing: ".12em", color: idx === 0 ? "#c8b69a" : "#ccc" }}>
                      {idx === 0 ? "IMAGE 01 · PRIMARY / COVER PHOTO" : `IMAGE 0${idx + 1}`}
                    </span>
                    {(p.images || []).length > 1 && (
                      <button
                        type="button"
                        style={{
                          border: "1px solid #4a2222",
                          background: "transparent",
                          color: "#ff7070",
                          fontSize: "10px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "3px 8px"
                        }}
                        onClick={() => {
                          setP(curr => {
                            const updated = [...(curr.images || [])];
                            updated.splice(idx, 1);
                            return { ...curr, images: updated.length ? updated : [""] };
                          });
                        }}
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    )}
                  </div>

                  <AdminMediaUpload
                    fieldKey={`image-${idx}`}
                    label={idx === 0 ? "PRIMARY PHOTO" : `IMAGE ${idx + 1}`}
                    hint="Paste Google Drive link, Image URL, or choose a file"
                    value={imgUrl}
                    onUploaded={(newUrl) => {
                      setP(curr => {
                        const updated = [...(curr.images || [""])];
                        updated[idx] = newUrl;
                        return { ...curr, images: updated };
                      });
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn outline full"
              style={{ marginTop: "14px", padding: "12px", fontSize: "11px", letterSpacing: ".1em", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", border: "1px dashed #444", background: "rgba(255,255,255,0.02)" }}
              onClick={() => setP(curr => ({ ...curr, images: [...(curr.images || []), ""] }))}
            >
              <Plus size={15} /> ADD MORE IMAGES
            </button>

            <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid #222" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", letterSpacing: ".1em", color: "#f5f5f2", display: "block", marginBottom: "8px" }}>
                PRODUCT VIDEO (OPTIONAL)
              </span>
              <AdminMediaUpload
                fieldKey="video"
                label="MOTION / VIDEO"
                hint="Paste video link (MP4, Cloudinary, etc.) or choose file"
                value={p.video}
                video
                onUploaded={(url) => setP(curr => ({ ...curr, video: url }))}
              />
            </div>
          </div>

          <label className="admin-product-field admin-product-wide">
            <span>
              DESCRIPTION
            </span>

            <textarea
              rows="4"
              value={
                p.description || ""
              }
              onChange={(e) =>
                setP({
                  ...p,
                  description:
                    e.target.value,
                })
              }
            />
          </label>

        </div>

        <div className="admin-editor-actions">

          <button
            className="btn primary"
            disabled={busy}
            onClick={save}
          >
            {busy
              ? "SAVING..."
              : editing
                ? "SAVE CHANGES"
                : "ADD PRODUCT"}
          </button>

          {editing && (
            <button
              className="btn outline"
              onClick={cancel}
            >
              CANCEL EDIT
            </button>
          )}

        </div>

        {message && (
          <div className="admin-save-message">
            {message}
          </div>
        )}

      </div>

      {/* =========================
          PRODUCT LIST
      ========================= */}

      <div className="admin-product-list-head">

        <div>
          <p className="eyebrow">
            CATALOG
          </p>

          <h2>
            {products.length} PRODUCTS
          </h2>
        </div>

        <span>
          Edit price, discount, photos,
          stock and product details
          anytime.
        </span>

      </div>

      <div className="admin-table-wrap admin-products-table">

        <table>

          <thead>
            <tr>
              <th>PRODUCT</th>
              <th>CATEGORY</th>
              <th>PRICE</th>
              <th>DISCOUNT</th>
              <th>STOCK</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>

            {products.map(
              (product) => {

                const discount =
                  Number(
                    product.oldPrice
                  ) >
                    Number(
                      product.price
                    )
                    ? Math.round(
                      (1 -
                        Number(
                          product.price
                        ) /
                        Number(
                          product.oldPrice
                        )) *
                      100
                    )
                    : 0;

                return (
                  <tr
                    key={
                      product.id
                    }
                  >

                    {/* PRODUCT */}

                    <td>
                      <div className="admin-product-cell">

                        {product.image ? (
                          <img
                            src={
                              normalizeImageUrl(product.image)
                            }
                            alt={
                              product.name
                            }
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const src = e.currentTarget.src;
                              if (src.includes("googleusercontent.com/d/")) {
                                const id = src.split("/d/")[1]?.split("=")[0];
                                if (id && !e.currentTarget.dataset.retried) {
                                  e.currentTarget.dataset.retried = "1";
                                  e.currentTarget.src = `https://drive.google.com/thumbnail?id=${id}&sz=w600`;
                                }
                              }
                            }}
                          />
                        ) : (
                          <div className="admin-product-placeholder">
                            <BrandLogo />
                          </div>
                        )}

                        <span>
                          {
                            product.name
                          }
                        </span>

                      </div>
                    </td>

                    {/* CATEGORY */}

                    <td>
                      {
                        product.category
                      }
                    </td>

                    {/* PRICE */}

                    <td>
                      ₹
                      {Number(
                        product.price
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    {/* DISCOUNT */}

                    <td>
                      {discount ? (
                        <span className="admin-discount">
                          {discount}% OFF
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* STOCK */}

                    <td>
                      {product.stock}
                      <div>
                        <strong style={{ fontSize: "12px", color: product.stock > 0 ? "#f5f5f2" : "#f87171" }}>
                          {product.stock} {product.stock === 1 ? "unit" : "units"}
                        </strong>
                        {product.sizeStock && typeof product.sizeStock === "object" && (
                          <div style={{ fontSize: "9.5px", color: "#888", display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "3px" }}>
                            {Object.entries(product.sizeStock).map(([s, q]) => (
                              <span
                                key={s}
                                style={{
                                  background: Number(q) > 0 ? "#181818" : "#2a1212",
                                  border: `1px solid ${Number(q) > 0 ? "#333" : "#552020"}`,
                                  color: Number(q) > 0 ? "#ccc" : "#f87171",
                                  padding: "1px 5px",
                                  borderRadius: "2px",
                                  fontWeight: "700"
                                }}
                              >
                                {s}:{q}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* ACTION */}

                    <td>

                      <div className="admin-actions">

                        {/* PENCIL / EDIT */}

                        <button
                          type="button"
                          className="admin-icon-btn admin-edit-icon"
                          onClick={() =>
                            startEdit(
                              product
                            )
                          }
                          title={`Edit ${product.name}`}
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil
                            size={18}
                            strokeWidth={
                              1.8
                            }
                          />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          className="admin-icon-btn admin-delete-icon"
                          onClick={() =>
                            remove(
                              product
                            )
                          }
                          title={`Delete ${product.name}`}
                          aria-label={`Delete ${product.name}`}
                        >
                          <Trash2
                            size={18}
                            strokeWidth={
                              1.8
                            }
                          />
                        </button>

                      </div>

                    </td>

                  </tr>
                );
              }
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
} function AdminSettings() { const [s, setS] = useState({ shippingFreeAbove: 0, shippingCharge: 0 }); useEffect(() => { api("/admin/settings").then(setS) }, []); return <div className="admin-settings"><h2>STORE SETTINGS</h2><label>Shipping Policy <input value="Free shipping on all orders (₹0 minimum)" disabled style={{ opacity: 0.8, cursor: "not-allowed" }} /></label><label>Standard shipping charge (₹) <input value={s.shippingCharge || "0"} onChange={e => setS({ ...s, shippingCharge: Number(e.target.value) || 0, shippingFreeAbove: 0 })} /></label><button className="btn primary" onClick={async () => { await api("/admin/settings", { method: "PUT", body: JSON.stringify({ ...s, shippingFreeAbove: 0, shippingCharge: 0 }) }); alert("Settings saved") }}>SAVE SETTINGS</button><p className="muted">Payment credentials, SMTP and WhatsApp credentials belong in the server .env file, not the browser.</p></div> }
function BrandIntro() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 3900);
    return () => window.clearTimeout(timer);
  }, []);
  if (!visible) return null;
  return (
    <div className="enytm-intro" role="status" aria-label="ENYTM introduction">
      <style>{`
        .enytm-intro{position:fixed;inset:0;z-index:2147483647;background:#080808;color:#f5f0e8;display:flex;align-items:center;justify-content:center;flex-direction:column;animation:enytmIntroOut .85s ease 3.05s forwards;overflow:hidden}
        .enytm-intro::before{content:"";position:absolute;width:min(54vw,380px);height:min(54vw,380px);border:1px solid rgba(245,240,232,.12);border-radius:50%;animation:enytmRing 2.8s ease-out both}
        .enytm-intro-logo{position:relative;font-family:Arial,Helvetica,sans-serif;font-size:clamp(30px,6.5vw,56px);font-weight:800;letter-spacing:.16em;margin-left:.16em;opacity:0;animation:enytmLogoIn .9s cubic-bezier(.2,.75,.25,1) .25s forwards}
        .enytm-intro-logo span{font-size:.22em;vertical-align:top;letter-spacing:0;margin-left:3px}
        .enytm-intro-line{width:0;height:1px;background:#c6b79a;margin:18px 0 14px;animation:enytmLineIn .8s ease 1s forwards}
        .enytm-intro-tag{font:9px/1.5 Arial,Helvetica,sans-serif;letter-spacing:.32em;margin-left:.32em;color:#c6b79a;opacity:0;animation:enytmTagIn .7s ease 1.2s forwards}
        @keyframes enytmLogoIn{from{opacity:0;transform:translateY(14px);filter:blur(6px)}to{opacity:1;transform:translateY(0);filter:blur(0)}}
        @keyframes enytmLineIn{to{width:64px}}
        @keyframes enytmTagIn{to{opacity:1}}
        @keyframes enytmRing{from{transform:scale(.8);opacity:0}40%{opacity:1}to{transform:scale(1.1);opacity:.35}}
        @keyframes enytmIntroOut{to{opacity:0;visibility:hidden;pointer-events:none}}
        @media(prefers-reduced-motion:reduce){.enytm-intro,.enytm-intro::before,.enytm-intro-logo,.enytm-intro-line,.enytm-intro-tag{animation-duration:.01ms!important;animation-delay:0ms!important}.enytm-intro{animation-delay:1.5s!important}}
      `}</style>
      <div className="enytm-intro-logo"><BrandLogo /></div>
      <div className="enytm-intro-line" />
      <p className="enytm-intro-tag">MORE THAN A MOMENT</p>
    </div>
  );
}


const enytmInventoryAndDeliveryStyles = `
          .product-stock-badge{position:absolute;z-index:3;top:12px;left:12px;padding:7px 9px;font-size:9px;letter-spacing:.12em;font-weight:800;background:#111;color:#fff}
          .product-stock-badge.low{background:#efe4cf;color:#241d12}.product-stock-badge.out{background:#eee;color:#555}
          .product-stock-message{font - size:11px;letter-spacing:.12em;font-weight:700;margin:10px 0 14px}.product-stock-message.low{color:#a77936}.product-stock-message.out{color:#a33}
          .quick-add:disabled,.add-detail:disabled{opacity:.5;cursor:not-allowed}
          .admin-delivery-editor{margin:20px 0}.admin-delivery-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:18px 0}.admin-delivery-form label{display:flex;flex-direction:column;gap:7px;font-size:10px;letter-spacing:.1em;font-weight:700}.admin-delivery-form input,.admin-delivery-form select{width:100%;min-width:0;padding:12px;border:1px solid #d7d2ca;background:#fff;color:#171717;font:inherit;letter-spacing:normal}.admin-delivery-editor .admin-save-message{margin - top:12px}.admin-delivery-editor button{margin - top:4px}
          @media(max-width:650px){.admin - delivery - form{grid - template - columns:1fr}}
          `;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <main className="empty" style={{ minHeight: "60vh", display: "grid", placeItems: "center", textAlign: "center", padding: "80px 20px" }}>
          <div>
            <p className="eyebrow">SOMETHING WENT WRONG</p>
            <h1 style={{ fontSize: "clamp(28px,4vw,48px)", margin: "15px 0" }}>PAGE COULD NOT LOAD</h1>
            <p style={{ color: "#888", maxWidth: 440, margin: "0 auto 25px" }}>{this.state.error?.message || "An unexpected error occurred while rendering this page."}</p>
            <a className="btn primary" href="/" onClick={() => this.setState({ hasError: false })}>RETURN HOME</a>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

function ScrollToTopOnRouteChange() { const route = useLocation(); useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); }, [route.pathname, route.search]); return null; }
function App() {
  const [search, setSearch] = useState(false);
  const route = useLocation();
  const immersive = route.pathname === "/launch";

  return (
    <>
      <style>{enytmInventoryAndDeliveryStyles}</style>
      <BrandIntro />
      <ScrollToTopOnRouteChange />
      {!immersive && !route.pathname.startsWith("/admin") && (
        <Navbar onSearch={() => setSearch(true)} />
      )}
      <ErrorBoundary key={route.pathname}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/collection" element={<Home />} />
          <Route path="/launch" element={<LaunchCountdown />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:id" element={<OrderDetails />} />
          <Route path="/order-success/:id" element={<OrderSuccess />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth register />} />
          <Route path="/account" element={<Account />} />
          <Route path="/orders" element={<Account />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/shipping-policy" element={<ShippingReturnsPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/track" element={<TrackOrderPage />} />
          <Route path="/size-guide" element={<SizeGuidePage />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </ErrorBoundary>
      {!immersive && !route.pathname.startsWith("/admin") && <Footer />}
      {search && <SearchOverlay close={() => setSearch(false)} />}
    </>
  );
}

export default App;
