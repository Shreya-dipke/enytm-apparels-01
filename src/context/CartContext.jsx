import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { api } from "../api";
const CartContext = createContext();

function getActiveUserId() {
  try {
    const u = JSON.parse(localStorage.getItem("enytm-user") || "null");
    return u?.id || u?._id || "anon";
  } catch {
    return "anon";
  }
}

export function CartProvider({children}) {
  const initialLoadDone = useRef(false);

  const [cart, setCart] = useState(() => {
    try {
      const uid = getActiveUserId();
      const raw = (uid && uid !== "anon" ? localStorage.getItem(`enytm-cart-${uid}`) : null) || localStorage.getItem("enytm-cart") || "[]";
      const v = JSON.parse(raw);
      return Array.isArray(v) ? v.map(i => ({ ...i, selected: i.selected !== false })) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const uid = getActiveUserId();
      const raw = (uid && uid !== "anon" ? localStorage.getItem(`enytm-wishlist-${uid}`) : null) || localStorage.getItem("enytm-wishlist") || "[]";
      const v = JSON.parse(raw);
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  });

  const clearCart = useCallback(() => {
    const uid = getActiveUserId();
    setCart([]);
    localStorage.removeItem("enytm-cart");
    if (uid && uid !== "anon") localStorage.removeItem(`enytm-cart-${uid}`);
  }, []);

  const clearWishlist = useCallback(() => {
    const uid = getActiveUserId();
    setWishlist([]);
    localStorage.removeItem("enytm-wishlist");
    if (uid && uid !== "anon") localStorage.removeItem(`enytm-wishlist-${uid}`);
  }, []);

  const logoutUser = useCallback(() => {
    localStorage.removeItem("enytm-token");
    localStorage.removeItem("enytm-user");
    localStorage.removeItem("enytm-cart");
    localStorage.removeItem("enytm-wishlist");
    setCart([]);
    setWishlist([]);
    initialLoadDone.current = false;
    window.dispatchEvent(new Event("enytm:auth_change"));
  }, []);

  const loadUserData = useCallback(async () => {
    const token = localStorage.getItem("enytm-token");
    if (!token) {
      // Guest mode: retain guest local storage items
      const guestCart = JSON.parse(localStorage.getItem("enytm-cart") || "[]");
      if (Array.isArray(guestCart)) setCart(guestCart.map(i => ({ ...i, selected: i.selected !== false })));
      const guestWish = JSON.parse(localStorage.getItem("enytm-wishlist") || "[]");
      if (Array.isArray(guestWish)) setWishlist(guestWish);
      initialLoadDone.current = true;
      return;
    }

    const uid = getActiveUserId();
    // 1. Immediately restore from per-user local cache if available
    try {
      const localCart = JSON.parse(localStorage.getItem(`enytm-cart-${uid}`) || "[]");
      if (Array.isArray(localCart) && localCart.length > 0) {
        setCart(localCart.map(i => ({ ...i, selected: i.selected !== false })));
      }
      const localWish = JSON.parse(localStorage.getItem(`enytm-wishlist-${uid}`) || "[]");
      if (Array.isArray(localWish) && localWish.length > 0) {
        setWishlist(localWish);
      }
    } catch {}

    // 2. Fetch fresh cart & wishlist from backend API
    try {
      const [cRes, wRes] = await Promise.allSettled([api("/cart"), api("/wishlist")]);
      if (cRes.status === "fulfilled" && Array.isArray(cRes.value?.items)) {
        if (cRes.value.items.length > 0) {
          const items = cRes.value.items.map(i => ({ ...i, selected: i.selected !== false }));
          setCart(items);
          localStorage.setItem(`enytm-cart-${uid}`, JSON.stringify(items));
          localStorage.setItem("enytm-cart", JSON.stringify(items));
        } else {
          // If server cart is empty but we have local cart for this user, sync local to server
          const localCart = JSON.parse(localStorage.getItem(`enytm-cart-${uid}`) || "[]");
          if (Array.isArray(localCart) && localCart.length > 0) {
            api("/cart/sync", { method: "POST", body: JSON.stringify({ items: localCart }) }).catch(() => {});
          }
        }
      }
      if (wRes.status === "fulfilled" && Array.isArray(wRes.value?.items)) {
        if (wRes.value.items.length > 0) {
          setWishlist(wRes.value.items);
          localStorage.setItem(`enytm-wishlist-${uid}`, JSON.stringify(wRes.value.items));
          localStorage.setItem("enytm-wishlist", JSON.stringify(wRes.value.items));
        } else {
          const localWish = JSON.parse(localStorage.getItem(`enytm-wishlist-${uid}`) || "[]");
          if (Array.isArray(localWish) && localWish.length > 0) {
            api("/wishlist/sync", { method: "POST", body: JSON.stringify({ items: localWish }) }).catch(() => {});
          }
        }
      }
    } catch {} finally {
      initialLoadDone.current = true;
    }
  }, []);

  useEffect(() => {
    loadUserData();
    const onAuthChange = () => {
      loadUserData();
    };
    window.addEventListener("enytm:auth_change", onAuthChange);
    window.addEventListener("storage", onAuthChange);
    return () => {
      window.removeEventListener("enytm:auth_change", onAuthChange);
      window.removeEventListener("storage", onAuthChange);
    };
  }, [loadUserData]);

  useEffect(() => {
    if (!initialLoadDone.current) return;
    const uid = getActiveUserId();
    localStorage.setItem("enytm-cart", JSON.stringify(cart));
    if (uid && uid !== "anon") {
      localStorage.setItem(`enytm-cart-${uid}`, JSON.stringify(cart));
    }
    const token = localStorage.getItem("enytm-token");
    if (token) {
      api("/cart/sync", { method: "POST", body: JSON.stringify({ items: cart }) }).catch(() => {});
    }
  }, [cart]);

  useEffect(() => {
    if (!initialLoadDone.current) return;
    const uid = getActiveUserId();
    localStorage.setItem("enytm-wishlist", JSON.stringify(wishlist));
    if (uid && uid !== "anon") {
      localStorage.setItem(`enytm-wishlist-${uid}`, JSON.stringify(wishlist));
    }
    const token = localStorage.getItem("enytm-token");
    if (token) {
      api("/wishlist/sync", { method: "POST", body: JSON.stringify({ items: wishlist }) }).catch(() => {});
    }
  }, [wishlist]);

  const addToCart=(product,size="M")=>setCart(items=>{
    const list = Array.isArray(items) ? items : [];
    const key=`${product?.id}-${size}`, old=list.find(i=>i.key===key);
    return old
      ? list.map(i=>i.key===key?{...i,qty:i.qty+1,selected:true}:i)
      : [...list,{...product,size,qty:1,key,selected:true}];
  });
  const updateQty=(key,qty)=>setCart(items=>{
    const list = Array.isArray(items) ? items : [];
    return qty<1?list.filter(i=>i.key!==key):list.map(i=>i.key===key?{...i,qty}:i);
  });
  const updateSize=(key,newSize)=>setCart(items=>{
    const list = Array.isArray(items) ? items : [];
    const target = list.find(i=>i.key===key);
    if (!target || !newSize || target.size === newSize) return list;
    const newKey = `${target.id}-${newSize}`;
    const existing = list.find(i=>i.key===newKey);
    if (existing) {
      return list.filter(i=>i.key!==key).map(i=>i.key===newKey ? {...i, qty: i.qty + target.qty} : i);
    }
    return list.map(i=>i.key===key ? {...i, size: newSize, key: newKey} : i);
  });
  const toggleSelectItem=(key)=>setCart(items=>{
    const list = Array.isArray(items) ? items : [];
    return list.map(i=>i.key===key ? {...i, selected: i.selected === false ? true : false} : i);
  });
  const selectAll=(select = true)=>setCart(items=>{
    const list = Array.isArray(items) ? items : [];
    return list.map(i=>({...i, selected: !!select}));
  });
  const removeFromCart=key=>setCart(items=>{
    const list = Array.isArray(items) ? items : [];
    return list.filter(i=>i.key!==key);
  });
  const addToWishlist=id=>setWishlist(w=>{
    const list = Array.isArray(w) ? w : [];
    const numId = Number(id) || id;
    return list.some(x => String(x) === String(numId)) ? list : [...list, numId];
  });
  const toggleWishlist=id=>setWishlist(w=>{
    const list = Array.isArray(w) ? w : [];
    return list.includes(id)?list.filter(x=>x!==id):[...list,id];
  });
  const safeCart = Array.isArray(cart) ? cart : [];
  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];
  const selectedItems = useMemo(() => safeCart.filter(i => i.selected !== false), [safeCart]);
  const cartCount=safeCart.reduce((s,i)=>s+(Number(i.qty)||0),0);
  const selectedCount=selectedItems.reduce((s,i)=>s+(Number(i.qty)||0),0);
  const subtotal=safeCart.reduce((s,i)=>s+((Number(i.price)||0)*(Number(i.qty)||0)),0);
  const selectedSubtotal=selectedItems.reduce((s,i)=>s+((Number(i.price)||0)*(Number(i.qty)||0)),0);
  const shipping=0;
  return (
    <CartContext.Provider value={{
      cart: safeCart,
      wishlist: safeWishlist,
      selectedItems,
      addToCart,
      updateQty,
      updateSize,
      toggleSelectItem,
      selectAll,
      removeFromCart,
      addToWishlist,
      toggleWishlist,
      clearCart,
      clearWishlist,
      logoutUser,
      cartCount,
      selectedCount,
      subtotal,
      selectedSubtotal,
      shipping,
      total: subtotal + shipping
    }}>
      {children}
    </CartContext.Provider>
  );
}
export const useCart=()=>useContext(CartContext);
