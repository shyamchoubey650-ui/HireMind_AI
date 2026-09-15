import { useState, useEffect } from 'react';
import { apiRequest } from '../../api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';

function TakeAssessment({ assessmentId, onDone }) {
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const toast = useToast();

  useEffect(() => {
    apiRequest(`/assessments/${assessmentId}/questions`).then(setQuestions).catch(() => setQuestions([]));
  }, [assessmentId]);

  function setAnswer(qid, value) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }

  async function submit() {
    try {
      const data = await apiRequest(`/assessments/${assessmentId}/submit`, { method: 'POST', body: { answers } });
      toast(`Submitted — scored ${data.score}%`, 'success');
      setResult(data);
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  if (result) {
    return (
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 6 }}>Result</h2>
        <div className="ac-score" style={{ fontSize: 32, marginBottom: 16 }}>{result.score}%</div>
        {result.per_question_feedback.map((f, i) => (
          <div className="question-card" key={i}>
            <div className="q-meta"><span className="q-num">Question {i + 1}</span></div>
            <div className="q-text">{f.question}</div>
            <div className={`q-feedback ${f.points >= f.max_points * 0.8 ? 'correct' : f.points > 0 ? 'partial' : 'incorrect'}`}>
              {f.feedback}
            </div>
          </div>
        ))}
        <button className="secondary" style={{ width: '100%' }} onClick={onDone}>Close</button>
      </div>
    );
  }

  if (questions === null) return <div><div className="skeleton sk-row" /><div className="skeleton sk-row" /></div>;

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 16 }}>Assessment</h2>
      {questions.map((q, i) => (
        <div className="question-card" key={q.id}>
          <div className="q-meta">
            <span className="q-num">Question {i + 1} of {questions.length}</span>
            {q.skill_tag && <span className="tag">{q.skill_tag}</span>}
          </div>
          <div className="q-text">{q.question}</div>
          {q.type === 'mcq' ? (
            (q.options || []).map((opt) => (
              <label
                key={opt}
                className={`mcq-option ${answers[q.id] === opt ? 'selected' : ''}`}
                onClick={() => setAnswer(q.id, opt)}
              >
                <input type="radio" name={`q_${q.id}`} value={opt} checked={answers[q.id] === opt} readOnly /> {opt}
              </label>
            ))
          ) : (
            <textarea
              placeholder="Type your answer..."
              style={{ minHeight: 90 }}
              value={answers[q.id] || ''}
              onChange={(e) => setAnswer(q.id, e.target.value)}
            />
          )}
        </div>
      ))}
      <button style={{ width: '100%' }} onClick={submit}>Submit assessment</button>
    </div>
  );
}

export default function Assessments() {
  const [subs, setSubs] = useState(null);
  const [activeAssessmentId, setActiveAssessmentId] = useState(null);

  async function load() {
    try {
      const data = await apiRequest('/assessments/mine');
      setSubs(data);
    } catch (_) {
      setSubs([]);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">ATS pipeline</div>
        <h1 className="page-title">Assessments</h1>
        <p className="page-sub">Recruiters may assign a skills assessment after screening. Complete it here — scoring is instant.</p>
      </div>

      {subs === null && (<><div className="skeleton sk-row" /><div className="skeleton sk-row" /></>)}

      {subs && subs.length === 0 && (
        <div className="card empty-state">
          <div className="es-icon"><Icon name="assessments" size={22} /></div>
          <div className="es-title">No assessments assigned yet</div>
          <div className="es-sub">Recruiters assign these after AI screening — check back after applying.</div>
        </div>
      )}

      {subs && subs.length > 0 && (
        subs.map((s) => (
          <div className="card assessment-card" key={s.id}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14.5 }}>Assessment #{s.assessment_id}</div>
              <div className="muted mono" style={{ fontSize: 11, marginTop: 4 }}>Application #{s.application_id} &middot; {s.status}</div>
            </div>
            {s.status === 'scored'
              ? <div className="ac-score">{s.score}%</div>
              : <button className="small" onClick={() => setActiveAssessmentId(s.assessment_id)}>Start assessment</button>}
          </div>
        ))
      )}

      <Modal open={activeAssessmentId !== null} onClose={() => setActiveAssessmentId(null)} maxWidth={640}>
        {activeAssessmentId !== null && (
          <TakeAssessment
            assessmentId={activeAssessmentId}
            onDone={() => { setActiveAssessmentId(null); load(); }}
          />
        )}
      </Modal>
    </div>
  );
}
