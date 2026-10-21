import React, {useEffect,useMemo,useRef,useState} from "react";
import {Link,Route,Routes,useLocation,useNavigate} from "react-router-dom";
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
  CalendarDays
} from "lucide-react";
import {useCart} from "./context/CartContext";
import {api} from "./api";
import {fallbackProducts} from "./data/products";
import "./index.css";

function useProducts(){const [p,setP]=useState(fallbackProducts);useEffect(()=>{api("/products").then(setP).catch(()=>{});},[]);return p}
function Navbar({onSearch}){const{cartCount,wishlist}=useCart();const[open,setOpen]=useState(false);const token=localStorage.getItem("enytm-token");return <><header className="nav"><button className="icon-btn mobile-menu" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button><Link className="logo" to="/">ENYTM<span>™</span></Link><nav className={open?"nav-links mobile-open":"nav-links"}><Link to="/shop" onClick={()=>setOpen(false)}>SHOP</Link><Link to="/shop?category=Oversized" onClick={()=>setOpen(false)}>OVERSIZED</Link><Link to="/shop?category=Polos" onClick={()=>setOpen(false)}>POLOS</Link><Link to="/about" onClick={()=>setOpen(false)}>ABOUT</Link></nav><div className="nav-actions"><button className="icon-btn" onClick={onSearch}><Search/></button><Link className="icon-btn badge-icon" to="/wishlist"><Heart/><b>{token?wishlist.length:0}</b></Link><Link className="icon-btn badge-icon" to="/cart"><ShoppingBag/>{token&&cartCount>0&&<b>{cartCount}</b>}</Link><Link className="icon-btn wallet-nav-link" aria-label="Wallet" title="Wallet" to={token?"/wallet":"/login"}><span style={{fontSize:10,fontWeight:800}}>₹</span></Link><Link className="icon-btn" to={token?"/account":"/login"}><User/></Link></div></header><div className="announcement"><div className="announcement-ticker-track"><span>PRE-ORDER IS LIVE (ADVANCE PAYMENT ONLY) <b>✳</b></span><span>COD AVAILABLE ON REGULAR LAUNCH <b>✳</b></span><span>PRE-ORDER IS LIVE (ADVANCE PAYMENT ONLY) <b>✳</b></span><span>COD AVAILABLE ON REGULAR LAUNCH <b>✳</b></span></div></div></>}
function ProductCard({product}){const{addToCart,wishlist,toggleWishlist}=useCart();const liked=wishlist.includes(product.id);const[added,setAdded]=useState(false);const stock=Math.max(0,Number(product.stock||0));const outOfStock=stock<=0;const add=()=>{if(outOfStock)return;addToCart(product,"M");setAdded(true);setTimeout(()=>setAdded(false),1800)};const hasDiscount=Number(product.oldPrice)>Number(product.price);return <article className="product-card"><div className="product-image">{outOfStock?<span className="product-stock-badge out">OUT OF STOCK</span>:stock<6?<span className="product-stock-badge low">{stock===1?"ONLY 1 LEFT":`ONLY ${stock} LEFT`}</span>:null}{product.badge&&!outOfStock&&<span className="product-badge">{product.badge}</span>}<button className={`heart ${liked?"liked":""}`} onClick={()=>toggleWishlist(product.id)}><Heart fill={liked?"currentColor":"none"}/></button><Link to={`/product/${product.id}`}>
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
    <header className="prelaunch-top"><Link className="prelaunch-logo" to="/">ENYTM<sup>™</sup></Link><span className="prelaunch-top-note">MORE THAN A MOMENT<br/>PUNE, INDIA · EST. 2026</span></header>
    <section className="prelaunch-hero"><div className="prelaunch-copy"><p className="prelaunch-kicker">A NEW EVERYDAY IS COMING · 001</p><h1 className="prelaunch-title">NOT JUST<br/>CLOTHING.<br/><em>A FEELING.</em></h1><p className="prelaunch-description">Considered fits. Better-feeling fabrics. An everyday uniform made to feel like you. Our first drop is almost here.</p><Link className="prelaunch-explore" to="/launch">EXPLORE THE DROP <ArrowRight size={18}/></Link></div><div className="prelaunch-bottom"><span>ENYTM APPARELS / FIRST DROP</span><span>THE COUNTDOWN STARTS HERE ↗</span></div></section><section className="home-faq" id="faq"><div className="home-faq-heading"><p className="eyebrow">06 / GOOD TO KNOW</p><h2>The useful<br/><em>details.</em></h2><p>Everything you need to know before making ENYTM part of your everyday.</p></div><div className="home-faq-list"><details><summary>What is the tee made from?<span aria-hidden="true">＋</span></summary><p>Each product listing includes its fabric and GSM details. Check the individual product page for the exact composition and specifications of the piece you choose.</p></details><details><summary>How should I care for it?<span aria-hidden="true">＋</span></summary><p>For best results, follow the care label on your garment. As a general guide, wash with similar colours, turn printed garments inside out, use a gentle cycle and avoid high heat when drying.</p></details><details><summary>Where do you ship?<span aria-hidden="true">＋</span></summary><p>We aim to deliver across serviceable locations in India. Enter your delivery pincode at checkout to confirm service availability.</p></details><details><summary>How does pre-order payment work?<span aria-hidden="true">＋</span></summary><p>For eligible pre-launch offers, pay 30% online to reserve your order. The remaining 70% must be paid online before dispatch. Cash on Delivery is not available for pre-orders.</p></details><details><summary>When will my pre-order be dispatched?<span aria-hidden="true">＋</span></summary><p>Pre-orders are scheduled for dispatch after the 8 November 2026 launch and after the remaining balance has been paid in full. We’ll share order updates through the contact details provided at checkout.</p></details><div className="home-faq-footer"><span>STILL CURIOUS?</span><Link to="/about">GET TO KNOW US <ArrowRight size={15}/></Link></div></div></section>
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
  return <main className="enytm-countdown-page"><style>{`.enytm-countdown-page a:focus-visible{outline:2px solid #c8b69a;outline-offset:5px}`}</style><header className="countdown-top"><Link className="prelaunch-logo" to="/">ENYTM<sup>™</sup></Link><Link className="countdown-back" to="/">← BACK TO INTRO</Link></header><section className="countdown-main"><div className="countdown-inner"><p className="countdown-overline">ENYTM APPARELS · DROP 001</p><h1 className="countdown-title">THE WAIT<br/>IS <em>ALMOST OVER.</em></h1><p className="countdown-subtitle">Your new everyday arrives 8 November 2026.</p>{time.live?<><p className="countdown-overline">WE ARE LIVE</p><Link className="countdown-shop" to="/shop">EXPLORE THE COLLECTION <ArrowRight size={16}/></Link></>:<><div className="countdown-grid" role="timer" aria-label="Countdown until ENYTM launch">{units.map(([key,label])=><div className="countdown-unit" key={key}><div className="countdown-number">{String(time[key]).padStart(2,"0")}</div><div className="countdown-label">{label}</div></div>)}</div><p className="countdown-launch-date">LAUNCHING · 08 NOVEMBER 2026 · 12:00 AM IST</p></>}</div></section>{!time.live&&<section className="countdown-preorder"><div className="countdown-offer-copy"><p className="countdown-overline">DROP 001 · PRE-LAUNCH OFFER</p><h2>YOUR FIRST ENYTM.<br/><em>RESERVE THE DROP.</em></h2><p>Reserve selected styles with 30% advance. Balance due online before dispatch.</p><div className="countdown-offer-points"><span>30% ADVANCE</span><span>70% BEFORE DISPATCH</span><span>NO COD</span></div><Link className="countdown-shop countdown-preorder-cta" to="/shop">SHOP THE PRE-LAUNCH OFFER <ArrowRight size={17}/></Link></div><div className="countdown-category-grid">{categories.map(category=><Link className="countdown-category-card" to={`/shop?category=${category.query}`} key={category.number}><div className="countdown-category-image"><img src={category.image} alt={category.name} loading="lazy"/><span className="countdown-category-number">{category.number}</span><span className="countdown-category-arrow">↗</span></div><div className="countdown-category-info"><div><strong>{category.name}</strong><span>{category.detail}</span></div><span className="countdown-category-link">EXPLORE</span></div></Link>)}</div></section>}<footer className="countdown-footer"><span>MORE THAN A MOMENT</span><span>ENYTM.CO.IN · DROP 001</span></footer></main>
}

function Home(){const products=useProducts();const categoryImage=(i)=>((products[i%Math.max(products.length,1)]||products[0]||{}).image)||"https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80";return <main className="home-black-label home-v3"><section className="hero hero-v2"><video className="hero-video" autoPlay muted loop playsInline poster="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=2200&q=90"><source src="/enytm-hero.mp4" type="video/mp4"/></video><div className="hero-overlay"/><div className="hero-edition"><span className="hero-edition-dot"/> ENYTM / THE BLACK LABEL <span>EST. 2026</span></div><div className="hero-content hero-content-v2"><p className="eyebrow hero-kicker">DROP 001&nbsp; / &nbsp;EVERYDAY, ELEVATED</p><h1>YOUR<br/>EVERYDAY.<br/><em>REDEFINED.</em></h1><p className="hero-subline">Quiet confidence. Considered details.<br/>Clothing that feels like you.</p><Link className="btn light hero-cta" to="/shop">SHOP THE COLLECTION <ArrowRight size={18}/></Link><span className="hero-caption">DESIGNED TO LIVE IN.</span></div><div className="hero-index"><span>01</span><i/><span>04</span></div><div className="scroll"><span>SCROLL</span> ↓</div></section><div className="blackline-marquee" aria-label="ENYTM brand statement"><div className="blackline-marquee-track"><span>MORE THAN A MOMENT</span><b>✳</b><span>FABRIC FIRST</span><b>✳</b><span>EVERYDAY, ELEVATED</span><b>✳</b><span>MORE THAN A MOMENT</span><b>✳</b><span>FABRIC FIRST</span><b>✳</b><span>EVERYDAY, ELEVATED</span></div></div><section className="manifesto manifesto-black-label manifesto-v2"><div className="manifesto-number">ENYTM™ — 001</div><p className="eyebrow">01 / A DIFFERENT KIND OF ESSENTIAL</p><h2>NOT MADE<br/>TO <span>STAND OUT.</span><br/>MADE TO <em>STAY.</em></h2><div className="manifesto-bottom"><p>Considered fits. Better-feeling fabrics. Pieces that earn their place in your everyday rotation.</p><div className="manifesto-signature">ENYTM™ <span>MORE THAN A MOMENT</span></div></div></section><section className="craft-strip craft-strip-v2" aria-label="Our design principles"><div><span>01 / MATERIAL</span><h3>FEEL THE WEIGHT.</h3><p>Texture you notice. Quality you feel.</p></div><div><span>02 / SILHOUETTE</span><h3>MOVE YOUR WAY.</h3><p>Relaxed proportions, considered lines.</p></div><div><span>03 / LONGEVITY</span><h3>WEAR IT OFTEN.</h3><p>Made for repeat days, not one-off moments.</p></div></section><section className="section home-arrivals home-arrivals-v2"><div className="drop-heading"><div><p className="eyebrow">02 / THE CURRENT ROTATION</p><h2>THE DROP<span className="heading-period"> 001.</span></h2><p className="drop-subtitle">A small edit. A strong point of view.</p></div><Link className="drop-circle-link" to="/shop" aria-label="Explore all products"><span>VIEW<br/>ALL</span><ArrowRight size={22}/></Link></div><div className="product-grid">{products.slice(0,4).map(p=><ProductCard key={p.id} product={p}/>)}</div><div className="arrivals-footnote"><span>DESIGNED FOR YOUR EVERYDAY</span><span>ENYTM / 001</span></div></section><section className="feature-editorial-v2"><div className="feature-editorial-image"><img src="/enytm-hero.jpg" alt="ENYTM streetwear editorial"/><span className="image-index">FIG. 01 — THE EVERYDAY UNIFORM</span><span className="image-vertical-label">FABRIC / FORM / FUNCTION</span></div><div className="feature-editorial-copy"><p className="eyebrow">03 / THE ENYTM APPROACH</p><span className="feature-big-number">01</span><h2>LESS,<br/><em>BETTER.</em></h2><p>We start with the fabric. Refine the fit. Strip away what doesn't belong. The result is an everyday uniform that doesn't need to shout.</p><Link className="btn outline" to="/about">GET TO KNOW ENYTM <ArrowRight size={18}/></Link><div className="feature-specs"><span><b>01</b> FABRIC FIRST</span><span><b>02</b> THOUGHTFUL FIT</span><span><b>03</b> CLEAN FINISH</span></div></div></section><section className="category-editorial category-editorial-v2"><div className="category-editorial-head"><div><p className="eyebrow">04 / BUILD YOUR ROTATION</p><h2>WHAT'S YOUR<br/><span>EVERYDAY?</span></h2></div><p>Choose a silhouette.<br/>Make it your own.</p></div><div className="categories">{["Oversized","Polos","Hoodies"].map((c,i)=><Link key={c} to={`/shop?category=${c}`} className={`category-tile category-tile-v2 category-v2-${i+1}`}><img src={categoryImage(i)} alt={`${c} collection`}/><div><span>0{i+1} / CATEGORY</span><h3>{c.toUpperCase()}</h3><ArrowRight/></div></Link>)}</div></section><section className="quote quote-black-label quote-v2"><div className="quote-mark">“</div><p className="eyebrow">THE THOUGHT BEHIND THE THREAD</p><h2>BUILT FOR TODAY.<br/><em>BEYOND THE MOMENT.</em></h2><p className="quote-brand">ENYTM APPARELS <span>™</span></p><Link to="/shop" className="quote-shop-link">FIND YOUR PIECE <ArrowRight size={15}/></Link></section><section className="home-faq" id="faq"><div className="home-faq-heading"><p className="eyebrow">06 / GOOD TO KNOW</p><h2>The useful<br/><em>details.</em></h2><p>Everything you need to know before making ENYTM part of your everyday.</p></div><div className="home-faq-list"><details><summary>What is the tee made from?<span aria-hidden="true">＋</span></summary><p>Each product listing includes its fabric and GSM details. Check the individual product page for the exact composition and specifications of the piece you choose.</p></details><details><summary>How should I care for it?<span aria-hidden="true">＋</span></summary><p>For best results, follow the care label on your garment. As a general guide, wash with similar colours, turn printed garments inside out, use a gentle cycle and avoid high heat when drying.</p></details><details><summary>Where do you ship?<span aria-hidden="true">＋</span></summary><p>We aim to deliver across serviceable locations in India. Enter your delivery pincode at checkout to confirm service availability.</p></details><details><summary>How does pre-order payment work?<span aria-hidden="true">＋</span></summary><p>For eligible pre-launch offers, pay 30% online to reserve your order. The remaining 70% must be paid online before dispatch. Cash on Delivery is not available for pre-orders.</p></details><details><summary>When will my pre-order be dispatched?<span aria-hidden="true">＋</span></summary><p>Pre-orders are scheduled for dispatch after the 8 November 2026 launch and after the remaining balance has been paid in full. We’ll share order updates through the contact details provided at checkout.</p></details><div className="home-faq-footer"><span>STILL CURIOUS?</span><Link to="/about">GET TO KNOW US <ArrowRight size={15}/></Link></div></div></section></main>}
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
 const products=useProducts();
 const id=Number(useLocation().pathname.split("/").pop());
 const product=products.find(p=>p.id===id)||products[0];
 const{addToCart,wishlist,toggleWishlist}=useCart();
 const[size,setSize]=useState("M");
 const[qty,setQty]=useState(1);
 const[added,setAdded]=useState(false);
 const[active,setActive]=useState(0);
 const[videoBlocked,setVideoBlocked]=useState(false);
 const liked=wishlist.includes(product.id);
 const stock=Math.max(0,Number(product.stock||0));
 const outOfStock=stock<=0;
 const videoRef=useRef(null);
 const gallery=[
  {type:"image",src:product.image,label:"01 / FRONT"},
  product.image2&&{type:"image",src:product.image2,label:"02 / BACK"},
  product.image3&&{type:"image",src:product.image3,label:"03 / FABRIC"},
  product.modelFront&&{type:"image",src:product.modelFront,label:"04 / MODEL FRONT"},
  product.modelBack&&{type:"image",src:product.modelBack,label:"05 / MODEL BACK"},
  product.video&&{type:"video",src:product.video,poster:product.image,label:"06 / MOTION"}
 ].filter(Boolean);
 const safeGallery=gallery.length?gallery:[{type:"image",src:product.image,label:"01 / FRONT"}];
 const add=()=>{if(outOfStock)return;if(qty>stock){setQty(stock);return}for(let i=0;i<qty;i++)addToCart(product,size);setAdded(true);setTimeout(()=>setAdded(false),1800)};
 const activeMedia=safeGallery[Math.min(active,safeGallery.length-1)];
 const startVideo=()=>{
  const video=videoRef.current;
  if(!video) return;
  video.muted=true;
  video.defaultMuted=true;
  video.playsInline=true;
  video.currentTime=0;
  const promise=video.play();
  if(promise?.then) promise.then(()=>setVideoBlocked(false)).catch(()=>setVideoBlocked(true));
 };
 useEffect(()=>{
  setVideoBlocked(false);
  if(activeMedia.type!=="video") return;
  const video=videoRef.current;
  if(!video) return;
  video.muted=true;
  video.defaultMuted=true;
  video.playsInline=true;
  video.currentTime=0;
  const tryPlay=()=>{
   const promise=video.play();
   if(promise?.then) promise.then(()=>setVideoBlocked(false)).catch(()=>setVideoBlocked(true));
  };
  video.addEventListener("loadedmetadata",tryPlay);
  video.addEventListener("canplay",tryPlay);
  const retry=setTimeout(tryPlay,700);
  tryPlay();
  return()=>{
   clearTimeout(retry);
   video.removeEventListener("loadedmetadata",tryPlay);
   video.removeEventListener("canplay",tryPlay);
  };
 },[active,activeMedia.type,activeMedia.src]);
 return <main className="product-page">
  <section className="product-gallery-wrap">
   <div className="gallery-toolbar"><span>ENYTM / PRODUCT 0{product.id}</span><span>{safeGallery.length} MEDIA</span></div>
   <div className="product-gallery-shell">
    <div className="product-main-media">
      {activeMedia.type==="video"?<div className="product-video-frame">
       <video ref={videoRef} key={activeMedia.src} autoPlay muted defaultMuted playsInline loop preload="auto" poster={activeMedia.poster} onLoadedData={startVideo} onCanPlay={startVideo} onError={()=>setVideoBlocked(true)} onClick={startVideo}>
        <source src={activeMedia.src} type="video/mp4"/>
       </video>
       {videoBlocked&&<button className="video-play-button" onClick={startVideo} aria-label="Play product video"><Play size={28} fill="currentColor"/></button>}
      </div>:<img src={activeMedia.src} alt={`${product.name} ${activeMedia.label}`}/>}<span className="main-media-label">{activeMedia.label}</span>
    </div>
    <div className="product-thumbs">
      {safeGallery.map((item,i)=><button key={item.label} className={`product-thumb ${active===i?"active":""}`} onClick={()=>setActive(i)} aria-label={`View ${item.label}`}>
       {item.type==="video"?<><video muted playsInline preload="metadata" poster={item.poster}><source src={item.src} type="video/mp4"/></video><span className="thumb-play"><Play size={15} fill="currentColor"/></span></>:<img src={item.src} alt={`${product.name} ${item.label}`}/>}<span>{item.label}</span>
      </button>)}
    </div>
   </div>
  </section>
  <section className="product-details">
   <div className="product-detail-top"><p className="eyebrow">{product.category.toUpperCase()} / ENYTM</p><button className={`detail-wish ${liked?"liked":""}`} onClick={()=>toggleWishlist(product.id)}><Heart size={19} fill={liked?"currentColor":"none"}/><span>{liked?"SAVED":"SAVE"}</span></button></div>
   <h1>{product.name}</h1>
   <div className="rating"><span className="stars">★★★★★</span><span>4.9</span><a href="#reviews">28 reviews</a></div>
   <div className="price-row"><strong>₹{Number(product.price).toLocaleString("en-IN")}</strong>{product.oldPrice&&<del>₹{Number(product.oldPrice).toLocaleString("en-IN")}</del>}<span className="price-note">INCLUSIVE OF TAXES</span></div>
   <p className={`product-stock-message ${outOfStock?"out":"low"}`}>{outOfStock?"OUT OF STOCK — THIS ITEM IS CURRENTLY UNAVAILABLE.":stock<6?`HURRY — ONLY ${stock} LEFT IN STOCK.`:"IN STOCK · READY TO ORDER"}</p>
   <p className="detail-copy">{product.description}</p>
   <div className="detail-highlights"><span>{product.fabric?.match(/\d+\s*GSM/i)?.[0]||"PREMIUM"}</span><span>PREMIUM COTTON</span><span>OVERSIZED FIT</span></div>
   <div className="spec"><span>FABRIC</span><b>{product.fabric}</b></div>
   <div className="option"><div className="option-head"><span>SELECT SIZE</span><Link to="/size-guide">SIZE GUIDE ↗</Link></div><div className="sizes">{(product.sizes||["S","M","L","XL","XXL"]).map(s=><button key={s} className={size===s?"selected":""} onClick={()=>setSize(s)}>{s}</button>)}</div></div>
   <div className="purchase-line">
    <div className="quantity-block">
      <span>QUANTITY</span>
      <div className="quantity-control">
        <button type="button" onClick={()=>setQty(Math.max(1,qty-1))} aria-label="Decrease quantity" disabled={outOfStock||qty<=1}><Minus size={15}/></button>
        <strong>{qty}</strong>
        <button type="button" onClick={()=>setQty(Math.min(stock,qty+1))} aria-label="Increase quantity" disabled={outOfStock||qty>=stock}><Plus size={15}/></button>
      </div>
    </div>
    <button className="btn primary add-detail" onClick={add} disabled={outOfStock}>{outOfStock?<>OUT OF STOCK</>:added?<><CheckCircle size={18}/> ADDED TO BAG</>:<>ADD TO BAG <ShoppingBag size={18}/></>}</button>
   </div>
   {added&&<div className="detail-added"><CheckCircle size={15}/><span>Added to your bag</span><Link to="/cart">VIEW BAG →</Link></div>}
   <div className="perks"><div><Truck/><span><b>FREE SHIPPING</b> ON ORDERS ₹1,999+</span></div><div><ShieldCheck/><span><b>SECURE PAYMENT</b> POWERED BY RAZORPAY</span></div><div><RotateCcw/><span><b>EASY RETURNS</b> WITHIN 48 HOURS</span></div></div>
   <div className="product-accordion"><details open><summary>PRODUCT DETAILS <span>+</span></summary><p>Designed with a relaxed oversized silhouette, clean finishing and a premium hand-feel for everyday wear.</p></details><details><summary>SHIPPING & RETURNS <span>+</span></summary><p>Free shipping applies to eligible orders above ₹1,999. Returns are accepted within 48 HOURS subject to product condition.</p></details><details id="reviews"><summary>REVIEWS <span>4.9 / 5</span></summary><p>28 verified-style review entries can be connected to your live review system here.</p></details></div>
  </section>
 </main>
}
function Auth({register=false}){
 const nav=useNavigate();
 const[form,setForm]=useState({name:"",email:"",phone:"",password:"",whatsappOptIn:false,emailOptIn:true});
 const[otp,setOtp]=useState({email:""});
 const[challengeId,setChallengeId]=useState("");
 const[step,setStep]=useState(register?"details":"login");
 useEffect(()=>{setStep(register?"details":"login");setError("");setSending(false);setSeconds(0)},[register]);
 const[error,setError]=useState("");
 const[sending,setSending]=useState(false);
 const[seconds,setSeconds]=useState(0);
 const[showPassword,setShowPassword]=useState(false);
 const[forgotMode,setForgotMode]=useState(false);
 const[forgotMessage,setForgotMessage]=useState("");
 useEffect(()=>{if(!seconds)return;const t=setInterval(()=>setSeconds(v=>v-1),1000);return()=>clearInterval(t)},[seconds]);
 const update=(key,value)=>setForm(f=>({...f,[key]:value}));
 const sendOtp=async e=>{e.preventDefault();setError("");setSending(true);try{const data=await api("/auth/register/send-otp",{method:"POST",body:JSON.stringify(form)});setChallengeId(data.challengeId);setStep("otp");setSeconds(60)}catch(err){setError(err.message||"Could not send OTP.")}finally{setSending(false)}};
 const verifyAndCreate=async e=>{e.preventDefault();setError("");setSending(true);try{const data=await api("/auth/register/verify-otp",{method:"POST",body:JSON.stringify({emailOtp:otp.email,challengeId,whatsappOptIn:form.whatsappOptIn,emailOptIn:form.emailOptIn})});localStorage.setItem("enytm-token",data.token);localStorage.setItem("enytm-user",JSON.stringify(data.user));const redirect=sessionStorage.getItem("enytm-after-login")||"/account";sessionStorage.removeItem("enytm-after-login");nav(redirect)}catch(err){setError(err.message||"Verification failed.")}finally{setSending(false)}};
 const requestPasswordReset=async e=>{e.preventDefault();setError("");setForgotMessage("");setSending(true);try{const data=await api("/auth/password-reset/confirm", {
  method: "POST",
  body: JSON.stringify({
    challengeId,
    otp,
    password: newPassword,
  }),
});setForgotMessage(data?.message||"If an account exists for this email, password reset instructions will be sent.")}catch(err){setError(err.message||"Could not request a password reset. Please try again.")}finally{setSending(false)}};
 const login=async e=>{e.preventDefault();setError("");setSending(true);try{const data=await api("/auth/login",{method:"POST",body:JSON.stringify({email:String(form.email).trim().toLowerCase(),password:form.password})});if(!data?.token)throw new Error("Login succeeded but no session token was returned.");localStorage.setItem("enytm-token",data.token);localStorage.setItem("enytm-user",JSON.stringify(data.user||{}));const redirect=sessionStorage.getItem("enytm-after-login")||"/account";sessionStorage.removeItem("enytm-after-login");nav(redirect,{replace:true})}catch(err){setError(err.message||"Login failed. Please try again.")}finally{setSending(false)}};
 return <main className="auth-page"><div className="auth-card"><p className="eyebrow">ENYTM MEMBERS</p><h1>{register?(step==="otp"?"VERIFY YOUR DETAILS":"CREATE ACCOUNT"):"WELCOME BACK"}</h1><p className="muted">{register?(step==="otp"?"Enter the 6-digit verification code sent to your email address.":"Create an account for faster checkout, order history and saved products."):"Login to continue to your ENYTM account."}</p>
 {error&&<div className="error auth-error">{error}</div>}
 {register&&step!=="otp"&&<form onSubmit={sendOtp}><input required placeholder="Full name" value={form.name} onChange={e=>update("name",e.target.value)}/><input required type="email" placeholder="Email address" value={form.email} onChange={e=>update("email",e.target.value)}/><input required inputMode="tel" placeholder="Mobile number" value={form.phone} onChange={e=>update("phone",e.target.value.replace(/\D/g,"").slice(-10))}/><input required minLength="6" type="password" placeholder="Password" value={form.password} onChange={e=>update("password",e.target.value)}/><label className="check"><input type="checkbox" checked={form.whatsappOptIn} onChange={e=>update("whatsappOptIn",e.target.checked)}/> Receive order updates on WhatsApp.</label><label className="check"><input type="checkbox" checked={form.emailOptIn} onChange={e=>update("emailOptIn",e.target.checked)}/> Receive useful ENYTM email updates.</label><button disabled={sending} className="btn primary full">{sending?"SENDING OTP...":"CONTINUE WITH OTP"} <ArrowRight size={17}/></button></form>}
 {register&&step==="otp"&&<form onSubmit={verifyAndCreate}><div className="otp-note">Enter the 6-digit code sent to your email. Your account will be created after the code is verified.</div><input required inputMode="numeric" maxLength="6" pattern="[0-9]{6}" placeholder="Email OTP — 6 digits" value={otp.email} onChange={e=>setOtp(o=>({...o,email:e.target.value.replace(/\D/g,"").slice(0,6)}))}/><button disabled={sending} className="btn primary full">{sending?"VERIFYING...":"VERIFY & CREATE ACCOUNT"} <CheckCircle size={17}/></button><button type="button" disabled={sending||seconds>0} className="btn outline full" onClick={sendOtp}>{seconds?`RESEND OTP IN ${seconds}s`:"RESEND OTP"}</button><button type="button" className="text-link" onClick={()=>{setStep("details");setError("")}}>← Change email or mobile number</button></form>}
 {!register&&!forgotMode&&<form onSubmit={login}><input required type="email" autoComplete="email" placeholder="Email address" value={form.email} onChange={e=>update("email",e.target.value)}/><div className="password-field" style={{position:"relative",display:"flex",alignItems:"center"}}><input style={{width:"100%",paddingRight:48}} required minLength="6" type={showPassword?"text":"password"} autoComplete="current-password" placeholder="Password" value={form.password} onChange={e=>update("password",e.target.value)}/><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?"Hide password":"Show password"} title={showPassword?"Hide password":"Show password"} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"transparent",border:0,color:"inherit",cursor:"pointer",padding:6}}>{showPassword?<EyeOff size={20}/>:<Eye size={20}/>}</button></div><div style={{display:"flex",justifyContent:"flex-end",margin:"-2px 0 14px"}}><button type="button" className="text-link" onClick={()=>{setForgotMode(true);setError("");setForgotMessage("")}}>Forgot password?</button></div><button disabled={sending} className="btn primary full">{sending?"LOGGING IN...":"LOGIN"} <ArrowRight size={17}/></button></form>}
 {!register&&forgotMode&&<form onSubmit={requestPasswordReset}><p className="muted">Enter your registered email address to request password reset instructions.</p><input required type="email" autoComplete="email" placeholder="Email address" value={form.email} onChange={e=>update("email",e.target.value)}/>{forgotMessage&&<div className="lookup-message success">{forgotMessage}</div>}<button disabled={sending} className="btn primary full">{sending?"SENDING...":"SEND RESET LINK"} <ArrowRight size={17}/></button><button type="button" className="text-link" onClick={()=>{setForgotMode(false);setError("");setForgotMessage("")}}>← Back to login</button></form>}
 {register?<p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>:<p className="auth-switch">New to ENYTM? <Link to="/register">Create an account</Link></p>}</div></main>
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
 const{cart,subtotal,shipping,total,clearCart}=useCart();
 const nav=useNavigate();
 const[user,setUser]=useState(null);
 const[loading,setLoading]=useState(true);
 const[form,setForm]=useState({name:"",phone:"",address:"",city:"",state:"",pincode:""});
 const[error,setError]=useState("");
 const[couponCode,setCouponCode]=useState("");
 const[appliedCoupon,setAppliedCoupon]=useState(null);
 const[couponBusy,setCouponBusy]=useState(false);
 const[finalTotal,setFinalTotal]=useState(total);
 useEffect(()=>{let alive=true;(async()=>{if(!localStorage.getItem("enytm-token")){sessionStorage.setItem("enytm-after-login","/checkout");nav("/login");return}try{const u=await api("/auth/me");if(!alive)return;setUser(u);const a=Array.isArray(u.addresses)?u.addresses.find(x=>x.isDefault)||u.addresses[0]:u.address;setForm({name:a?.name||u.name||"",phone:a?.phone||u.phone||"",address:a?.address||"",city:a?.city||"",state:a?.state||"",pincode:a?.pincode||""})}catch(e){if(alive)setError(e.message||"Could not load your account.")}finally{if(alive)setLoading(false)}})();return()=>{alive=false}},[nav]);
 useEffect(()=>{setFinalTotal(Math.max(0,total-Number(appliedCoupon?.discount||0)))},[total,appliedCoupon]);
 const applyCoupon=async()=>{setCouponBusy(true);setError("");try{const result=await api("/coupons/validate",{method:"POST",body:JSON.stringify({code:couponCode,items:cart})});setAppliedCoupon(result);setCouponCode(result.code);setError("");}catch(e){setAppliedCoupon(null);setError(e.message||"Could not apply coupon.")}finally{setCouponBusy(false)}};
 const removeCoupon=()=>{setAppliedCoupon(null);setCouponCode("");setError("")};
 const pay=async e=>{e.preventDefault();setError("");try{const data=await api("/checkout/order",{method:"POST",body:JSON.stringify({items:cart,shippingAddress:form,couponCode:appliedCoupon?.code||""})});if(!window.Razorpay)throw new Error("Razorpay Checkout could not load. Check your internet connection.");const digits=String(form.phone||"").replace(/\\D/g,"").slice(-10);if(digits.length!==10)throw new Error("Please enter a valid 10-digit mobile number.");const rzp=new window.Razorpay({key:data.keyId,amount:data.amount,currency:data.currency,name:"ENYTM APPARELS",description:"ENYTM order",order_id:data.razorpayOrderId,prefill:{name:form.name,email:user?.email,contact:digits},theme:{color:"#111111"},modal:{ondismiss:()=>{}},handler:async response=>{await api("/checkout/verify",{method:"POST",body:JSON.stringify({...response,orderId:data.orderId})});clearCart();nav(`/order-success/${data.orderId}`)}});rzp.on("payment.failed",r=>setError(r.error?.description||"Payment failed. Please try again."));rzp.open()}catch(err){setError(err.message||"Could not start payment.")}};
 if(loading)return <main className="empty loading-page"><p className="eyebrow">SECURE CHECKOUT</p><h1>LOADING CHECKOUT...</h1></main>;
 if(!user)return <main className="empty"><p className="eyebrow">SECURE CHECKOUT</p><h1>CHECKOUT UNAVAILABLE</h1>{error&&<div className="error">{error}</div>}<Link className="btn primary" to="/login">LOGIN AGAIN</Link></main>;
 return <main className="checkout-page"><div className="checkout-head"><p className="eyebrow">SECURE CHECKOUT</p><h1>COMPLETE YOUR ORDER</h1></div><div className="checkout-layout"><form className="checkout-form" onSubmit={pay}><h2>1. DELIVERY DETAILS</h2><div className="form-grid"><AddressLookupFields form={form} setForm={setForm} setError={setError}/></div><h2>2. COUPON CODE</h2><div className="checkout-coupon-row"><input aria-label="Coupon code" placeholder="Enter coupon code" value={couponCode} onChange={e=>setCouponCode(e.target.value.toUpperCase())} disabled={!!appliedCoupon}/>{appliedCoupon?<button type="button" className="btn outline" onClick={removeCoupon}>REMOVE</button>:<button type="button" className="btn outline" disabled={couponBusy||!couponCode.trim()} onClick={applyCoupon}>{couponBusy?"CHECKING...":"APPLY"}</button>}</div>{appliedCoupon&&<p className="coupon-success">✓ {appliedCoupon.code} applied — you save ₹{Number(appliedCoupon.discount).toLocaleString("en-IN")}</p>}<h2>3. PAYMENT</h2><div className="payment-box"><LockKeyhole/><div><b>Razorpay Secure Checkout</b><p>UPI · Cards · NetBanking · Wallets and available methods</p></div><span>SECURE</span></div>{error&&<div className="error">{error}</div>}<div className="preorder-payment-note"><b>ENYTM PRE-ORDER · LAUNCH 8 NOVEMBER 2026</b><p>Pay 30% now to confirm your pre-order. The remaining 70% must be paid online before dispatch. Cash on delivery is unavailable.</p><div><span>Advance due today (30%)</span><strong>₹{Math.ceil(finalTotal*0.30).toLocaleString("en-IN")}</strong></div><div><span>Balance before dispatch (70%)</span><strong>₹{(finalTotal-Math.ceil(finalTotal*0.30)).toLocaleString("en-IN")}</strong></div></div><button className="btn primary full">PAY ADVANCE ₹{Math.ceil(finalTotal*0.30).toLocaleString("en-IN")} <ArrowRight/></button><p className="tiny">Your payment is processed by Razorpay. ENYTM does not store your card/UPI credentials.</p></form><aside className="summary"><h2>YOUR BAG</h2>{cart.map(i=><div key={i.key} className="mini-item"><img src={i.image}/><span>{i.name}<small>{i.size} × {i.qty}</small></span><b>₹{(i.price*i.qty).toLocaleString("en-IN")}</b></div>)}<hr/><div><span>Subtotal</span><b>₹{subtotal.toLocaleString("en-IN")}</b></div><div><span>Shipping</span><b>{shipping?"₹"+shipping:"FREE"}</b></div>{appliedCoupon&&<div className="coupon-summary-line"><span>Coupon ({appliedCoupon.code})</span><b>−₹{Number(appliedCoupon.discount).toLocaleString("en-IN")}</b></div>}<hr/><div className="total"><span>TOTAL</span><b>₹{finalTotal.toLocaleString("en-IN")}</b></div></aside></div></main>
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
 if(error||!order)return <main className="empty"><p className="eyebrow">ENYTM ORDER</p><h1>ORDER NOT FOUND</h1>{error&&<div className="error">{error}</div>}<Link className="btn primary" to="/account">BACK TO MY ORDERS</Link></main>;
 const steps=[
  ["confirmed","ORDER CONFIRMED","We received your order."],
  ["packed","PACKED","Your order is being prepared."],
  ["shipped","SHIPPED","Your package is on the way."],
  ["out_for_delivery","OUT FOR DELIVERY","Your package is arriving today."],
  ["delivered","DELIVERED","Delivered to your address."]
 ];
 return <main className="order-detail-page">
  <div className="order-detail-top"><div><p className="eyebrow">ENYTM / ORDER DETAILS</p><h1>{order.receipt||order.id}</h1><p className="muted">Placed on {new Date(order.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})}</p></div><Link className="text-link" to="/account">← MY ORDERS</Link></div>
  {message&&<div className="order-action-message">{message}</div>}
  <section className="order-status-card">
   <div className="order-status-head"><div><span className={`order-status-big ${cancelled?"cancelled":""}`}>{cancelled?"ORDER CANCELLED":statusLabel}</span><h2>{cancelled?"This order has been cancelled.":deliveryDate?`Estimated delivery: ${formatDate(deliveryDate)}`:"Delivery date will be updated soon."}</h2></div>{!cancelled&&<Truck size={30}/>}</div>
   {!cancelled?<div className="order-timeline">{steps.map((step,i)=>{const active=i<=statusIndex;return <div className={`timeline-step ${active?"active":""}`} key={step[0]}><div className="timeline-dot">{active?<CheckCircle size={16}/>:<span>{i+1}</span>}</div><div><b>{step[1]}</b><small>{step[2]}</small></div></div>})}</div>:<div className="cancelled-note">If your payment was online, refund status: <b>{String(order.refundStatus||"pending").replace(/_/g," ")}</b>.</div>}
  </section>
  <div className="order-detail-grid">
   <section className="order-detail-main">
    <div className="order-panel"><div className="panel-head"><h2>ITEMS</h2><span>{order.items?.length||0} ITEM{order.items?.length===1?"":"S"}</span></div>{(order.items||[]).map((item,idx)=><article className="order-item-detail" key={`${item.productId}-${idx}`}><img src={item.image} alt={item.name}/><div className="order-item-copy"><h3>{item.name}</h3><p>Size: <b>{item.size||"—"}</b> · Qty: <b>{item.qty}</b></p><p className="muted">₹{Number(item.price).toLocaleString("en-IN")} each</p>{!shipped&&!cancelled&&<button className="order-action-link" onClick={()=>{setSizeItem(item);setSizeValue(item.size||"")}}>CHANGE SIZE</button>}</div><strong>₹{(Number(item.price)*Number(item.qty)).toLocaleString("en-IN")}</strong></article>)}</div>
    {order.tracking?.trackingNumber&&<div className="order-panel tracking-panel"><div className="panel-head"><h2>TRACK SHIPMENT</h2><span>{order.tracking.courier}</span></div><div className="tracking-row"><Package size={22}/><div><b>{order.tracking.trackingNumber}</b><small>Tracking number</small></div>{order.tracking.trackingUrl&&<a className="btn outline" href={order.tracking.trackingUrl} target="_blank" rel="noreferrer">TRACK NOW <ArrowRight size={15}/></a>}</div></div>}
    {!order.tracking?.trackingNumber&&!cancelled&&<div className="order-panel tracking-panel"><div className="panel-head"><h2>TRACK YOUR ORDER</h2><span>LIVE STATUS</span></div><div className="tracking-placeholder"><Truck size={24}/><div><b>Tracking details will appear after dispatch.</b><small>You can follow every delivery stage above.</small></div></div></div>}
    <div className="order-panel"><div className="panel-head"><h2>DELIVERY ADDRESS</h2><MapPin size={18}/></div><div className="delivery-address"><b>{order.customer?.name}</b><p>{order.customer?.address}</p><p>{order.customer?.city}, {order.customer?.state} — {order.customer?.pincode}</p><p>{order.customer?.phone}</p></div></div>
   </section>
   <aside className="order-detail-side">
    <div className="order-panel price-panel"><div className="panel-head"><h2>PRICE DETAILS</h2></div><div><span>Item total</span><b>₹{Number(order.subtotal||0).toLocaleString("en-IN")}</b></div><div><span>Shipping</span><b>{Number(order.shipping||0)?`₹${Number(order.shipping).toLocaleString("en-IN")}`:"FREE"}</b></div>{Number(order.codFee||0)>0&&<div><span>COD fee</span><b>₹{Number(order.codFee).toLocaleString("en-IN")}</b></div>}<hr/><div className="grand"><span>ORDER TOTAL</span><b>₹{Number(order.total||0).toLocaleString("en-IN")}</b></div>{(order.advanceAmount!==undefined)&&<><div><span>Advance paid</span><b>₹{Number(order.advancePaid||0).toLocaleString("en-IN")}</b></div><div><span>Balance due</span><b>₹{Math.max(0,Number(order.total||0)-Number(order.advancePaid||0)-Number(order.balancePaid||0)).toLocaleString("en-IN")}</b></div></>}<p className="payment-meta">Payment: {String(order.paymentMethod||"online").toUpperCase()} · {String(order.paymentStatus||"").replace(/_/g," ").toUpperCase()}</p>{!cancelled&&order.paymentStatus!=="paid"&&Number(order.advancePaid||0)>0&&<button className="btn primary full" disabled={actionBusy} onClick={payBalance}>{actionBusy?"PROCESSING...":`PAY BALANCE ₹${Math.max(0,Number(order.total||0)-Number(order.advancePaid||0)-Number(order.balancePaid||0)).toLocaleString("en-IN")}`}</button>}</div>
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

function Cart(){const{cart,updateQty,removeFromCart,subtotal,shipping,total}=useCart();const nav=useNavigate();return <main className="cart-page"><div className="page-heading compact"><p className="eyebrow">YOUR SELECTION</p><h1>SHOPPING BAG</h1></div>{!cart.length?<div className="empty"><ShoppingBag size={50}/><h2>Your bag is empty.</h2><Link className="btn primary" to="/shop">SHOP NOW</Link></div>:<div className="cart-layout"><div className="cart-items">{cart.map(i=><div className="cart-item" key={i.key}><img src={i.image}/><div className="cart-item-info"><div><h3>{i.name}</h3><p>{i.fabric} · Size {i.size}</p></div><strong>₹{(i.price*i.qty).toLocaleString("en-IN")}</strong><div className="cart-bottom"><div className="quantity"><button onClick={()=>updateQty(i.key,i.qty-1)}><Minus size={14}/></button><b>{i.qty}</b><button onClick={()=>updateQty(i.key,i.qty+1)}><Plus size={14}/></button></div><button className="remove" onClick={()=>removeFromCart(i.key)}><Trash2 size={15}/> REMOVE</button></div></div></div>)}</div><aside className="summary"><h2>ORDER SUMMARY</h2><div><span>Subtotal</span><b>₹{subtotal.toLocaleString("en-IN")}</b></div><div><span>Shipping</span><b>{shipping?"₹"+shipping:"FREE"}</b></div><hr/><div className="total"><span>TOTAL</span><b>₹{total.toLocaleString("en-IN")}</b></div><button className="btn primary full" onClick={()=>{if(!localStorage.getItem("enytm-token")){sessionStorage.setItem("enytm-after-login","/checkout");nav("/login")}else nav("/checkout")}}>PROCEED TO CHECKOUT <ArrowRight/></button></aside></div>}</main>}
function Account() {
  const { wishlist } = useCart();
  const nav = useNavigate();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [defaultAddressId, setDefaultAddressId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

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

        <div className="account-mark">
          E<span>™</span>
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
function Footer(){const whatsappLink="https://wa.me/message/5KFLGKP4XCG7C1";return <><a className="whatsapp-float" href={whatsappLink} target="_blank" rel="noreferrer" aria-label="Chat with ENYTM on WhatsApp" title="WhatsApp">
<svg
  viewBox="0 0 32 32"
  width="30"
  height="30"
  xmlns="http://www.w3.org/2000/svg"
  aria-label="WhatsApp"
  role="img"
>
  <path
    fill="#25D366"
    d="M16 2.5A13.2 13.2 0 0 0 4.7 22.5L3 29l6.7-1.7A13.3 13.3 0 1 0 16 2.5Z"
  />
  <path
    fill="#fff"
    d="M23.1 19.1c-.4-.2-2.1-1.1-2.5-1.2-.3-.1-.6-.2-.8.2-.3.4-1 1.2-1.2 1.4-.2.2-.4.3-.8.1a10.2 10.2 0 0 1-3-1.9 11.4 11.4 0 0 1-2-2.5c-.2-.4 0-.6.2-.8l.6-.7c.2-.2.3-.4.4-.6.1-.2 0-.5 0-.7l-1.1-2.6c-.3-.7-.6-.6-.8-.6h-.7c-.3 0-.7.1-1 .5-.4.4-1.3 1.3-1.3 3.1s1.3 3.5 1.5 3.8c.2.3 2.6 4 6.2 5.5.9.4 1.6.6 2.1.7.9.3 1.8.2 2.4.1.7-.1 2.1-.9 2.4-1.7.3-.8.3-1.5.2-1.7-.1-.1-.4-.2-.8-.4Z"
  />
</svg>
</a><footer><div className="footer-main"><div><Link className="logo footer-logo" to="/">ENYTM<span>™</span></Link></div><div className="footer-col"><h4>SHOP</h4><Link to="/shop">All Products</Link><Link to="/shop?category=Oversized">Oversized</Link><Link to="/shop?category=Polos">Polos</Link><Link to="/shop?category=Hoodies">Hoodies</Link></div><div className="footer-col"><h4>HELP</h4><a href={whatsappLink} target="_blank" rel="noreferrer">WhatsApp</a></div><div className="footer-col"><h4>FOLLOW</h4><a href="https://instagram.com/enytmapparels" target="_blank" rel="noreferrer"><Instagram size={17}/> Instagram</a></div></div><div className="footer-bottom"><span>© 2026 ENYTM APPARELS. ALL RIGHTS RESERVED.</span><span>CHAROLI, PUNE · INDIA</span></div></footer></>}function SearchOverlay({close}){const[q,setQ]=useState("");const products=useProducts();const results=products.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())||p.category.toLowerCase().includes(q.toLowerCase()));return <div className="search-overlay"><button className="close-search" onClick={close}><X/></button><div className="search-inner"><p className="eyebrow">SEARCH ENYTM</p><input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="What are you looking for?"/><div className="search-results">{q&&results.map(p=><Link key={p.id} to={`/product/${p.id}`} onClick={close}><img src={p.image}/><span>{p.name}<small>₹{p.price.toLocaleString("en-IN")}</small></span><ArrowRight/></Link>)}</div></div></div>}
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
 return <main className="admin-page"><aside className="admin-side"><div className="logo">ENYTM<span>™</span></div>{["dashboard","orders","customers","products","coupons","settings"].map(t=><button className={tab===t?"active":""} onClick={()=>setTab(t)} key={t}>{t.toUpperCase()}</button>)}<button onClick={()=>{localStorage.removeItem("enytm-admin");setLogged(false)}}>LOG OUT</button></aside><section className="admin-content"><div className="admin-top"><div><p className="eyebrow">ENYTM APPARELS</p><h1>{tab.toUpperCase()}</h1></div><Link className="btn outline" to="/">VIEW STORE</Link></div>{tab==="dashboard"&&data&&<div className="metric-grid">{[["REVENUE",`₹${data.revenue.toLocaleString("en-IN")}`],["ORDERS",data.orders],["PAID",data.paidOrders],["CUSTOMERS",data.customers],["PRODUCTS",data.products],["PENDING",data.pendingPayments]].map(([a,b])=><div className="metric" key={a}><span>{a}</span><strong>{b}</strong></div>)}</div>}{tab==="orders"&&<AdminOrders orders={orders} reload={load}/>} {tab==="customers"&&<AdminTable headers={["NAME","EMAIL","PHONE","CREATED","WHATSAPP","EMAIL"]} rows={customers.map(c=>[c.name,c.email,c.phone||"—",new Date(c.createdAt).toLocaleDateString(),c.whatsappOptIn?"ON":"OFF",c.emailOptIn?"ON":"OFF"])}/>} {tab==="products"&&<AdminProducts products={products} reload={load}/>} {tab==="coupons"&&<AdminCoupons products={products}/>} {tab==="settings"&&<AdminSettings/>}</section></main>}
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
                            ENYTM
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
}function AdminSettings(){const[s,setS]=useState({shippingFreeAbove:1999,shippingCharge:99});useEffect(()=>{api("/admin/settings").then(setS)},[]);return <div className="admin-settings"><h2>STORE SETTINGS</h2><label>Free shipping above <input value={s.shippingFreeAbove||""} onChange={e=>setS({...s,shippingFreeAbove:e.target.value})}/></label><label>Standard shipping charge <input value={s.shippingCharge||""} onChange={e=>setS({...s,shippingCharge:e.target.value})}/></label><button className="btn primary" onClick={async()=>{await api("/admin/settings",{method:"PUT",body:JSON.stringify(s)});alert("Settings saved")}}>SAVE SETTINGS</button><p className="muted">Payment credentials, SMTP and WhatsApp credentials belong in the server .env file, not the browser.</p></div>}
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
      <div className="enytm-intro-logo">ENYTM<span>™</span></div>
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

function ScrollToTopOnRouteChange(){const route=useLocation();useEffect(()=>{window.scrollTo({top:0,left:0,behavior:"auto"});},[route.pathname,route.search]);return null;}
function App(){const[search,setSearch]=useState(false);const route=useLocation();const immersive=route.pathname==="/"||route.pathname==="/launch";return <><style>{enytmInventoryAndDeliveryStyles}</style><BrandIntro/><ScrollToTopOnRouteChange/>{!immersive&&!route.pathname.startsWith("/admin")&&<Navbar onSearch={()=>setSearch(true)}/>}<Routes><Route path="/" element={<PrelaunchHome/>}/><Route path="/launch" element={<LaunchCountdown/>}/><Route path="/collection" element={<Home/>}/><Route path="/shop" element={<Shop/>}/><Route path="/product/:id" element={<ProductPage/>}/><Route path="/cart" element={<Cart/>}/><Route path="/checkout" element={<Checkout/>}/><Route path="/order/:id" element={<OrderDetails/>}/><Route path="/order-success/:id" element={<OrderSuccess/>}/><Route path="/wishlist" element={<Wishlist/>}/><Route path="/about" element={<About/>}/><Route path="/login" element={<Auth/>}/><Route path="/register" element={<Auth register/>}/><Route path="/account" element={<Account/>}/><Route path="/wallet" element={<WalletPage/>}/><Route path="/admin" element={<Admin/>}/><Route path="*" element={<Home/>}/></Routes>{!immersive&&!route.pathname.startsWith("/admin")&&<Footer/>}{search&&<SearchOverlay close={()=>setSearch(false)}/>}</>}
export default App;
