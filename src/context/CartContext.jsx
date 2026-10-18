import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api";
const CartContext = createContext();

export function CartProvider({children}) {
  const [cart,setCart] = useState(()=>JSON.parse(localStorage.getItem("enytm-cart")||"[]"));
  const [wishlist,setWishlist] = useState(()=>JSON.parse(localStorage.getItem("enytm-wishlist")||"[]"));

  useEffect(()=>localStorage.setItem("enytm-cart",JSON.stringify(cart)),[cart]);
  useEffect(()=>localStorage.setItem("enytm-wishlist",JSON.stringify(wishlist)),[wishlist]);
  useEffect(()=>{ if(localStorage.getItem("enytm-token")) api("/cart/sync",{method:"POST",body:JSON.stringify({items:cart})}).catch(()=>{}); },[cart]);
  useEffect(()=>{ if(localStorage.getItem("enytm-token")) api("/wishlist/sync",{method:"POST",body:JSON.stringify({items:wishlist})}).catch(()=>{}); },[wishlist]);

  const addToCart=(product,size="M")=>setCart(items=>{
    const key=`${product.id}-${size}`, old=items.find(i=>i.key===key);
    return old?items.map(i=>i.key===key?{...i,qty:i.qty+1}:i):[...items,{...product,size,qty:1,key}];
  });
  const updateQty=(key,qty)=>setCart(items=>qty<1?items.filter(i=>i.key!==key):items.map(i=>i.key===key?{...i,qty}:i));
  const removeFromCart=key=>setCart(items=>items.filter(i=>i.key!==key));
  const toggleWishlist=id=>setWishlist(w=>w.includes(id)?w.filter(x=>x!==id):[...w,id]);
  const clearCart=()=>setCart([]);
  const cartCount=cart.reduce((s,i)=>s+i.qty,0);
  const subtotal=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const shipping=subtotal===0||subtotal>=1999?0:99;
  return <CartContext.Provider value={{cart,wishlist,addToCart,updateQty,removeFromCart,toggleWishlist,clearCart,cartCount,subtotal,shipping,total:subtotal+shipping}}>{children}</CartContext.Provider>
}
export const useCart=()=>useContext(CartContext);
