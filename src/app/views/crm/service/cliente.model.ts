export interface ClienteAPI {
    content: Cliente[];
    pageable: Pageable;
    totalPages: number;
    totalElements: number;
    last: false;
    size: number;
    numberOfElements: number;
    first: true;
    number: number;
    sort: Sort;
}

export interface RegraPontuacaoAPI {
    content: RegraPontuacao[];
    pageable: Pageable;
    totalPages: number;
    totalElements: number;
    last: false;
    size: number;
    numberOfElements: number;
    first: true;
    number: number;
    sort: Sort;
}

export interface Pageable {
    sort: Sort;
    offset: number;
    pageSize: number;
    pageNumber: number;
    paged: true;
    unpaged: boolean;
}


export interface Sort {
    sorted: boolean;
    unsorted: boolean;
}

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




