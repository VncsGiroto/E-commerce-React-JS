import { useEffect, useState } from 'react';
import CheckAdminToken from '../functions/admin/CheckAdminToken';

const useAdminAuth = () => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const response = await CheckAdminToken(); // Verifica sessão
                if (response) {
                    setAdmin(response);
                } else {
                    setAdmin(null);
                }
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
