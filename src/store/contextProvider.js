import React, { useContext, useReducer } from 'react';
import reducer from './reducer';
import INIT_STATE from './variables';

const DappContext = React.createContext();

const DappContextProvider = (props) => {
    const [state, dispatch] = useReducer(reducer, { ...INIT_STATE });
    return <DappContext.Provider value={{ state, dispatch }}>
        {props.children}
    </DappContext.Provider>;
};

const useDappContext = () => ({ ...useContext(DappContext) });

export { DappContextProvider, useDappContext };
