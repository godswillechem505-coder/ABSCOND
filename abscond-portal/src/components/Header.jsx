import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { siteConfig } from "../data/homeData";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isPath = (path) => location.pathname === path;



  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <header className="abscons-header" role="banner">
        <div className="header-container">
          {/* Left: Coat of Arms + Title & Motto */}
          <Link to="/" className="header-brand" aria-label={`${siteConfig.brandName} Home`}>
            <img
              src={siteConfig.logo}
              alt="Abia State Coat of Arms"
              className="header-logo-img"
            />
            <div className="header-brand-text">
              <span className="header-subtitle">{siteConfig.institutionName}</span>
              <h1 className="header-title">{siteConfig.brandName}</h1>
              <p className="header-tagline">{siteConfig.tagline}</p>
            </div>
          </Link>

        {/* Right: Navigation Rows */}
        <div className="header-nav-wrapper">
          {/* Top Row: Primary Navigation + Student Portal + Admin Portal */}
          <div className="header-top-row">
            <nav className="header-primary-nav">
              <Link
                to="/"
                className={`nav-link ${isPath("/") ? "active" : ""}`}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`nav-link ${isPath("/about") ? "active" : ""}`}
              >
                About Us
              </Link>
              <Link
                to="/campuses"
                className={`nav-link ${isPath("/campuses") ? "active" : ""}`}
              >
                Campuses
              </Link>
              <Link
                to="/programmes"
                className={`nav-link ${isPath("/programmes") ? "active" : ""}`}
              >
                Programmes
              </Link>
              <Link
                to="/admissions"
                className={`nav-link ${isPath("/admissions") ? "active" : ""}`}
              >
                Admissions
              </Link>
            </nav>
            <div className="header-portal-actions">
              <Link to="/login" className="header-portal-btn">
                Student Portal
              </Link>
              <Link to="/admin" className="header-admin-btn" title="Staff & Administration Access">
                Admin Portal
              </Link>
            </div>
          </div>

          {/* Bottom Row: Secondary Nav + Social Icons */}
          <div className="header-bottom-row">
            <nav className="header-secondary-nav">
              <Link to="/announcements" className={`nav-sublink ${isPath("/announcements") ? "active" : ""}`}>
                News & Announcements
              </Link>
              <Link to="/events" className={`nav-sublink ${isPath("/events") ? "active" : ""}`}>
                Events
              </Link>
              <Link to="/faqs" className={`nav-sublink ${isPath("/faqs") ? "active" : ""}`}>
                FAQs
              </Link>
              <Link to="/contact" className={`nav-sublink ${isPath("/contact") ? "active" : ""}`}>
                Contact Us
              </Link>
            </nav>

            <div className="header-social-icons">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon facebook"
                aria-label="Facebook"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon x-twitter"
                aria-label="X (Twitter)"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon instagram"
                aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon youtube"
                aria-label="YouTube"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="header-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation-drawer"
        >
          <span className={`bar ${mobileMenuOpen ? "open" : ""}`}></span>
          <span className={`bar ${mobileMenuOpen ? "open" : ""}`}></span>
          <span className={`bar ${mobileMenuOpen ? "open" : ""}`}></span>
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-navigation-drawer" className="header-mobile-menu" role="dialog" aria-label="Mobile Navigation">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)}>
            About Us
          </Link>
          <Link to="/campuses" onClick={() => setMobileMenuOpen(false)}>
            Campuses
          </Link>
          <Link to="/programmes" onClick={() => setMobileMenuOpen(false)}>
            Programmes
          </Link>
          <Link to="/admissions" onClick={() => setMobileMenuOpen(false)}>
            Admissions
          </Link>
          <Link to="/announcements" onClick={() => setMobileMenuOpen(false)}>
            News and announcement
          </Link>
          <Link to="/events" onClick={() => setMobileMenuOpen(false)}>
            Events
          </Link>
          <Link to="/faqs" onClick={() => setMobileMenuOpen(false)}>
            FAQs
          </Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
            Contact us
          </Link>
          <Link
            to="/login"
            className="header-portal-btn mobile-portal"
            onClick={() => setMobileMenuOpen(false)}
          >
            Student Portal
          </Link>
          <Link
            to="/admin"
            className="header-admin-btn mobile-portal"
            style={{ marginTop: '8px', background: '#334155' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Admin / Staff Portal
          </Link>
        </div>
      )}

    </header>
    </>
  );
}

