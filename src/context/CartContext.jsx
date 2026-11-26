import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { api } from "../api";
export const CartContext = createContext();

function getActiveUserId() {
  try {
    const u = JSON.parse(localStorage.getItem("enytm-user") || "null");
    return u?.id || u?._id || "anon";
  } catch {
    return "anon";
  }
}

function getDeletedCartKeys() {
  try {
    const raw = localStorage.getItem("enytm-deleted-cart-keys");
    const arr = JSON.parse(raw || "[]");
    return Array.isArray(arr) ? new Set(arr) : new Set();
  } catch {
    return new Set();
  }
}

function markCartKeyDeleted(key) {
  if (!key) return;
  try {
    const set = getDeletedCartKeys();
    set.add(String(key));
    localStorage.setItem("enytm-deleted-cart-keys", JSON.stringify(Array.from(set)));
  } catch {}
}

function unmarkCartKeyDeleted(key) {
  if (!key) return;
  try {
    const set = getDeletedCartKeys();
    set.delete(String(key));
    localStorage.setItem("enytm-deleted-cart-keys", JSON.stringify(Array.from(set)));
  } catch {}
}

export function CartProvider({children}) {
  const initialLoadDone = useRef(false);

  const [cart, setCart] = useState(() => {
    try {
      const uid = getActiveUserId();
      const rawUserCart = uid && uid !== "anon" ? localStorage.getItem(`enytm-cart-${uid}`) : null;
      const rawGlobalCart = localStorage.getItem("enytm-cart");
      const raw = rawUserCart !== null ? rawUserCart : rawGlobalCart;
      const v = JSON.parse(raw || "[]");
      const deletedKeys = getDeletedCartKeys();
      return Array.isArray(v)
        ? v.filter(i => i?.key && !deletedKeys.has(i.key)).map(i => ({ ...i, selected: i.selected !== false }))
        : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const uid = getActiveUserId();
      const rawUserWish = uid && uid !== "anon" ? localStorage.getItem(`enytm-wishlist-${uid}`) : null;
      const rawGlobalWish = localStorage.getItem("enytm-wishlist");
      const raw = rawUserWish !== null ? rawUserWish : rawGlobalWish;
      const v = JSON.parse(raw || "[]");
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  });

  const clearCart = useCallback(() => {
    const uid = getActiveUserId();
    setCart(items => {
      if (Array.isArray(items)) {
        items.forEach(i => { if (i?.key) markCartKeyDeleted(i.key); });
      }
      return [];
    });
    localStorage.setItem("enytm-cart", "[]");
    if (uid && uid !== "anon") localStorage.setItem(`enytm-cart-${uid}`, "[]");
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
    localStorage.setItem("enytm-cart", "[]");
    localStorage.removeItem("enytm-wishlist");
    localStorage.removeItem("enytm-deleted-cart-keys");
    setCart([]);
    setWishlist([]);
    initialLoadDone.current = false;
    window.dispatchEvent(new Event("enytm:auth_change"));
  }, []);

  const loadUserData = useCallback(async () => {
    const uid = getActiveUserId();
    const deletedKeys = getDeletedCartKeys();

    // 1. Immediately read whatever is in local storage so cart is never empty on reload
    let localItems = [];
    try {
      const rawUserCart = uid && uid !== "anon" ? localStorage.getItem(`enytm-cart-${uid}`) : null;
      const rawGlobalCart = localStorage.getItem("enytm-cart");
      const raw = rawUserCart !== null ? rawUserCart : rawGlobalCart;
      const parsed = JSON.parse(raw || "[]");
      if (Array.isArray(parsed)) {
        localItems = parsed
          .filter(i => i?.key && !deletedKeys.has(i.key))
          .map(i => ({ ...i, selected: i.selected !== false }));
        setCart(localItems);
      }
      const rawUserWish = uid && uid !== "anon" ? localStorage.getItem(`enytm-wishlist-${uid}`) : null;
      const rawGlobalWish = localStorage.getItem("enytm-wishlist");
      const parsedWish = JSON.parse(rawUserWish !== null ? rawUserWish : (rawGlobalWish || "[]"));
      if (Array.isArray(parsedWish)) {
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
        // Discard any items that were deleted on this client
        const serverItems = cRes.value.items
          .filter(i => i?.key && !deletedKeys.has(i.key))
          .map(i => ({ ...i, selected: i.selected !== false }));

        const itemMap = new Map();
        for (const item of serverItems) {
          if (item?.key) itemMap.set(item.key, item);
        }
        for (const item of localItems) {
          if (item?.key && !deletedKeys.has(item.key)) itemMap.set(item.key, item);
        }
        const merged = Array.from(itemMap.values());
        setCart(merged);
        localStorage.setItem(`enytm-cart-${uid}`, JSON.stringify(merged));
        localStorage.setItem("enytm-cart", JSON.stringify(merged));
        // Keep backend in sync with clean merged cart
        api("/cart/sync", { method: "POST", body: JSON.stringify({ items: merged }) }).catch(() => {});
      }
      if (wRes.status === "fulfilled" && Array.isArray(wRes.value?.items)) {
        const serverWish = wRes.value.items;
        const setWish = new Set([...serverWish, ...wishlist]);
        const mergedWish = Array.from(setWish);
        setWishlist(mergedWish);
        localStorage.setItem(`enytm-wishlist-${uid}`, JSON.stringify(mergedWish));
        localStorage.setItem("enytm-wishlist", JSON.stringify(mergedWish));
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
    const prodId = product?.id ?? product?._id;
    const key = `${prodId}-${size}`;
    unmarkCartKeyDeleted(key);
    setCart(items => {
      const list = Array.isArray(items) ? items : [];
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

  const updateQty = (key, qty) => {
    if (qty < 1) {
      removeFromCart(key);
      return;
    }
    setCart(items => {
      const list = Array.isArray(items) ? items : [];
      const updated = list.map(i => i.key === key ? { ...i, qty } : i);
      try {
        const uid = getActiveUserId();
        localStorage.setItem("enytm-cart", JSON.stringify(updated));
        if (uid && uid !== "anon") localStorage.setItem(`enytm-cart-${uid}`, JSON.stringify(updated));
        const token = localStorage.getItem("enytm-token");
        if (token) api("/cart/sync", { method: "POST", body: JSON.stringify({ items: updated }) }).catch(() => {});
      } catch (e) {}
      return updated;
    });
  };

  const updateSize = (key, newSize) => setCart(items => {
    const list = Array.isArray(items) ? items : [];
    const target = list.find(i => i.key === key);
    if (!target || !newSize || target.size === newSize) return list;
    const newKey = `${target.id}-${newSize}`;
    unmarkCartKeyDeleted(newKey);
    const existing = list.find(i => i.key === newKey);
    let updated;
    if (existing) {
      updated = list.filter(i => i.key !== key).map(i => i.key === newKey ? { ...i, qty: i.qty + target.qty } : i);
    } else {
      updated = list.map(i => i.key === key ? { ...i, size: newSize, key: newKey } : i);
    }
    markCartKeyDeleted(key);
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

  const removeFromCart = key => {
    markCartKeyDeleted(key);
    setCart(items => {
      const list = Array.isArray(items) ? items : [];
      const updated = list.filter(i => i.key !== key);
      try {
        const uid = getActiveUserId();
        localStorage.setItem("enytm-cart", JSON.stringify(updated));
        if (uid && uid !== "anon") localStorage.setItem(`enytm-cart-${uid}`, JSON.stringify(updated));
        const token = localStorage.getItem("enytm-token");
        if (token) {
          api("/cart/sync", { method: "POST", body: JSON.stringify({ items: updated }) }).catch(() => {});
          api(`/cart/${encodeURIComponent(key)}`, { method: "DELETE" }).catch(() => {});
        }
      } catch (e) {}
      return updated;
    });
  };
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

// Re-export hook for backwards compatibility while keeping CartProvider as main component export
export { useCart } from "./useCart";
