import { useState } from 'react';
import Home from './pages/Home.jsx';
import CENGRForm from './pages/CENGRForm.jsx';
import StudentOrgForm from './pages/StudentOrgForm.jsx';
import EntertainmentForm from './pages/EntertainmentForm.jsx';
import NonEmployeeForm from './pages/NonEmployeeForm.jsx';
import TravelAuthForm from './pages/TravelAuthForm.jsx';
import './reimbursement.css';

export default function ReimbursementApp() {
  const [page, setPage] = useState('home');
  const goHome = () => setPage('home');

  return (
    <div className="reimb">
      {page === 'home'          && <Home onSelect={setPage} />}
      {page === 'cengr'         && <CENGRForm onBack={goHome} />}
      {page === 'student-org'   && <StudentOrgForm onBack={goHome} />}
      {page === 'entertainment' && <EntertainmentForm onBack={goHome} />}
      {page === 'non-employee'  && <NonEmployeeForm onBack={goHome} />}
      {page === 'travel-auth'   && <TravelAuthForm onBack={goHome} />}
    </div>
  );
}
