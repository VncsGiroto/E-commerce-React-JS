import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import { GetOrders } from "../functions/order/OrderApi.js";

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

const ErrorMsg = styled.p`
    color: #dc3545;
`;

function formatBRL(value) {
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
}

export default function Orders() {
    const [orders, setOrders] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            const result = await GetOrders();
            if (Array.isArray(result?.pedidos)) {
                setOrders(result.pedidos);
            } else {
                setError(result?.data?.message ?? "Não foi possível carregar os pedidos.");
            }
            setLoading(false);
        };
        load();
    }, []);

    if (loading) {
        return (<><Navbar /><Container aria-live="polite">Carregando pedidos...</Container></>);
    }

    return (
        <>
            <Navbar />
            <Container>
                <Title>Meus pedidos</Title>
                {error && <><ErrorMsg role="alert">{error}</ErrorMsg><p><Link to="/">Voltar à loja</Link></p></>}
                {!error && orders && orders.length === 0 && (
                    <p>Você ainda não fez nenhum pedido.</p>
                )}
                {!error && (orders ?? []).map((order) => (
                    <Row key={String(order._id)}>
                        <span>Pagamento SIMULADO — {formatBRL(order.total)}</span>
                        <Link to={`/orders/${order._id}/confirmation`}>Ver detalhes</Link>
                    </Row>
                ))}
            </Container>
        </>
    );
}
