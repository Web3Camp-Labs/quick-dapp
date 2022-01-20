const reducer = (state, action) => {
    /*
    let data = {};
    switch (action.type) {
        case 'appName':
            data = { ...state, appName: action.payload };
            break;
        case 'appDesc':
            data = { ...state, appDesc: action.payload };
            break;

        case 'appAbi':
            data = { ...state, appAbi: action.payload };
            break;

        case 'appNetwork':
            data = { ...state, appNetwork: action.payload };
            break;

        case 'appAddress':
            data = { ...state, appAddress: action.payload };
            break;
        default:
            break;
    }
    return data;
    */

    return { ...state, appData: action.payload };
}

export default reducer;