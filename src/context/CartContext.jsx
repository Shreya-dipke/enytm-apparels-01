import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api";
const CartContext = createContext();

export function CartProvider({children}) {
  const [cart,setCart] = useState(()=>{
    try {
      const v = JSON.parse(localStorage.getItem("enytm-cart") || "[]");
      return Array.isArray(v) ? v.map(i => ({ ...i, selected: i.selected !== false })) : [];
    } catch {
      return [];
    }
  });
  const [wishlist,setWishlist] = useState(()=>{
    try {
      const v = JSON.parse(localStorage.getItem("enytm-wishlist") || "[]");
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  });

  useEffect(()=>localStorage.setItem("enytm-cart",JSON.stringify(cart)),[cart]);
  useEffect(()=>localStorage.setItem("enytm-wishlist",JSON.stringify(wishlist)),[wishlist]);
  useEffect(()=>{ if(localStorage.getItem("enytm-token")) api("/cart/sync",{method:"POST",body:JSON.stringify({items:cart})}).catch(()=>{}); },[cart]);
  useEffect(()=>{ if(localStorage.getItem("enytm-token")) api("/wishlist/sync",{method:"POST",body:JSON.stringify({items:wishlist})}).catch(()=>{}); },[wishlist]);

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
  const clearCart=()=>setCart([]);
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
