import { useEffect, useState } from 'react';
import AdminToken from '../functions/AdminToken';

const useAdminAuth = () => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const response = await AdminToken(); // Verifica sessão
                console.log(response);
            } catch (error) {
                setAdmin(null); // Se falhar, não está autenticado
            } finally {
                setLoading(false);
            }
        };

        checkAdmin();
    }, []);

    return { admin, loading };
};

export default useAdminAuth;
