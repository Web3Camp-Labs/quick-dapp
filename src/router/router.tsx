import React from 'react';
import AppCreate from '../components/AppCreate';
import AppHome from '../components/AppHome';
import AppDetail from '../components/AppDetail';

import { Navigate, Route, Routes } from 'react-router-dom';


function RouterPath() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/home"></Navigate>}></Route>
            <Route path="/home" element={<AppHome></AppHome>}></Route>
            <Route path="/new" element={<AppCreate></AppCreate>}></Route>
            <Route path="/detail" element={<AppDetail></AppDetail>}></Route>
        </Routes>
    );
}

export default RouterPath;