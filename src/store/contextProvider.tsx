import React, { useContext, useReducer, ReactNode } from 'react';
import reducer from './reducer';
import INIT_STATE from './variables';

interface ContextValue {
    state: any;
    dispatch: React.Dispatch<any>;
}

const DappContext = React.createContext<ContextValue | undefined>(undefined);

interface Props {
    children: ReactNode;
}

const DappContextProvider = (props: Props) => {
    const [state, dispatch] = useReducer(reducer, INIT_STATE);
    return <DappContext.Provider value={{ state, dispatch }}>
        {props.children}
    </DappContext.Provider>;
};

const useDappContext = () => {
    const context = useContext(DappContext);
    if (!context) throw new Error('useDappContext must be used within DappContextProvider');
    return context;
};

export { DappContextProvider, useDappContext };
