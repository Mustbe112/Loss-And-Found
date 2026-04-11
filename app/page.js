import Link from 'next/link';

export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .page {
          min-height: 100vh;
          background: #fff;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* Nav */
        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 0.5px solid #e8e8e8;
        }
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #0d0d0d;
          text-decoration: none;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .nav-login {
          font-size: 0.82rem;
          color: #666;
          text-decoration: none;
          letter-spacing: 0.04em;
          padding: 0.45rem 0.75rem;
          border-radius: 4px;
          transition: color 0.2s;
        }
        .nav-login:hover { color: #0d0d0d; }
        .nav-cta {
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: #0d0d0d;
          color: #fff;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          transition: background 0.2s;
        }
        .nav-cta:hover { background: #222; }

        /* Hero */
        .hero {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: calc(100vh - 73px);
        }

        .hero-left {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 4rem 3rem 4rem 3rem;
          border-right: 0.5px solid #e8e8e8;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 1.5rem;
        }
        .eyebrow-line {
          width: 24px;
          height: 1px;
          background: #ccc;
        }

        .hero-left h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.4rem, 4vw, 4rem);
          color: #0d0d0d;
          line-height: 1.1;
          margin-bottom: 1.5rem;
        }
        .hero-left h1 em {
          font-style: italic;
          color: #555;
        }

        .hero-left p {
          color: #777;
          font-size: 1rem;
          line-height: 1.8;
          max-width: 380px;
          margin-bottom: 2.5rem;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #0d0d0d;
          color: #fff;
          text-decoration: none;
          padding: 0.85rem 1.75rem;
          border-radius: 4px;
          font-size: 0.82rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: background 0.2s;
        }
        .btn-primary:hover { background: #222; }
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: #555;
          text-decoration: none;
          font-size: 0.85rem;
          border-bottom: 1px solid #ccc;
          padding-bottom: 2px;
          transition: color 0.2s, border-color 0.2s;
        }
        .btn-secondary:hover { color: #0d0d0d; border-color: #0d0d0d; }

        .hero-stats {
          display: flex;
          gap: 2rem;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 0.5px solid #ebebeb;
        }
        .stat-item { }
        .stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          color: #0d0d0d;
          line-height: 1;
          margin-bottom: 4px;
        }
        .stat-label {
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #aaa;
        }

        /* Hero right */
        .hero-right {
          background: #0d0d0d;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 4rem 3rem;
          position: relative;
          overflow: hidden;
        }
        .hero-right::before {
          content: '';
          position: absolute;
          top: -100px; right: -100px;
          width: 400px; height: 400px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.04);
        }
        .hero-right::after {
          content: '';
          position: absolute;
          bottom: -60px; left: -60px;
          width: 250px; height: 250px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.03);
        }

        .feature-cards {
          display: flex;
          flex-direction: column;
          gap: 1px;
          z-index: 1;
        }
        .feature-card {
          background: rgba(255,255,255,0.03);
          border: 0.5px solid rgba(255,255,255,0.07);
          border-radius: 8px;
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 0.75rem;
          transition: background 0.2s;
        }
        .feature-card:last-child { margin-bottom: 0; }
        .feature-icon {
          width: 32px; height: 32px;
          border-radius: 6px;
          background: rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .feature-text h3 {
          color: #fff;
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 4px;
        }
        .feature-text p {
          color: #555;
          font-size: 0.78rem;
          line-height: 1.6;
        }

        .right-label {
          z-index: 1;
          font-size: 0.7rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #444;
          margin-bottom: 1.5rem;
        }

        /* ── Mobile (≤ 480px) ── */
        @media (max-width: 480px) {
          .nav {
            padding: 1rem 1.25rem;
          }
          .nav-brand {
            font-size: 0.75rem;
          }
          .nav-cta {
            font-size: 0.72rem;
            padding: 0.45rem 0.85rem;
          }

          .hero {
            grid-template-columns: 1fr;
            min-height: auto;
          }

          .hero-left {
            padding: 2.5rem 1.25rem 2rem;
            border-right: none;
            border-bottom: 0.5px solid #e8e8e8;
          }

          .hero-left h1 {
            font-size: 2.2rem;
          }

          .hero-left p {
            font-size: 0.95rem;
            margin-bottom: 2rem;
            max-width: 100%;
          }

          .hero-actions {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.85rem;
          }

          .btn-primary {
            width: 100%;
            justify-content: center;
            padding: 0.9rem 1.5rem;
          }

          .hero-stats {
            gap: 1.25rem;
            margin-top: 2rem;
            flex-wrap: wrap;
          }

          .stat-num {
            font-size: 1.4rem;
          }

          .hero-right {
            padding: 2rem 1.25rem 2.5rem;
          }

          .feature-card {
            padding: 1rem 1.1rem;
          }

          .feature-text h3 {
            font-size: 0.85rem;
          }

          .feature-text p {
            font-size: 0.76rem;
          }
        }

        /* ── Small tablet / large phone (481px – 768px) ── */
        @media (min-width: 481px) and (max-width: 768px) {
          .nav { padding: 1.25rem 1.5rem; }

          .hero {
            grid-template-columns: 1fr;
            min-height: auto;
          }

          .hero-left {
            padding: 3rem 2rem;
            border-right: none;
            border-bottom: 0.5px solid #e8e8e8;
          }

          .hero-left h1 {
            font-size: clamp(2.4rem, 6vw, 3rem);
          }

          .hero-left p {
            max-width: 100%;
          }

          .hero-actions {
            flex-wrap: wrap;
            gap: 0.75rem;
          }

          .btn-primary {
            flex: 1;
            justify-content: center;
            min-width: 160px;
          }

          .hero-stats { gap: 1.5rem; }

          .hero-right { padding: 2.5rem 2rem; }
        }
      `}</style>

      <div className="page">
        {/* Nav */}
        <nav className="nav">
          <Link href="/" className="nav-brand">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L13.8 9.2L21 11L13.8 12.8L12 20L10.2 12.8L3 11L10.2 9.2L12 2Z" stroke="#0d0d0d" strokeWidth="1.5" fill="none"/>
            </svg>
            Lost &amp; Found
          </Link>
          <div className="nav-links">
            <Link href="/login" className="nav-login">Sign in</Link>
            <Link href="/register" className="nav-cta">Get Started</Link>
          </div>
        </nav>

        {/* Hero */}
        <div className="hero">
          {/* Left */}
          <div className="hero-left">
            <span className="eyebrow">
              <span className="eyebrow-line"></span>
              AI-Powered Platform
            </span>

            <h1>
              Lost something?<br/>
              <em>We'll find it.</em>
            </h1>

            <p>
              A smart lost &amp; found system for your campus or community.
              Report missing items, get AI-matched results, and reunite with
              your belongings — fast.
            </p>

            <div className="hero-actions">
              <Link href="/register" className="btn-primary">
                Get Started
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link href="/login" className="btn-secondary">
                Sign in
              </Link>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-num">100+</div>
                <div className="stat-label">Items Recovered</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">94%</div>
                <div className="stat-label">Match Accuracy</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">48h</div>
                <div className="stat-label">Avg. Return Time</div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="hero-right">
            <p className="right-label">How it works</p>
            <div className="feature-cards">
              {[
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5v14M5 12h14" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  ),
                  title: 'Report an item',
                  desc: 'Describe what you lost or found. Add photos and a location in seconds.',
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="11" cy="11" r="7" stroke="#888" strokeWidth="1.5"/>
                      <path d="M16.5 16.5L21 21" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  ),
                  title: 'AI finds matches',
                  desc: 'Our system scans reports and surfaces the most likely matches automatically.',
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ),
                  title: 'Reunite & resolve',
                  desc: 'Connect with the finder directly and mark your item as returned.',
                },
              ].map((f, i) => (
                <div key={i} className="feature-card">
                  <div className="feature-icon">{f.icon}</div>
                  <div className="feature-text">
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}