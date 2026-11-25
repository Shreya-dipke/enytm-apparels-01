import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { api } from "../api";
const CartContext = createContext();

export function CartProvider({children}) {
  const [cart,setCart] = useState(()=>{
    try {
      if (!localStorage.getItem("enytm-token")) return [];
      const v = JSON.parse(localStorage.getItem("enytm-cart") || "[]");
      return Array.isArray(v) ? v.map(i => ({ ...i, selected: i.selected !== false })) : [];
    } catch {
      return [];
    }
  });
  const [wishlist,setWishlist] = useState(()=>{
    try {
      if (!localStorage.getItem("enytm-token")) return [];
      const v = JSON.parse(localStorage.getItem("enytm-wishlist") || "[]");
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  });

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem("enytm-cart");
  }, []);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
    localStorage.removeItem("enytm-wishlist");
  }, []);

  const logoutUser = useCallback(() => {
    localStorage.removeItem("enytm-token");
    localStorage.removeItem("enytm-user");
    localStorage.removeItem("enytm-cart");
    localStorage.removeItem("enytm-wishlist");
    setCart([]);
    setWishlist([]);
    window.dispatchEvent(new Event("enytm:auth_change"));
  }, []);

  const loadUserData = useCallback(async () => {
    const token = localStorage.getItem("enytm-token");
    if (!token) {
      setCart([]);
      setWishlist([]);
      localStorage.removeItem("enytm-cart");
      localStorage.removeItem("enytm-wishlist");
      return;
    }
    try {
      const [cRes, wRes] = await Promise.allSettled([api("/cart"), api("/wishlist")]);
      if (cRes.status === "fulfilled" && Array.isArray(cRes.value?.items)) {
        setCart(cRes.value.items.map(i => ({ ...i, selected: i.selected !== false })));
      }
      if (wRes.status === "fulfilled" && Array.isArray(wRes.value?.items)) {
        setWishlist(wRes.value.items);
      }
    } catch {}
  }, []);

  useEffect(() => {
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
    if (localStorage.getItem("enytm-token")) {
      localStorage.setItem("enytm-cart", JSON.stringify(cart));
      api("/cart/sync", { method: "POST", body: JSON.stringify({ items: cart }) }).catch(() => {});
    }
  }, [cart]);

  useEffect(() => {
    if (localStorage.getItem("enytm-token")) {
      localStorage.setItem("enytm-wishlist", JSON.stringify(wishlist));
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
