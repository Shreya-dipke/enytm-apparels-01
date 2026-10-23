import React, {useEffect,useMemo,useRef,useState} from "react";
import {Link,Route,Routes,useLocation,useNavigate,useParams} from "react-router-dom";
import {
  ArrowRight,
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  ChevronDown,
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
  Check
} from "lucide-react";
import {useCart} from "./context/CartContext";
import {api} from "./api";
import {fallbackProducts} from "./data/products";
import "./index.css";

function useProducts(){
  const [p,setP]=useState(fallbackProducts);
  useEffect(()=>{
    api("/products")
      .then(data => {
        if (Array.isArray(data) && data.length) {
          setP(data);
        } else if (data && Array.isArray(data.products) && data.products.length) {
          setP(data.products);
        }
      })
      .catch(()=>{});
  },[]);
  return Array.isArray(p) && p.length ? p : fallbackProducts;
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
const TICKER_TRACK_ITEMS = Array.from({ length: 12 }, () => TICKER_ITEMS).flat();

function Navbar({onSearch}){const{cartCount,wishlist}=useCart();const[open,setOpen]=useState(false);const token=localStorage.getItem("enytm-token");const safeWishlist=Array.isArray(wishlist)?wishlist:[];return <><header className="nav"><button className="icon-btn mobile-menu" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button><Link className="logo" to="/" aria-label="ENYTM"><BrandLogo /></Link><nav className={open?"nav-links mobile-open":"nav-links"}><Link to="/shop" onClick={()=>setOpen(false)}>SHOP</Link><Link to="/shop?category=Oversized" onClick={()=>setOpen(false)}>OVERSIZED</Link><Link to="/shop?category=Polos" onClick={()=>setOpen(false)}>POLOS</Link><Link to="/shop?category=Hoodies" onClick={()=>setOpen(false)}>HOODIES</Link><Link to="/shop?category=Lowers" onClick={()=>setOpen(false)}>LOWERS</Link><Link to={token?"/orders":"/login"} onClick={()=>setOpen(false)}>ORDERS</Link><Link to="/about" onClick={()=>setOpen(false)}>ABOUT</Link></nav><div className="nav-actions"><button className="icon-btn" onClick={onSearch}><Search/></button><Link className="icon-btn badge-icon" to="/wishlist"><Heart/><b>{token?safeWishlist.length:0}</b></Link><Link className="icon-btn badge-icon" to="/cart"><ShoppingBag/>{token&&cartCount>0&&<b>{cartCount}</b>}</Link><Link className="icon-btn wallet-nav-link" aria-label="Wallet" title="Wallet" to={token?"/wallet":"/login"}><span className="wallet-nav-symbol" aria-hidden="true">₹</span></Link><Link className="icon-btn" aria-label="Orders" title="Orders" to={token?"/orders":"/login"}><User/></Link></div></header><div className="announcement" role="region" aria-label="Store Announcements"><div className="announcement-ticker-track">{TICKER_TRACK_ITEMS.map((item, idx) => (<span key={idx}>{item.highlight ? (<strong className="ticker-highlight">{item.text}</strong>) : (item.text)}<b className="ticker-star" aria-hidden="true">✳</b></span>))}</div></div></>}
function ProductCard({product}){
  if (!product) return null;
  const{addToCart,wishlist,toggleWishlist}=useCart();
  const safeWishlist=Array.isArray(wishlist)?wishlist:[];
  const liked=safeWishlist.includes(product.id);
  const[added,setAdded]=useState(false);
  const stock=Math.max(0,Number(product.stock||0));
  const outOfStock=stock<=0;
  const add=()=>{if(outOfStock)return;addToCart(product,"M");setAdded(true);setTimeout(()=>setAdded(false),1800)};
  const hasDiscount=Number(product.oldPrice)>Number(product.price);
  return <article className="product-card"><div className="product-image">{outOfStock?<span className="product-stock-badge out">OUT OF STOCK</span>:stock<6?<span className="product-stock-badge low">{stock===1?"ONLY 1 LEFT":`ONLY ${stock} LEFT`}</span>:null}{product.badge&&!outOfStock&&<span className="product-badge">{product.badge}</span>}<button className={`heart ${liked?"liked":""}`} onClick={()=>toggleWishlist(product.id)}><Heart fill={liked?"currentColor":"none"}/></button><Link to={`/product/${product.id}`}>
<img
  src={product.image || ""}
  alt={product.name}
  loading="lazy"
  onError={(e) => {
    const img = e.currentTarget;

    // Prevent repeated fallback attempts.
    if (img.dataset.fallbackApplied === "true") return;
    img.dataset.fallbackApplied = "true";

    const fallbackImages = {
      1: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85",
      3: "https://images.unsplash.com/photo-1625910513413-5fc45c2f9c3f?auto=format&fit=crop&w=1200&q=85",
    };

    img.src =
      fallbackImages[product.id] ||
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80";
  }}
/>
</Link><button className="quick-add" onClick={add} disabled={outOfStock}>{outOfStock?"OUT OF STOCK":added?<>ADDED TO BAG <CheckCircle size={15}/></>:<>QUICK ADD <Plus size={15}/></>}</button>{added&&<div className="added-toast"><CheckCircle size={16}/><span><b>Added to bag</b><small>{product.name}</small></span><Link to="/cart">VIEW BAG</Link></div>}</div><div className="product-info"><div><Link to={`/product/${product.id}`}><h3>{product.name}</h3></Link><p>{product.fabric}</p></div><div className="product-card-prices" style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:8,flexWrap:"wrap",whiteSpace:"nowrap"}}><strong>₹{Number(product.price).toLocaleString("en-IN")}</strong>{hasDiscount&&<del style={{color:"#a7a19a",fontSize:"0.9em",fontWeight:400}}>₹{Number(product.oldPrice).toLocaleString("en-IN")}</del>}{hasDiscount&&<span style={{fontSize:"10px",letterSpacing:".04em",color:"#c8b69a",fontWeight:700}}>{Math.round((Number(product.oldPrice)-Number(product.price))/Number(product.oldPrice)*100)}% OFF</span>}</div></div></article>}
function PrelaunchHome(){
  return <main className="enytm-prelaunch-home">
    <style>{`
      .enytm-prelaunch-home,.enytm-countdown-page{min-height:100svh;background:#080808;color:#f5f2ed;font-family:Arial,Helvetica,sans-serif;overflow:hidden}
      .prelaunch-top{position:absolute;z-index:2;top:0;left:0;right:0;padding:25px clamp(20px,5vw,76px);display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,.18)}
      .prelaunch-logo{font-size:clamp(22px,3vw,30px);font-weight:800;letter-spacing:.18em;color:#fff;text-decoration:none}.prelaunch-logo sup{font-size:10px;letter-spacing:0}
      .prelaunch-top-note{font-size:10px;letter-spacing:.22em;color:#d0c6b8;text-align:right}
      .prelaunch-hero{position:relative;min-height:100svh;display:flex;align-items:center;padding:120px clamp(24px,9vw,140px) 80px;background:linear-gradient(90deg,rgba(0,0,0,.84) 0%,rgba(0,0,0,.54) 48%,rgba(0,0,0,.15) 100%),linear-gradient(0deg,rgba(0,0,0,.45),transparent 55%),url('https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=2200&q=90') center 38%/cover no-repeat}
      .prelaunch-copy{max-width:760px;position:relative;z-index:1}.prelaunch-kicker{font-size:10px;letter-spacing:.3em;color:#d1bfa2;margin:0 0 24px}.prelaunch-title{font-size:clamp(54px,10.5vw,150px);line-height:.86;letter-spacing:-.075em;font-weight:800;margin:0;text-transform:uppercase}.prelaunch-title em{font-style:normal;color:#c8b69a}.prelaunch-description{max-width:410px;color:#dedbd5;line-height:1.8;font-size:clamp(14px,1.5vw,17px);margin:30px 0 32px}.prelaunch-explore{display:inline-flex;align-items:center;gap:28px;background:#f5f2ed;color:#080808;padding:19px 25px;text-decoration:none;font-size:11px;font-weight:800;letter-spacing:.18em;transition:background .2s,transform .2s}.prelaunch-explore:hover{background:#c8b69a;transform:translateY(-2px)}.prelaunch-bottom{position:absolute;bottom:24px;left:clamp(24px,5vw,76px);right:clamp(24px,5vw,76px);display:flex;justify-content:space-between;gap:20px;color:#c8c2b8;font-size:9px;letter-spacing:.2em}.prelaunch-bottom span:last-child{text-align:right}
      .enytm-countdown-page{display:flex;flex-direction:column;position:relative}.countdown-top{padding:25px clamp(20px,5vw,76px);display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,.14)}.countdown-main{flex:1;display:flex;align-items:center;justify-content:center;text-align:center;padding:70px 22px 90px;position:relative;background:radial-gradient(ellipse at 50% 30%,#25221d 0%,#111 40%,#080808 76%)}.countdown-inner{width:min(100%,900px)}.countdown-overline{font-size:10px;letter-spacing:.34em;color:#c8b69a;margin:0 0 24px}.countdown-title{font-size:clamp(42px,8vw,100px);letter-spacing:-.06em;line-height:.92;text-transform:uppercase;margin:0;font-weight:800}.countdown-title em{font-style:normal;color:#c8b69a}.countdown-subtitle{color:#c5c0b7;line-height:1.8;margin:25px auto 36px;max-width:520px;font-size:14px}.countdown-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(8px,2vw,18px);max-width:740px;margin:0 auto}.countdown-unit{border:1px solid rgba(200,182,154,.45);background:rgba(255,255,255,.025);padding:clamp(14px,3vw,30px) 5px}.countdown-number{font-variant-numeric:tabular-nums;font-size:clamp(30px,6.5vw,70px);font-weight:700;letter-spacing:-.05em;line-height:1}.countdown-label{margin-top:12px;color:#c8b69a;font-size:9px;letter-spacing:.22em;text-transform:uppercase}.countdown-launch-date{font-size:10px;letter-spacing:.22em;color:#a9a39a;margin:27px 0 0}.countdown-footer{padding:22px clamp(20px,5vw,76px);display:flex;justify-content:space-between;gap:15px;color:#9e988f;font-size:9px;letter-spacing:.2em;border-top:1px solid rgba(255,255,255,.12)}.countdown-back{color:#f5f2ed;text-decoration:none;font-size:10px;letter-spacing:.16em}.countdown-shop{display:inline-flex;margin-top:30px;padding:17px 24px;background:#f5f2ed;color:#080808;text-decoration:none;font-size:11px;letter-spacing:.16em;font-weight:800}
      @media(max-width:600px){.prelaunch-top-note{font-size:8px;max-width:125px;line-height:1.6}.prelaunch-hero{background-position:58% center;padding-top:140px;padding-bottom:110px}.prelaunch-title{font-size:clamp(53px,15vw,88px)}.prelaunch-bottom{font-size:8px;line-height:1.6}.countdown-grid{gap:6px}.countdown-unit{padding:18px 2px}.countdown-label{font-size:7px;letter-spacing:.12em}.countdown-footer{font-size:8px;line-height:1.6}.countdown-footer span:last-child{text-align:right}}
      @media(prefers-reduced-motion:reduce){.prelaunch-explore{transition:none}}
    `}</style>
    <header className="prelaunch-top"><Link className="prelaunch-logo" to="/" aria-label="ENYTM"><BrandLogo /></Link><span className="prelaunch-top-note">MORE THAN A MOMENT<br/>PUNE, INDIA · EST. 2026</span></header>
    <section className="prelaunch-hero"><div className="prelaunch-copy"><p className="prelaunch-kicker">A NEW EVERYDAY IS COMING · 001</p><h1 className="prelaunch-title">NOT JUST<br/>CLOTHING.<br/><em>A FEELING.</em></h1><p className="prelaunch-description">Considered fits. Better-feeling fabrics. An everyday uniform made to feel like you. Our first drop is almost here.</p><Link className="prelaunch-explore" to="/launch">EXPLORE THE DROP <ArrowRight size={18}/></Link></div><div className="prelaunch-bottom"><span>ENYTM APPARELS / FIRST DROP</span><span>THE COUNTDOWN STARTS HERE ↗</span></div></section><section className="home-faq" id="faq"><div className="home-faq-heading"><p className="eyebrow">06 / GOOD TO KNOW</p><h2>The useful<br/><em>details.</em></h2><p>Everything you need to know before making ENYTM part of your everyday.</p></div><div className="home-faq-list"><details><summary>What is the tee made from?<span aria-hidden="true">＋</span></summary><p>Each product listing includes its fabric and GSM details. Check the individual product page for the exact composition and specifications of the piece you choose.</p></details><details><summary>How should I care for it?<span aria-hidden="true">＋</span></summary><p>For best results, follow the care label on your garment. As a general guide, wash with similar colours, turn printed garments inside out, use a gentle cycle and avoid high heat when drying.</p></details><details><summary>Where do you ship?<span aria-hidden="true">＋</span></summary><p>We aim to deliver across serviceable locations in India. Enter your delivery pincode at checkout to confirm service availability.</p></details><details><summary>How do payments & pre-orders work?<span aria-hidden="true">＋</span></summary><p>You can choose between two convenient options at checkout: <b>Online Payment</b> (pay 100% upfront via UPI/Cards and receive an instant <b>extra 5% discount</b>) or <b>Cash on Delivery</b> (pay a 30% advance online today to confirm manufacturing, and pay the remaining 70% in cash/UPI upon delivery).</p></details><details><summary>When will my pre-order be dispatched?<span aria-hidden="true">＋</span></summary><p>Pre-orders are scheduled for dispatch after the 8 November 2026 launch. We’ll share tracking updates through the contact details provided at checkout.</p></details><div className="home-faq-footer"><span>STILL CURIOUS?</span><Link to="/about">GET TO KNOW US <ArrowRight size={15}/></Link></div></div></section>
  </main>
}
function LaunchCountdown(){
  const launchAt = new Date("2026-11-08T00:00:00+05:30").getTime();
  const calculate=()=>{const diff=Math.max(0,launchAt-Date.now());return {days:Math.floor(diff/86400000),hours:Math.floor((diff%86400000)/3600000),minutes:Math.floor((diff%3600000)/60000),seconds:Math.floor((diff%60000)/1000),live:diff===0}};
  const [time,setTime]=useState(calculate);
  useEffect(()=>{const timer=window.setInterval(()=>setTime(calculate()),1000);return()=>window.clearInterval(timer)},[]);
  const units=[["days","DAYS"],["hours","HOURS"],["minutes","MINUTES"],["seconds","SECONDS"]];
  const categories=[
    {number:"01",name:"OVERSIZED TEES",detail:"Relaxed by design",image:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",query:"Oversized%20Tees"},
    {number:"02",name:"PREMIUM POLOS",detail:"Everyday, refined",image:"https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85",query:"Premium%20Polos"},
    {number:"03",name:"OVERSIZED HOODIES",detail:"Comfort with presence",image:"https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85",query:"Oversized%20Hoodies"},
    {number:"04",name:"BAGGY LOWER",detail:"Move your way",image:"https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=85",query:"Baggy%20Lower"}
  ];
  return <main className="enytm-countdown-page"><style>{`.enytm-countdown-page a:focus-visible{outline:2px solid #c8b69a;outline-offset:5px}`}</style><header className="countdown-top"><Link className="prelaunch-logo" to="/" aria-label="ENYTM"><BrandLogo /></Link><Link className="countdown-back" to="/">← BACK TO INTRO</Link></header><section className="countdown-main"><div className="countdown-inner"><p className="countdown-overline">ENYTM APPARELS · DROP 001</p><h1 className="countdown-title">THE WAIT<br/>IS <em>ALMOST OVER.</em></h1><p className="countdown-subtitle">Your new everyday arrives 8 November 2026.</p>{time.live?<><p className="countdown-overline">WE ARE LIVE</p><Link className="countdown-shop" to="/shop">EXPLORE THE COLLECTION <ArrowRight size={16}/></Link></>:<><div className="countdown-grid" role="timer" aria-label="Countdown until ENYTM launch">{units.map(([key,label])=><div className="countdown-unit" key={key}><div className="countdown-number">{String(time[key]).padStart(2,"0")}</div><div className="countdown-label">{label}</div></div>)}</div><p className="countdown-launch-date">LAUNCHING · 08 NOVEMBER 2026 · 12:00 AM IST</p></>}</div></section>{!time.live&&<section className="countdown-preorder"><div className="countdown-offer-copy"><p className="countdown-overline">DROP 001 · PRE-LAUNCH OFFER</p><h2>YOUR FIRST ENYTM.<br/><em>RESERVE THE DROP.</em></h2><p>Reserve selected styles with 30% advance. Balance due online before dispatch.</p><div className="countdown-offer-points"><span>30% ADVANCE</span><span>70% BEFORE DISPATCH</span><span>NO COD</span></div><Link className="countdown-shop countdown-preorder-cta" to="/shop">SHOP THE PRE-LAUNCH OFFER <ArrowRight size={17}/></Link></div><div className="countdown-category-grid">{categories.map(category=><Link className="countdown-category-card" to={`/shop?category=${category.query}`} key={category.number}><div className="countdown-category-image"><img src={category.image} alt={category.name} loading="lazy"/><span className="countdown-category-number">{category.number}</span><span className="countdown-category-arrow">↗</span></div><div className="countdown-category-info"><div><strong>{category.name}</strong><span>{category.detail}</span></div><span className="countdown-category-link">EXPLORE</span></div></Link>)}</div></section>}<footer className="countdown-footer"><span>MORE THAN A MOMENT</span><span>ENYTM.CO.IN · DROP 001</span></footer></main>
}

function Home() {
  const products = useProducts();
  const [activeTab, setActiveTab] = useState("all");

  const categoryImages = {
    Oversized: products.find(p => p.category === "Oversized")?.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85",
    Polos: products.find(p => p.category === "Polos")?.image || "https://images.unsplash.com/photo-1625910513413-5fc45c2f9c3f?auto=format&fit=crop&w=1200&q=85",
    Hoodies: products.find(p => p.category === "Hoodies" || p.category === "Sweatshirts")?.image || "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=85",
    Lowers: products.find(p => p.category === "Lowers")?.image || "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=1200&q=85"
  };

  const collections = [
    { title: "OVERSIZED T-SHIRTS", desc: "240–260 GSM heavy combed cotton with relaxed drop-shoulders.", link: "/shop?category=Oversized", img: categoryImages.Oversized, num: "01" },
    { title: "POLOS", desc: "280 GSM textured organic piqué with minimal elevated branding.", link: "/shop?category=Polos", img: categoryImages.Polos, num: "02" },
    { title: "HOODIES & SWEATSHIRTS", desc: "360–380 GSM heavyweight French Terry built for structured warmth.", link: "/shop?category=Hoodies", img: categoryImages.Hoodies, num: "03" },
    { title: "HEAVYWEIGHT LOWERS", desc: "Architectural straight-leg French Terry pants with tailored drape.", link: "/shop?category=Lowers", img: categoryImages.Lowers, num: "04" }
  ];

  const filteredProducts = useMemo(() => {
    if (activeTab === "new") return products.filter(p => p.badge === "NEW" || p.id === 1 || p.id === 7);
    if (activeTab === "bestsellers") return products.filter(p => p.badge === "BESTSELLER" || p.badge === "SIGNATURE" || p.id === 2 || p.id === 3);
    if (activeTab === "heavyweight") return products.filter(p => (p.fabric && p.fabric.includes("French Terry")) || p.category === "Lowers" || p.category === "Hoodies");
    return products;
  }, [products, activeTab]);

  return (
    <main className="home-black-label home-v3">
      <section className="hero hero-v2">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=2200&q=90"
        >
          <source src="/enytm-hero.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay" />
        <div className="hero-edition">
          <span className="hero-edition-dot" /> ENYTM / THE BLACK LABEL <span>EST. 2026</span>
        </div>
        <div className="hero-content hero-content-v2">
          <p className="eyebrow hero-kicker">DROP 001 &nbsp;/&nbsp; EVERYDAY, ELEVATED</p>
          <div className="hero-tagline-badge">
            <span>“MORE THAN A MOMENT.”</span>
          </div>
          <h1>
            YOUR<br />
            EVERYDAY.<br />
            <em>REDEFINED.</em>
          </h1>
          <p className="hero-subline">
            Quiet confidence. Considered details. Heavyweight fabrics made to live in.
          </p>
          <div className="hero-cta-group">
            <Link className="btn primary hero-cta hero-cta-primary" to="/shop">
              SHOP NOW <ArrowRight size={18} />
            </Link>
            <a className="btn outline hero-cta hero-cta-secondary" href="#collections">
              EXPLORE COLLECTIONS
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

      <div className="blackline-marquee" aria-label="ENYTM brand statement">
        <div className="blackline-marquee-track">
          <span>MORE THAN A MOMENT</span><b>✳</b>
          <span>FABRIC FIRST</span><b>✳</b>
          <span>EVERYDAY, ELEVATED</span><b>✳</b>
          <span>EXTRA 10% OFF PREPAID</span><b>✳</b>
          <span>MORE THAN A MOMENT</span><b>✳</b>
          <span>FREE SHIPPING ON ALL ORDERS</span><b>✳</b>
          <span>EVERYDAY, ELEVATED</span><b>✳</b>
        </div>
      </div>

      <section className="manifesto manifesto-black-label manifesto-v2">
        <div className="manifesto-number"><BrandLogo style={{ height: 14 }} /> — 001</div>
        <p className="eyebrow">01 / A DIFFERENT KIND OF ESSENTIAL</p>
        <h2>
          NOT MADE<br />
          TO <span>STAND OUT.</span><br />
          MADE TO <em>STAY.</em>
        </h2>
        <div className="manifesto-bottom">
          <p>
            Considered fits. Better-feeling heavyweight fabrics. Pieces that earn their place in your everyday rotation without screaming for attention.
          </p>
          <div className="manifesto-signature">
            <BrandLogo /> <span>MORE THAN A MOMENT</span>
          </div>
        </div>
      </section>

      <section className="craft-strip craft-strip-v2" aria-label="Our design principles">
        <div>
          <span>01 / MATERIAL</span>
          <h3>FEEL THE WEIGHT.</h3>
          <p>240–380 GSM luxury combed cotton & French Terry.</p>
        </div>
        <div>
          <span>02 / SILHOUETTE</span>
          <h3>MOVE YOUR WAY.</h3>
          <p>Relaxed streetwear proportions, balanced drop shoulders.</p>
        </div>
        <div>
          <span>03 / LONGEVITY</span>
          <h3>WEAR IT OFTEN.</h3>
          <p>Made for repeat days, not one-off moments.</p>
        </div>
      </section>

      {/* Featured Collections: Oversized, Polos, Hoodies, Lowers */}
      <section className="category-editorial category-editorial-v2" id="collections">
        <div className="category-editorial-head">
          <div>
            <p className="eyebrow">02 / CORE SILHOUETTES</p>
            <h2>
              CURATED<br />
              <span>COLLECTIONS.</span>
            </h2>
          </div>
          <p>
            Four foundational cuts.<br />
            Engineered for modern movement.
          </p>
        </div>
        <div className="categories categories-four-col">
          {collections.map(c => (
            <Link key={c.title} to={c.link} className="category-tile category-tile-v2">
              <img src={c.img} alt={c.title} loading="lazy" />
              <div>
                <span>{c.num} / SILHOUETTE</span>
                <h3>{c.title}</h3>
                <p className="cat-desc-preview">{c.desc}</p>
                <div className="cat-explore-link">
                  EXPLORE <ArrowRight size={15} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* The Current Rotation with Tab Switcher */}
      <section className="section home-arrivals home-arrivals-v2" id="rotation">
        <div className="drop-heading">
          <div>
            <p className="eyebrow">03 / THE CURRENT ROTATION</p>
            <h2>
              THE DROP<span className="heading-period"> 001.</span>
            </h2>
            <p className="drop-subtitle">A small edit. A strong point of view.</p>
          </div>
          <div className="drop-tabs-nav">
            <button
              className={`drop-tab-btn ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              ALL PIECES
            </button>
            <button
              className={`drop-tab-btn ${activeTab === "new" ? "active" : ""}`}
              onClick={() => setActiveTab("new")}
            >
              NEW ARRIVALS
            </button>
            <button
              className={`drop-tab-btn ${activeTab === "bestsellers" ? "active" : ""}`}
              onClick={() => setActiveTab("bestsellers")}
            >
              BEST SELLERS
            </button>
            <button
              className={`drop-tab-btn ${activeTab === "heavyweight" ? "active" : ""}`}
              onClick={() => setActiveTab("heavyweight")}
            >
              HEAVYWEIGHT
            </button>
          </div>
        </div>

        <div className="product-grid">
          {filteredProducts.slice(0, 8).map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <div className="arrivals-footnote">
          <span>DESIGNED FOR YOUR EVERYDAY</span>
          <Link to="/shop" className="arrivals-view-all-link">
            VIEW FULL CATALOG ({products.length} PIECES) <ArrowRight size={14} />
          </Link>
          <span>ENYTM / 001</span>
        </div>
      </section>

      <section className="feature-editorial-v2">
        <div className="feature-editorial-image">
          <img src="/enytm-hero.jpg" alt="ENYTM streetwear editorial" />
          <span className="image-index">FIG. 01 — THE EVERYDAY UNIFORM</span>
          <span className="image-vertical-label">FABRIC / FORM / FUNCTION</span>
        </div>
        <div className="feature-editorial-copy">
          <p className="eyebrow">04 / THE ENYTM APPROACH</p>
          <span className="feature-big-number">01</span>
          <h2>
            LESS,<br />
            <em>BETTER.</em>
          </h2>
          <p>
            We start with the fabric. Refine the fit. Strip away what doesn't belong. The result is an everyday uniform that speaks through texture, cut, and weight.
          </p>
          <Link className="btn outline" to="/about">
            GET TO KNOW ENYTM <ArrowRight size={18} />
          </Link>
          <div className="feature-specs">
            <span><b>01</b> FABRIC FIRST</span>
            <span><b>02</b> THOUGHTFUL FIT</span>
            <span><b>03</b> CLEAN FINISH</span>
          </div>
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
function Shop(){
 const products=useProducts();
 const location=useLocation();
 const params=new URLSearchParams(location.search);
 const requested=params.get("category")||"All";
 const [sort,setSort]=useState("featured");
 const [category,setCategory]=useState(requested);
 const resultsRef=useRef(null);
 useEffect(()=>{
  setCategory(requested);
  if(location.search){
   window.requestAnimationFrame(()=>resultsRef.current?.scrollIntoView({behavior:"smooth",block:"start"}));
  }
 },[requested,location.search]);
 const categoryKey=(value)=>{
  const s=String(value||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
  if(!s||s==="all")return "all";
  if(s.includes("oversized")||s.includes("oversize")||s==="tee"||s.includes("t shirt")||s.includes("tshirt"))return "oversized";
  if(s.includes("polo"))return "polos";
  if(s.includes("hoodie")||s.includes("hooded"))return "hoodies";
  if(s.includes("baggy")||s.includes("lower")||s.includes("trouser")||s.includes("pant"))return "baggy";
  return s;
 };
 const categoryTitle=category==="All"?"SHOP ALL":category==="Oversized"||categoryKey(category)==="oversized"?"OVERSIZED TEES":categoryKey(category)==="polos"?"PREMIUM POLOS":categoryKey(category)==="hoodies"?"OVERSIZED HOODIES":categoryKey(category)==="baggy"?"BAGGY LOWER":"SHOP ALL";
 const shown=useMemo(()=>{
  let list=categoryKey(category)==="all"?[...products]:products.filter(p=>categoryKey(p.category)===categoryKey(category));
  if(sort==="low")list.sort((x,y)=>Number(x.price)-Number(y.price));
  if(sort==="high")list.sort((x,y)=>Number(y.price)-Number(x.price));
  return list;
 },[products,category,sort]);
 const choices=[["All","ALL"],["Oversized","OVERSIZED TEES"],["Polos","PREMIUM POLOS"],["Hoodies","HOODIES"],["Baggy Lower","BAGGY LOWER"]];
 return <main className="shop-page shop-page-v2">
  <section className="shop-intro-v2">
   <div className="shop-intro-kicker"><span className="shop-live-dot"/> ENYTM APPARELS <span>DROP 001 / EVERYDAY, ELEVATED</span></div>
   <p className="eyebrow">THE ENYTM EDIT</p>
   <h1>{categoryTitle.split(" ").map((word,i)=><React.Fragment key={word}>{i>0&&" "}{word}</React.Fragment>)}</h1>
   <p className="shop-intro-copy">{categoryKey(category)==="all"?"Considered fits. Better-feeling fabrics. Find the pieces you'll live in.":`A closer look at ${categoryTitle.toLowerCase()}. Thoughtful fits, made for everyday.`}</p>
   <div className="shop-intro-bottom"><span>MORE THAN A MOMENT™</span><span>{String(shown.length).padStart(2,"0")} {shown.length===1?"STYLE":"STYLES"} {categoryKey(category)!=="all"?"IN THIS EDIT":"IN THE COLLECTION"}</span></div>
  </section>
  <section className="shop-toolbar-v2">
   <div className="shop-filter-head"><span>FIND YOUR FIT</span><span>01 — 06 / CATEGORIES</span></div>
   <div className="shop-chips-v2">{choices.map(([value,label])=><Link key={value} to={value==="All"?"/shop":`/shop?category=${encodeURIComponent(value)}`} className={`shop-chip-v2 ${categoryKey(category)===categoryKey(value)?"active":""}`}>{label}<ArrowRight size={13}/></Link>)}</div>
   <label className="shop-sort-v2"><span>SORT BY</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option></select><ChevronDown size={15}/></label>
  </section>
  <section className="shop-results-v2" ref={resultsRef}>
   <div className="shop-results-heading"><p className="eyebrow">CURATED FOR EVERYDAY</p><span>{shown.length} {shown.length===1?"PIECE":"PIECES"}</span></div>
   {shown.length?<div className="product-grid shop-grid shop-grid-v2">{shown.map(p=><ProductCard key={p.id} product={p}/>)}</div>:<div className="shop-empty-v2"><span>COMING INTO FOCUS</span><h2>THIS EDIT IS<br/><em>ON ITS WAY.</em></h2><p>We're preparing this category for the ENYTM collection. Explore the available pieces in the meantime.</p><Link className="shop-empty-link" to="/shop">VIEW ALL PIECES <ArrowRight size={16}/></Link></div>}
  </section>
 </main>
}

function ProductPage(){
  const products = useProducts();
  const params = useParams();
  const location = useLocation();
  const nav = useNavigate();
  const rawId = params?.id ?? location.pathname.split("/").filter(Boolean).pop();
  const productList = Array.isArray(products) && products.length ? products : fallbackProducts;
  const product = productList.find(p => String(p.id) === String(rawId)) || productList[0] || fallbackProducts[0];
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
  const stock = Math.max(0, Number(product?.stock || 0));
  const outOfStock = stock <= 0;
  const videoRef = useRef(null);

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
    const otherProducts = productList.filter((p) => String(p.id) !== String(product.id));
    const sameCategory = otherProducts.filter(
      (p) => p.category && product.category && String(p.category).toLowerCase() === String(product.category).toLowerCase()
    );
    const differentCategory = otherProducts.filter(
      (p) => !p.category || !product.category || String(p.category).toLowerCase() !== String(product.category).toLowerCase()
    );
    return [...sameCategory, ...differentCategory].slice(0, 4);
  }, [productList, product]);

  if (!product) {
    return (
      <main className="product-page" style={{padding:"120px 4vw",textAlign:"center"}}>
        <p className="eyebrow">ENYTM / APPARELS</p>
        <h1>PRODUCT NOT FOUND</h1>
        <p style={{color:"#888",margin:"20px 0 30px"}}>The piece you're looking for is unavailable.</p>
        <Link className="btn primary" to="/shop">VIEW ALL PIECES</Link>
      </main>
    );
  }

  const fallbackImg = "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80";

  const gallery = [
    product.image && { type: "image", src: product.image, label: "01 / FRONT" },
    (product.image2 || product.image) && { type: "image", src: product.image2 || product.image, label: "02 / BACK" },
    (product.image3 || "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1200&q=85") && { type: "image", src: product.image3 || "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1200&q=85", label: "03 / CLOSE-UP" },
    (product.modelFront || "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=1200&q=85") && { type: "image", src: product.modelFront || "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=1200&q=85", label: "04 / LIFESTYLE" },
    product.video && { type: "video", src: product.video, poster: product.image || fallbackImg, label: "05 / MOTION" }
  ].filter(Boolean);

  const safeGallery = gallery.length ? gallery : [{ type: "image", src: product.image || fallbackImg, label: "01 / FRONT" }];
  const activeMedia = safeGallery[Math.min(active, safeGallery.length - 1)] || safeGallery[0];

  const add = () => {
    if (outOfStock) return;
    if (qty > stock) { setQty(stock); return; }
    for (let i = 0; i < qty; i++) addToCart(product, size);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const buyNow = () => {
    if (outOfStock) return;
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
      <section className="product-gallery-wrap">
        <div className="gallery-toolbar">
          <span>ENYTM / PRODUCT 0{product.id}</span>
          <span>{safeGallery.length} VIEWS · ZOOM ENABLED</span>
        </div>
        <div className="product-gallery-shell">
          <div className="product-main-media">
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
                <img
                  src={activeMedia?.src || fallbackImg}
                  alt={`${product.name} ${activeMedia?.label || ""}`}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = fallbackImg;
                  }}
                />
                <button className="zoom-trigger-btn" aria-label="Zoom image" title="Click to zoom">
                  <ZoomIn size={16} /> ZOOM
                </button>
              </div>
            )}
            <span className="main-media-label">{activeMedia?.label}</span>
          </div>
          <div className="product-thumbs">
            {safeGallery.map((item, i) => (
              <button
                key={`${item.label}-${i}`}
                className={`product-thumb ${active === i ? "active" : ""}`}
                onClick={() => setActive(i)}
                aria-label={`View ${item.label}`}
              >
                {item.type === "video" ? (
                  <>
                    <video muted playsInline preload="metadata" poster={item.poster}>
                      <source src={item.src} type="video/mp4" />
                    </video>
                    <span className="thumb-play">
                      <Play size={15} fill="currentColor" />
                    </span>
                  </>
                ) : (
                  <img
                    src={item.src || fallbackImg}
                    alt={`${product.name} ${item.label}`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = fallbackImg;
                    }}
                  />
                )}
                <span>{item.label}</span>
              </button>
            ))}
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

        <p className={`product-stock-message ${outOfStock ? "out" : stock < 6 ? "low" : "in"}`}>
          {outOfStock
            ? "OUT OF STOCK — THIS ITEM IS CURRENTLY UNAVAILABLE."
            : stock < 6
            ? `HURRY — ONLY ${stock} LEFT IN STOCK.`
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

        <p className="detail-copy">
          {product.description || "Designed with an architectural oversized silhouette, clean drop shoulder drape and heavyweight hand-feel for effortless daily wear."}
        </p>

        <div className="detail-highlights">
          <span className="gsm-box">{product.fabric?.match(/\d+\s*GSM/i)?.[0] || "240+ GSM"}</span>
          {isOversized && (
            <>
              <span className="wash-box">SILICON WASH</span>
              <span className="wash-box">BIO WASH</span>
              <span className="wash-box gold-box">GOLD FINISH</span>
            </>
          )}
          <span>100% COMBED COTTON</span>
          <span>OVERSIZED FIT</span>
          <span>DROP SHOULDER</span>
        </div>

        {isOversized && (
          <div className="oversized-wash-row">
            <div className="wash-box-card">
              <span className="wash-box-tag">TREATMENT 01</span>
              <strong className="wash-box-title">SILICON WASH</strong>
              <small className="wash-box-desc">Ultra-soft silky handfeel</small>
            </div>
            <div className="wash-box-card">
              <span className="wash-box-tag">TREATMENT 02</span>
              <strong className="wash-box-title">BIO WASH</strong>
              <small className="wash-box-desc">Enzyme-treated anti-pilling</small>
            </div>
            <div className="wash-box-card gold-finish">
              <span className="wash-box-tag">FINISH 03</span>
              <strong className="wash-box-title">GOLD FINISH</strong>
              <small className="wash-box-desc">Lustrous premium sheen</small>
            </div>
          </div>
        )}

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
            {sizes.map((s) => (
              <button key={s} className={size === s ? "selected" : ""} onClick={() => setSize(s)}>
                {s}
              </button>
            ))}
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
                disabled={outOfStock || qty <= 1}
              >
                <Minus size={15} />
              </button>
              <strong>{qty}</strong>
              <button
                type="button"
                onClick={() => setQty(Math.min(stock, qty + 1))}
                aria-label="Increase quantity"
                disabled={outOfStock || qty >= stock}
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          <div className="purchase-dual-buttons">
            <button className="btn outline add-detail" onClick={add} disabled={outOfStock}>
              {outOfStock ? (
                <>OUT OF STOCK</>
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
            <button className="btn primary buy-now-btn" onClick={buyNow} disabled={outOfStock}>
              {outOfStock ? "UNAVAILABLE" : <>BUY NOW <ArrowRight size={18} /></>}
            </button>
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
          <details open>
            <summary>
              <span className="acc-title">PRODUCT DETAILS</span>
              <ChevronDown size={16} className="acc-chevron" />
            </summary>
            <div className="acc-content">
              <p>{product.description || "Crafted for comfort and daily wear with an architectural cut and clean finishes."}</p>
              <div className="acc-specs-grid">
                <div><span>FABRIC</span><b>{product.fabric || "Premium Combed Cotton"}</b></div>
                <div><span>WEIGHT / GSM</span><b>{product.fabric?.match(/\d+\s*GSM/i)?.[0] || "240–380 GSM Heavyweight"}</b></div>
                {isOversized && (
                  <div><span>FINISH & WASH</span><b>SILICON WASH · BIO WASH · GOLD FINISH</b></div>
                )}
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
                <div className="damaged-header"><AlertCircle size={15}/> <b>DAMAGED, DEFECTIVE, OR INCORRECT ITEMS</b></div>
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
          {recommendations.map((item) => (
            <ProductCard key={item.id} product={item} />
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

function Auth({register=false}){
 const nav=useNavigate();
 const[form,setForm]=useState({name:"",email:"",phone:"",password:"",whatsappOptIn:false,emailOptIn:true});
 const[otp,setOtp]=useState({email:""});
 const[challengeId,setChallengeId]=useState("");
 const[step,setStep]=useState(register?"details":"login");
 const[error,setError]=useState("");
 const[sending,setSending]=useState(false);
 const[seconds,setSeconds]=useState(0);
 const[showPassword,setShowPassword]=useState(false);
 const[forgotMode,setForgotMode]=useState(false);
 const[forgotStep,setForgotStep]=useState("email");
 const[forgotChallengeId,setForgotChallengeId]=useState("");
 const[forgotOtp,setForgotOtp]=useState("");
 const[newPassword,setNewPassword]=useState("");
 const[showNewPassword,setShowNewPassword]=useState(false);
 const[forgotMessage,setForgotMessage]=useState("");

 useEffect(()=>{
  setStep(register?"details":"login");
  setError("");
  setSending(false);
  setSeconds(0);
  setForgotMode(false);
  setForgotStep("email");
  setForgotMessage("");
 },[register]);

 useEffect(()=>{
  if(!seconds)return;
  const t=setInterval(()=>setSeconds(v=>v-1),1000);
  return()=>clearInterval(t);
 },[seconds]);

 const update=(key,value)=>setForm(f=>({...f,[key]:value}));

 const sendOtp=async e=>{
  e.preventDefault();
  setError("");
  setSending(true);
  try{
   const data=await api("/auth/register/send-otp",{method:"POST",body:JSON.stringify(form)});
   setChallengeId(data.challengeId);
   setStep("otp");
   setSeconds(60);
  }catch(err){
   setError(err.message||"Could not send OTP.");
  }finally{
   setSending(false);
  }
 };

 const verifyAndCreate=async e=>{
  e.preventDefault();
  setError("");
  setSending(true);
  try{
   const data=await api("/auth/register/verify-otp",{method:"POST",body:JSON.stringify({emailOtp:otp.email,challengeId,whatsappOptIn:form.whatsappOptIn,emailOptIn:form.emailOptIn})});
   localStorage.setItem("enytm-token",data.token);
   localStorage.setItem("enytm-user",JSON.stringify(data.user));
   const redirect=sessionStorage.getItem("enytm-after-login")||"/";
   sessionStorage.removeItem("enytm-after-login");
   nav(redirect);
  }catch(err){
   setError(err.message||"Verification failed.");
  }finally{
   setSending(false);
  }
 };

 const sendForgotOtp=async e=>{
  e.preventDefault();
  setError("");
  setForgotMessage("");
  setSending(true);
  try{
   const targetEmail=String(form.email||"").trim().toLowerCase();
   if(!targetEmail)throw new Error("Please enter your email address.");
   const data=await api("/auth/password-reset/send-otp",{method:"POST",body:JSON.stringify({email:targetEmail})});
   setForgotChallengeId(data.challengeId||"");
   setForgotStep("confirm");
   setSeconds(60);
   setForgotMessage(data.message||"Reset code sent to your email.");
  }catch(err){
   setError(err.message||"Could not request password reset.");
  }finally{
   setSending(false);
  }
 };

 const confirmPasswordReset=async e=>{
  e.preventDefault();
  setError("");
  setSending(true);
  try{
   if(newPassword.length<8)throw new Error("Password must be at least 8 characters long.");
   const data=await api("/auth/password-reset/confirm",{method:"POST",body:JSON.stringify({challengeId:forgotChallengeId,otp:forgotOtp.trim(),password:newPassword})});
   setForgotMessage(data?.message||"Password updated successfully!");
   setForgotStep("done");
  }catch(err){
   setError(err.message||"Failed to reset password. Please check the code.");
  }finally{
   setSending(false);
  }
 };

 const login=async e=>{
  e.preventDefault();
  setError("");
  setSending(true);
  try{
   const data=await api("/auth/login",{method:"POST",body:JSON.stringify({email:String(form.email).trim().toLowerCase(),password:form.password})});
   if(!data?.token)throw new Error("Login succeeded but no session token was returned.");
   localStorage.setItem("enytm-token",data.token);
   localStorage.setItem("enytm-user",JSON.stringify(data.user||{}));
   const redirect=sessionStorage.getItem("enytm-after-login")||"/";
   sessionStorage.removeItem("enytm-after-login");
   nav(redirect,{replace:true});
  }catch(err){
   setError(err.message||"Login failed. Please try again.");
  }finally{
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

    {register && step !== "otp" && (
     <form className="auth-form" onSubmit={sendOtp}>
      <input className="auth-input" required autoComplete="name" placeholder="Full name" value={form.name} onChange={e=>update("name",e.target.value)}/>
      <input className="auth-input" required type="email" inputMode="email" autoComplete="email" placeholder="Email address" value={form.email} onChange={e=>update("email",e.target.value)}/>
      <input className="auth-input" required inputMode="tel" autoComplete="tel" placeholder="Mobile number" value={form.phone} onChange={e=>update("phone",e.target.value.replace(/\D/g,"").slice(-10))}/>
      <div className="password-field auth-password-field">
       <input className="auth-input" required minLength="6" type={showPassword?"text":"password"} autoComplete="new-password" placeholder="Password (min 6 chars)" value={form.password} onChange={e=>update("password",e.target.value)}/>
       <button type="button" className="auth-password-toggle" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?"Hide password":"Show password"} title={showPassword?"Hide password":"Show password"}>
        {showPassword?<EyeOff size={19}/>:<Eye size={19}/>}
       </button>
      </div>
      <label className="check auth-check">
       <input type="checkbox" checked={form.whatsappOptIn} onChange={e=>update("whatsappOptIn",e.target.checked)}/>
       <span>Receive order updates on WhatsApp.</span>
      </label>
      <label className="check auth-check">
       <input type="checkbox" checked={form.emailOptIn} onChange={e=>update("emailOptIn",e.target.checked)}/>
       <span>Receive useful ENYTM email updates.</span>
      </label>
      <button disabled={sending} className="btn primary full auth-submit-btn">
       {sending?"SENDING OTP...":"CONTINUE WITH OTP"} <ArrowRight size={17}/>
      </button>
     </form>
    )}

    {register && step === "otp" && (
     <form className="auth-form" onSubmit={verifyAndCreate}>
      <div className="otp-note">Enter the 6-digit code sent to your email. Your account will be created after the code is verified.</div>
      <input className="auth-input auth-otp-input" required inputMode="numeric" maxLength="6" pattern="[0-9]{6}" placeholder="Email OTP — 6 digits" value={otp.email} onChange={e=>setOtp(o=>({...o,email:e.target.value.replace(/\D/g,"").slice(0,6)}))}/>
      <button disabled={sending} className="btn primary full auth-submit-btn">
       {sending?"VERIFYING...":"VERIFY & CREATE ACCOUNT"} <CheckCircle size={17}/>
      </button>
      <button type="button" disabled={sending||seconds>0} className="btn outline full auth-secondary-btn" onClick={sendOtp}>
       {seconds?`RESEND OTP IN ${seconds}s`:"RESEND OTP"}
      </button>
      <button type="button" className="text-link" onClick={()=>{setStep("details");setError("")}}>
       ← Change email or mobile number
      </button>
     </form>
    )}

    {!register && !forgotMode && (
     <form className="auth-form" onSubmit={login}>
      <input className="auth-input" required type="email" inputMode="email" autoComplete="email" placeholder="Email address" value={form.email} onChange={e=>update("email",e.target.value)}/>
      <div className="password-field auth-password-field">
       <input className="auth-input" required minLength="6" type={showPassword?"text":"password"} autoComplete="current-password" placeholder="Password" value={form.password} onChange={e=>update("password",e.target.value)}/>
       <button type="button" className="auth-password-toggle" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?"Hide password":"Show password"} title={showPassword?"Hide password":"Show password"}>
        {showPassword?<EyeOff size={19}/>:<Eye size={19}/>}
       </button>
      </div>
      <div className="auth-forgot-row">
       <button type="button" className="text-link" onClick={()=>{setForgotMode(true);setForgotStep("email");setError("");setForgotMessage("")}}>
        Forgot password?
       </button>
      </div>
      <button disabled={sending} className="btn primary full auth-submit-btn">
       {sending?"LOGGING IN...":"LOGIN"} <ArrowRight size={17}/>
      </button>
     </form>
    )}

    {!register && forgotMode && forgotStep === "email" && (
     <form className="auth-form" onSubmit={sendForgotOtp}>
      <input className="auth-input" required type="email" inputMode="email" autoComplete="email" placeholder="Registered email address" value={form.email} onChange={e=>update("email",e.target.value)}/>
      <button disabled={sending} className="btn primary full auth-submit-btn">
       {sending?"SENDING CODE...":"SEND RESET CODE"} <ArrowRight size={17}/>
      </button>
      <button type="button" className="text-link" onClick={()=>{setForgotMode(false);setForgotStep("email");setError("");setForgotMessage("")}}>
       ← Back to login
      </button>
     </form>
    )}

    {!register && forgotMode && forgotStep === "confirm" && (
     <form className="auth-form" onSubmit={confirmPasswordReset}>
      {forgotMessage && <div className="lookup-message success">{forgotMessage}</div>}
      <input className="auth-input auth-otp-input" required inputMode="numeric" maxLength="6" pattern="[0-9]{6}" placeholder="Reset code — 6 digits" value={forgotOtp} onChange={e=>setForgotOtp(e.target.value.replace(/\D/g,"").slice(0,6))}/>
      <div className="password-field auth-password-field">
       <input className="auth-input" required minLength="8" type={showNewPassword?"text":"password"} autoComplete="new-password" placeholder="New password (min 8 chars)" value={newPassword} onChange={e=>setNewPassword(e.target.value)}/>
       <button type="button" className="auth-password-toggle" onClick={()=>setShowNewPassword(v=>!v)} aria-label={showNewPassword?"Hide password":"Show password"} title={showNewPassword?"Hide password":"Show password"}>
        {showNewPassword?<EyeOff size={19}/>:<Eye size={19}/>}
       </button>
      </div>
      <button disabled={sending} className="btn primary full auth-submit-btn">
       {sending?"UPDATING...":"UPDATE PASSWORD"} <CheckCircle size={17}/>
      </button>
      <button type="button" disabled={sending||seconds>0} className="btn outline full auth-secondary-btn" onClick={sendForgotOtp}>
       {seconds?`RESEND CODE IN ${seconds}s`:"RESEND CODE"}
      </button>
      <button type="button" className="text-link" onClick={()=>{setForgotMode(false);setForgotStep("email");setError("");setForgotMessage("")}}>
       ← Back to login
      </button>
     </form>
    )}

    {!register && forgotMode && forgotStep === "done" && (
     <div className="auth-form">
      <div className="lookup-message success">{forgotMessage||"Password updated successfully!"}</div>
      <button type="button" className="btn primary full auth-submit-btn" onClick={()=>{setForgotMode(false);setForgotStep("email");setError("");setForgotMessage("")}}>
       CONTINUE TO LOGIN <ArrowRight size={17}/>
      </button>
     </div>
    )}

    {register ? (
     <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
    ) : (
     <p className="auth-switch">New to ENYTM? <Link to="/register">Create an account</Link></p>
    )}
   </div>
  </main>
 );
}

function AddressLookupFields({form,setForm,setError,compact=false}){
 const[cityOptions,setCityOptions]=useState([]);
 const[lookupBusy,setLookupBusy]=useState(false);
 const[pincodeBusy,setPincodeBusy]=useState(false);
 const[lookupMessage,setLookupMessage]=useState("");
 const cityTimer=useRef(null);
 const update=(key,value)=>setForm(f=>({...f,[key]:value}));
 const lookupPincode=async value=>{
  const pin=String(value||"").replace(/\D/g,"").slice(0,6);
  update("pincode",pin); setLookupMessage("");
  if(pin.length!==6)return;
  setPincodeBusy(true);
  try{
   const d=await api(`/pincode/${pin}`);
   if(!d.valid)throw new Error(d.message||"Pincode not found. Enter the city and choose a PIN.");
   setForm(f=>({...f,pincode:pin,city:d.city||d.district||f.city,state:d.state||f.state,district:d.district||"",postOffice:d.postOffice||""}));
   setLookupMessage(`✓ ${d.city||d.district||"Location found"}${d.state?`, ${d.state}`:""}`);
  }catch(e){setLookupMessage(e.message||"Could not find this pincode. You can enter city/state manually.");}
  finally{setPincodeBusy(false);}
 };
 const lookupCity=async()=>{
  const city=String(form.city||"").trim();
  if(city.length<2){setLookupMessage("Enter a city name first.");return;}
  setLookupBusy(true);setLookupMessage("");
  try{
   const d=await api(`/pincode/city/${encodeURIComponent(city)}`);
   const list=Array.isArray(d.pincodes)?d.pincodes:[];
   setCityOptions(list);
   if(list.length===1){await lookupPincode(list[0].pincode);}
   else if(list.length>1){setLookupMessage(`${list.length} PIN codes found. Choose your locality below.`);}
   else setLookupMessage("No PIN codes found. Check the city spelling or enter your PIN code manually.");
  }catch(e){setLookupMessage(e.message||"PIN lookup is temporarily unavailable. Try again in a moment.");}
  finally{setLookupBusy(false);}
 };
 useEffect(()=>()=>{if(cityTimer.current)clearTimeout(cityTimer.current)},[]);
 return <>
  <input required placeholder="Full name" value={form.name||""} onChange={e=>update("name",e.target.value)}/>
  <input required inputMode="tel" placeholder="Phone" value={form.phone||""} onChange={e=>update("phone",e.target.value.replace(/\D/g,"").slice(-10))}/>
  <input required className="wide" placeholder="Flat / House / Street / Area" value={form.address||""} onChange={e=>update("address",e.target.value)}/>
  <div className="address-city-row">
   <input required placeholder="City" value={form.city||""} onChange={e=>{update("city",e.target.value);setCityOptions([]);setLookupMessage("");if(cityTimer.current)clearTimeout(cityTimer.current);const val=e.target.value;if(val.trim().length>=3)cityTimer.current=setTimeout(()=>lookupCity(),650)}} onBlur={()=>{if(String(form.city||"").trim().length>=2)lookupCity()}}/>
   <button type="button" className="address-mini-btn" onClick={lookupCity} disabled={lookupBusy}>{lookupBusy?"SEARCHING...":"FIND PINCODE"}</button>
  </div>
  {cityOptions.length>1&&<select className="wide address-select" value={form.pincode||""} onChange={e=>lookupPincode(e.target.value)}><option value="">SELECT PINCODE FOR {String(form.city||"").toUpperCase()}</option>{cityOptions.map((x,i)=><option key={`${x.pincode}-${i}`} value={x.pincode}>{x.pincode}{x.postOffice?` — ${x.postOffice}`:""}{x.district?` · ${x.district}`:""}</option>)}</select>}
  <input required placeholder="State" value={form.state||""} onChange={e=>update("state",e.target.value)}/>
  <div className="pincode-control"><input required inputMode="numeric" maxLength="6" placeholder="6-digit Pincode" value={form.pincode||""} onChange={e=>lookupPincode(e.target.value)}/>{pincodeBusy&&<span>LOOKING UP…</span>}</div>
  {lookupMessage&&<div className={`lookup-message ${lookupMessage.startsWith("✓")?"success":""}`}>{lookupMessage}</div>}
 </>
}

function Checkout(){
  const { cart, subtotal, shipping, total, clearCart, updateQty, removeFromCart } = useCart();
  const products = useProducts();
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", state: "", pincode: "" });
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponBusy, setCouponBusy] = useState(false);
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("online");

  useEffect(() => {
    if (error && error.toLowerCase().includes("item")) {
      setShowMobileSummary(true);
    }
  }, [error]);

  const totalQty = cart.reduce((s, i) => s + (Number(i.qty) || 0), 0);
  const qtyDiscountPct = totalQty >= 3 ? 0.15 : (totalQty >= 2 ? 0.10 : 0);
  const buy2Discount = (!appliedCoupon && qtyDiscountPct > 0) ? Math.round(subtotal * qtyDiscountPct) : 0;
  const isFreeShipping = true;
  const shippingFee = 0;
  const couponDiscountVal = Number(appliedCoupon?.discount || 0);
  const basePayable = Math.max(0, subtotal - buy2Discount - couponDiscountVal + shippingFee);

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
    let alive = true;
    (async () => {
      if (!localStorage.getItem("enytm-token")) {
        sessionStorage.setItem("enytm-after-login", "/checkout");
        nav("/login");
        return;
      }
      try {
        const u = await api("/auth/me");
        if (!alive) return;
        setUser(u);
        const a = Array.isArray(u.addresses) ? u.addresses.find((x) => x.isDefault) || u.addresses[0] : u.address;
        setForm({
          name: a?.name || u.name || "",
          phone: a?.phone || u.phone || "",
          address: a?.address || "",
          city: a?.city || "",
          state: a?.state || "",
          pincode: a?.pincode || ""
        });
      } catch (e) {
        if (alive) setError(e.message || "Could not load your account.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [nav]);

  const applyCoupon = async () => {
    setCouponBusy(true);
    setError("");
    try {
      const result = await api("/coupons/validate", {
        method: "POST",
        body: JSON.stringify({ code: couponCode, items: cart })
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
          items: cart,
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
        modal: { ondismiss: () => {} },
        handler: async (response) => {
          await api("/checkout/verify", {
            method: "POST",
            body: JSON.stringify({ ...response, orderId: data.orderId })
          });
          clearCart();
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
          <img src={i.image || fallbackProducts[0]?.image} alt={i.name} />
        </div>
        <div className="checkout-item-details">
          <div className="checkout-item-row-top">
            <h4>{i.name}</h4>
            <strong className="checkout-item-price">
              ₹{(Number(i.price) * Number(i.qty)).toLocaleString("en-IN")}
            </strong>
          </div>
          <div className="checkout-item-meta">
            <span className="checkout-item-size-badge">SIZE {i.size}</span>
            <span className="checkout-item-rate">₹{Number(i.price).toLocaleString("en-IN")} each</span>
            {isOverStock ? (
              <span className="checkout-stock-pill out">Only {stockCount} in stock</span>
            ) : isLowStock ? (
              <span className="checkout-stock-pill">Only {stockCount} left</span>
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
              <ShoppingBag size={17} />
              <span>
                {showMobileSummary ? "Hide order items" : "Review & adjust items"} ({totalQty} {totalQty === 1 ? "piece" : "pieces"})
              </span>
              <ChevronDown size={16} className={`summary-arrow ${showMobileSummary ? "open" : ""}`} />
            </div>
            <div className="mobile-summary-bar-right">
              <small>{isOnline ? "PAY ONLINE (5% OFF)" : "COD ADVANCE (30%)"}</small>
              <strong>₹{payableToday.toLocaleString("en-IN")}</strong>
            </div>
          </button>

          {showMobileSummary && (
            <div className="mobile-order-summary-drawer">
              <div className="mobile-order-items-list">
                {cart.map(renderCheckoutItem)}
              </div>
              <div className="mobile-summary-subtotals">
                <div>
                  <span>Subtotal ({totalQty} items)</span>
                  <b>₹{subtotal.toLocaleString("en-IN")}</b>
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
            {cart.map(renderCheckoutItem)}
          </div>
          <hr />
          <div>
            <span>Subtotal</span>
            <b>₹{subtotal.toLocaleString("en-IN")}</b>
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
function OrderDetails(){
 const id=useLocation().pathname.split("/").pop();
 const nav=useNavigate();
 const[order,setOrder]=useState(null);
 const[loading,setLoading]=useState(true);
 const[error,setError]=useState("");
 const[actionBusy,setActionBusy]=useState(false);
 const[sizeItem,setSizeItem]=useState(null);
 const[sizeValue,setSizeValue]=useState("");
 const[message,setMessage]=useState("");
 const load=async()=>{setLoading(true);setError("");try{const o=await api(`/orders/${id}`);setOrder(o)}catch(e){setError(e.message||"Could not load this order.")}finally{setLoading(false)}};
 useEffect(()=>{if(!localStorage.getItem("enytm-token")){nav("/login");return}load();const refresh=window.setInterval(()=>{api(`/orders/${id}`).then(setOrder).catch(()=>{})},30000);return()=>window.clearInterval(refresh)},[id]);
 const status=String(order?.status||"payment_pending");
 const shipped=["shipped","out_for_delivery","delivered"].includes(status);
 const cancelled=status==="cancelled";
 const statusIndex={payment_pending:0,confirmed:1,packed:2,shipped:3,out_for_delivery:4,delivered:5,cancelled:0}[status]??0;
 const statusLabel=status==="payment_pending"?"PAYMENT PENDING":status.replace(/_/g," ").toUpperCase();
 const deliveryDate=order?.estimatedDeliveryDate?new Date(order.estimatedDeliveryDate):null;
 const formatDate=d=>d&&!Number.isNaN(d.getTime())?d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"—";
 const cancelOrder=async()=>{if(!window.confirm("Cancel this order? You will be asked to choose where an eligible refund should go."))return;const paid=Number(order?.advancePaid||0)+Number(order?.balancePaid||0);let refundTo="original";if(paid>0){const choice=window.prompt("Refund preference: type WALLET to refund to your ENYTM wallet, or ORIGINAL to refund to the original payment method.","ORIGINAL");if(choice===null)return;const normalized=choice.trim().toLowerCase();if(!["wallet","original"].includes(normalized)){setMessage("Please type WALLET or ORIGINAL. No cancellation was made.");return;}refundTo=normalized;}setActionBusy(true);setMessage("");try{const o=await api(`/orders/${id}/cancel`,{method:"POST",body:JSON.stringify({refundTo})});setOrder(o);setMessage(o.refundStatus==="initiated"?"Order cancelled. Your refund has been initiated.":o.refundStatus==="wallet_credited"?"Order cancelled and eligible refund credited to your ENYTM wallet.":"Order cancelled successfully.")}catch(e){setMessage(e.message||"Could not cancel the order.")}finally{setActionBusy(false)}};
 const payBalance=async()=>{setActionBusy(true);setMessage("");try{const data=await api(`/orders/${id}/balance/order`,{method:"POST"});if(!window.Razorpay)throw new Error("Razorpay Checkout could not load. Check your internet connection.");const rzp=new window.Razorpay({key:data.keyId,amount:data.amount,currency:data.currency,name:"ENYTM APPARELS",description:"ENYTM pre-order balance",order_id:data.razorpayOrderId,theme:{color:"#111111"},handler:async response=>{try{const result=await api("/checkout/verify",{method:"POST",body:JSON.stringify({...response,orderId:data.orderId})});setOrder(result.order);setMessage("Balance payment successful. Your order is fully paid and will be dispatched after launch.");}catch(e){setMessage(e.message||"Payment verification is pending. Refresh the order shortly.");}},modal:{ondismiss:()=>setActionBusy(false)}});rzp.on("payment.failed",r=>{setMessage(r.error?.description||"Balance payment failed. Please try again.");setActionBusy(false)});rzp.open();}catch(e){setMessage(e.message||"Could not start balance payment.");setActionBusy(false)}};
 const changeSize=async()=>{if(!sizeItem||!sizeValue)return;setActionBusy(true);setMessage("");try{const o=await api(`/orders/${id}/change-size`,{method:"POST",body:JSON.stringify({productId:sizeItem.productId,size:sizeValue})});setOrder(o);setSizeItem(null);setSizeValue("");setMessage("Size updated successfully.")}catch(e){setMessage(e.message||"Could not change the size.")}finally{setActionBusy(false)}};
 if(loading)return <main className="empty loading-page"><p className="eyebrow">ENYTM ORDER</p><h1>LOADING ORDER...</h1></main>;
 if(error||!order)return <main className="empty"><p className="eyebrow">ENYTM ORDER</p><h1>ORDER NOT FOUND</h1>{error&&<div className="error">{error}</div>}<Link className="btn primary" to="/orders">BACK TO MY ORDERS</Link></main>;
 const steps=[
  ["confirmed","ORDER CONFIRMED","We received your order."],
  ["packed","PACKED","Your order is being prepared."],
  ["shipped","SHIPPED","Your package is on the way."],
  ["out_for_delivery","OUT FOR DELIVERY","Your package is arriving today."],
  ["delivered","DELIVERED","Delivered to your address."]
 ];
 return <main className="order-detail-page">
  <div className="order-detail-top"><div><p className="eyebrow">ENYTM / ORDER DETAILS</p><h1>{order.receipt||order.id}</h1><p className="muted">Placed on {new Date(order.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})}</p></div><Link className="text-link" to="/orders">← MY ORDERS</Link></div>
  {message&&<div className="order-action-message">{message}</div>}
  <section className="order-status-card">
   <div className="order-status-head"><div><span className={`order-status-big ${cancelled?"cancelled":""}`}>{cancelled?"ORDER CANCELLED":statusLabel}</span><h2>{cancelled?"This order has been cancelled.":deliveryDate?`Estimated delivery: ${formatDate(deliveryDate)}`:"Delivery date will be updated soon."}</h2></div>{!cancelled&&<Truck size={30}/>}</div>
   {!cancelled?<div className="order-timeline">{steps.map((step,i)=>{const active=i<=statusIndex;return <div className={`timeline-step ${active?"active":""}`} key={step[0]}><div className="timeline-dot">{active?<CheckCircle size={16}/>:<span>{i+1}</span>}</div><div><b>{step[1]}</b><small>{step[2]}</small></div></div>})}</div>:<div className="cancelled-note">If your payment was online, refund status: <b>{String(order.refundStatus||"pending").replace(/_/g," ")}</b>.</div>}
  </section>
  <div className="order-detail-grid">
   <section className="order-detail-main">
    <div className="order-panel"><div className="panel-head"><h2>ITEMS</h2><span>{order.items?.length||0} ITEM{order.items?.length===1?"":"S"}</span></div>{(order.items||[]).map((item,idx)=><article className="order-item-detail" key={`${item.productId}-${idx}`}><img src={item.image} alt={item.name}/><div className="order-item-copy"><h3>{item.name}</h3><p>Size: <b>{item.size||"—"}</b> · Qty: <b>{item.qty}</b></p><p className="muted">₹{Number(item.price).toLocaleString("en-IN")} each</p>{!shipped&&!cancelled&&<button type="button" className="order-action-link order-change-size-button" onClick={()=>{setSizeItem(item);setSizeValue(item.size||"")}}><Pencil size={13}/> CHANGE T-SHIRT SIZE</button>}</div><strong>₹{(Number(item.price)*Number(item.qty)).toLocaleString("en-IN")}</strong></article>)}</div>
    {order.tracking?.trackingNumber&&<div className="order-panel tracking-panel"><div className="panel-head"><h2>TRACK SHIPMENT</h2><span>{order.tracking.courier}</span></div><div className="tracking-row"><Package size={22}/><div><b>{order.tracking.trackingNumber}</b><small>Tracking number</small></div>{order.tracking.trackingUrl&&<a className="btn outline" href={order.tracking.trackingUrl} target="_blank" rel="noreferrer">TRACK NOW <ArrowRight size={15}/></a>}</div></div>}
    <div className="order-panel"><div className="panel-head"><h2>DELIVERY ADDRESS</h2><MapPin size={18}/></div><div className="delivery-address"><b>{order.customer?.name}</b><p>{order.customer?.address}</p><p>{order.customer?.city}, {order.customer?.state} — {order.customer?.pincode}</p><p>{order.customer?.phone}</p></div></div>
   </section>
   <aside className="order-detail-side">
    <div className="order-panel price-panel"><div className="panel-head"><h2>PRICE DETAILS</h2></div><div><span>Item total</span><b>₹{Number(order.subtotal||0).toLocaleString("en-IN")}</b></div><div><span>Shipping</span><b>{Number(order.shipping||0)?`₹${Number(order.shipping).toLocaleString("en-IN")}`:"FREE"}</b></div>{Number(order.buy2Discount||0)>0&&<div className="promo-line"><span>Promotional Discount</span><b className="discount-green">−₹{Number(order.buy2Discount).toLocaleString("en-IN")}</b></div>}{Number(order.discount||0)>0&&!order.buy2Discount&&<div className="coupon-summary-line"><span>Coupon ({order.couponCode})</span><b className="discount-green">−₹{Number(order.discount).toLocaleString("en-IN")}</b></div>}{Number(order.fullPaymentDiscount||0)>0&&<div className="promo-line"><span>Online Payment Discount (5% Off)</span><b className="discount-green">−₹{Number(order.fullPaymentDiscount).toLocaleString("en-IN")}</b></div>}{Number(order.codFee||0)>0&&<div><span>COD fee</span><b>₹{Number(order.codFee).toLocaleString("en-IN")}</b></div>}<hr/><div className="grand"><span>ORDER TOTAL</span><b>₹{Number(order.total||0).toLocaleString("en-IN")}</b></div>{order.paymentMethod === "cod" ? (<><div><span>Payment method</span><b>Cash on Delivery (30% Advance)</b></div><div><span>Advance paid online (30%)</span><b>₹{Number(order.advancePaid||0).toLocaleString("en-IN")}</b></div><div><span>Cash due on delivery (70%)</span><b>₹{Math.max(0,Number(order.total||0)-Number(order.advancePaid||0)-Number(order.balancePaid||0)).toLocaleString("en-IN")}</b></div></>) : (<><div><span>Payment method</span><b>Online Payment (100% Prepaid)</b></div><div><span>Amount paid online</span><b>₹{Number(order.advancePaid||order.total||0).toLocaleString("en-IN")}</b></div><div><span>Balance due on delivery</span><b style={{ color: "#4ade80" }}>₹0 (Fully Paid)</b></div></>)}<p className="payment-meta">Payment: {String(order.paymentMethod||"online").toUpperCase()} · {String(order.paymentStatus||"").replace(/_/g," ").toUpperCase()}</p>{!cancelled&&order.paymentStatus!=="paid"&&order.paymentMethod!=="cod"&&Number(order.advancePaid||0)>0&&<button className="btn primary full" disabled={actionBusy} onClick={payBalance}>{actionBusy?"PROCESSING...":`PAY BALANCE ₹${Math.max(0,Number(order.total||0)-Number(order.advancePaid||0)-Number(order.balancePaid||0)).toLocaleString("en-IN")}`}</button>}</div>
    <div className="order-panel delivery-summary"><div className="panel-head"><h2>DELIVERY</h2><CalendarDays size={18}/></div><b>{deliveryDate?formatDate(deliveryDate):"To be confirmed"}</b><p className="muted">Standard delivery</p></div>
    <div className="order-actions-panel">{!cancelled&&<><button className="btn primary full" disabled={actionBusy||shipped} onClick={cancelOrder}>{shipped?"CANCELLATION CLOSED":actionBusy?"PROCESSING...":"CANCEL ORDER"}</button><p className="action-note">Cancellation and size change are available until the order is shipped.</p></>}<Link className="btn outline full" to="/shop">CONTINUE SHOPPING</Link></div>
   </aside>
  </div>
  {sizeItem&&<div className="order-modal-backdrop"><div className="order-modal"><div className="panel-head"><h2>CHANGE SIZE</h2><button className="icon-btn" onClick={()=>setSizeItem(null)}><X/></button></div><p>{sizeItem.name}</p><select value={sizeValue} onChange={e=>setSizeValue(e.target.value)}><option value="">SELECT SIZE</option>{(sizeItem.sizes||["S","M","L","XL","XXL"]).map(s=><option key={s} value={s}>{s}</option>)}</select><button className="btn primary full" disabled={!sizeValue||actionBusy} onClick={changeSize}>{actionBusy?"UPDATING...":"CONFIRM SIZE"}</button></div></div>}
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

function Cart(){
  const { cart, updateQty, removeFromCart, subtotal } = useCart();
  const nav = useNavigate();
  const totalQty = cart.reduce((s, i) => s + (Number(i.qty) || 0), 0);
  const qtyDiscountPct = totalQty >= 3 ? 0.15 : (totalQty >= 2 ? 0.10 : 0);
  const buy2Discount = Math.round(subtotal * qtyDiscountPct);
  const isFreeShipping = true;
  const shippingFee = 0;
  const finalPayable = Math.max(0, subtotal - buy2Discount);
  const neededForFree = 0;
  const progressPct = 100;

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
            {/* Free shipping progress bar */}
            <div className="free-shipping-bar-card">
              <div className="free-shipping-text-row">
                <div className="shipping-icon-label">
                  <Truck size={17} />
                  <span>
                    <span className="shipping-unlocked-text">✓ You unlocked <b>FREE SHIPPING</b> across India!</span>
                  </span>
                </div>
                <span className="shipping-pct">100%</span>
              </div>
              <div className="shipping-progress-track">
                <div className="shipping-progress-fill" style={{ width: "100%" }} />
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

            <div className="cart-items">
              {cart.map((i) => (
                <div className="cart-item" key={i.key}>
                  <img src={i.image} alt={i.name} />
                  <div className="cart-item-info">
                    <div>
                      <h3>{i.name}</h3>
                      <p>{i.fabric} · Size {i.size}</p>
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
              ))}
            </div>
          </div>

          <aside className="summary">
            <h2>ORDER SUMMARY</h2>
            <div>
              <span>Subtotal ({totalQty} item{totalQty === 1 ? "" : "s"})</span>
              <b>₹{subtotal.toLocaleString("en-IN")}</b>
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
              className="btn primary full"
              onClick={() => {
                if (!localStorage.getItem("enytm-token")) {
                  sessionStorage.setItem("enytm-after-login", "/checkout");
                  nav("/login");
                } else nav("/checkout");
              }}
            >
              PROCEED TO CHECKOUT <ArrowRight />
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
  const { wishlist } = useCart();
  const nav = useNavigate();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [defaultAddressId, setDefaultAddressId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", whatsappOptIn: false, emailOptIn: true });

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
    setLoading(true);
    setLoadError("");

    const token = localStorage.getItem("enytm-token");

    if (!token) {
      nav("/login", { replace: true });
      return;
    }

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
        throw new Error(
          meResult.reason?.message ||
          "Unable to load your account."
        );
      }

      const accountUser = meResult.value;

      if (!accountUser) {
        throw new Error("Your account session is no longer valid.");
      }

      setUser(accountUser);
      setProfileForm({ name: accountUser.name || "", phone: accountUser.phone || "", whatsappOptIn: Boolean(accountUser.whatsappOptIn), emailOptIn: accountUser.emailOptIn !== false });

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
      if (addressesResult.status === "fulfilled") {
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
        /*
         * Older backend versions may not have
         * /auth/addresses yet.
         *
         * Do not break the entire account page.
         */
        setAddresses([]);

        // Preserve legacy single address if available
        if (accountUser.address) {
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

      setLoadError(
        error?.message ||
        "Could not load your account. Please try again."
      );
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
      const updated = await api("/auth/profile", { method: "PUT", body: JSON.stringify({
        name: profileForm.name.trim(), phone: profileForm.phone.trim(),
        whatsappOptIn: profileForm.whatsappOptIn, emailOptIn: profileForm.emailOptIn
      }) });
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
    localStorage.removeItem("enytm-token");
    localStorage.removeItem("enytm-user");

    nav("/", { replace: true });
  };

  if (loading) {
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

  if (loadError) {
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


      {/* STATS */}

      <div className="account-stats">

        <div>
          <span>ORDERS</span>
          <strong>{orders.length}</strong>
        </div>

        <div>
          <span>SPENT</span>
          <strong>
            ₹{spent.toLocaleString("en-IN")}
          </strong>
        </div>

        <div>
          <span>WISHLIST</span>
          <strong>{wishlist.length}</strong>
        </div>

        <div>
          <span>MEMBER SINCE</span>
          <strong>
            {user.createdAt
              ? new Date(user.createdAt).getFullYear()
              : "—"}
          </strong>
        </div>

      </div>


      {/* MAIN GRID */}

      <div className="account-grid">

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
            <label>FULL NAME<input required maxLength={80} value={profileForm.name} onChange={e => setProfileForm(v => ({...v, name:e.target.value}))} /></label>
            <label>PHONE NUMBER<input inputMode="tel" maxLength={16} value={profileForm.phone} onChange={e => setProfileForm(v => ({...v, phone:e.target.value}))} /></label>
            <label className="check"><input type="checkbox" checked={profileForm.whatsappOptIn} onChange={e => setProfileForm(v => ({...v, whatsappOptIn:e.target.checked}))} /> Receive order updates on WhatsApp</label>
            <label className="check"><input type="checkbox" checked={profileForm.emailOptIn} onChange={e => setProfileForm(v => ({...v, emailOptIn:e.target.checked}))} /> Receive order updates by email</label>
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

          <div className="account-actions">

            <Link
              className="btn outline"
              to="/wishlist"
            >
              <Heart size={15} />
              WISHLIST
            </Link>

            <button
              className="btn outline"
              onClick={logout}
            >
              <LogOut size={15} />
              LOG OUT
            </button>

          </div>

        </section>


        {/* ORDERS */}

        <section className="account-card orders-card">

          <div className="card-kicker">
            02 / ORDER HISTORY
          </div>

          <div className="orders-title">

            <h2>YOUR ORDERS</h2>

            <Link to="/shop">
              CONTINUE SHOPPING
              <ArrowRight size={15} />
            </Link>

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
                  className={`order-status ${
                    order.paymentStatus
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

      </div>


      {/* SAVED ADDRESSES */}

      <section className="account-card saved-addresses-card">

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

          <button
            className="btn primary"
            onClick={startAddAddress}
          >
            + ADD ADDRESS
          </button>

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
                className={`saved-address ${
                  address.id === defaultAddressId
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

    </main>
  );
}
function Wishlist(){const products=useProducts();const{wishlist}=useCart();const items=products.filter(p=>wishlist.includes(p.id));return <main className="shop-page"><div className="page-heading"><p className="eyebrow">SAVED FOR LATER</p><h1>WISHLIST</h1></div>{items.length?<div className="product-grid shop-grid">{items.map(p=><ProductCard key={p.id} product={p}/>)}</div>:<div className="empty"><Heart size={50}/><h2>Your wishlist is empty.</h2><Link className="btn primary" to="/shop">EXPLORE PRODUCTS</Link></div>}</main>}
function About(){return <main className="enytm-about-page"><section className="about-hero"><img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2200&q=90" alt="A curated clothing store"/><div><p className="eyebrow">THE STORY</p><h1>MORE THAN<br/><em>A MOMENT.</em></h1></div></section><section className="about-quality-section"><div className="about-quality-heading"><p className="eyebrow">THE DETAILS MATTER</p><h2>FEEL THE<br/><em>DIFFERENCE.</em></h2><p>Premium-feeling fabrics. Thoughtful construction. Everyday pieces made to be reached for again and again.</p></div><img className="about-quality-triptych" src="/enytm-quality-triptych.png" alt="Close-up details of ENYTM garment fabric, collar, folded clothing and stitching"/><div className="about-quality-caption"><span>FABRIC, FIT & FINISH</span><span>MADE FOR EVERYDAY WEAR</span></div></section><section className="about-copy"><p className="eyebrow">01 / A LITTLE ABOUT ENYTM</p><h2>MADE FOR THE<br/><em>WAY YOU LIVE.</em></h2><p>ENYTM APPARELS began with a simple belief: what you wear should feel as natural as being yourself. We create everyday streetwear with considered silhouettes, comfortable fabrics and clean details.</p><p>From oversized tees and polos to heavyweight layers, each piece is designed to bring together ease, character and lasting versatility—without unnecessary noise.</p><div className="about-vision"><p className="eyebrow">OUR VISION</p><p>To make everyday clothing feel more personal: pieces that move with you, fit into your life and let your confidence speak quietly.</p></div></section><section className="about-why"><p className="eyebrow">02 / WHY ENYTM</p><h2>LESS NOISE.<br/><em>MORE YOU.</em></h2><div className="about-why-grid"><div><span>01</span><h3>CONSIDERED FITS</h3><p>Relaxed silhouettes and balanced proportions made for everyday movement.</p></div><div><span>02</span><h3>BETTER-FEELING FABRICS</h3><p>We pay attention to fabric weight, texture and the way a garment feels in use.</p></div><div><span>03</span><h3>DETAILS THAT LAST</h3><p>Clean finishes and versatile design, made to be worn, styled and worn again.</p></div></div><Link className="btn outline" to="/shop">EXPLORE THE COLLECTION <ArrowRight size={16}/></Link></section></main>}
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

function Footer(){
  const whatsappLink="https://wa.me/message/5KFLGKP4XCG7C1";
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
            <h4>COLLECTIONS</h4>
            <Link to="/shop">All Products</Link>
            <Link to="/shop?category=Oversized">Oversized T-Shirts</Link>
            <Link to="/shop?category=Polos">Polos</Link>
            <Link to="/shop?category=Hoodies">Hoodies & Sweatshirts</Link>
            <Link to="/shop?category=Lowers">Heavyweight Lowers</Link>
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
            <div className="footer-social-links">
              <a href="https://www.instagram.com/enytm_official/?__d=1%253Futm_source%253Dig_embed" target="_blank" rel="noreferrer">
                <Instagram size={17} /> Instagram
              </a>
            </div>
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

function SearchOverlay({close}){
  const[q,setQ]=useState("");
  const products=useProducts();
  const results=products.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())||p.category.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="search-overlay">
      <button className="close-search" onClick={close}><X/></button>
      <div className="search-inner">
        <p className="eyebrow">SEARCH ENYTM</p>
        <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="What are you looking for?"/>
        <div className="search-results">
          {q&&results.map(p=>(
            <Link key={p.id} to={`/product/${p.id}`} onClick={close}>
              <img src={p.image} alt={p.name}/>
              <span>{p.name}<small>₹{p.price.toLocaleString("en-IN")}</small></span>
              <ArrowRight/>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
function WalletPage(){
 const [wallet,setWallet]=useState({balance:0,transactions:[]});
 const [amount,setAmount]=useState("500");
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const load=async()=>{try{setWallet(await api("/wallet"));}catch(e){setMessage(e.message||"Could not load wallet.");}};
 useEffect(()=>{load()},[]);
 const addMoney=async()=>{
  const rupees=Number(amount);
  if(!Number.isFinite(rupees)||rupees<100||rupees>50000){setMessage("Enter an amount from ₹100 to ₹50,000.");return;}
  setBusy(true);setMessage("");
  try{
   const data=await api("/wallet/topup/order",{method:"POST",body:JSON.stringify({amount:rupees})});
   if(!window.Razorpay)throw new Error("Payment checkout could not load. Please try again.");
   const rzp=new window.Razorpay({key:data.keyId,amount:data.amount,currency:"INR",name:"ENYTM APPARELS",description:"Add money to ENYTM Wallet",order_id:data.razorpayOrderId,theme:{color:"#c8b69a"},handler:async response=>{
    try{await api("/wallet/topup/verify",{method:"POST",body:JSON.stringify({...response,topupId:data.topupId})});await load();setMessage("Wallet credited successfully.");}
    catch(e){setMessage(e.message||"Payment verification pending. Refresh wallet shortly.");}
   },modal:{ondismiss:()=>setBusy(false)}});
   rzp.on("payment.failed",r=>{setMessage(r.error?.description||"Payment failed.");setBusy(false)});rzp.open();
  }catch(e){setMessage(e.message||"Unable to start wallet top-up.");setBusy(false);}
 };
 return <main className="account-page"><div className="page-heading compact"><p className="eyebrow">ENYTM MEMBERS</p><h1>MY WALLET</h1><p>Your balance and wallet activity.</p></div><section className="account-card wallet-card"><p className="eyebrow">AVAILABLE BALANCE</p><h2 style={{fontSize:42,margin:"8px 0 24px"}}>₹{Number(wallet.balance||0).toLocaleString("en-IN")}</h2><div className="wallet-topup"><label htmlFor="wallet-add-amount">ADD MONEY (₹100–₹50,000)</label><input id="wallet-add-amount" inputMode="numeric" value={amount} onChange={e=>setAmount(e.target.value.replace(/\D/g,""))}/><button className="btn primary" disabled={busy} onClick={addMoney}>{busy?"PROCESSING...":"ADD MONEY SECURELY"}</button></div>{message&&<p className="order-action-message">{message}</p>}<h2>WALLET ACTIVITY</h2>{wallet.transactions?.length?wallet.transactions.map((t,i)=><div className="wallet-transaction" key={t.id||i}><span>{t.description||t.type||"Wallet transaction"}<small>{t.createdAt?new Date(t.createdAt).toLocaleString("en-IN"):""}</small></span><b>{t.amount>=0?"+":"−"}₹{Math.abs(Number(t.amount||0)).toLocaleString("en-IN")}</b></div>):<p className="muted">No wallet transactions yet.</p>}</section></main>
}

function Admin(){
 const[logged,setLogged]=useState(!!localStorage.getItem("enytm-admin"));
 const[tab,setTab]=useState("dashboard");
 const[data,setData]=useState(null);
 const[orders,setOrders]=useState([]);
 const[customers,setCustomers]=useState([]);
 const[products,setProducts]=useState([]);
 const[email,setEmail]=useState("");
 const[password,setPassword]=useState("");
 const[busy,setBusy]=useState(false);
 const[error,setError]=useState("");
 const load=async()=>{try{setData(await api("/admin/dashboard"));setOrders(await api("/admin/orders"));setCustomers(await api("/admin/customers"));setProducts(await api("/admin/products"));}catch{localStorage.removeItem("enytm-admin");setLogged(false)}};
 useEffect(()=>{if(logged)load()},[logged]);
 const login=async()=>{
  setBusy(true); setError("");
  try{
   const r=await api("/admin/login",{method:"POST",body:JSON.stringify({email:email.trim().toLowerCase(),password})});
   localStorage.setItem("enytm-admin",r.token);
   setLogged(true);
  }catch(e){setError(e.message||"Admin login failed.");}
  finally{setBusy(false)}
 };
 if(!logged)return <main className="admin-login"><div className="auth-card"><p className="eyebrow">ENYTM CONTROL</p><h1>ADMIN LOGIN</h1><p className="muted">Use the ADMIN_EMAIL and ADMIN_PASSWORD from your server .env file.</p><input autoComplete="username" placeholder="Admin email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/><input autoComplete="current-password" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/>{error&&<div className="admin-login-error">{error}</div>}<button className="btn primary full" disabled={busy} onClick={login}>{busy?"CHECKING...":"LOGIN"}</button></div></main>;
 return <main className="admin-page"><aside className="admin-side"><div className="logo"><BrandLogo /></div>{["dashboard","orders","customers","products","coupons","settings"].map(t=><button className={tab===t?"active":""} onClick={()=>setTab(t)} key={t}>{t.toUpperCase()}</button>)}<button onClick={()=>{localStorage.removeItem("enytm-admin");setLogged(false)}}>LOG OUT</button></aside><section className="admin-content"><div className="admin-top"><div><p className="eyebrow">ENYTM APPARELS</p><h1>{tab.toUpperCase()}</h1></div><Link className="btn outline" to="/">VIEW STORE</Link></div>{tab==="dashboard"&&data&&<div className="metric-grid">{[["REVENUE",`₹${data.revenue.toLocaleString("en-IN")}`],["ORDERS",data.orders],["PAID",data.paidOrders],["CUSTOMERS",data.customers],["PRODUCTS",data.products],["PENDING",data.pendingPayments]].map(([a,b])=><div className="metric" key={a}><span>{a}</span><strong>{b}</strong></div>)}</div>}{tab==="orders"&&<AdminOrders orders={orders} reload={load}/>} {tab==="customers"&&<AdminTable headers={["NAME","EMAIL","PHONE","CREATED","WHATSAPP","EMAIL"]} rows={customers.map(c=>[c.name,c.email,c.phone||"—",new Date(c.createdAt).toLocaleDateString(),c.whatsappOptIn?"ON":"OFF",c.emailOptIn?"ON":"OFF"])}/>} {tab==="products"&&<AdminProducts products={products} reload={load}/>} {tab==="coupons"&&<AdminCoupons products={products}/>} {tab==="settings"&&<AdminSettings/>}</section></main>}
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
     <label>ORDER STATUS<select value={status} onChange={e=>setStatus(e.target.value)}>{[["payment_pending","Payment pending"],["confirmed","Order confirmed"],["processing","Processing"],["packed","Packed"],["shipped","Shipped"],["out_for_delivery","Out for delivery"],["delivered","Delivered"]].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
     <label>COURIER PARTNER<input value={courier} onChange={e=>setCourier(e.target.value)} placeholder="e.g. Delhivery, Shiprocket"/></label>
     <label>TRACKING / AWB NUMBER<input value={trackingNumber} onChange={e=>setTrackingNumber(e.target.value)} placeholder="Enter AWB or tracking number"/></label>
     <label>TRACKING URL<input type="url" value={trackingUrl} onChange={e=>setTrackingUrl(e.target.value)} placeholder="https://courier-tracking-link"/></label>
    </div>
    <button className="btn primary" disabled={saving} onClick={saveDelivery}>{saving?"SAVING...":"SAVE DELIVERY UPDATE"}</button>{message&&<p className="admin-save-message">{message}</p>}
   </section>
   <div className="admin-order-detail-grid">
    <section className="admin-order-card"><p className="eyebrow">CUSTOMER & DELIVERY</p><h3>{customer.name || "Customer details unavailable"}</h3><div className="admin-order-fields">{field("Email", customer.email)}{field("Phone", customer.phone)}{field("Address", customer.address)}{field("City", customer.city)}{field("State", customer.state)}{field("PIN code", customer.pincode)}{field("Landmark", customer.landmark)}</div></section>
    <section className="admin-order-card"><p className="eyebrow">PAYMENT INFORMATION</p><div className="admin-order-fields">{field("Payment status", order.paymentStatus)}{field("Payment method", order.paymentMethod)}{field("Payment ID", order.paymentId)}{field("Gateway order ID", order.razorpayOrderId)}{field("Order ID", order.receipt || order.id)}{field("Last updated", date(order.updatedAt))}</div></section>
   </div>
   <section className="admin-order-card admin-order-items"><p className="eyebrow">ITEMS IN THIS ORDER</p><div className="admin-order-item-list">{items.length ? items.map((item, i) => <div className="admin-order-item" key={`${item.productId || item.name}-${i}`}><div className="admin-order-item-image">{item.image ? <img src={item.image} alt={item.name || "Ordered product"}/> : <span>ENYTM</span>}</div><div className="admin-order-item-name"><strong>{item.name || "Product"}</strong><span>{item.category || "Apparel"}{item.size ? ` · Size ${item.size}` : ""}{item.color ? ` · ${item.color}` : ""}</span><small>Qty: {Number(item.qty || 1)}</small></div><div className="admin-order-item-price"><span>{money(item.price)} each</span><strong>{money(Number(item.price || 0) * Number(item.qty || 1))}</strong></div></div>) : <p className="admin-order-muted">No product line items were saved with this order.</p>}</div>
   <div className="admin-order-totals">{field("Subtotal", money(order.subtotal))}{field("Discount", money(order.discount))}{field("Shipping", Number(order.shipping || 0) ? money(order.shipping) : "Free")}{field("Order total", money(order.total))}</div></section>
   <p className="admin-order-note">Details are shown from the order record saved by your store. Fields that were not collected at checkout appear as “—”.</p>
  </section>;
 }
 return <div className="admin-table-wrap admin-orders-table"><table><thead><tr>{["ORDER ID · CLICK TO OPEN","CUSTOMER","PHONE","TOTAL","PAYMENT","ORDER STATUS","DATE"].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{orders.map(order=><tr key={order.id || order.receipt}><td><button className="admin-order-link" onClick={() => openOrder(order)}>{order.receipt || order.id}</button></td><td>{order.customer?.name || "—"}</td><td>{order.customer?.phone || "—"}</td><td>{money(order.total)}</td><td>{order.paymentStatus || "—"}</td><td>{String(order.status || "—").replaceAll("_", " ")}</td><td>{date(order.createdAt)}</td></tr>)}</tbody></table>{!orders.length&&<p className="admin-order-muted">No orders found.</p>}</div>;
}

function AdminTable({headers,rows}){return <div className="admin-table-wrap"><table><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j}>{c}</td>)}</tr>)}</tbody></table></div>}
function AdminMediaUpload({fieldKey,label,hint,value,onUploaded,video=false}){
 const[busy,setBusy]=useState(false);const[error,setError]=useState("");
 const upload=async file=>{if(!file)return;setBusy(true);setError("");try{const form=new FormData();form.append(video?"video":"image",file);const result=await api(video?"/admin/upload-video":"/admin/upload-image",{method:"POST",body:form});onUploaded(result.url)}catch(e){setError(e.message||"Upload failed.")}finally{setBusy(false)}};
 return <div className="admin-media-upload"><div className="admin-media-preview">{value?(video?<video src={value} controls/>:<img src={value} alt={label}/>):<div className="admin-media-empty"><Package size={23}/><span>{video?"VIDEO":"IMAGE"}</span></div>}</div><div className="admin-media-meta"><strong>{label}</strong><small>{hint}</small><label className="admin-upload-button">{busy?"UPLOADING...":value?"REPLACE FILE":"CHOOSE FILE"}<input type="file" accept={video?"video/mp4,video/webm,video/quicktime":"image/jpeg,image/png,image/webp"} disabled={busy} onChange={e=>{upload(e.target.files?.[0]);e.target.value=""}}/></label>{value&&<button type="button" className="admin-media-remove" onClick={()=>onUploaded("")}>REMOVE</button>}{error&&<small className="admin-media-error">{error}</small>}</div></div>
}
function AdminCoupons({products}){
 const empty={code:"",title:"",discountType:"percentage",discountValue:10,maxDiscount:0,minOrderValue:0,usageLimit:0,perCustomerLimit:1,startsAt:"",expiresAt:"",categories:[],productIds:[],active:true};
 const[coupon,setCoupon]=useState(empty);const[list,setList]=useState([]);const[editing,setEditing]=useState(null);const[busy,setBusy]=useState(false);const[message,setMessage]=useState("");
 const load=async()=>{try{setList(await api("/admin/coupons"))}catch(e){setMessage(e.message||"Could not load coupons.")}};
 useEffect(()=>{load()},[]);
 const save=async()=>{setBusy(true);setMessage("");try{await api("/admin/coupons",{method:"POST",body:JSON.stringify({...coupon,id:editing||undefined,code:coupon.code.toUpperCase(),startsAt:coupon.startsAt?new Date(coupon.startsAt).toISOString():"",expiresAt:coupon.expiresAt?new Date(coupon.expiresAt).toISOString():""})});setCoupon(empty);setEditing(null);setMessage("Coupon saved.");await load()}catch(e){setMessage(e.message||"Could not save coupon.")}finally{setBusy(false)}};
 const edit=c=>{setEditing(c.id);setCoupon({...empty,...c,startsAt:c.startsAt?new Date(c.startsAt).toISOString().slice(0,16):"",expiresAt:c.expiresAt?new Date(c.expiresAt).toISOString().slice(0,16):""});setMessage("")};
 const remove=async c=>{if(!window.confirm(`Delete coupon ${c.code}?`))return;try{await api(`/admin/coupons/${c.id}`,{method:"DELETE"});await load()}catch(e){setMessage(e.message||"Could not delete coupon.")}};
 const toggleCategory=(value,checked)=>setCoupon(c=>({...c,categories:checked?[...c.categories,value]:c.categories.filter(x=>x!==value)}));
 return <div className="admin-coupons"><section className="admin-product-editor"><div className="admin-editor-head"><div><p className="eyebrow">{editing?"EDIT COUPON":"PROMOTIONS"}</p><h2>{editing?"Update coupon":"Create a coupon code"}</h2><p className="muted">Build seasonal offers, influencer codes and customer promotions without editing code.</p></div>{editing&&<button className="admin-text-btn" onClick={()=>{setEditing(null);setCoupon(empty)}}>CANCEL</button>}</div><div className="admin-product-form">
 <label className="admin-product-field"><span>COUPON CODE</span><input value={coupon.code} placeholder="DIWALI20" onChange={e=>setCoupon(c=>({...c,code:e.target.value.toUpperCase().replace(/\s/g,"")}))}/></label>
 <label className="admin-product-field"><span>CAMPAIGN / CREATOR NAME</span><input value={coupon.title} placeholder="Diwali campaign or creator name" onChange={e=>setCoupon(c=>({...c,title:e.target.value}))}/></label>
 <label className="admin-product-field"><span>DISCOUNT TYPE</span><select value={coupon.discountType} onChange={e=>setCoupon(c=>({...c,discountType:e.target.value}))}><option value="percentage">Percentage (%)</option><option value="fixed">Fixed amount (₹)</option></select></label>
 <label className="admin-product-field"><span>DISCOUNT VALUE</span><input type="number" min="1" max={coupon.discountType==="percentage"?100:undefined} value={coupon.discountValue} onChange={e=>setCoupon(c=>({...c,discountValue:e.target.value}))}/></label>
 <label className="admin-product-field"><span>MAX DISCOUNT (₹, 0 = NONE)</span><input type="number" min="0" value={coupon.maxDiscount} onChange={e=>setCoupon(c=>({...c,maxDiscount:e.target.value}))} disabled={coupon.discountType==="fixed"}/></label>
 <label className="admin-product-field"><span>MINIMUM ORDER VALUE (₹)</span><input type="number" min="0" value={coupon.minOrderValue} onChange={e=>setCoupon(c=>({...c,minOrderValue:e.target.value}))}/></label>
 <label className="admin-product-field"><span>TOTAL USAGE LIMIT (0 = UNLIMITED)</span><input type="number" min="0" value={coupon.usageLimit} onChange={e=>setCoupon(c=>({...c,usageLimit:e.target.value}))}/></label>
 <label className="admin-product-field"><span>PER CUSTOMER LIMIT (0 = UNLIMITED)</span><input type="number" min="0" value={coupon.perCustomerLimit} onChange={e=>setCoupon(c=>({...c,perCustomerLimit:e.target.value}))}/></label>
 <label className="admin-product-field"><span>START DATE / TIME</span><input type="datetime-local" value={coupon.startsAt} onChange={e=>setCoupon(c=>({...c,startsAt:e.target.value}))}/></label>
 <label className="admin-product-field"><span>EXPIRY DATE / TIME</span><input type="datetime-local" value={coupon.expiresAt} onChange={e=>setCoupon(c=>({...c,expiresAt:e.target.value}))}/></label>
 <div className="admin-product-field admin-product-wide"><span>APPLIES TO CATEGORIES (NONE = ALL)</span><div className="admin-coupon-checks">{["Oversized","Polos","Hoodies","Sweatshirts"].map(cat=><label key={cat}><input type="checkbox" checked={coupon.categories.includes(cat)} onChange={e=>toggleCategory(cat,e.target.checked)}/>{cat}</label>)}</div></div>
 <div className="admin-product-field admin-product-wide"><span>SPECIFIC PRODUCTS (NONE = ALL)</span><select multiple value={coupon.productIds.map(String)} onChange={e=>setCoupon(c=>({...c,productIds:[...e.target.selectedOptions].map(o=>Number(o.value))}))}>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
 <label className="admin-coupon-active admin-product-wide"><input type="checkbox" checked={coupon.active} onChange={e=>setCoupon(c=>({...c,active:e.target.checked}))}/> Coupon is active and can be used at checkout</label>
 </div><div className="admin-editor-actions"><button className="btn primary" disabled={busy} onClick={save}>{busy?"SAVING...":editing?"SAVE COUPON":"CREATE COUPON"}</button>{editing&&<button className="btn outline" onClick={()=>{setEditing(null);setCoupon(empty)}}>CANCEL</button>}</div>{message&&<div className="admin-save-message">{message}</div>}</section>
 <div className="admin-product-list-head"><div><p className="eyebrow">CAMPAIGN LIBRARY</p><h2>{list.length} COUPONS</h2></div></div><div className="admin-table-wrap"><table><thead><tr>{["CODE","CAMPAIGN","OFFER","USAGE","VALID UNTIL","STATUS","ACTIONS"].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{list.map(c=><tr key={c.id}><td><strong>{c.code}</strong></td><td>{c.title||"—"}</td><td>{c.discountType==="fixed"?`₹${c.discountValue} off`:`${c.discountValue}% off`}{c.maxDiscount>0&&c.discountType==="percentage"?` (max ₹${c.maxDiscount})`:""}</td><td>{c.usageCount||0}{c.usageLimit?` / ${c.usageLimit}`:" / ∞"}</td><td>{c.expiresAt?new Date(c.expiresAt).toLocaleString("en-IN"):"No expiry"}</td><td>{c.active?"ACTIVE":"INACTIVE"}</td><td><div className="admin-actions"><button className="admin-icon-btn" title="Edit" onClick={()=>edit(c)}><Pencil size={17}/></button><button className="admin-icon-btn admin-delete-icon" title="Delete" onClick={()=>remove(c)}><Trash2 size={17}/></button></div></td></tr>)}</tbody></table>{!list.length&&<p className="admin-order-muted">No coupons yet. Create your first campaign above.</p>}</div></div>
}
function AdminProducts({ products, reload }) {
  const empty = {
    name: "",
    category: "Oversized",
    price: 999,
    oldPrice: 1199,
    stock: 20,
    fabric: "240 GSM Premium Cotton",
    badge: "NEW",
    description: "",
    image: "",
    image2: "",
    image3: "",
    modelFront: "",
    modelBack: "",
    video: "",
    sizes: ["S","M","L","XL","XXL"],
  };

  const [p, setP] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const startEdit = (product) => {
    setEditing(product.id);
    setP({
      ...empty,
      ...product,
    });
    setMessage("");
  };

  const cancel = () => {
    setEditing(null);
    setP({ ...empty });
    setMessage("");
  };

  const save = async () => {
    if (!p.name.trim()) {
      setMessage("Product name is required.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const payload = {
        ...p,
        price: Number(p.price),
        oldPrice: Number(p.oldPrice || 0),
        stock: Number(p.stock || 0),
        sizes:
          p.sizes || [
            "S",
            "M",
            "L",
            "XL",
            "XXL",
          ],
      };

      if (editing) {
        await api(
          `/admin/products/${editing}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );
      } else {
        await api(
          "/admin/products",
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );
      }

      setMessage(
        editing
          ? "Product updated successfully."
          : "Product added successfully."
      );

      setEditing(null);
      setP({ ...empty });

      await reload();
    } catch (e) {
      setMessage(
        e.message ||
          "Could not save product."
      );
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

          {field(
            "name",
            "PRODUCT NAME"
          )}

          <label className="admin-product-field">
            <span>CATEGORY</span>

            <select
              value={p.category}
              onChange={(e) =>
                setP({
                  ...p,
                  category:
                    e.target.value,
                })
              }
            >
              <option>
                Oversized
              </option>

              <option>
                Polos
              </option>

              <option>
                Hoodies
              </option>

              <option>
                Sweatshirts
              </option>
            </select>
          </label>

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
            "stock",
            "STOCK",
            "number"
          )}

          {field(
            "badge",
            "BADGE"
          )}

          {field(
            "fabric",
            "FABRIC"
          )}

          <div className="admin-media-upload-grid admin-product-wide">
            {[
              ["image","FRONT VIEW","Upload the primary product photo"],
              ["image2","BACK VIEW","Product back view"],
              ["image3","FABRIC DETAIL","Close-up of fabric and texture"],
              ["modelFront","MODEL FRONT","Front view worn by a model"],
              ["modelBack","MODEL BACK","Back view worn by a model"]
            ].map(([key,label,hint])=><AdminMediaUpload key={key} fieldKey={key} label={label} hint={hint} value={p[key]} onUploaded={url=>setP(current=>({...current,[key]:url}))}/>)}
            <AdminMediaUpload fieldKey="video" label="PRODUCT VIDEO (OPTIONAL)" hint="MP4, WEBM or MOV · up to 100 MB" value={p.video} video onUploaded={url=>setP(current=>({...current,video:url}))}/>
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
                              product.image
                            }
                            alt={
                              product.name
                            }
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
}function AdminSettings(){const[s,setS]=useState({shippingFreeAbove:0,shippingCharge:0});useEffect(()=>{api("/admin/settings").then(setS)},[]);return <div className="admin-settings"><h2>STORE SETTINGS</h2><label>Free shipping above <input value={s.shippingFreeAbove||""} onChange={e=>setS({...s,shippingFreeAbove:e.target.value})}/></label><label>Standard shipping charge <input value={s.shippingCharge||""} onChange={e=>setS({...s,shippingCharge:e.target.value})}/></label><button className="btn primary" onClick={async()=>{await api("/admin/settings",{method:"PUT",body:JSON.stringify(s)});alert("Settings saved")}}>SAVE SETTINGS</button><p className="muted">Payment credentials, SMTP and WhatsApp credentials belong in the server .env file, not the browser.</p></div>}
function BrandIntro(){
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
        .enytm-intro::before{content:"";position:absolute;width:min(70vw,520px);height:min(70vw,520px);border:1px solid rgba(245,240,232,.12);border-radius:50%;animation:enytmRing 2.8s ease-out both}
        .enytm-intro-logo{position:relative;font-family:Arial,Helvetica,sans-serif;font-size:clamp(44px,10vw,88px);font-weight:800;letter-spacing:.16em;margin-left:.16em;opacity:0;animation:enytmLogoIn .9s cubic-bezier(.2,.75,.25,1) .25s forwards}
        .enytm-intro-logo span{font-size:.22em;vertical-align:top;letter-spacing:0;margin-left:3px}
        .enytm-intro-line{width:0;height:1px;background:#c6b79a;margin:24px 0 18px;animation:enytmLineIn .8s ease 1s forwards}
        .enytm-intro-tag{font:10px/1.5 Arial,Helvetica,sans-serif;letter-spacing:.34em;margin-left:.34em;color:#c6b79a;opacity:0;animation:enytmTagIn .7s ease 1.2s forwards}
        @keyframes enytmLogoIn{from{opacity:0;transform:translateY(14px);filter:blur(6px)}to{opacity:1;transform:translateY(0);filter:blur(0)}}
        @keyframes enytmLineIn{to{width:90px}}
        @keyframes enytmTagIn{to{opacity:1}}
        @keyframes enytmRing{from{transform:scale(.8);opacity:0}40%{opacity:1}to{transform:scale(1.12);opacity:.35}}
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
.product-stock-message{font-size:11px;letter-spacing:.12em;font-weight:700;margin:10px 0 14px}.product-stock-message.low{color:#a77936}.product-stock-message.out{color:#a33}
.quick-add:disabled,.add-detail:disabled{opacity:.5;cursor:not-allowed}
.admin-delivery-editor{margin:20px 0}.admin-delivery-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:18px 0}.admin-delivery-form label{display:flex;flex-direction:column;gap:7px;font-size:10px;letter-spacing:.1em;font-weight:700}.admin-delivery-form input,.admin-delivery-form select{width:100%;min-width:0;padding:12px;border:1px solid #d7d2ca;background:#fff;color:#171717;font:inherit;letter-spacing:normal}.admin-delivery-editor .admin-save-message{margin-top:12px}.admin-delivery-editor button{margin-top:4px}
@media(max-width:650px){.admin-delivery-form{grid-template-columns:1fr}}
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
        <main className="empty" style={{minHeight:"60vh",display:"grid",placeItems:"center",textAlign:"center",padding:"80px 20px"}}>
          <div>
            <p className="eyebrow">SOMETHING WENT WRONG</p>
            <h1 style={{fontSize:"clamp(28px,4vw,48px)",margin:"15px 0"}}>PAGE COULD NOT LOAD</h1>
            <p style={{color:"#888",maxWidth:440,margin:"0 auto 25px"}}>{this.state.error?.message || "An unexpected error occurred while rendering this page."}</p>
            <a className="btn primary" href="/" onClick={()=>this.setState({hasError:false})}>RETURN HOME</a>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

function ScrollToTopOnRouteChange(){const route=useLocation();useEffect(()=>{window.scrollTo({top:0,left:0,behavior:"auto"});},[route.pathname,route.search]);return null;}
function App() {
  const [search, setSearch] = useState(false);
  const route = useLocation();
  const immersive = route.pathname === "/" || route.pathname === "/launch";

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
          <Route path="/" element={<PrelaunchHome />} />
          <Route path="/launch" element={<LaunchCountdown />} />
          <Route path="/collection" element={<Home />} />
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
