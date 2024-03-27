import React, {
    createContext,
    type FC,
    type PropsWithChildren,
    useContext,
    useReducer
} from 'react';

import {
    type InitialConfig,
    type PaginationAction,
    type PaginationMethods,
    type TPaginationContext
} from './types';

const initialState: TPaginationContext = {
    goNextPage: () => {},
    goPreviousPage: () => {},
    goLastPage: () => {},
    goFirstPage: () => {},
    usePaginationEffect: () => {},
    getPaginationVariables: () => undefined,
    getPaginationEntry: () => ({}),
    setCountPerPage: () => {}
};

function getEntry(state: TPaginationContext, dataKey: string) {
    const currentItem = state[dataKey];
    return currentItem !== undefined && typeof currentItem === 'object' && currentItem !== null
        ? currentItem
        : {};
}

function paginationReducer(
    state: TPaginationContext,
    action: PaginationAction
): TPaginationContext {
    const entry = getEntry(state, action.dataKey);
    const { dataKey, type } = action;
    const first = entry?.paginationVariables?.first;
    const last = entry?.paginationVariables?.last;

    switch (type) {
        case 'SET_TOTAL_COUNT':
            return {
                ...state,
                [dataKey]: {
                    ...entry,
                    totalCount: action.payload
                }
            };
        case 'SET_COUNT_PER_PAGE':
            return {
                ...state,
                [dataKey]: {
                    ...entry,
                    countPerPage: action.payload,
                    paginationVariables: {
                        ...entry?.paginationVariables,
                        first: first ?? (!first && !last) ? action.payload : null,
                        last: last ? action.payload : null
                    }
                }
            };
        case 'SET_CURRENT_PAGE':
            return {
                ...state,
                [dataKey]: { ...entry, currentPage: action.payload }
            };
        case 'SET_HAS_NEXT_PAGE':
            return {
                ...state,
                [dataKey]: { ...entry, hasNextPage: action.payload }
            };
        case 'SET_HAS_PREVIOUS_PAGE':
            return {
                ...state,
                [dataKey]: { ...entry, hasPreviousPage: action.payload }
            };
        case 'SET_NEXT_PAGE_CURSOR':
            return {
                ...state,
                [dataKey]: { ...entry, endCursor: action.payload }
            };
        case 'SET_PREVIOUS_PAGE_CURSOR':
            return {
                ...state,
                [dataKey]: { ...entry, startCursor: action.payload }
            };
        case 'SET_FIRST':
            return {
                ...state,
                [dataKey]: {
                    ...entry,
                    paginationVariables: {
                        ...entry?.paginationVariables,
                        first: action.payload
                    }
                }
            };
        case 'SET_LAST':
            return {
                ...state,
                [dataKey]: {
                    ...entry,
                    paginationVariables: {
                        ...entry?.paginationVariables,
                        last: action.payload
                    }
                }
            };
        case 'GO_PREVIOUS_PAGE':
            return {
                ...state,
                [dataKey]: {
                    ...entry,
                    paginationVariables: {
                        last: entry.countPerPage,
                        before: entry.startCursor,
                        after: null,
                        first: null
                    },
                    currentPage: (entry?.currentPage ?? 1) - 1
                }
            };
        case 'GO_NEXT_PAGE':
            return {
                ...state,
                [dataKey]: {
                    ...entry,
                    currentPage: (entry?.currentPage ?? 1) + 1,
                    paginationVariables: {
                        first: entry.countPerPage,
                        after: entry.endCursor,
                        before: null,
                        last: null
                    }
                }
            };
        case 'GO_FIRST_PAGE':
            return {
                ...state,
                [dataKey]: {
                    ...entry,
                    paginationVariables: {
                        first: entry.countPerPage,
                        last: null,
                        before: null,
                        after: null
                    },
                    currentPage: 1
                }
            };
        case 'GO_LAST_PAGE':
            return {
                ...state,
                [dataKey]: {
                    ...entry,
                    paginationVariables: { after: null, before: null, first: null, last: entry.countPerPage },
                    currentPage: action.payload
                }
            };
        default:
            return state;
    }
}

const PaginationContext = createContext<TPaginationContext>(initialState);

export const PaginationProvider: FC<PropsWithChildren> = ({ children }) => {
    const [state, dispatch] = useReducer(paginationReducer, initialState);

    const getPagesAmount = (dataKey: string) => {
        const entry = getEntry(state, dataKey);
        const calc = Math.ceil(Number(entry?.totalCount) / Number(entry?.countPerPage));
        return Number.isNaN(calc) ? 1 : calc;
    };

    function setLast(dataKey: string, count: number | null) {
        const entry = getEntry(state, dataKey);
        if (count !== entry?.paginationVariables?.last)
            dispatch({ type: 'SET_LAST', dataKey, payload: count });
    }

    function setFirst(dataKey: string, count: number | null) {
        const entry = getEntry(state, dataKey);
        if (count !== entry?.paginationVariables?.first)
            dispatch({ type: 'SET_FIRST', dataKey, payload: count });
    }

    function setTotalCount(dataKey: string, totalCount: number) {
        const entry = getEntry(state, dataKey);
        if (totalCount !== entry?.totalCount)
            dispatch({ type: 'SET_TOTAL_COUNT', dataKey, payload: totalCount });
    }

    function setCountPerPage(dataKey: string, countPerPage: number) {
        const entry = getEntry(state, dataKey);
        if (countPerPage !== entry?.countPerPage)
            dispatch({ type: 'SET_COUNT_PER_PAGE', dataKey, payload: countPerPage });
    }

    function setHasNextPage(dataKey: string, hasNextPage: boolean) {
        const entry = getEntry(state, dataKey);
        if (hasNextPage !== entry?.hasNextPage)
            dispatch({ type: 'SET_HAS_NEXT_PAGE', dataKey, payload: hasNextPage });
    }

    function setHasPreviousPage(dataKey: string, hasPreviousPage: boolean) {
        const entry = getEntry(state, dataKey);
        if (hasPreviousPage !== entry?.hasPreviousPage)
            dispatch({ type: 'SET_HAS_PREVIOUS_PAGE', dataKey, payload: hasPreviousPage });
    }

    function setCursorPreviousPage(dataKey: string, cursor: string | null) {
        const entry = getEntry(state, dataKey);
        if (cursor !== entry?.startCursor)
            dispatch({ type: 'SET_PREVIOUS_PAGE_CURSOR', dataKey, payload: cursor });
    }

    function setCursorNextPage(dataKey: string, cursor: string | null) {
        const entry = getEntry(state, dataKey);
        if (cursor !== entry?.endCursor)
            dispatch({ type: 'SET_NEXT_PAGE_CURSOR', dataKey, payload: cursor });
    }

    function goPreviousPage(dataKey: string) {
        dispatch({ type: 'GO_PREVIOUS_PAGE', dataKey });
    }

    function goNextPage(dataKey: string) {
        dispatch({ type: 'GO_NEXT_PAGE', dataKey });
    }

    function goFirstPage(dataKey: string) {
        dispatch({ type: 'GO_FIRST_PAGE', dataKey });
    }

    function goLastPage(dataKey: string) {
        dispatch({ type: 'GO_LAST_PAGE', dataKey, payload: getPagesAmount(dataKey) });
    }

    function setCurrentPage(dataKey: string, payload: number) {
        dispatch({ type: 'SET_CURRENT_PAGE', dataKey, payload });
    }

    function getPaginationVariables(dataKey: string) {
        const entry = getEntry(state, dataKey);
        return entry.paginationVariables;
    }

    function getPaginationEntry(dataKey: string) {
        return { ...getEntry(state, dataKey), pagesAmount: getPagesAmount(dataKey) };
    }

    const usePaginationEffect: PaginationMethods['usePaginationEffect'] = (initConfig) => {
        const {
            dataKey,
            hasNextPage,
            hasPreviousPage,
            initItemsPerPage,
            totalCount,
            startCursor,
            endCursor
        } = initConfig

        const entry = getEntry(state, dataKey);
        const countPerPage = entry?.countPerPage ?? initItemsPerPage;

        if (startCursor && entry.startCursor !== startCursor)
            setCursorPreviousPage(dataKey, startCursor);
        if (endCursor && entry.endCursor !== endCursor) setCursorNextPage(dataKey, endCursor);
        if (!entry.currentPage) setCurrentPage(dataKey, 1);
        if (!entry.countPerPage) setCountPerPage(dataKey, countPerPage);
        if (entry?.hasNextPage !== hasNextPage) setHasNextPage(dataKey, hasNextPage);
        if (entry?.hasPreviousPage !== hasPreviousPage) setHasPreviousPage(dataKey, hasPreviousPage);
        if (!entry?.paginationVariables?.first && !entry?.paginationVariables?.last)
            setFirst(dataKey, countPerPage);
        if (entry?.paginationVariables?.first) setFirst(dataKey, countPerPage);
        if (entry?.paginationVariables?.last) setLast(dataKey, countPerPage);
        if (!entry?.paginationVariables?.first && !entry?.paginationVariables?.last)
            setFirst(dataKey, countPerPage);
        if (totalCount && totalCount !== entry.totalCount) setTotalCount(dataKey, totalCount);
    };

    return (
        <PaginationContext.Provider
            value={{
                ...state,
                getPaginationEntry,
                usePaginationEffect,
                getPaginationVariables,
                setCountPerPage,
                goNextPage,
                goPreviousPage,
                goLastPage,
                goFirstPage
            }}
        >
            {children}
        </PaginationContext.Provider>
    );
};

export const usePagination = (initConfig?: InitialConfig) => {
    const context = useContext(PaginationContext);
    if (initConfig) context.usePaginationEffect(initConfig);
    return context;
};
