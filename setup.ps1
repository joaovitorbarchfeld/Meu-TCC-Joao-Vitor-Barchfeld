# AutoCheck Setup Script - PowerShell
# Execute este script na raiz do projeto autocheck

Write-Host "🚀 Configurando projeto AutoCheck..." -ForegroundColor Cyan

# Criar estrutura de pastas
Write-Host "📁 Criando estrutura de pastas..." -ForegroundColor Yellow
$folders = @(
    "apps/api/src/config",
    "apps/api/src/controllers",
    "apps/api/src/services",
    "apps/api/src/repositories",
    "apps/api/src/routes",
    "apps/api/src/middlewares",
    "apps/api/src/validators",
    "apps/api/src/dto",
    "apps/api/src/utils",
    "apps/api/src/types",
    "apps/api/src/tests",
    "infra/db/init",
    "infra/production",
    "scripts",
    ".vscode"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
}

# tsconfig.json
Write-Host "📝 Criando tsconfig.json..." -ForegroundColor Yellow
@"
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
"@ | Out-File -FilePath "apps/api/tsconfig.json" -Encoding UTF8

# .env
Write-Host "📝 Criando .env..." -ForegroundColor Yellow
@"
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/autocheck
WEB_ORIGIN=http://localhost:5173

JWT_ACCESS_SECRET=CHAVE-ACCESS-32-CHARACTERS-LONG-ABC
JWT_REFRESH_SECRET=CHAVE-REFRESH-32-CHARACTERS-LONG-XYZ
REFRESH_TTL_DAYS=30
BCRYPT_ROUNDS=11

OFFLINE_MINUTES=10
A_THR=2.5
B_THR=2.5
TZ_BACKEND=UTC
"@ | Out-File -FilePath "apps/api/.env" -Encoding UTF8

# .gitignore
Write-Host "📝 Criando .gitignore..." -ForegroundColor Yellow
@"
node_modules/
dist/
.env
.env.local
*.log
coverage/
.vscode/
.DS_Store
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8

# src/types/database.ts
Write-Host "📝 Criando types/database.ts..." -ForegroundColor Yellow
@"
export type PerfilEnum = 'colaborador' | 'gestor' | 'admin';
export type TipoVeiculoEnum = 'leve' | 'utilitario' | 'moto' | 'caminhao' | 'outro';
export type CombustivelEnum = 'gasolina' | 'etanol' | 'diesel' | 'flex' | 'elétrico' | 'gnv' | 'outro';
export type CnhCategoriaEnum = 'A' | 'B' | 'C' | 'D' | 'E' | 'AB' | 'AC' | 'AD' | 'AE';
export type StatusDispositivoEnum = 'conectado' | 'offline' | 'nunca_pareado';
export type VehicleStatusEnum = 'disponivel' | 'em_uso' | 'offline' | 'sem_dispositivo' | 'inativo';

export interface Database {
  usuarios: UsuariosTable;
  veiculos: VeiculosTable;
  dispositivos: DispositivosTable;
  reservas: ReservasTable;
  telemetria: TelemetriaTable;
  auditoria_logs: AuditoriaLogsTable;
  auth_refresh_tokens: AuthRefreshTokensTable;
}

export interface UsuariosTable {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  cpf: string | null;
  cnh_numero: string | null;
  cnh_categoria: CnhCategoriaEnum | null;
  cnh_validade: Date | null;
  perfil: PerfilEnum;
  unidade_id: string | null;
  cargo: string | null;
  avatar_url: string | null;
  observacao: string | null;
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface VeiculosTable {
  id: string;
  nome: string;
  placa: string;
  renavam: string | null;
  chassi: string | null;
  tipo: TipoVeiculoEnum;
  ano_modelo: number | null;
  combustivel: CombustivelEnum | null;
  odometro: number;
  consumo_medio: number | null;
  cor_hex: string;
  unidade_id: string | null;
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface DispositivosTable {
  id: string;
  serial: string;
  modelo: string;
  status: StatusDispositivoEnum;
  last_seen: Date | null;
  veiculo_id: string | null;
  acelerometro: boolean;
  giroscopio: boolean;
  magnetometro: boolean;
  barometro: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ReservasTable {
  id: string;
  veiculo_id: string;
  user_id: string;
  start_at: Date;
  end_at: Date;
  note: string | null;
  canceled_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface TelemetriaTable {
  id: string;
  dispositivo_id: string;
  veiculo_id: string;
  ts: Date;
  ax: number | null;
  ay: number | null;
  az: number | null;
  gx: number | null;
  gy: number | null;
  gz: number | null;
  mx: number | null;
  my: number | null;
  mz: number | null;
  pressao: number | null;
}

export interface AuditoriaLogsTable {
  id: string;
  actor_user_id: string | null;
  entity: string;
  entity_id: string;
  action: string;
  payload: Record<string, any> | null;
  ip: string | null;
  user_agent: string | null;
  created_at: Date;
}

export interface AuthRefreshTokensTable {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
  revoked_at: Date | null;
}
"@ | Out-File -FilePath "apps/api/src/types/database.ts" -Encoding UTF8

# src/config/env.ts
Write-Host "📝 Criando config/env.ts..." -ForegroundColor Yellow
@"
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  WEB_ORIGIN: z.string().url(),
  
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  REFRESH_TTL_DAYS: z.coerce.number().default(30),
  BCRYPT_ROUNDS: z.coerce.number().min(10).max(15).default(11),
  
  OFFLINE_MINUTES: z.coerce.number().default(10),
  A_THR: z.coerce.number().default(2.5),
  B_THR: z.coerce.number().default(2.5),
  TZ_BACKEND: z.string().default('UTC'),
});

const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
  console.error('❌ Invalid environment variables:', envParsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = envParsed.data;
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
"@ | Out-File -FilePath "apps/api/src/config/env.ts" -Encoding UTF8

# src/config/db.ts
Write-Host "📝 Criando config/db.ts..." -ForegroundColor Yellow
@"
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { env } from './env';
import type { Database } from '@/types/database';

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool,
  }),
});

export { pool };
"@ | Out-File -FilePath "apps/api/src/config/db.ts" -Encoding UTF8

# src/utils/logger.ts
Write-Host "📝 Criando utils/logger.ts..." -ForegroundColor Yellow
@"
import pino from 'pino';
import { env, isDevelopment } from '@/config/env';

export const logger = pino({
  level: isDevelopment ? 'debug' : 'info',
  transport: isDevelopment ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'yyyy-mm-dd HH:MM:ss',
    },
  } : undefined,
  redact: {
    paths: ['password', 'token', 'authorization'],
    censor: '[REDACTED]',
  },
});
"@ | Out-File -FilePath "apps/api/src/utils/logger.ts" -Encoding UTF8

# src/middlewares/requestId.ts
Write-Host "📝 Criando middlewares/requestId.ts..." -ForegroundColor Yellow
@"
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.id = (req.headers['x-request-id'] as string) || uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
};

declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: {
        id: string;
        perfil: string;
        email?: string;
      };
    }
  }
}
"@ | Out-File -FilePath "apps/api/src/middlewares/requestId.ts" -Encoding UTF8

# src/server.ts
Write-Host "📝 Criando server.ts..." -ForegroundColor Yellow
@"
import express from 'express';
import { env, isDevelopment } from '@/config/env';
import { logger } from '@/utils/logger';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    name: 'autocheck-api',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

const server = app.listen(env.PORT, () => {
  logger.info({
    port: env.PORT,
    env: env.NODE_ENV,
    pid: process.pid,
  }, ``AutoCheck API started on port ``${env.PORT}``);
  
  if (isDevelopment) {
    logger.info(``Health Check: http://localhost:``${env.PORT}``/health``);
  }
});

const gracefulShutdown = (signal: string) => {
  logger.info({ signal }, 'Shutting down gracefully...');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  
  setTimeout(() => {
    logger.error('Forced shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
"@ | Out-File -FilePath "apps/api/src/server.ts" -Encoding UTF8

# README.md
Write-Host "📝 Criando README.md..." -ForegroundColor Yellow
@"
# AutoCheck API

Sistema de Gerenciamento de Veículos para empresas de pequeno e médio porte.

## Stack

- Node.js 20 + TypeScript
- Express
- PostgreSQL 15+
- Kysely (SQL type-safe)
- Docker

## Setup

``````bash
# Instalar dependências
cd apps/api
npm install

# Subir banco de dados
docker compose up -d db

# Rodar em desenvolvimento
npm run dev
``````

## Credenciais de Desenvolvimento

- admin@autocheck.com / autocheck123 (admin)
- maria.oliveira@autocheck.com / autocheck123 (gestor)
- joao.silva@autocheck.com / autocheck123 (colaborador)

## Endpoints

- GET /health - Health check

## Autor

João Vítor Barchfeld - TCC SETREM 2025
"@ | Out-File -FilePath "README.md" -Encoding UTF8

Write-Host ""
Write-Host "✅ Estrutura criada com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. cd apps/api" -ForegroundColor White
Write-Host "2. npm install" -ForegroundColor White
Write-Host "3. docker compose down -v && docker compose up -d db" -ForegroundColor White
Write-Host "4. npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Depois acesse: http://localhost:3000/health" -ForegroundColor Yellow