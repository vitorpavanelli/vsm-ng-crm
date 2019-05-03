export interface Cliente {
    id: number;
    nome: string;
    idade: number;
    genero: string;
    cpf: string;
    email: string;
    endereco: Endereco;
}

export interface Endereco {
    id: number;
    rua: string;
    cidade: string;
    estado: string;
    cep: string;
}

export interface RegraPontuacao {
    id: number;
    valorInicio: number; // float
    valorFim: number; // float
    inicio: string; // date
    fim: string; // date
    pontos: number; // int
}
