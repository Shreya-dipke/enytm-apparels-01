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
      const rawUserCart = uid && uid !== "anon" ? localStorage.getItem(`enytm-cart-${uid}`) : null;
      const rawGlobalCart = localStorage.getItem("enytm-cart");
      const v = JSON.parse(rawUserCart || rawGlobalCart || "[]");
      return Array.isArray(v) ? v.map(i => ({ ...i, selected: i.selected !== false })) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const uid = getActiveUserId();
      const rawUserWish = uid && uid !== "anon" ? localStorage.getItem(`enytm-wishlist-${uid}`) : null;
      const rawGlobalWish = localStorage.getItem("enytm-wishlist");
      const v = JSON.parse(rawUserWish || rawGlobalWish || "[]");
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
    const token = localStorage.getItem("enytm-token");
    if (token) {
      api("/cart/sync", { method: "POST", body: JSON.stringify({ items: [] }) }).catch(() => {});
    }
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
    const uid = getActiveUserId();
    // 1. Immediately read whatever is in local storage so cart is never empty on reload
    let localItems = [];
    try {
      const rawUserCart = uid && uid !== "anon" ? localStorage.getItem(`enytm-cart-${uid}`) : null;
      const rawGlobalCart = localStorage.getItem("enytm-cart");
      const parsed = JSON.parse(rawUserCart || rawGlobalCart || "[]");
      if (Array.isArray(parsed) && parsed.length > 0) {
        localItems = parsed.map(i => ({ ...i, selected: i.selected !== false }));
        setCart(localItems);
      }
      const rawUserWish = uid && uid !== "anon" ? localStorage.getItem(`enytm-wishlist-${uid}`) : null;
      const rawGlobalWish = localStorage.getItem("enytm-wishlist");
      const parsedWish = JSON.parse(rawUserWish || rawGlobalWish || "[]");
      if (Array.isArray(parsedWish) && parsedWish.length > 0) {
        setWishlist(parsedWish);
      }
    } catch {}

    const token = localStorage.getItem("enytm-token");
    if (!token) {
      initialLoadDone.current = true;
      return;
    }

    // 2. Fetch fresh cart & wishlist from backend API for logged-in user
    try {
      const [cRes, wRes] = await Promise.allSettled([api("/cart"), api("/wishlist")]);
      if (cRes.status === "fulfilled" && Array.isArray(cRes.value?.items)) {
        // If server returns cart items, sync exactly with server (respects server removals and empty cart)
        const serverItems = cRes.value.items.map(i => ({ ...i, selected: i.selected !== false }));
        setCart(serverItems);
        localStorage.setItem(`enytm-cart-${uid}`, JSON.stringify(serverItems));
        localStorage.setItem("enytm-cart", JSON.stringify(serverItems));
      }
      if (wRes.status === "fulfilled" && Array.isArray(wRes.value?.items)) {
        const serverWish = wRes.value.items;
        setWishlist(serverWish);
        localStorage.setItem(`enytm-wishlist-${uid}`, JSON.stringify(serverWish));
        localStorage.setItem("enytm-wishlist", JSON.stringify(serverWish));
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

  const addToCart = (product, size = "M") => {
    setCart(items => {
      const list = Array.isArray(items) ? items : [];
      const prodId = product?.id ?? product?._id;
      const key = `${prodId}-${size}`;
      const old = list.find(i => i.key === key);
      const updated = old
        ? list.map(i => i.key === key ? { ...i, qty: i.qty + 1, selected: true } : i)
        : [...list, { ...product, id: prodId, size, qty: 1, key, selected: true }];

      // Immediately write to local storage so page reload never loses the newly added item
      try {
        const uid = getActiveUserId();
        localStorage.setItem("enytm-cart", JSON.stringify(updated));
        if (uid && uid !== "anon") {
          localStorage.setItem(`enytm-cart-${uid}`, JSON.stringify(updated));
        }
        const token = localStorage.getItem("enytm-token");
        if (token) {
          api("/cart/sync", { method: "POST", body: JSON.stringify({ items: updated }) }).catch(() => {});
        }
      } catch (e) {}

      return updated;
    });
  };

  const updateQty = (key, qty) => setCart(items => {
    const list = Array.isArray(items) ? items : [];
    const updated = qty < 1 ? list.filter(i => i.key !== key) : list.map(i => i.key === key ? { ...i, qty } : i);
    try {
      const uid = getActiveUserId();
      localStorage.setItem("enytm-cart", JSON.stringify(updated));
      if (uid && uid !== "anon") localStorage.setItem(`enytm-cart-${uid}`, JSON.stringify(updated));
      const token = localStorage.getItem("enytm-token");
      if (token) api("/cart/sync", { method: "POST", body: JSON.stringify({ items: updated }) }).catch(() => {});
    } catch (e) {}
    return updated;
  });

  const updateSize = (key, newSize) => setCart(items => {
    const list = Array.isArray(items) ? items : [];
    const target = list.find(i => i.key === key);
    if (!target || !newSize || target.size === newSize) return list;
    const newKey = `${target.id}-${newSize}`;
    const existing = list.find(i => i.key === newKey);
    let updated;
    if (existing) {
      updated = list.filter(i => i.key !== key).map(i => i.key === newKey ? { ...i, qty: i.qty + target.qty } : i);
    } else {
      updated = list.map(i => i.key === key ? { ...i, size: newSize, key: newKey } : i);
    }
    try {
      const uid = getActiveUserId();
      localStorage.setItem("enytm-cart", JSON.stringify(updated));
      if (uid && uid !== "anon") localStorage.setItem(`enytm-cart-${uid}`, JSON.stringify(updated));
      const token = localStorage.getItem("enytm-token");
      if (token) api("/cart/sync", { method: "POST", body: JSON.stringify({ items: updated }) }).catch(() => {});
    } catch (e) {}
    return updated;
  });

  const toggleSelectItem = (key) => setCart(items => {
    const list = Array.isArray(items) ? items : [];
    const updated = list.map(i => i.key === key ? { ...i, selected: i.selected === false ? true : false } : i);
    try {
      const uid = getActiveUserId();
      localStorage.setItem("enytm-cart", JSON.stringify(updated));
      if (uid && uid !== "anon") localStorage.setItem(`enytm-cart-${uid}`, JSON.stringify(updated));
    } catch (e) {}
    return updated;
  });

  const selectAll = (select = true) => setCart(items => {
    const list = Array.isArray(items) ? items : [];
    const updated = list.map(i => ({ ...i, selected: !!select }));
    try {
      const uid = getActiveUserId();
      localStorage.setItem("enytm-cart", JSON.stringify(updated));
      if (uid && uid !== "anon") localStorage.setItem(`enytm-cart-${uid}`, JSON.stringify(updated));
    } catch (e) {}
    return updated;
  });

  const removeFromCart = key => setCart(items => {
    const list = Array.isArray(items) ? items : [];
    const updated = list.filter(i => i.key !== key);
    try {
      const uid = getActiveUserId();
      localStorage.setItem("enytm-cart", JSON.stringify(updated));
      if (uid && uid !== "anon") localStorage.setItem(`enytm-cart-${uid}`, JSON.stringify(updated));
      const token = localStorage.getItem("enytm-token");
      if (token) api("/cart/sync", { method: "POST", body: JSON.stringify({ items: updated }) }).catch(() => {});
    } catch (e) {}
    return updated;
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
