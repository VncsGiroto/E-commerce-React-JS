import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import { GetOrder } from "../functions/order/OrderApi.js";

const Container = styled.div`
    padding: 20px;
    max-width: 900px;
    margin: 0 auto;
`;

const Title = styled.h2`
    color: #333;
`;

const Badge = styled.p`
    display: inline-block;
    background-color: #fff3cd;
    color: #856404;
    border: 1px solid #ffeeba;
    border-radius: 4px;
    padding: 8px 12px;
    font-weight: bold;
`;

const Row = styled.div`
    display: flex;
    justify-content: space-between;
    border: 1px solid #eaeaea;
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 10px;
    background-color: #f9f9f9;
`;

const Total = styled.p`
    font-size: 18px;
    font-weight: bold;
    text-align: right;
`;

const ErrorMsg = styled.p`
    color: #dc3545;
`;

function formatBRL(value) {
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
}

export default function OrderConfirmation() {
    const { id } = useParams();
    const location = useLocation();
    const justConfirmed = location.state?.fromCheckout === true;
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            const result = await GetOrder(id);
            if (result?._id) {
                setOrder(result);
            } else if (result?.status === 404) {
                setError("Pedido não encontrado.");
            } else {
                setError(result?.data?.message ?? "Não foi possível carregar o pedido.");
            }
            setLoading(false);
        };
        load();
    }, [id]);

    if (loading) {
        return (<><Navbar /><Container aria-live="polite">Carregando pedido...</Container></>);
    }

    return (
        <>
            <Navbar />
            <Container>
                <Title>{justConfirmed ? "Pedido confirmado!" : "Detalhes do pedido"}</Title>
                {error && <><ErrorMsg role="alert">{error}</ErrorMsg><p><Link to="/orders">Voltar para meus pedidos</Link> | <Link to="/">Voltar à loja</Link></p></>}
                {order && (
                    <>
                        <Badge>Pagamento SIMULADO — nenhuma cobrança real foi feita.</Badge>
                        {(order.items ?? []).map((item) => (
                            <Row key={String(item.produtoId)}>
                                <span>{item.nome ?? String(item.produtoId)} (x{item.quantidade})</span>
                                <span>{formatBRL(item.subtotal)}</span>
                            </Row>
                        ))}
                        <Total>Total: {formatBRL(order.total)}</Total>
                        <p><Link to="/orders">Ver meus pedidos</Link> | <Link to="/">Voltar à loja</Link></p>
                    </>
                )}
            </Container>
        </>
    );
}
