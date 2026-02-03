import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import './Layout.css';

const MainLayout = () => {
    return (
        <div className="app-layout">
            <Navbar />
            <main className="main-content-full">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
