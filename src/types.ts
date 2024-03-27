interface PaginationVariables {
    first?: number | null;
    last?: number | null;
    after?: string | null;
    before?: string | null;
}

export interface PaginationDataType {
    paginationVariables?: PaginationVariables;
    totalCount?: number;
    countPerPage?: number;
    currentPage?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    endCursor?: string | null;
    startCursor?: string | null;
    pagesAmount?: number;
}

export interface InitialConfig {
    dataKey: string;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    initItemsPerPage: number;
    totalCount?: number;
    endCursor?: string | null;
    startCursor?: string | null;
}

export interface PaginationMethods {
    setCountPerPage: (dataKey: string, count: number) => void;
    goNextPage: (dataKey: string) => void;
    goPreviousPage: (dataKey: string) => void;
    goLastPage: (dataKey: string) => void;
    goFirstPage: (dataKey: string) => void;
    usePaginationEffect: ({
                              dataKey,
                              hasNextPage,
                              hasPreviousPage,
                              initItemsPerPage,
                              totalCount,
                              endCursor,
                              startCursor
                          }: InitialConfig) => void;
    getPaginationVariables: (dataKey: string) => PaginationVariables | undefined;
    getPaginationEntry: (dataKey: string) => PaginationDataType;
}
export type TPaginationContext = Record<
    string,
    PaginationDataType | PaginationMethods[keyof PaginationMethods]
> &
    PaginationMethods;

export type PaginationAction =
    | { type: 'SET_TOTAL_COUNT'; dataKey: string; payload: number }
    | { type: 'SET_COUNT_PER_PAGE'; dataKey: string; payload: number }
    | { type: 'SET_CURRENT_PAGE'; dataKey: string; payload: number }
    | { type: 'SET_HAS_NEXT_PAGE'; dataKey: string; payload: boolean }
    | { type: 'SET_HAS_PREVIOUS_PAGE'; dataKey: string; payload: boolean }
    | { type: 'SET_NEXT_PAGE_CURSOR'; dataKey: string; payload: string | null }
    | { type: 'SET_PREVIOUS_PAGE_CURSOR'; dataKey: string; payload: string | null }
    | { type: 'SET_FIRST'; dataKey: string; payload: number | null }
    | { type: 'SET_LAST'; dataKey: string; payload: number | null }
    | { type: 'GO_PREVIOUS_PAGE'; dataKey: string }
    | { type: 'GO_NEXT_PAGE'; dataKey: string }
    | { type: 'GO_FIRST_PAGE'; dataKey: string }
    | { type: 'GO_LAST_PAGE'; dataKey: string; payload: number };
