import type { VeiculoCreateInput, VeiculoUpdateInput, VeiculoFilter } from '../validators/veiculos.schemas';
import type { VeiculoStatus } from '../types/database';
export declare class VeiculosService {
    list(filters: VeiculoFilter): Promise<{
        data: {
            status: VeiculoStatus;
            id: string;
            nome: string;
            ativo: boolean;
            created_at: Date;
            updated_at: Date;
            placa: string;
            tipo: "sedan" | "suv" | "pickup" | "van" | "hatch";
            combustivel: "gasolina" | "etanol" | "diesel" | "flex" | "eletrico" | "hibrido";
            cor_hex: string;
            ano: number | null;
        }[];
        meta: {
            page: number;
            size: number;
            total: number;
            totalPages: number;
        };
    }>;
    getById(id: string): Promise<{
        status: VeiculoStatus;
        dispositivo: {
            id: string;
            identificador: string;
            descricao: string | null;
        } | null;
        id: string;
        nome: string;
        ativo: boolean;
        created_at: Date;
        updated_at: Date;
        placa: string;
        tipo: "sedan" | "suv" | "pickup" | "van" | "hatch";
        combustivel: "gasolina" | "etanol" | "diesel" | "flex" | "eletrico" | "hibrido";
        cor_hex: string;
        ano: number | null;
    }>;
    create(input: VeiculoCreateInput): Promise<{
        id: string;
        nome: string;
        ativo: boolean;
        created_at: Date;
        updated_at: Date;
        placa: string;
        tipo: "sedan" | "suv" | "pickup" | "van" | "hatch";
        combustivel: "gasolina" | "etanol" | "diesel" | "flex" | "eletrico" | "hibrido";
        cor_hex: string;
        ano: number | null;
    }>;
    update(id: string, input: VeiculoUpdateInput): Promise<{
        id: string;
        nome: string;
        ativo: boolean;
        created_at: Date;
        updated_at: Date;
        placa: string;
        tipo: "sedan" | "suv" | "pickup" | "van" | "hatch";
        combustivel: "gasolina" | "etanol" | "diesel" | "flex" | "eletrico" | "hibrido";
        cor_hex: string;
        ano: number | null;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
    toggleAtivo(id: string): Promise<{
        id: string;
        nome: string;
        ativo: boolean;
        created_at: Date;
        updated_at: Date;
        placa: string;
        tipo: "sedan" | "suv" | "pickup" | "van" | "hatch";
        combustivel: "gasolina" | "etanol" | "diesel" | "flex" | "eletrico" | "hibrido";
        cor_hex: string;
        ano: number | null;
    }>;
    private getVeiculoStatus;
}
export declare const veiculosService: VeiculosService;
