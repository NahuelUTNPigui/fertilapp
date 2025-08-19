import { loadMercadoPago } from "@mercadopago/sdk-js";
const PUBLIC_KEY = import.meta.env.VITE_PUBLIC_MP

await loadMercadoPago();
const mp = new window.MercadoPago(PUBLIC_KEY);

