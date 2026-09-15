import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useToast } from '../../context/ToastContext';
import Icon from '../../components/Icon';

const PAGE_SIZE = 12;

function formatMemberSince(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('default', { month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

function CompanyCard({ company, onViewCompany, onViewJobs }) {
  return (
    <div className="company-card">
      <div className="company-card-top">
        <div className="icon-badge violet" style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0 }}>
          <Icon name="building" size={24} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="company-card-name">{company.name}</div>
          <div className="muted mono" style={{ fontSize: 11, marginTop: 2 }}>
            On HireMind since {formatMemberSince(company.member_since)}
          </div>
        </div>
      </div>

      <div className="company-card-stat">
        <Icon name="briefcase" size={13} />
        <span>{company.open_jobs_count} open position{company.open_jobs_count === 1 ? '' : 's'}</span>
      </div>

      <div className="company-card-actions">
        <button type="button" className="secondary small" onClick={() => onViewCompany(company)}>View Company</button>
        <button type="button" className="small" onClick={() => onViewJobs(company)}>View Jobs</button>
      </div>
    </div>
  );
}

export default function ChooseCompany() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [companies, setCompanies] = useState(null);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  // Debounce the search box so we're not firing a request on every
  // keystroke — matches the "debounced search" / "avoid unnecessary API
  // requests" requirement for this feature specifically.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async (targetPage, replace) => {
    if (replace) setCompanies(null); else setLoadingMore(true);
    try {
      const qs = new URLSearchParams({ page: String(targetPage), page_size: String(PAGE_SIZE) });
      if (debouncedSearch) qs.set('search', debouncedSearch);
      const data = await apiRequest(`/companies?${qs.toString()}`);
      setTotal(data.total);
      setCompanies((prev) => (replace || !prev ? data.items : [...prev, ...data.items]));
      setPage(targetPage);
    } catch (e) {
      toast(e.message, 'error');
      if (replace) setCompanies([]);
    } finally {
      setLoadingMore(false);
    }
  }, [debouncedSearch, toast]);

  useEffect(() => { load(1, true); }, [load]);

  function loadMore() {
    load(page + 1, false);
  }

  function goToCompany(company, focusJobs) {
    navigate(`/candidate/companies/${company.id}${focusJobs ? '?focus=jobs' : ''}`);
  }

  return (
    <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
      <style>{`
        .aesthetic-search-wrapper {
          background: linear-gradient(135deg, rgba(22, 16, 42, 0.8) 0%, rgba(10, 12, 26, 0.95) 100%);
          border: 1.5px solid rgba(139, 92, 246, 0.4);
          box-shadow: inset 0 0 25px rgba(139, 92, 246, 0.06), 0 8px 30px rgba(0, 0, 0, 0.4);
          border-radius: 18px;
          padding: 16px 20px;
          margin-bottom: 22px;
          box-sizing: border-box;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          backdrop-filter: blur(12px);
        }
        .aesthetic-search-input-box {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }
        .aesthetic-search-input-box input {
          width: 100%;
          background: rgba(12, 10, 24, 0.9);
          border: 1.5px solid rgba(139, 92, 246, 0.35);
          border-radius: 12px;
          padding: 12px 42px 12px 48px;
          color: #fff;
          font-size: 13.5px;
          box-sizing: border-box;
          outline: none;
          font-family: Inter, sans-serif;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          height: 46px;
        }
        .aesthetic-search-input-box input:focus {
          border-color: rgba(168, 85, 247, 0.9);
          box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4), 0 0 15px rgba(139, 92, 246, 0.3);
        }
        .aesthetic-search-icon-badge {
          position: absolute;
          left: 10px;
          top: 0;
          bottom: 0;
          margin: auto;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c084fc;
          pointer-events: none;
        }

        .company-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
          gap: 18px;
        }
        .company-card {
          background: linear-gradient(135deg, rgba(20, 15, 38, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%);
          border: 1.5px solid rgba(139, 92, 246, 0.4);
          box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.05), 0 4px 20px rgba(0, 0, 0, 0.4);
          border-radius: 18px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          transition: all 0.2s ease;
        }
        .company-card:hover {
          border-color: rgba(139, 92, 246, 0.65);
          transform: translateY(-2px);
        }
        .company-card-top {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .company-card-name {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 16px;
          color: #f8fafc;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .company-card-stat {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          color: #a78bfa;
          font-family: var(--font-mono);
          padding: 8px 12px;
          border-radius: 10px;
          background: rgba(139, 92, 246, 0.08);
          border: 1px solid rgba(139, 92, 246, 0.25);
          width: fit-content;
        }
        .company-card-actions {
          display: flex;
          gap: 10px;
          margin-top: auto;
        }
        .company-card-actions button {
          flex: 1;
          margin: 0;
        }
        .load-more-wrap {
          display: flex;
          justify-content: center;
          margin-top: 18px;
        }

        @media (max-width: 520px) {
          .company-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="page-header">
        <div className="page-eyebrow">ATS pipeline</div>
        <h1 className="page-title">Choose <span className="hl">Company</span></h1>
        <p className="page-sub">Discover companies and explore opportunities that match your career goals.</p>
      </div>

      <div className="aesthetic-search-wrapper">
        <div className="aesthetic-search-input-box">
          <span className="aesthetic-search-icon-badge"><Icon name="search" size={14} /></span>
          <input
            type="text"
            placeholder="Search companies, jobs, skills..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {companies === null && (
        <>
          <div className="skeleton sk-row" />
          <div className="skeleton sk-row" />
        </>
      )}

      {companies && companies.length === 0 && (
        <div className="card empty-state">
          <div className="es-icon"><Icon name="building" size={22} /></div>
          <div className="es-title">
            {debouncedSearch ? 'No companies or jobs match your search.' : 'No companies found.'}
          </div>
        </div>
      )}

      {companies && companies.length > 0 && (
        <>
          <div className="company-grid">
            {companies.map((c) => (
              <CompanyCard
                key={c.id}
                company={c}
                onViewCompany={(co) => goToCompany(co, false)}
                onViewJobs={(co) => goToCompany(co, true)}
              />
            ))}
          </div>

          {companies.length < total && (
            <div className="load-more-wrap">
              <button type="button" className="secondary" disabled={loadingMore} onClick={loadMore}>
                {loadingMore ? 'Loading...' : `Load more (${companies.length}/${total})`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
