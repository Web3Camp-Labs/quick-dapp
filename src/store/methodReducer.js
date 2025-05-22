/**
 * Reducer for managing method call state in AppMethod component
 */

// Action types
export const METHOD_ACTIONS = {
  SET_METHOD_DATA: 'SET_METHOD_DATA',
  SET_METHOD_VALUES: 'SET_METHOD_VALUES',
  UPDATE_METHOD_VALUE: 'UPDATE_METHOD_VALUE',
  SET_PAYABLE_VALUE: 'SET_PAYABLE_VALUE',
  CALL_METHOD_START: 'CALL_METHOD_START',
  CALL_METHOD_SUCCESS: 'CALL_METHOD_SUCCESS',
  CALL_METHOD_ERROR: 'CALL_METHOD_ERROR',
  RESET_RESULT: 'RESET_RESULT',
};

// Initial state
export const initialMethodState = {
  methodName: '',
  methodInputs: [],
  methodValues: [],
  methodStateMutability: '',
  payableValue: '0',
  isLoading: false,
  callResult: '',
  displayResult: '',
  resultType: null, // 'success', 'error', or null
  showResult: false,
  transactionHash: null,
  blockNumber: null,
};

/**
 * Method reducer function
 * @param {Object} state - Current state
 * @param {Object} action - Dispatched action
 * @returns {Object} - New state
 */
export const methodReducer = (state, action) => {
  switch (action.type) {
    case METHOD_ACTIONS.SET_METHOD_DATA:
      return {
        ...state,
        methodName: action.payload.name,
        methodInputs: action.payload.inputs,
        methodValues: action.payload.inputs.map(() => null),
        methodStateMutability: action.payload.stateMutability,
        // Reset result when method changes
        callResult: '',
        displayResult: '',
        resultType: null,
        showResult: false,
        transactionHash: null,
        blockNumber: null,
      };
      
    case METHOD_ACTIONS.SET_METHOD_VALUES:
      return {
        ...state,
        methodValues: action.payload,
      };
      
    case METHOD_ACTIONS.UPDATE_METHOD_VALUE:
      const newValues = [...state.methodValues];
      newValues[action.payload.index] = action.payload.value;
      return {
        ...state,
        methodValues: newValues,
      };
      
    case METHOD_ACTIONS.SET_PAYABLE_VALUE:
      return {
        ...state,
        payableValue: action.payload,
      };
      
    case METHOD_ACTIONS.CALL_METHOD_START:
      return {
        ...state,
        isLoading: true,
        callResult: '',
        displayResult: '',
        showResult: false,
        resultType: null,
        transactionHash: null,
        blockNumber: null,
      };
      
    case METHOD_ACTIONS.CALL_METHOD_SUCCESS:
      return {
        ...state,
        isLoading: false,
        callResult: action.payload.result,
        displayResult: action.payload.result,
        resultType: 'success',
        showResult: true,
        transactionHash: action.payload.transactionHash,
        blockNumber: action.payload.blockNumber,
      };
      
    case METHOD_ACTIONS.CALL_METHOD_ERROR:
      return {
        ...state,
        isLoading: false,
        callResult: action.payload,
        displayResult: action.payload,
        resultType: 'error',
        showResult: true,
      };
      
    case METHOD_ACTIONS.RESET_RESULT:
      return {
        ...state,
        callResult: '',
        displayResult: '',
        resultType: null,
        showResult: false,
        transactionHash: null,
        blockNumber: null,
      };
      
    default:
      return state;
  }
};
