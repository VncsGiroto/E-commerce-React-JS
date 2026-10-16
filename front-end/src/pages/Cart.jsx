import { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import { GetCart, UpdateCart, RemoveCartItem, DeleteCart } from "../functions/cart/CartApi.js";
import { CheckoutOrder } from "../functions/order/OrderApi.js";

const Container = styled.div`
    padding: 20px;
    max-width: 900px;
    margin: 0 auto;
`;

const Title = styled.h2`
    color: #333;
`;

const Row = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #eaeaea;
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 10px;
    background-color: #f9f9f9;
`;

const ItemName = styled.span`
    font-weight: 500;
    color: #333;
`;

const QtyControls = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const SmallButton = styled.button`
    padding: 4px 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const RemoveButton = styled(SmallButton)`
    border-color: #dc3545;
    color: #dc3545;
`;

const Total = styled.p`
    font-size: 18px;
    font-weight: bold;
    text-align: right;
`;

const ErrorMsg = styled.p`
    color: #dc3545;
`;

const CheckoutButton = styled(SmallButton)`
    border-color: #28a745;
    color: #fff;
    background: #28a745;
    font-weight: bold;
`;

const SimNote = styled.p`
    color: #856404;
    font-size: 14px;
`;

function formatBRL(value) {
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
}

function generateIdempotencyKey() {
    if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

export default function Cart() {
    const navigate = useNavigate();
    const { userId } = useOutletContext() ?? {};
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [busyId, setBusyId] = useState(null);
    const idempotencyKeyRef = useRef(null);
    const isBusy = busyId !== null;

    useEffect(() => {
        const load = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }
            const result = await GetCart(userId);
            if (result?.cartId) {
                setCart(result);
            } else if (result?.status === 404) {
                setCart(null);
            } else {
                setError(result?.data?.message ?? "Não foi possível carregar o carrinho.");
            }
            setLoading(false);
        };
        load();
    }, [userId]);

    const changeQty = async (produtoId, delta) => {
        if (!cart?.cartId || isBusy) return;
        const items = (cart.items ?? []).map((item) => ({
            produtoId: String(item.produtoId?._id ?? item.produtoId),
            quantidade: Number(item.quantidade),
        }));
        const target = items.find((i) => i.produtoId === String(produtoId));
        if (!target) return;
        target.quantidade += delta;
        if (target.quantidade < 1) return;
        setBusyId(String(produtoId));
        const result = await UpdateCart(cart.cartId, items);
        if (result?.cartId) {
            setCart(result);
        } else {
            setError(result?.data?.message ?? "Falha ao atualizar quantidade.");
        }
        setBusyId(null);
    };

    const removeItem = async (produtoId) => {
        if (!cart?.cartId || isBusy) return;
        if (!window.confirm("Remover este item do carrinho?")) return;
        setBusyId(`rm-${produtoId}`);
        const result = await RemoveCartItem(cart.cartId, String(produtoId));
        if (result?.items) {
            setCart((prev) => ({ ...prev, items: result.items, valorTotal: result.valorTotal }));
        } else {
            setError(result?.data?.message ?? "Falha ao remover item.");
        }
        setBusyId(null);
    };

    const clearCart = async () => {
        if (!cart?.cartId || isBusy) return;
        if (!window.confirm("Esvaziar o carrinho?")) return;
        setBusyId("clear");
        const result = await DeleteCart(cart.cartId);
        if (result?.message) {
            setCart(null);
        } else {
            setError(result?.data?.message ?? "Falha ao esvaziar carrinho.");
        }
        setBusyId(null);
    };

    const checkout = async () => {
        if (!cart?.cartId || isBusy) return;
        if (!idempotencyKeyRef.current) {
            idempotencyKeyRef.current = generateIdempotencyKey();
        }
        setBusyId("checkout");
        setError(null);
        const result = await CheckoutOrder(idempotencyKeyRef.current);
        if (result?._id) {
            idempotencyKeyRef.current = null;
            setBusyId(null);
            navigate(`/orders/${result._id}/confirmation`, { state: { fromCheckout: true }, replace: true });
            return;
        }
        if (result?.status === 401 || result?.status === 403) {
            setBusyId(null);
            navigate("/login", { replace: true });
            return;
        }
        setError(result?.data?.message ?? "Falha ao finalizar pedido. Tente novamente.");
        setBusyId(null);
    };

    if (loading) {
        return (<><Navbar /><Container aria-live="polite">Carregando carrinho...</Container></>);
    }

    return (
        <>
            <Navbar />
            <Container>
                <Title>Meu Carrinho</Title>
                {error && <ErrorMsg role="alert">{error}</ErrorMsg>}
                {!cart || (cart.items ?? []).length === 0 ? (
                    <p>Seu carrinho está vazio.</p>
                ) : (
                    <>
                        {(cart.items ?? []).map((item) => {
                            const pid = String(item.produtoId?._id ?? item.produtoId);
                            return (
                                <Row key={pid}>
                                    <ItemName>{item.nome ?? pid} (x{item.quantidade}) — {formatBRL(item.subtotal ?? item.precoNaCompra * item.quantidade)}</ItemName>
                                    <QtyControls>
                                        <SmallButton type="button" aria-label={`Diminuir quantidade de ${item.nome ?? pid}`} disabled={isBusy} onClick={() => changeQty(pid, -1)}>-</SmallButton>
                                        <span>{item.quantidade}</span>
                                        <SmallButton type="button" aria-label={`Aumentar quantidade de ${item.nome ?? pid}`} disabled={isBusy} onClick={() => changeQty(pid, 1)}>+</SmallButton>
                                        <RemoveButton type="button" aria-label={`Remover ${item.nome ?? pid} do carrinho`} disabled={isBusy} onClick={() => removeItem(pid)}>Remover</RemoveButton>
                                    </QtyControls>
                                </Row>
                            );
                        })}
                        <Total>Total: {formatBRL(cart.valorTotal)}</Total>
                        <SimNote>Pagamento simulado — nenhuma cobrança real será feita.</SimNote>
                        <CheckoutButton type="button" disabled={isBusy} onClick={checkout}>Finalizar compra</CheckoutButton>
                        <SmallButton type="button" disabled={isBusy} onClick={clearCart}>Esvaziar carrinho</SmallButton>
                    </>
                )}
            </Container>
        </>
    );
}
