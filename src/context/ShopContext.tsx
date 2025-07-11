import { createContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "react-toastify";

import type { CartItems } from "../Types/CartItems";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import type { Products } from "../Types/Product";
export const ShopContext = createContext<any>(null);

interface ShopContextProviderProps {
  children: ReactNode;
  bestseller: boolean;
}

const ShopContextProvider = (props: ShopContextProviderProps) => {
  const currency = "$";
  const delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // states
  const [search, setSearch] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(true);
  const [cartItems, setCartItems] = useState<CartItems>({});
  const [products, setProducts] = useState<Products[]>([]);
  const [token, setToken] = useState("");

  // navigate
  const navigate = useNavigate();

  // add to cart function
  const addToCart = async (itemId: string, size: string): Promise<void> => {
  const cartData:CartItems = structuredClone(cartItems || {});

    console.log(cartItems);

    if (!size) {
      toast.error("Select Product Size.");
      return;
    }

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          `${backendUrl}/api/cart/add`,
          { itemId, size },
          { headers: { token } }
        );
      } catch (error) {
        console.log(error);

        if (error instanceof Error) toast.error(error.message);
      }
    }
  };

  // Function for get cart count

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {
           console.log(error);

        if (error instanceof Error) toast.error(error.message);
     
        }
      }
    }
    return totalCount;
  };

  //   function for Quantity update

  const updateQuantity = async (
    itemId: number,
    size: string,
    quantity: number
  ): Promise<void> => {
    let cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);
    if (token) {
      try {
        axios.post(
          `${backendUrl}/api/cart/update`,
          { itemId, size, quantity },
          { headers: { token } }
        );
      } catch (error) {
        console.log(error);

        if (error instanceof Error) toast.error(error.message);
      }
    }
  };

  // Function for  cart amount

  const getCartAmount = () => {
    let totalAmout = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmout += itemInfo!.price * cartItems[items][item];
          }
        } catch (error) {
           console.log(error);

        if (error instanceof Error) toast.error(error.message);
     
        }
      }
    }
    return totalAmout;
  };

  // Function for products data

  const getProductsData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error) toast.error(error.message);
    }
  };

  const getUserCart = async (token: string | null): Promise<void> => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/cart/get`,
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error) toast.error(error.message);
    }
  };

  // use effects

  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    if (!token && localStorage.getItem("token")) {
      setToken(localStorage.getItem("token")!);
      getUserCart(localStorage.getItem("token"));
    }
  }, []);

  // values

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    showSearch,
    setSearch,
    setShowSearch,
    cartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    setToken,
    token,
    setCartItems,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
