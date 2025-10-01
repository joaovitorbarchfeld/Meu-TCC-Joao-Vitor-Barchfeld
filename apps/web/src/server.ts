import { reservasRouter } from './routes/reservas.routes';
import { veiculosRouter } from './routes/veiculos.routes';
import { usuariosRouter } from './routes/usuarios.routes';

app.use('/reservas', reservasRouter);
app.use('/veiculos', veiculosRouter);
app.use('/usuarios', usuariosRouter);