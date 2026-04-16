import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Footer.css';

export default function Footer() {
  const { isAuthenticated } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-inner">

        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo">
            <svg width="28" height="26" viewBox="0 0 30 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 2L2 12.5V27h9v-8h8v8h9V12.5L15 2Z" fill="#e55c2f"/>
              <path d="M15 2L2 12.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M15 2L28 12.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
              <rect x="12" y="19" width="6" height="8" rx="1" fill="#fff" opacity="0.3"/>
            </svg>
            <span className="footer-brand-name">LogementFacile</span>
          </div>
          <p className="footer-tagline">
            La plateforme de location immobilière simple,<br/>sécurisée et transparente.
          </p>
        </div>

        {/* Liens */}
        <div className="footer-cols">
          <div className="footer-col">
            <h4 className="footer-col-title">Plateforme</h4>
            <ul className="footer-links">
              <li><Link to="/properties">Parcourir les logements</Link></li>
              <li><Link to="/register">Devenir propriétaire</Link></li>
              {!isAuthenticated && <li><Link to="/login">Se connecter</Link></li>}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Légal</h4>
            <ul className="footer-links">
              <li><a href="#">Mentions légales</a></li>
              <li><a href="#">Conditions générales d'utilisation</a></li>
              <li><a href="#">Politique de confidentialité</a></li>
              <li><a href="#">Gestion des cookies</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">RGPD</h4>
            <ul className="footer-links">
              <li><a href="#">Vos droits (accès, rectification)</a></li>
              <li><a href="#">Demande de suppression</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Contact</h4>
            <ul className="footer-links">
              <li><a href="#">Formulaire de contact</a></li>
              <li><a href="#">Aide & support</a></li>
              <li><a href="#">Signaler un problème</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {year} LogementFacile. Tous droits réservés.</p>
          <p className="footer-legal-note">
            Conforme au RGPD (Règlement UE 2016/679) — Hébergement : France.
          </p>
        </div>
      </div>
    </footer>
  );
}
