"use client";
import { useEffect, useState } from "react";

const useMounted = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
};
export default useMounted;


// mount means, The moment your component gets added to the DOM (the webpage) and is visible or active in the browser.