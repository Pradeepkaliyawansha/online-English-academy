import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import "../../styles/Public.css";

const PublicLayout = () => {
  return (
    <div className="public-layout">
      <PublicHeader />
      <main className="public-main">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
