import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api";
const CartContext = createContext();

export function CartProvider({children}) {
  const [cart,setCart] = useState(()=>{
    try {
      const v = JSON.parse(localStorage.getItem("enytm-cart") || "[]");
      return Array.isArray(v) ? v : [];
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
    return old?list.map(i=>i.key===key?{...i,qty:i.qty+1}:i):[...list,{...product,size,qty:1,key}];
  });
  const updateQty=(key,qty)=>setCart(items=>{
    const list = Array.isArray(items) ? items : [];
    return qty<1?list.filter(i=>i.key!==key):list.map(i=>i.key===key?{...i,qty}:i);
  });
  const removeFromCart=key=>setCart(items=>{
    const list = Array.isArray(items) ? items : [];
    return list.filter(i=>i.key!==key);
  });
  const toggleWishlist=id=>setWishlist(w=>{
    const list = Array.isArray(w) ? w : [];
    return list.includes(id)?list.filter(x=>x!==id):[...list,id];
  });
  const clearCart=()=>setCart([]);
  const safeCart = Array.isArray(cart) ? cart : [];
  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];
  const cartCount=safeCart.reduce((s,i)=>s+(Number(i.qty)||0),0);
  const subtotal=safeCart.reduce((s,i)=>s+((Number(i.price)||0)*(Number(i.qty)||0)),0);
  const shipping=subtotal===0||subtotal>=1999?0:99;
  return <CartContext.Provider value={{cart:safeCart,wishlist:safeWishlist,addToCart,updateQty,removeFromCart,toggleWishlist,clearCart,cartCount,subtotal,shipping,total:subtotal+shipping}}>{children}</CartContext.Provider>
}
export const useCart=()=>useContext(CartContext);
