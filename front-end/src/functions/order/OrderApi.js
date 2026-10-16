import { api } from "../Api";

export async function CheckoutOrder(idempotencyKey) {
    try {
        const response = await api.post("/order/checkout", {}, {
            headers: { "X-Idempotency-Key": idempotencyKey },
        });
        return response.data;
    } catch (error) {
        return error.response ?? null;
    }
}

export async function GetOrders() {
    try {
        const response = await api.get("/order/");
        const data = response.data ?? {};
        const pedidos = data.pedidos ?? data.data ?? (Array.isArray(data) ? data : []);
        return { total: data.total ?? pedidos.length, pedidos };
    } catch (error) {
        return error.response ?? null;
    }
}

export async function GetOrder(id) {
    try {
        const response = await api.get(`/order/${id}`);
        return response.data;
    } catch (error) {
        return error.response ?? null;
    }
}
