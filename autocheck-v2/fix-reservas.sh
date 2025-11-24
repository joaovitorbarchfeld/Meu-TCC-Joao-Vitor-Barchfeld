#!/bin/bash
FILE="apps/frontend/src/pages/Reservas.tsx"

# Backup
cp $FILE ${FILE}.backup

# 1. Adicionar import de api
sed -i "s|import { reservasApi, veiculosApi } from '../services/api';|import { reservasApi, veiculosApi, api } from '../services/api';|g" $FILE

# 2. Adicionar state de usuarios após veiculos
sed -i "/const \[veiculos, setVeiculos\] = useState<Veiculo\[\]>(\[\]);/a\  const [usuarios, setUsuarios] = useState<any[]>([]);" $FILE

# 3. Adicionar state de usuarioId após veiculoId
sed -i "/const \[veiculoId, setVeiculoId\] = useState('');/a\  const [usuarioId, setUsuarioId] = useState('');" $FILE

echo "✅ Script aplicado! Agora edite manualmente para adicionar:"
echo "   - Carregamento de usuários no loadData"
echo "   - Campo usuario_id no handleSubmit"
echo "   - Select visual de usuário"
echo ""
echo "Quer que eu te passe as linhas exatas?"
