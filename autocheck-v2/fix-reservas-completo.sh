#!/bin/bash
FILE="apps/frontend/src/pages/Reservas.tsx"

echo "🔧 Aplicando correções completas..."

# 4. Adicionar carregamento de usuários no loadData (linha ~35)
sed -i "/const \[reservasData, veiculosData\] = await Promise.all(\[/,/\]);/ {
  s|const \[reservasData, veiculosData\] = await Promise.all(\[|const [reservasData, veiculosData, usuariosData] = await Promise.all([|
  s|veiculosApi.list()|veiculosApi.list(),\n        api.get('/v1/usuarios').then(r => r.data.data)|
}" $FILE

# 5. Adicionar setUsuarios após setVeiculos
sed -i "/setVeiculos(veiculosData.filter(v => v.ativo));/a\      setUsuarios(usuariosData.filter((u: any) => u.ativo));" $FILE

# 6. Adicionar usuario_id no handleSubmit
sed -i "/veiculo_id: veiculoId,/a\        usuario_id: usuarioId," $FILE

# 7. Adicionar usuarioId no resetForm
sed -i "/setVeiculoId('');/a\    setUsuarioId('');" $FILE

echo "✅ Lógica aplicada!"
echo ""
echo "🎨 Agora vou adicionar o campo visual..."

# 8. Adicionar select de usuário após o select de veículo
# Procurar a linha que termina </div> após o select de veículo e adicionar o novo select
sed -i '/<\/select>/,/<\/div>/ {
  /<\/div>/a\
\
                <div>\
                  <label style={{ display: '"'"'block'"'"', color: '"'"'#d1d5db'"'"', marginBottom: '"'"'0.5rem'"'"', fontSize: '"'"'0.875rem'"'"' }}>Usuário Responsável</label>\
                  <select value={usuarioId} onChange={e => setUsuarioId(e.target.value)} required style={{ width: '"'"'100%'"'"', padding: '"'"'0.75rem'"'"', background: '"'"'#334155'"'"', color: '"'"'#fff'"'"', border: '"'"'1px solid #475569'"'"', borderRadius: '"'"'0.5rem'"'"' }}>\
                    <option value="">Selecione o usuário</option>\
                    {usuarios.map((u: any) => (\
                      <option key={u.id} value={u.id}>{u.nome}</option>\
                    ))}\
                  </select>\
                </div>
}' $FILE

echo "✅ Campo visual adicionado!"
echo ""
echo "🔍 Verificando..."
grep -c "usuarioId\|usuario_id" $FILE
echo " ocorrências encontradas"
