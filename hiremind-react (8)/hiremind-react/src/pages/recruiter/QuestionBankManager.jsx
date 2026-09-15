// import { useState, useEffect, useCallback } from 'react';
// import { apiRequest, API_BASE, getToken } from '../../api';

// /**
//  * Recruiter-facing question bank manager for one job.
//  *
//  * Features:
//  * - List questions
//  * - Filter by type/source
//  * - Create MCQ questions
//  * - Create fill-in-the-blank questions
//  * - Create coding questions
//  * - Java/Python/C++/JavaScript starter code
//  * - Duplicate question detection
//  * - Coding test-case management
//  * - Delete questions
//  *
//  * IMPORTANT:
//  * The backend question routes are:
//  *
//  * GET    /api/questions
//  * POST   /api/questions
//  * DELETE /api/questions/{question_id}
//  * POST   /api/questions/{question_id}/test-cases
//  * GET    /api/questions/{question_id}/test-cases
//  * DELETE /api/questions/test-cases/{test_case_id}
//  */

// // ============================================================
// // CODING I/O PATTERNS
// // ============================================================

// const CODING_IO_PATTERNS = [
//   {
//     value: 'count_then_list|int',
//     label: 'Count + list of ints → int',
//     input: 'First line: N. Second line: N space-separated integers.',
//     output: 'A single integer.',
//   },
//   {
//     value: 'single_string|string',
//     label: 'String → string',
//     input: 'A single line containing a string.',
//     output: 'A single string.',
//   },
//   {
//     value: 'single_string|bool_lower',
//     label: 'String → true/false',
//     input: 'A single line containing a string.',
//     output: "The literal word 'true' or 'false'.",
//   },
//   {
//     value: 'single_int|string_lines',
//     label: 'Int → N lines',
//     input: 'A single integer N.',
//     output: 'N lines of text, one value per line.',
//   },
//   {
//     value: 'single_int|int',
//     label: 'Int → int',
//     input: 'A single integer.',
//     output: 'A single integer.',
//   },
//   {
//     value: 'single_int|bool_lower',
//     label: 'Int → true/false',
//     input: 'A single integer.',
//     output: "The literal word 'true' or 'false'.",
//   },
//   {
//     value: 'list_then_target|int_pair',
//     label: 'List + target → int pair',
//     input: 'First line: space-separated integers. Second line: target integer.',
//     output: 'Two space-separated integers.',
//   },
//   {
//     value: 'list_then_target|int',
//     label: 'List + target → int',
//     input: 'First line: space-separated integers. Second line: target integer.',
//     output: 'A single integer.',
//   },
// ];

// // ============================================================
// // EMPTY FORMS
// // ============================================================

// const EMPTY_MCQ_FORM = {
//   question_text: '',
//   options: ['', ''],
//   correct_answer: '',
//   difficulty: 'medium',
//   topic: '',
//   skill: '',
//   marks: 2,
//   explanation: '',
// };

// const EMPTY_FB_FORM = {
//   question_text: '',
//   expected_answer: '',
//   accepted_answers: '',
//   difficulty: 'medium',
//   topic: '',
//   skill: '',
//   marks: 1,
//   explanation: '',
// };

// const EMPTY_CODING_FORM = {
//   question_text: '',
//   problem_statement: '',
//   input_format: '',
//   output_format: '',
//   constraints: '',
//   io_pattern: CODING_IO_PATTERNS[0].value,
//   starter_python: '',
//   starter_java: '',
//   starter_cpp: '',
//   starter_javascript: '',
//   difficulty: 'medium',
//   topic: '',
//   skill: '',
//   marks: 9,
//   explanation: '',
// };

// // ============================================================
// // API URL HELPER
// // ============================================================
// //
// // Your backend uses:
// //
// // /api/questions
// //
// // Depending on your api.js configuration, API_BASE may be:
// //
// // http://localhost:8000
// //
// // OR:
// //
// // http://localhost:8000/api
// //
// // This helper handles BOTH cases and prevents:
// //
// // /api/api/questions
// //
// // ============================================================

// function getQuestionApiBase() {
//   const base = String(API_BASE || '').replace(/\/+$/, '');

//   if (!base) {
//     return '/api';
//   }

//   if (base.endsWith('/api')) {
//     return base;
//   }

//   return `${base}/api`;
// }

// const QUESTION_API_BASE = getQuestionApiBase();

// // ============================================================
// // ERROR MESSAGE HELPER
// // ============================================================

// function getReadableError(data, fallback = 'Something went wrong.') {
//   if (!data) {
//     return fallback;
//   }

//   if (typeof data === 'string') {
//     return data;
//   }

//   if (typeof data.detail === 'string') {
//     return data.detail;
//   }

//   if (data.detail && typeof data.detail.message === 'string') {
//     return data.detail.message;
//   }

//   if (Array.isArray(data.detail)) {
//     return data.detail
//       .map((item) => {
//         if (typeof item === 'string') {
//           return item;
//         }

//         if (item?.msg) {
//           return item.msg;
//         }

//         return JSON.stringify(item);
//       })
//       .join(', ');
//   }

//   if (typeof data.message === 'string') {
//     return data.message;
//   }

//   return fallback;
// }

// // ============================================================
// // CREATE QUESTION
// // ============================================================

// async function postQuestionRaw(payload) {
//   const token = getToken();

//   const url = `${QUESTION_API_BASE}/questions`;

//   console.log('Creating question...');
//   console.log('POST URL:', url);
//   console.log('Payload:', payload);

//   const res = await fetch(url, {
//     method: 'POST',

//     headers: {
//       'Content-Type': 'application/json',

//       ...(token
//         ? {
//           Authorization: `Bearer ${token}`,
//         }
//         : {}),
//     },

//     body: JSON.stringify(payload),
//   });

//   const data = await res.json().catch(() => ({}));

//   console.log('Create question response:', {
//     status: res.status,
//     ok: res.ok,
//     data,
//   });

//   return {
//     ok: res.ok,
//     status: res.status,
//     data,
//   };
// }

// // ============================================================
// // MAIN COMPONENT
// // ============================================================

// export default function QuestionBankManager({
//   jobId,
//   jobTitle,
//   open,
//   onClose,
// }) {
//   // ==========================================================
//   // STATE
//   // ==========================================================

//   const [questions, setQuestions] = useState(null);

//   const [filterType, setFilterType] = useState('');

//   const [filterSource, setFilterSource] = useState('');

//   const [error, setError] = useState('');

//   const [showAddForm, setShowAddForm] = useState(false);

//   const [addType, setAddType] = useState('mcq');

//   const [mcqForm, setMcqForm] = useState(EMPTY_MCQ_FORM);

//   const [fbForm, setFbForm] = useState(EMPTY_FB_FORM);

//   const [codingForm, setCodingForm] = useState(
//     EMPTY_CODING_FORM
//   );

//   const [saving, setSaving] = useState(false);

//   const [duplicateConflict, setDuplicateConflict] =
//     useState(null);

//   const [expandedTestCasesFor, setExpandedTestCasesFor] =
//     useState(null);

//   const [testCases, setTestCases] = useState({});

//   const [newTestCase, setNewTestCase] = useState({
//     input: '',
//     expected_output: '',
//     is_public: true,
//   });

//   // ==========================================================
//   // LOAD QUESTIONS
//   // ==========================================================

//   const load = useCallback(async () => {
//     if (!jobId) {
//       return;
//     }

//     setError('');

//     try {
//       const params = new URLSearchParams({
//         job_id: jobId,
//       });

//       if (filterType) {
//         params.set('question_type', filterType);
//       }

//       if (filterSource) {
//         params.set('source', filterSource);
//       }

//       const data = await apiRequest(
//         `/questions?${params.toString()}`
//       );

//       setQuestions(Array.isArray(data) ? data : []);
//     } catch (e) {
//       console.error('Could not load question bank:', e);

//       setError(
//         e.message || 'Could not load question bank.'
//       );

//       setQuestions([]);
//     }
//   }, [jobId, filterType, filterSource]);

//   // ==========================================================
//   // LOAD WHEN OPEN
//   // ==========================================================

//   useEffect(() => {
//     if (open) {
//       load();
//     }
//   }, [open, load]);

//   // ==========================================================
//   // LOAD TEST CASES
//   // ==========================================================

//   async function loadTestCases(questionId) {
//     try {
//       setError('');

//       const data = await apiRequest(
//         `/questions/${questionId}/test-cases`
//       );

//       setTestCases((prev) => ({
//         ...prev,
//         [questionId]: Array.isArray(data) ? data : [],
//       }));
//     } catch (e) {
//       console.error('Could not load test cases:', e);

//       setError(
//         e.message || 'Could not load test cases.'
//       );
//     }
//   }

//   // ==========================================================
//   // TOGGLE TEST CASES
//   // ==========================================================

//   function toggleTestCases(questionId) {
//     if (expandedTestCasesFor === questionId) {
//       setExpandedTestCasesFor(null);
//       return;
//     }

//     setExpandedTestCasesFor(questionId);

//     if (!testCases[questionId]) {
//       loadTestCases(questionId);
//     }
//   }

//   // ==========================================================
//   // ADD TEST CASE
//   // ==========================================================

//   async function addTestCase(questionId) {
//     setError('');

//     if (
//       !newTestCase.input.trim() ||
//       !newTestCase.expected_output.trim()
//     ) {
//       setError(
//         'Both input and expected output are required for a test case.'
//       );

//       return;
//     }

//     try {
//       await apiRequest(
//         `/questions/${questionId}/test-cases`,
//         {
//           method: 'POST',
//           body: {
//             input: newTestCase.input.trim(),
//             expected_output:
//               newTestCase.expected_output.trim(),
//             is_public: newTestCase.is_public,
//           },
//         }
//       );

//       setNewTestCase({
//         input: '',
//         expected_output: '',
//         is_public: true,
//       });

//       await loadTestCases(questionId);
//     } catch (e) {
//       console.error('Could not add test case:', e);

//       setError(
//         e.message || 'Could not add test case.'
//       );
//     }
//   }

//   // ==========================================================
//   // DELETE TEST CASE
//   // ==========================================================

//   async function deleteTestCase(questionId, testCaseId) {
//     setError('');

//     try {
//       await apiRequest(
//         `/questions/test-cases/${testCaseId}`,
//         {
//           method: 'DELETE',
//         }
//       );

//       await loadTestCases(questionId);
//     } catch (e) {
//       console.error('Could not delete test case:', e);

//       setError(
//         e.message || 'Could not delete test case.'
//       );
//     }
//   }

//   // ==========================================================
//   // DELETE QUESTION
//   // ==========================================================

//   async function deleteQuestion(questionId) {
//     setError('');

//     const confirmed = window.confirm(
//       'Are you sure you want to delete this question?'
//     );

//     if (!confirmed) {
//       return;
//     }

//     try {
//       await apiRequest(
//         `/questions/${questionId}`,
//         {
//           method: 'DELETE',
//         }
//       );

//       await load();
//     } catch (e) {
//       console.error('Could not delete question:', e);

//       setError(
//         e.message || 'Could not delete question.'
//       );
//     }
//   }

//   // ==========================================================
//   // RESET FORM
//   // ==========================================================

//   function resetAddForm() {
//     setMcqForm({
//       ...EMPTY_MCQ_FORM,
//       options: ['', ''],
//     });

//     setFbForm({
//       ...EMPTY_FB_FORM,
//     });

//     setCodingForm({
//       ...EMPTY_CODING_FORM,
//     });

//     setDuplicateConflict(null);

//     setError('');
//   }

//   // ==========================================================
//   // SUBMIT QUESTION
//   // ==========================================================

//   async function submitAddForm() {
//     setError('');

//     setDuplicateConflict(null);

//     let payload;

//     // ========================================================
//     // MCQ
//     // ========================================================

//     if (addType === 'mcq') {
//       const options = mcqForm.options
//         .map((o) => o.trim())
//         .filter(Boolean);

//       if (
//         !mcqForm.question_text.trim() ||
//         options.length < 2 ||
//         !mcqForm.correct_answer
//       ) {
//         setError(
//           'MCQ needs question text, at least 2 options, and a correct answer.'
//         );

//         return;
//       }

//       payload = {
//         job_id: Number(jobId),

//         question_type: 'mcq',

//         question_text:
//           mcqForm.question_text.trim(),

//         difficulty: mcqForm.difficulty,

//         topic: mcqForm.topic.trim(),

//         skill: mcqForm.skill.trim(),

//         marks: Number(mcqForm.marks) || 2,

//         explanation:
//           mcqForm.explanation.trim(),

//         payload: {
//           options,

//           correct_answer:
//             mcqForm.correct_answer,
//         },
//       };
//     }

//     // ========================================================
//     // FILL IN THE BLANK
//     // ========================================================

//     else if (addType === 'fill_blank') {
//       if (
//         !fbForm.question_text.trim() ||
//         !fbForm.expected_answer.trim()
//       ) {
//         setError(
//           'Fill-in-the-blank needs question text and an expected answer.'
//         );

//         return;
//       }

//       const accepted =
//         fbForm.accepted_answers
//           .split(',')
//           .map((a) => a.trim())
//           .filter(Boolean);

//       payload = {
//         job_id: Number(jobId),

//         question_type: 'fill_blank',

//         question_text:
//           fbForm.question_text.trim(),

//         difficulty: fbForm.difficulty,

//         topic: fbForm.topic.trim(),

//         skill: fbForm.skill.trim(),

//         marks: Number(fbForm.marks) || 1,

//         explanation:
//           fbForm.explanation.trim(),

//         payload: {
//           expected_answer:
//             fbForm.expected_answer.trim(),

//           accepted_answers:
//             accepted.length
//               ? accepted
//               : [fbForm.expected_answer.trim()],
//         },
//       };
//     }

//     // ========================================================
//     // CODING
//     // ========================================================

//     else {
//       if (
//         !codingForm.question_text.trim() ||
//         !codingForm.problem_statement.trim() ||
//         !codingForm.starter_python.trim()
//       ) {
//         setError(
//           'Coding questions need a title, problem statement, and at least Python starter code.'
//         );

//         return;
//       }

//       const [
//         inputPattern,
//         outputPattern,
//       ] = codingForm.io_pattern.split('|');

//       payload = {
//         job_id: Number(jobId),

//         question_type: 'coding',

//         question_text:
//           codingForm.question_text.trim(),

//         difficulty:
//           codingForm.difficulty,

//         topic:
//           codingForm.topic.trim(),

//         skill:
//           codingForm.skill.trim(),

//         marks:
//           Number(codingForm.marks) || 9,

//         explanation:
//           codingForm.explanation.trim(),

//         payload: {
//           problem_statement:
//             codingForm.problem_statement.trim(),

//           input_format:
//             codingForm.input_format.trim(),

//           output_format:
//             codingForm.output_format.trim(),

//           constraints:
//             codingForm.constraints.trim(),

//           examples: [],

//           starter_code: {
//             python:
//               codingForm.starter_python,

//             java:
//               codingForm.starter_java,

//             cpp:
//               codingForm.starter_cpp,

//             javascript:
//               codingForm.starter_javascript,
//           },

//           allowed_languages: [
//             'python',
//             'java',
//             'cpp',
//             'javascript',
//           ],

//           visible_test_cases: [],

//           hidden_test_cases: [],

//           input_pattern:
//             inputPattern,

//           output_pattern:
//             outputPattern,
//         },
//       };
//     }

//     // ========================================================
//     // SAVE
//     // ========================================================

//     setSaving(true);

//     try {
//       console.log(
//         'Question payload being sent:',
//         payload
//       );

//       const {
//         ok,
//         status,
//         data,
//       } = await postQuestionRaw(payload);

//       // ======================================================
//       // SUCCESS
//       // ======================================================

//       if (ok) {
//         setShowAddForm(false);

//         resetAddForm();

//         await load();

//         return;
//       }

//       // ======================================================
//       // DUPLICATE
//       // ======================================================

//       if (status === 409) {
//         const detail =
//           data?.detail || data;

//         setDuplicateConflict(
//           detail
//         );

//         return;
//       }

//       // ======================================================
//       // 404
//       // ======================================================

//       if (status === 404) {
//         setError(
//           'Question API was not found. Please make sure the backend is running and the API URL is correct.'
//         );

//         console.error(
//           '404 while creating question:',
//           {
//             url: `${QUESTION_API_BASE}/questions`,
//             response: data,
//           }
//         );

//         return;
//       }

//       // ======================================================
//       // 401 / 403
//       // ======================================================

//       if (
//         status === 401 ||
//         status === 403
//       ) {
//         setError(
//           'You are not authorized to create questions. Please log in again as a recruiter.'
//         );

//         return;
//       }

//       // ======================================================
//       // VALIDATION ERROR
//       // ======================================================

//       if (status === 422) {
//         setError(
//           getReadableError(
//             data,
//             'The question data is invalid. Please check all required fields.'
//           )
//         );

//         console.error(
//           'Validation error:',
//           data
//         );

//         return;
//       }

//       // ======================================================
//       // OTHER ERROR
//       // ======================================================

//       setError(
//         getReadableError(
//           data,
//           `Could not save question. Server returned ${status}.`
//         )
//       );
//     } catch (e) {
//       console.error(
//         'Create question request failed:',
//         e
//       );

//       setError(
//         e.message ||
//         'Could not connect to the backend. Make sure the FastAPI server is running.'
//       );
//     } finally {
//       setSaving(false);
//     }
//   }

//   // ==========================================================
//   // DON'T RENDER WHEN CLOSED
//   // ==========================================================

//   if (!open) {
//     return null;
//   }

//   // ==========================================================
//   // UI
//   // ==========================================================

//   return (
//     <div
//       className="qbank-overlay"
//       role="dialog"
//       aria-modal="true"
//       aria-label="Question Bank"
//     >
//       <style>{`

//         /* =====================================================
//            OVERLAY
//            ===================================================== */

//         .qbank-overlay {
//           position: fixed;
//           inset: 0;
//           z-index: 99999;

//           display: flex;
//           align-items: center;
//           justify-content: center;

//           padding: 24px;

//           background:
//             rgba(3, 5, 14, 0.82);

//           backdrop-filter:
//             blur(7px);
//         }

//         /* =====================================================
//            MAIN PANEL
//            ===================================================== */

//         .qbank-panel {
//           width: min(920px, 100%);

//           max-height:
//             calc(100vh - 48px);

//           overflow: auto;

//           border:
//             1px solid rgba(139, 92, 246, 0.24);

//           border-radius: 24px;

//           background:
//             #0d1428;

//           color:
//             #e8ecf8;

//           box-shadow:
//             0 30px 90px rgba(0, 0, 0, 0.55);

//           padding:
//             26px 28px 30px;
//         }

//         /* =====================================================
//            HEADER
//            ===================================================== */

//         .qbank-head {
//           display:
//             flex;

//           justify-content:
//             space-between;

//           align-items:
//             flex-start;

//           gap:
//             16px;
//         }

//         .qbank-title {
//           margin:
//             0;

//           font-size:
//             21px;

//           font-weight:
//             800;

//           letter-spacing:
//             -0.02em;
//         }

//         .qbank-sub {
//           margin:
//             6px 0 0;

//           color:
//             #7f8ba8;

//           font-size:
//             12px;
//         }

//         .qbank-close {
//           width:
//             40px;

//           height:
//             40px;

//           border-radius:
//             10px;

//           border:
//             1px solid rgba(255, 255, 255, 0.08);

//           background:
//             #121b32;

//           color:
//             #8d98b2;

//           font-size:
//             20px;

//           cursor:
//             pointer;

//           transition:
//             all 0.2s ease;

//           display: flex; 
//           align-items: center; 
//           justify-content: center;  
//         }

//         .qbank-close:hover {

//           color: #ffffff;
//           background: rgba(244, 63, 94, 0.25);
//           border-color: rgba(244, 63, 94, 0.4);
//           transform: translateY(-1px);
//         }

//         /* =====================================================
//            TOOLBAR
//            ===================================================== */

//         .qbank-toolbar {
//           display:
//             flex;

//           gap:
//             10px;

//           flex-wrap:
//             wrap;

//           align-items:
//             center;

//           margin:
//             20px 0 16px;
//         }

//         .qbank-toolbar select {
//           background:
//             #121b32;

//           border:
//             1px solid rgba(255, 255, 255, 0.1);

//           color:
//             #e8ecf8;

//           padding:
//             8px 12px;

//           border-radius:
//             8px;

//           font-size:
//             12.5px;

//           outline:
//             none;
//         }

//         .qbank-toolbar select:focus {
//           border-color:
//             rgba(139, 92, 246, 0.55);

//           box-shadow:
//             0 0 0 3px rgba(139, 92, 246, 0.08);
//         }

//         .qbank-add-btn {
//           margin-left:
//             auto;

//           padding:
//             9px 16px;

//           border-radius:
//             9px;

//           background:
//             linear-gradient(
//               135deg,
//               #8b5cf6,
//               #f97316
//             );

//           border:
//             none;

//           color:
//             #fff;

//           font-weight:
//             700;

//           font-size:
//             12.5px;

//           cursor:
//             pointer;

//           transition:
//             all 0.2s ease;
//         }

//         .qbank-add-btn:hover {
//           transform:
//             translateY(-1px);

//           box-shadow:
//             0 8px 24px rgba(139, 92, 246, 0.25);
//         }

//         /* =====================================================
//            ERROR
//            ===================================================== */

//         .qbank-error {
//           margin:
//             12px 0;

//           border:
//             1px solid rgba(239, 68, 68, 0.28);

//           background:
//             rgba(239, 68, 68, 0.08);

//           color:
//             #fca5a5;

//           padding:
//             11px 13px;

//           border-radius:
//             10px;

//           font-size:
//             12.5px;

//           line-height:
//             1.5;
//         }

//         /* =====================================================
//            QUESTION LIST
//            ===================================================== */

//         .qbank-list {
//           display:
//             flex;

//           flex-direction:
//             column;

//           gap:
//             10px;
//         }

//         .qbank-row {
//           border:
//             1px solid rgba(255, 255, 255, 0.06);

//           border-radius:
//             12px;

//           background:
//             rgba(255, 255, 255, 0.02);

//           padding:
//             14px 16px;

//           transition:
//             border-color 0.2s ease,
//             background 0.2s ease,
//             transform 0.2s ease;
//         }

//         .qbank-row:hover {
//           border-color:
//             rgba(139, 92, 246, 0.25);

//           background:
//             rgba(139, 92, 246, 0.025);

//           transform:
//             translateY(-1px);
//         }

//         .qbank-row-top {
//           display:
//             flex;

//           justify-content:
//             space-between;

//           align-items:
//             flex-start;

//           gap:
//             12px;
//         }

//         .qbank-row-text {
//           font-size:
//             13.5px;

//           font-weight:
//             600;

//           color:
//             #f1f5f9;

//           line-height:
//             1.4;
//         }

//         .qbank-badges {
//           display:
//             flex;

//           gap:
//             6px;

//           flex-wrap:
//             wrap;

//           margin-top:
//             6px;
//         }

//         .qbank-badge {
//           font:
//             600 10px/1 monospace;

//           padding:
//             3px 8px;

//           border-radius:
//             6px;

//           border:
//             1px solid rgba(255, 255, 255, 0.12);

//           color:
//             #9aa5c0;
//         }

//         .qbank-badge.type {
//           color:
//             #a78bfa;

//           border-color:
//             rgba(139, 92, 246, 0.35);
//         }

//         .qbank-badge.src-ai {
//           color:
//             #38bdf8;

//           border-color:
//             rgba(56, 189, 248, 0.35);
//         }

//         .qbank-badge.src-recruiter {
//           color:
//             #4ade80;

//           border-color:
//             rgba(74, 222, 128, 0.35);
//         }

//         .qbank-row-actions {
//           display:
//             flex;

//           gap:
//             6px;

//           flex-shrink:
//             0;
//         }

//         .qbank-mini-btn {
//           padding:
//             6px 10px;

//           border-radius:
//             7px;

//           font-size:
//             11px;

//           font-weight:
//             600;

//           cursor:
//             pointer;

//           border:
//             1px solid rgba(255, 255, 255, 0.1);

//           background:
//             #121b32;

//           color:
//             #cbd5e1;

//           transition:
//             all 0.2s ease;
//         }

//         .qbank-mini-btn:hover {
//           border-color:
//             rgba(139, 92, 246, 0.4);

//           color:
//             #fff;

//           transform:
//             translateY(-1px);
//         }

//         .qbank-mini-btn.danger {
//           border-color:
//             rgba(239, 68, 68, 0.3);

//           color:
//             #fca5a5;
//         }

//         .qbank-mini-btn.danger:hover {
//           border-color:
//             rgba(239, 68, 68, 0.65);

//           background:
//             rgba(239, 68, 68, 0.08);

//           color:
//             #fecaca;
//         }

//         /* =====================================================
//            TEST CASES
//            ===================================================== */

//         .qbank-tc-panel {
//           margin-top:
//             10px;

//           padding-top:
//             10px;

//           border-top:
//             1px solid rgba(255, 255, 255, 0.06);

//           display:
//             flex;

//           flex-direction:
//             column;

//           gap:
//             8px;
//         }

//         .qbank-tc-row {
//           display:
//             flex;

//           gap:
//             8px;

//           align-items:
//             center;

//           font-size:
//             11.5px;

//           font-family:
//             monospace;

//           background:
//             rgba(0, 0, 0, 0.25);

//           padding:
//             8px 10px;

//           border-radius:
//             8px;
//         }

//         .qbank-tc-row .tc-io {
//           flex:
//             1;

//           overflow:
//             hidden;

//           text-overflow:
//             ellipsis;

//           white-space:
//             nowrap;
//         }

//         .qbank-tc-add {
//           display:
//             flex;

//           gap:
//             8px;

//           flex-wrap:
//             wrap;

//           align-items:
//             center;
//         }

//         .qbank-tc-add input[type="text"] {
//           flex:
//             1;

//           min-width:
//             140px;

//           background:
//             #121b32;

//           border:
//             1px solid rgba(255, 255, 255, 0.1);

//           color:
//             #e8ecf8;

//           padding:
//             7px 10px;

//           border-radius:
//             7px;

//           font-size:
//             12px;

//           font-family:
//             monospace;

//           outline:
//             none;
//         }

//         /* =====================================================
//            FORM
//            ===================================================== */

//         .qbank-form {
//           margin-top:
//             16px;

//           border:
//             1px solid rgba(139, 92, 246, 0.25);

//           border-radius:
//             14px;

//           padding:
//             18px;

//           background:
//             rgba(139, 92, 246, 0.03);
//         }

//         .qbank-form label {
//           display:
//             block;

//           font:
//             600 10.5px/1.2 monospace;

//           text-transform:
//             uppercase;

//           letter-spacing:
//             0.05em;

//           color:
//             #9aa5c0;

//           margin:
//             12px 0 6px;
//         }

//         .qbank-form input[type="text"],
//         .qbank-form input[type="number"],
//         .qbank-form textarea,
//         .qbank-form select {
//           width:
//             100%;

//           background:
//             #0b1120;

//           border:
//             1px solid rgba(255, 255, 255, 0.1);

//           color:
//             #e8ecf8;

//           padding:
//             9px 12px;

//           border-radius:
//             8px;

//           font-size:
//             12.5px;

//           box-sizing:
//             border-box;

//           outline:
//             none;

//           transition:
//             border-color 0.2s ease,
//             box-shadow 0.2s ease;
//         }

//         .qbank-form input:focus,
//         .qbank-form textarea:focus,
//         .qbank-form select:focus {
//           border-color:
//             rgba(139, 92, 246, 0.55);

//           box-shadow:
//             0 0 0 3px rgba(139, 92, 246, 0.07);
//         }

//         .qbank-form textarea {
//           resize:
//             vertical;

//           font-family:
//             monospace;

//           line-height:
//             1.5;
//         }

//         /* =====================================================
//            QUESTION TYPE TABS
//            ===================================================== */

//         .qbank-type-tabs {
//           display:
//             flex;

//           gap:
//             6px;
//         }

//         .qbank-type-tab {
//           flex:
//             1;

//           padding:
//             8px;

//           border-radius:
//             8px;

//           text-align:
//             center;

//           font-size:
//             12px;

//           font-weight:
//             700;

//           cursor:
//             pointer;

//           border:
//             1px solid rgba(255, 255, 255, 0.1);

//           background:
//             #121b32;

//           color:
//             #9aa5c0;

//           transition:
//             all 0.2s ease;
//         }

//         .qbank-type-tab:hover {
//           border-color:
//             rgba(139, 92, 246, 0.3);

//           color:
//             #d8dff0;
//         }

//         .qbank-type-tab.active {
//           border-color:
//             rgba(139, 92, 246, 0.5);

//           background:
//             rgba(139, 92, 246, 0.15);

//           color:
//             #d8b4fe;

//           box-shadow:
//             inset 0 0 20px rgba(139, 92, 246, 0.05);
//         }

//         /* =====================================================
//            MCQ OPTIONS
//            ===================================================== */

//         .qbank-opt-row {
//           display:
//             flex;

//           gap:
//             8px;

//           align-items:
//             center;

//           margin-bottom:
//             6px;
//         }

//         .qbank-opt-row input {
//           flex:
//             1;
//         }

//         /* =====================================================
//            TWO COLUMN
//            ===================================================== */

//         .qbank-two-col {
//           display:
//             grid;

//           grid-template-columns:
//             1fr 1fr;

//           gap:
//             14px;
//         }

//         /* =====================================================
//            FORM ACTIONS
//            ===================================================== */

//         .qbank-form-actions {
//           display:
//             flex;

//           gap:
//             10px;

//           margin-top:
//             18px;
//         }

//         .qbank-form-actions button {
//           flex:
//             1;

//           padding:
//             11px;

//           border-radius:
//             9px;

//           font-weight:
//             700;

//           font-size:
//             12.5px;

//           cursor:
//             pointer;

//           transition:
//             all 0.2s ease;
//         }

//         .qbank-cancel-btn {
//           background:
//             #121b32;

//           border:
//             1px solid rgba(255, 255, 255, 0.1);

//           color:
//             #cbd5e1;
//         }

//         .qbank-cancel-btn:hover {
//           border-color:
//             rgba(255, 255, 255, 0.2);

//           color:
//             #fff;
//         }

//         .qbank-save-btn {
//           background:
//             linear-gradient(
//               135deg,
//               #8b5cf6,
//               #f97316
//             );

//           border:
//             none;

//           color:
//             #fff;

//           box-shadow:
//             0 8px 24px rgba(139, 92, 246, 0.16);
//         }

//         .qbank-save-btn:hover:not(:disabled) {
//           transform:
//             translateY(-1px);

//           box-shadow:
//             0 10px 30px rgba(139, 92, 246, 0.28);
//         }

//         .qbank-save-btn:disabled {
//           opacity:
//             0.6;

//           cursor:
//             default;
//         }

//         /* =====================================================
//            DUPLICATE NOTICE
//            ===================================================== */

//         .qbank-dup-notice {
//           margin-top:
//             14px;

//           border:
//             1px solid rgba(245, 158, 11, 0.35);

//           background:
//             rgba(245, 158, 11, 0.08);

//           border-radius:
//             10px;

//           padding:
//             12px 14px;

//           font-size:
//             12.5px;

//           color:
//             #fde68a;

//           line-height:
//             1.5;
//         }

//         .qbank-dup-notice strong {
//           color:
//             #fbbf24;
//         }

//         /* =====================================================
//            EMPTY
//            ===================================================== */

//         .qbank-empty {
//           text-align:
//             center;

//           padding:
//             30px 10px;

//           color:
//             #77849f;

//           font-size:
//             13px;
//         }

//         /* =====================================================
//            MOBILE
//            ===================================================== */

//         @media (max-width: 700px) {

//           .qbank-overlay {
//             padding:
//               10px;
//           }

//           .qbank-panel {
//             max-height:
//               calc(100vh - 20px);

//             padding:
//               20px 16px 22px;

//             border-radius:
//               18px;
//           }

//           .qbank-two-col {
//             grid-template-columns:
//               1fr;
//           }

//           .qbank-row-top {
//             flex-direction:
//               column;
//           }

//           .qbank-row-actions {
//             width:
//               100%;
//           }

//           .qbank-row-actions button {
//             flex:
//               1;
//           }

//           .qbank-add-btn {
//             margin-left:
//               0;

//             width:
//               100%;
//           }

//           .qbank-toolbar select {
//             flex:
//               1;

//             min-width:
//               140px;
//           }

//           .qbank-type-tabs {
//             flex-direction:
//               column;
//           }

//           .qbank-form-actions {
//             flex-direction:
//               column;
//           }
//         }

//       `}</style>

//       {/* ========================================================
//           PANEL
//           ======================================================== */}

//       <div className="qbank-panel">

//         {/* ======================================================
//             HEADER
//             ====================================================== */}

//         <div className="qbank-head">

//           <div>
//             <h2 className="qbank-title">
//               Question Bank
//             </h2>

//             <p className="qbank-sub">
//               {jobTitle}
//             </p>
//           </div>

//           <button
//             className="qbank-close"
//             onClick={onClose}
//             aria-label="Close"
//             type="button"
//           >
//             ×
//           </button>

//         </div>

//         {/* ======================================================
//             TOOLBAR
//             ====================================================== */}

//         <div className="qbank-toolbar">

//           <select
//             value={filterType}
//             onChange={(e) =>
//               setFilterType(e.target.value)
//             }
//           >
//             <option value="">
//               All types
//             </option>

//             <option value="mcq">
//               MCQ
//             </option>

//             <option value="fill_blank">
//               Fill in the blank
//             </option>

//             <option value="coding">
//               Coding
//             </option>
//           </select>

//           <select
//             value={filterSource}
//             onChange={(e) =>
//               setFilterSource(e.target.value)
//             }
//           >
//             <option value="">
//               All sources
//             </option>

//             <option value="ai">
//               AI-generated
//             </option>

//             <option value="recruiter">
//               Recruiter-created
//             </option>
//           </select>

//           <button
//             type="button"
//             className="qbank-add-btn"
//             onClick={() => {
//               setShowAddForm((p) => !p);
//               resetAddForm();
//             }}
//           >
//             {showAddForm
//               ? 'Close form'
//               : '+ Add question'}
//           </button>

//         </div>

//         {/* ======================================================
//             ERROR
//             ====================================================== */}

//         {error && (
//           <div className="qbank-error">
//             {error}
//           </div>
//         )}

//         {/* ======================================================
//             ADD FORM
//             ====================================================== */}

//         {showAddForm && (

//           <div className="qbank-form">

//             {/* ==================================================
//                 TYPE TABS
//                 ================================================== */}

//             <div className="qbank-type-tabs">

//               {[
//                 'mcq',
//                 'fill_blank',
//                 'coding',
//               ].map((t) => (

//                 <div
//                   key={t}
//                   className={
//                     `qbank-type-tab ${addType === t
//                       ? 'active'
//                       : ''
//                     }`
//                   }
//                   onClick={() => {
//                     setAddType(t);
//                     setDuplicateConflict(null);
//                     setError('');
//                   }}
//                 >
//                   {t === 'mcq'
//                     ? 'MCQ'
//                     : t === 'fill_blank'
//                       ? 'Fill in the blank'
//                       : 'Coding'}
//                 </div>

//               ))}

//             </div>

//             {/* ==================================================
//                 MCQ
//                 ================================================== */}

//             {addType === 'mcq' && (

//               <>
//                 <label>
//                   Question text
//                 </label>

//                 <textarea
//                   rows={2}
//                   value={
//                     mcqForm.question_text
//                   }
//                   onChange={(e) =>
//                     setMcqForm({
//                       ...mcqForm,
//                       question_text:
//                         e.target.value,
//                     })
//                   }
//                 />

//                 <label>
//                   Options
//                 </label>

//                 {mcqForm.options.map(
//                   (opt, idx) => (

//                     <div
//                       className="qbank-opt-row"
//                       key={idx}
//                     >

//                       <input
//                         type="text"
//                         value={opt}
//                         onChange={(e) => {

//                           const next =
//                             [
//                               ...mcqForm.options,
//                             ];

//                           next[idx] =
//                             e.target.value;

//                           setMcqForm({
//                             ...mcqForm,
//                             options: next,
//                           });
//                         }}
//                         placeholder={
//                           `Option ${idx + 1}`
//                         }
//                       />

//                       {mcqForm.options
//                         .length > 2 && (

//                           <button
//                             type="button"
//                             className="qbank-mini-btn danger"
//                             onClick={() => {

//                               const next =
//                                 mcqForm.options
//                                   .filter(
//                                     (_, i) =>
//                                       i !== idx
//                                   );

//                               setMcqForm({
//                                 ...mcqForm,

//                                 options:
//                                   next,

//                                 correct_answer:
//                                   mcqForm.correct_answer ===
//                                     opt
//                                     ? ''
//                                     : mcqForm.correct_answer,
//                               });
//                             }}
//                           >
//                             Remove
//                           </button>

//                         )}

//                     </div>

//                   )
//                 )}

//                 {mcqForm.options.length < 6 && (

//                   <button
//                     type="button"
//                     className="qbank-mini-btn"
//                     onClick={() =>
//                       setMcqForm({
//                         ...mcqForm,

//                         options: [
//                           ...mcqForm.options,
//                           '',
//                         ],
//                       })
//                     }
//                   >
//                     + Add option
//                   </button>

//                 )}

//                 <label>
//                   Correct answer
//                 </label>

//                 <select
//                   value={
//                     mcqForm.correct_answer
//                   }
//                   onChange={(e) =>
//                     setMcqForm({
//                       ...mcqForm,

//                       correct_answer:
//                         e.target.value,
//                     })
//                   }
//                 >
//                   <option value="">
//                     Select the correct option
//                   </option>

//                   {mcqForm.options
//                     .filter(
//                       (o) => o.trim()
//                     )
//                     .map((o) => (

//                       <option
//                         value={o}
//                         key={o}
//                       >
//                         {o}
//                       </option>

//                     ))}
//                 </select>
//               </>

//             )}

//             {/* ==================================================
//                 FILL BLANK
//                 ================================================== */}

//             {addType === 'fill_blank' && (

//               <>
//                 <label>
//                   Question text
//                   (use ______ for the blank)
//                 </label>

//                 <textarea
//                   rows={2}
//                   value={
//                     fbForm.question_text
//                   }
//                   onChange={(e) =>
//                     setFbForm({
//                       ...fbForm,

//                       question_text:
//                         e.target.value,
//                     })
//                   }
//                 />

//                 <label>
//                   Expected answer
//                 </label>

//                 <input
//                   type="text"
//                   value={
//                     fbForm.expected_answer
//                   }
//                   onChange={(e) =>
//                     setFbForm({
//                       ...fbForm,

//                       expected_answer:
//                         e.target.value,
//                     })
//                   }
//                 />

//                 <label>
//                   Also accept
//                   (comma-separated, optional)
//                 </label>

//                 <input
//                   type="text"
//                   value={
//                     fbForm.accepted_answers
//                   }
//                   onChange={(e) =>
//                     setFbForm({
//                       ...fbForm,

//                       accepted_answers:
//                         e.target.value,
//                     })
//                   }
//                   placeholder="synonym, alternate casing, ..."
//                 />
//               </>

//             )}

//             {/* ==================================================
//                 CODING
//                 ================================================== */}

//             {addType === 'coding' && (

//               <>
//                 <label>
//                   Title
//                 </label>

//                 <input
//                   type="text"
//                   value={
//                     codingForm.question_text
//                   }
//                   onChange={(e) =>
//                     setCodingForm({
//                       ...codingForm,

//                       question_text:
//                         e.target.value,
//                     })
//                   }
//                 />

//                 <label>
//                   Problem statement
//                 </label>

//                 <textarea
//                   rows={5}
//                   value={
//                     codingForm.problem_statement
//                   }
//                   onChange={(e) =>
//                     setCodingForm({
//                       ...codingForm,

//                       problem_statement:
//                         e.target.value,
//                     })
//                   }
//                 />

//                 <label>
//                   Input/output shape
//                   (must match one exactly)
//                 </label>

//                 <select
//                   value={
//                     codingForm.io_pattern
//                   }
//                   onChange={(e) =>
//                     setCodingForm({
//                       ...codingForm,

//                       io_pattern:
//                         e.target.value,
//                     })
//                   }
//                 >

//                   {CODING_IO_PATTERNS.map(
//                     (p) => (

//                       <option
//                         value={p.value}
//                         key={p.value}
//                       >
//                         {p.label}
//                       </option>

//                     )
//                   )}

//                 </select>

//                 <div className="qbank-two-col">

//                   <div>

//                     <label>
//                       Input format
//                     </label>

//                     <textarea
//                       rows={3}
//                       value={
//                         codingForm.input_format
//                       }
//                       onChange={(e) =>
//                         setCodingForm({
//                           ...codingForm,

//                           input_format:
//                             e.target.value,
//                         })
//                       }
//                       placeholder={
//                         CODING_IO_PATTERNS.find(
//                           (p) =>
//                             p.value ===
//                             codingForm.io_pattern
//                         )?.input
//                       }
//                     />

//                   </div>

//                   <div>

//                     <label>
//                       Output format
//                     </label>

//                     <textarea
//                       rows={3}
//                       value={
//                         codingForm.output_format
//                       }
//                       onChange={(e) =>
//                         setCodingForm({
//                           ...codingForm,

//                           output_format:
//                             e.target.value,
//                         })
//                       }
//                       placeholder={
//                         CODING_IO_PATTERNS.find(
//                           (p) =>
//                             p.value ===
//                             codingForm.io_pattern
//                         )?.output
//                       }
//                     />

//                   </div>

//                 </div>

//                 <label>
//                   Constraints
//                 </label>

//                 <textarea
//                   rows={3}
//                   value={
//                     codingForm.constraints
//                   }
//                   onChange={(e) =>
//                     setCodingForm({
//                       ...codingForm,

//                       constraints:
//                         e.target.value,
//                     })
//                   }
//                 />

//                 <label>
//                   Starter code — Python
//                   (required)
//                 </label>

//                 <textarea
//                   rows={6}
//                   value={
//                     codingForm.starter_python
//                   }
//                   onChange={(e) =>
//                     setCodingForm({
//                       ...codingForm,

//                       starter_python:
//                         e.target.value,
//                     })
//                   }
//                   placeholder={
//                     `def solve():\n    pass`
//                   }
//                 />

//                 <label>
//                   Starter code — Java
//                   (optional)
//                 </label>

//                 <textarea
//                   rows={6}
//                   value={
//                     codingForm.starter_java
//                   }
//                   onChange={(e) =>
//                     setCodingForm({
//                       ...codingForm,

//                       starter_java:
//                         e.target.value,
//                     })
//                   }
//                 />

//                 <label>
//                   Starter code — C++
//                   (optional)
//                 </label>

//                 <textarea
//                   rows={6}
//                   value={
//                     codingForm.starter_cpp
//                   }
//                   onChange={(e) =>
//                     setCodingForm({
//                       ...codingForm,

//                       starter_cpp:
//                         e.target.value,
//                     })
//                   }
//                 />

//                 <label>
//                   Starter code — JavaScript
//                   (optional)
//                 </label>

//                 <textarea
//                   rows={6}
//                   value={
//                     codingForm.starter_javascript
//                   }
//                   onChange={(e) =>
//                     setCodingForm({
//                       ...codingForm,

//                       starter_javascript:
//                         e.target.value,
//                     })
//                   }
//                 />

//                 <div
//                   className="qbank-dup-notice"
//                   style={{
//                     marginTop: 14,
//                     borderColor:
//                       'rgba(139,92,246,.3)',
//                     background:
//                       'rgba(139,92,246,.06)',
//                     color:
//                       '#c4b5fd',
//                   }}
//                 >
//                   Add test cases after saving
//                   this question, using the
//                   "Test cases" button on it
//                   in the list below.
//                 </div>

//               </>

//             )}

//             {/* ==================================================
//                 DIFFICULTY + SKILL
//                 ================================================== */}

//             <div
//               className="qbank-two-col"
//               style={{
//                 marginTop: 14,
//               }}
//             >

//               <div>

//                 <label>
//                   Difficulty
//                 </label>

//                 <select
//                   value={
//                     (
//                       addType === 'mcq'
//                         ? mcqForm
//                         : addType === 'fill_blank'
//                           ? fbForm
//                           : codingForm
//                     ).difficulty
//                   }
//                   onChange={(e) => {

//                     const v =
//                       e.target.value;

//                     if (addType === 'mcq') {

//                       setMcqForm({
//                         ...mcqForm,
//                         difficulty: v,
//                       });

//                     } else if (
//                       addType === 'fill_blank'
//                     ) {

//                       setFbForm({
//                         ...fbForm,
//                         difficulty: v,
//                       });

//                     } else {

//                       setCodingForm({
//                         ...codingForm,
//                         difficulty: v,
//                       });

//                     }

//                   }}
//                 >

//                   <option value="easy">
//                     Easy
//                   </option>

//                   <option value="medium">
//                     Medium
//                   </option>

//                   <option value="hard">
//                     Hard
//                   </option>

//                 </select>

//               </div>

//               <div>

//                 <label>
//                   Skill tag
//                 </label>

//                 <input
//                   type="text"
//                   value={
//                     (
//                       addType === 'mcq'
//                         ? mcqForm
//                         : addType === 'fill_blank'
//                           ? fbForm
//                           : codingForm
//                     ).skill
//                   }
//                   onChange={(e) => {

//                     const v =
//                       e.target.value;

//                     if (addType === 'mcq') {

//                       setMcqForm({
//                         ...mcqForm,
//                         skill: v,
//                       });

//                     } else if (
//                       addType === 'fill_blank'
//                     ) {

//                       setFbForm({
//                         ...fbForm,
//                         skill: v,
//                       });

//                     } else {

//                       setCodingForm({
//                         ...codingForm,
//                         skill: v,
//                       });

//                     }

//                   }}
//                   placeholder="e.g. python, sql, react"
//                 />

//               </div>

//             </div>

//             {/* ==================================================
//                 DUPLICATE CONFLICT
//                 ================================================== */}

//             {duplicateConflict && (

//               <div className="qbank-dup-notice">

//                 <strong>
//                   Similar question already exists:
//                 </strong>

//                 <div
//                   style={{
//                     marginTop: 6,
//                   }}
//                 >
//                   {duplicateConflict.existing_question_text ||
//                     duplicateConflict.message ||
//                     'A similar question already exists.'}
//                 </div>

//                 <div
//                   style={{
//                     marginTop: 8,
//                     display: 'flex',
//                     gap: 8,
//                     flexWrap: 'wrap',
//                   }}
//                 >

//                   <button
//                     type="button"
//                     className="qbank-mini-btn"
//                     onClick={() => {
//                       setShowAddForm(false);
//                       resetAddForm();
//                     }}
//                   >
//                     Use existing question
//                   </button>

//                   <button
//                     type="button"
//                     className="qbank-mini-btn"
//                     onClick={() =>
//                       setDuplicateConflict(null)
//                     }
//                   >
//                     Edit and try again
//                   </button>

//                 </div>

//               </div>

//             )}

//             {/* ==================================================
//                 ACTION BUTTONS
//                 ================================================== */}

//             <div className="qbank-form-actions">

//               <button
//                 type="button"
//                 className="qbank-cancel-btn"
//                 onClick={() => {
//                   setShowAddForm(false);
//                   resetAddForm();
//                 }}
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 className="qbank-save-btn"
//                 onClick={submitAddForm}
//                 disabled={saving}
//               >
//                 {saving
//                   ? 'Saving...'
//                   : 'Save question'}
//               </button>

//             </div>

//           </div>

//         )}

//         {/* ======================================================
//             QUESTION LIST
//             ====================================================== */}

//         <div
//           className="qbank-list"
//           style={{
//             marginTop: 18,
//           }}
//         >

//           {/* LOADING */}

//           {questions === null && (
//             <div className="qbank-empty">
//               Loading...
//             </div>
//           )}

//           {/* EMPTY */}

//           {questions &&
//             questions.length === 0 && (
//               <div className="qbank-empty">
//                 No questions in the bank
//                 yet for this job.
//               </div>
//             )}

//           {/* QUESTIONS */}

//           {questions &&
//             questions.map((q) => (

//               <div
//                 className="qbank-row"
//                 key={q.id}
//               >

//                 <div className="qbank-row-top">

//                   <div
//                     style={{
//                       minWidth: 0,
//                       flex: 1,
//                     }}
//                   >

//                     <div className="qbank-row-text">
//                       {q.question_text}
//                     </div>

//                     <div className="qbank-badges">

//                       <span className="qbank-badge type">
//                         {q.question_type}
//                       </span>

//                       <span
//                         className={
//                           `qbank-badge src-${q.source}`
//                         }
//                       >
//                         {q.source}
//                       </span>

//                       <span className="qbank-badge">
//                         {q.difficulty}
//                       </span>

//                       <span className="qbank-badge">
//                         {q.marks} marks
//                       </span>

//                       {q.skill && (
//                         <span className="qbank-badge">
//                           {q.skill}
//                         </span>
//                       )}

//                     </div>

//                   </div>

//                   <div className="qbank-row-actions">

//                     {q.question_type ===
//                       'coding' && (

//                         <button
//                           type="button"
//                           className="qbank-mini-btn"
//                           onClick={() =>
//                             toggleTestCases(q.id)
//                           }
//                         >
//                           {expandedTestCasesFor ===
//                             q.id
//                             ? 'Hide tests'
//                             : 'Test cases'}
//                         </button>

//                       )}

//                     <button
//                       type="button"
//                       className="qbank-mini-btn danger"
//                       onClick={() =>
//                         deleteQuestion(q.id)
//                       }
//                     >
//                       Delete
//                     </button>

//                   </div>

//                 </div>

//                 {/* ==================================================
//                     TEST CASE PANEL
//                     ================================================== */}

//                 {q.question_type === 'coding' &&
//                   expandedTestCasesFor ===
//                   q.id && (

//                     <div className="qbank-tc-panel">

//                       {(testCases[q.id] || [])
//                         .map((tc) => (

//                           <div
//                             className="qbank-tc-row"
//                             key={tc.id}
//                           >

//                             <span
//                               className="qbank-badge"
//                               style={{
//                                 flexShrink: 0,
//                               }}
//                             >
//                               {tc.is_public
//                                 ? 'public'
//                                 : 'private'}
//                             </span>

//                             <span className="tc-io">
//                               in: {tc.input}
//                               {' → '}
//                               out: {
//                                 tc.expected_output
//                               }
//                             </span>

//                             <button
//                               type="button"
//                               className="qbank-mini-btn danger"
//                               style={{
//                                 flexShrink: 0,
//                               }}
//                               onClick={() =>
//                                 deleteTestCase(
//                                   q.id,
//                                   tc.id
//                                 )
//                               }
//                             >
//                               ×
//                             </button>

//                           </div>

//                         ))}

//                       {/* ADD TEST CASE */}

//                       <div className="qbank-tc-add">

//                         <input
//                           type="text"
//                           placeholder="input"
//                           value={
//                             newTestCase.input
//                           }
//                           onChange={(e) =>
//                             setNewTestCase({
//                               ...newTestCase,

//                               input:
//                                 e.target.value,
//                             })
//                           }
//                         />

//                         <input
//                           type="text"
//                           placeholder="expected output"
//                           value={
//                             newTestCase.expected_output
//                           }
//                           onChange={(e) =>
//                             setNewTestCase({
//                               ...newTestCase,

//                               expected_output:
//                                 e.target.value,
//                             })
//                           }
//                         />

//                         <label
//                           style={{
//                             display: 'flex',
//                             alignItems: 'center',
//                             gap: 6,
//                             fontSize: 11.5,
//                             color: '#9aa5c0',
//                             margin: 0,
//                           }}
//                         >

//                           <input
//                             type="checkbox"
//                             checked={
//                               newTestCase.is_public
//                             }
//                             onChange={(e) =>
//                               setNewTestCase({
//                                 ...newTestCase,

//                                 is_public:
//                                   e.target.checked,
//                               })
//                             }
//                             style={{
//                               width: 'auto',
//                             }}
//                           />

//                           Public
//                           (visible to candidate)

//                         </label>

//                         <button
//                           type="button"
//                           className="qbank-mini-btn"
//                           onClick={() =>
//                             addTestCase(q.id)
//                           }
//                         >
//                           + Add
//                         </button>

//                       </div>

//                     </div>

//                   )}

//               </div>

//             ))}

//         </div>

//       </div>

//     </div>
//   );
// }










import { useState, useEffect, useCallback } from 'react';
import { apiRequest, API_BASE, getToken } from '../../api';

/**
 * ------------------------------------------------------------
 * SELF-CONTAINED ICONS
 * ------------------------------------------------------------
 * No external icon package required (avoids "Failed to resolve
 * import lucide-react" if the dependency isn't installed).
 * Same visual language as lucide/feather icons — plain inline
 * SVGs, sized and colored entirely through CSS (currentColor).
 * ------------------------------------------------------------
 */

function IconBase({ children, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

function X(props) {
  return (
    <IconBase {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </IconBase>
  );
}

function Plus(props) {
  return (
    <IconBase {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </IconBase>
  );
}

function Trash2(props) {
  return (
    <IconBase {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </IconBase>
  );
}

function Save(props) {
  return (
    <IconBase {...props}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </IconBase>
  );
}

function ListChecks(props) {
  return (
    <IconBase {...props}>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <polyline points="3 6 3.5 6.5 5 5" />
      <polyline points="3 12 3.5 12.5 5 11" />
      <polyline points="3 18 3.5 18.5 5 17" />
    </IconBase>
  );
}

function PenLine(props) {
  return (
    <IconBase {...props}>
      <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </IconBase>
  );
}

function Code2(props) {
  return (
    <IconBase {...props}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </IconBase>
  );
}

function FlaskConical(props) {
  return (
    <IconBase {...props}>
      <path d="M9 2v6.5L4 18a2 2 0 0 0 1.8 3h12.4a2 2 0 0 0 1.8-3l-5-9.5V2" />
      <line x1="9" y1="2" x2="15" y2="2" />
      <line x1="7.5" y1="14" x2="16.5" y2="14" />
    </IconBase>
  );
}

function Bot(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <line x1="12" y1="7" x2="12" y2="11" />
      <line x1="8" y1="16" x2="8" y2="16.01" />
      <line x1="16" y1="16" x2="16" y2="16.01" />
    </IconBase>
  );
}

function UserRound(props) {
  return (
    <IconBase {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </IconBase>
  );
}

function Loader2(props) {
  return (
    <IconBase {...props}>
      <path d="M21 12a9 9 0 1 1-9-9" />
    </IconBase>
  );
}

function Inbox(props) {
  return (
    <IconBase {...props}>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </IconBase>
  );
}

function AlertTriangle(props) {
  return (
    <IconBase {...props}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </IconBase>
  );
}

function ChevronDown(props) {
  return (
    <IconBase {...props}>
      <polyline points="6 9 12 15 18 9" />
    </IconBase>
  );
}

function CircleCheck(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 11 14 15.5 9.5" />
    </IconBase>
  );
}

function Sparkles(props) {
  return (
    <IconBase {...props} fill="currentColor" stroke="none">
      <path d="M12 3l1.6 4.9L18.5 9l-4.9 1.6L12 15.5l-1.6-4.9L5.5 9l4.9-1.6L12 3z" />
      <path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14z" />
    </IconBase>
  );
}

function SlidersHorizontal(props) {
  return (
    <IconBase {...props}>
      <line x1="21" y1="4" x2="14" y2="4" />
      <line x1="10" y1="4" x2="3" y2="4" />
      <line x1="21" y1="12" x2="12" y2="12" />
      <line x1="8" y1="12" x2="3" y2="12" />
      <line x1="21" y1="20" x2="16" y2="20" />
      <line x1="12" y1="20" x2="3" y2="20" />
      <line x1="14" y1="2" x2="14" y2="6" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <line x1="16" y1="18" x2="16" y2="22" />
    </IconBase>
  );
}

/**
 * Recruiter-facing question bank manager for one job.
 *
 * Features:
 * - List questions
 * - Filter by type/source
 * - Create MCQ questions
 * - Create fill-in-the-blank questions
 * - Create coding questions
 * - Java/Python/C++/JavaScript starter code
 * - Duplicate question detection
 * - Coding test-case management
 * - Delete questions
 *
 * IMPORTANT:
 * The backend question routes are:
 *
 * GET    /api/questions
 * POST   /api/questions
 * DELETE /api/questions/{question_id}
 * POST   /api/questions/{question_id}/test-cases
 * GET    /api/questions/{question_id}/test-cases
 * DELETE /api/questions/test-cases/{test_case_id}
 */

// ============================================================
// CODING I/O PATTERNS
// ============================================================

const CODING_IO_PATTERNS = [
  {
    value: 'count_then_list|int',
    label: 'Count + list of ints → int',
    input: 'First line: N. Second line: N space-separated integers.',
    output: 'A single integer.',
  },
  {
    value: 'single_string|string',
    label: 'String → string',
    input: 'A single line containing a string.',
    output: 'A single string.',
  },
  {
    value: 'single_string|bool_lower',
    label: 'String → true/false',
    input: 'A single line containing a string.',
    output: "The literal word 'true' or 'false'.",
  },
  {
    value: 'single_int|string_lines',
    label: 'Int → N lines',
    input: 'A single integer N.',
    output: 'N lines of text, one value per line.',
  },
  {
    value: 'single_int|int',
    label: 'Int → int',
    input: 'A single integer.',
    output: 'A single integer.',
  },
  {
    value: 'single_int|bool_lower',
    label: 'Int → true/false',
    input: 'A single integer.',
    output: "The literal word 'true' or 'false'.",
  },
  {
    value: 'list_then_target|int_pair',
    label: 'List + target → int pair',
    input: 'First line: space-separated integers. Second line: target integer.',
    output: 'Two space-separated integers.',
  },
  {
    value: 'list_then_target|int',
    label: 'List + target → int',
    input: 'First line: space-separated integers. Second line: target integer.',
    output: 'A single integer.',
  },
];

// ============================================================
// EMPTY FORMS
// ============================================================

const EMPTY_MCQ_FORM = {
  question_text: '',
  options: ['', ''],
  correct_answer: '',
  difficulty: 'medium',
  topic: '',
  skill: '',
  marks: 2,
  explanation: '',
};

const EMPTY_FB_FORM = {
  question_text: '',
  expected_answer: '',
  accepted_answers: '',
  difficulty: 'medium',
  topic: '',
  skill: '',
  marks: 1,
  explanation: '',
};

const EMPTY_CODING_FORM = {
  question_text: '',
  problem_statement: '',
  input_format: '',
  output_format: '',
  constraints: '',
  io_pattern: CODING_IO_PATTERNS[0].value,
  starter_python: '',
  starter_java: '',
  starter_cpp: '',
  starter_javascript: '',
  difficulty: 'medium',
  topic: '',
  skill: '',
  marks: 9,
  explanation: '',
};

// ============================================================
// API URL HELPER
// ============================================================
//
// Your backend uses:
//
// /api/questions
//
// Depending on your api.js configuration, API_BASE may be:
//
// http://localhost:8000
//
// OR:
//
// http://localhost:8000/api
//
// This helper handles BOTH cases and prevents:
//
// /api/api/questions
//
// ============================================================

function getQuestionApiBase() {
  const base = String(API_BASE || '').replace(/\/+$/, '');

  if (!base) {
    return '/api';
  }

  if (base.endsWith('/api')) {
    return base;
  }

  return `${base}/api`;
}

const QUESTION_API_BASE = getQuestionApiBase();

// ============================================================
// TYPE / SOURCE META (icons + labels only — no content changes)
// ============================================================

const TYPE_META = {
  mcq: { label: 'MCQ', Icon: ListChecks },
  fill_blank: { label: 'Fill in the blank', Icon: PenLine },
  coding: { label: 'Coding', Icon: Code2 },
};

const SOURCE_META = {
  ai: { Icon: Bot },
  recruiter: { Icon: UserRound },
};

// ============================================================
// ERROR MESSAGE HELPER
// ============================================================

function getReadableError(data, fallback = 'Something went wrong.') {
  if (!data) {
    return fallback;
  }

  if (typeof data === 'string') {
    return data;
  }

  if (typeof data.detail === 'string') {
    return data.detail;
  }

  if (data.detail && typeof data.detail.message === 'string') {
    return data.detail.message;
  }

  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }

        if (item?.msg) {
          return item.msg;
        }

        return JSON.stringify(item);
      })
      .join(', ');
  }

  if (typeof data.message === 'string') {
    return data.message;
  }

  return fallback;
}

// ============================================================
// CREATE QUESTION
// ============================================================

async function postQuestionRaw(payload) {
  const token = getToken();

  const url = `${QUESTION_API_BASE}/questions`;

  console.log('Creating question...');
  console.log('POST URL:', url);
  console.log('Payload:', payload);

  const res = await fetch(url, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',

      ...(token
        ? {
          Authorization: `Bearer ${token}`,
        }
        : {}),
    },

    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  console.log('Create question response:', {
    status: res.status,
    ok: res.ok,
    data,
  });

  return {
    ok: res.ok,
    status: res.status,
    data,
  };
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function QuestionBankManager({
  jobId,
  jobTitle,
  open,
  onClose,
}) {
  // ==========================================================
  // STATE
  // ==========================================================

  const [questions, setQuestions] = useState(null);

  const [filterType, setFilterType] = useState('');

  const [filterSource, setFilterSource] = useState('');

  const [error, setError] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);

  const [addType, setAddType] = useState('mcq');

  const [mcqForm, setMcqForm] = useState(EMPTY_MCQ_FORM);

  const [fbForm, setFbForm] = useState(EMPTY_FB_FORM);

  const [codingForm, setCodingForm] = useState(
    EMPTY_CODING_FORM
  );

  const [saving, setSaving] = useState(false);

  const [duplicateConflict, setDuplicateConflict] =
    useState(null);

  const [expandedTestCasesFor, setExpandedTestCasesFor] =
    useState(null);

  const [testCases, setTestCases] = useState({});

  const [newTestCase, setNewTestCase] = useState({
    input: '',
    expected_output: '',
    is_public: true,
  });

  // ==========================================================
  // LOAD QUESTIONS
  // ==========================================================

  const load = useCallback(async () => {
    if (!jobId) {
      return;
    }

    setError('');

    try {
      const params = new URLSearchParams({
        job_id: jobId,
      });

      if (filterType) {
        params.set('question_type', filterType);
      }

      if (filterSource) {
        params.set('source', filterSource);
      }

      const data = await apiRequest(
        `/questions?${params.toString()}`
      );

      setQuestions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Could not load question bank:', e);

      setError(
        e.message || 'Could not load question bank.'
      );

      setQuestions([]);
    }
  }, [jobId, filterType, filterSource]);

  // ==========================================================
  // LOAD WHEN OPEN
  // ==========================================================

  useEffect(() => {
    if (open) {
      load();
    }
  }, [open, load]);

  // ==========================================================
  // LOAD TEST CASES
  // ==========================================================

  async function loadTestCases(questionId) {
    try {
      setError('');

      const data = await apiRequest(
        `/questions/${questionId}/test-cases`
      );

      setTestCases((prev) => ({
        ...prev,
        [questionId]: Array.isArray(data) ? data : [],
      }));
    } catch (e) {
      console.error('Could not load test cases:', e);

      setError(
        e.message || 'Could not load test cases.'
      );
    }
  }

  // ==========================================================
  // TOGGLE TEST CASES
  // ==========================================================

  function toggleTestCases(questionId) {
    if (expandedTestCasesFor === questionId) {
      setExpandedTestCasesFor(null);
      return;
    }

    setExpandedTestCasesFor(questionId);

    if (!testCases[questionId]) {
      loadTestCases(questionId);
    }
  }

  // ==========================================================
  // ADD TEST CASE
  // ==========================================================

  async function addTestCase(questionId) {
    setError('');

    if (
      !newTestCase.input.trim() ||
      !newTestCase.expected_output.trim()
    ) {
      setError(
        'Both input and expected output are required for a test case.'
      );

      return;
    }

    try {
      await apiRequest(
        `/questions/${questionId}/test-cases`,
        {
          method: 'POST',
          body: {
            input: newTestCase.input.trim(),
            expected_output:
              newTestCase.expected_output.trim(),
            is_public: newTestCase.is_public,
          },
        }
      );

      setNewTestCase({
        input: '',
        expected_output: '',
        is_public: true,
      });

      await loadTestCases(questionId);
    } catch (e) {
      console.error('Could not add test case:', e);

      setError(
        e.message || 'Could not add test case.'
      );
    }
  }

  // ==========================================================
  // DELETE TEST CASE
  // ==========================================================

  async function deleteTestCase(questionId, testCaseId) {
    setError('');

    try {
      await apiRequest(
        `/questions/test-cases/${testCaseId}`,
        {
          method: 'DELETE',
        }
      );

      await loadTestCases(questionId);
    } catch (e) {
      console.error('Could not delete test case:', e);

      setError(
        e.message || 'Could not delete test case.'
      );
    }
  }

  // ==========================================================
  // DELETE QUESTION
  // ==========================================================

  async function deleteQuestion(questionId) {
    setError('');

    const confirmed = window.confirm(
      'Are you sure you want to delete this question?'
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest(
        `/questions/${questionId}`,
        {
          method: 'DELETE',
        }
      );

      await load();
    } catch (e) {
      console.error('Could not delete question:', e);

      setError(
        e.message || 'Could not delete question.'
      );
    }
  }

  // ==========================================================
  // RESET FORM
  // ==========================================================

  function resetAddForm() {
    setMcqForm({
      ...EMPTY_MCQ_FORM,
      options: ['', ''],
    });

    setFbForm({
      ...EMPTY_FB_FORM,
    });

    setCodingForm({
      ...EMPTY_CODING_FORM,
    });

    setDuplicateConflict(null);

    setError('');
  }

  // ==========================================================
  // SUBMIT QUESTION
  // ==========================================================

  async function submitAddForm() {
    setError('');

    setDuplicateConflict(null);

    let payload;

    // ========================================================
    // MCQ
    // ========================================================

    if (addType === 'mcq') {
      const options = mcqForm.options
        .map((o) => o.trim())
        .filter(Boolean);

      if (
        !mcqForm.question_text.trim() ||
        options.length < 2 ||
        !mcqForm.correct_answer
      ) {
        setError(
          'MCQ needs question text, at least 2 options, and a correct answer.'
        );

        return;
      }

      payload = {
        job_id: Number(jobId),

        question_type: 'mcq',

        question_text:
          mcqForm.question_text.trim(),

        difficulty: mcqForm.difficulty,

        topic: mcqForm.topic.trim(),

        skill: mcqForm.skill.trim(),

        marks: Number(mcqForm.marks) || 2,

        explanation:
          mcqForm.explanation.trim(),

        payload: {
          options,

          correct_answer:
            mcqForm.correct_answer,
        },
      };
    }

    // ========================================================
    // FILL IN THE BLANK
    // ========================================================

    else if (addType === 'fill_blank') {
      if (
        !fbForm.question_text.trim() ||
        !fbForm.expected_answer.trim()
      ) {
        setError(
          'Fill-in-the-blank needs question text and an expected answer.'
        );

        return;
      }

      const accepted =
        fbForm.accepted_answers
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean);

      payload = {
        job_id: Number(jobId),

        question_type: 'fill_blank',

        question_text:
          fbForm.question_text.trim(),

        difficulty: fbForm.difficulty,

        topic: fbForm.topic.trim(),

        skill: fbForm.skill.trim(),

        marks: Number(fbForm.marks) || 1,

        explanation:
          fbForm.explanation.trim(),

        payload: {
          expected_answer:
            fbForm.expected_answer.trim(),

          accepted_answers:
            accepted.length
              ? accepted
              : [fbForm.expected_answer.trim()],
        },
      };
    }

    // ========================================================
    // CODING
    // ========================================================

    else {
      if (
        !codingForm.question_text.trim() ||
        !codingForm.problem_statement.trim() ||
        !codingForm.starter_python.trim()
      ) {
        setError(
          'Coding questions need a title, problem statement, and at least Python starter code.'
        );

        return;
      }

      const [
        inputPattern,
        outputPattern,
      ] = codingForm.io_pattern.split('|');

      payload = {
        job_id: Number(jobId),

        question_type: 'coding',

        question_text:
          codingForm.question_text.trim(),

        difficulty:
          codingForm.difficulty,

        topic:
          codingForm.topic.trim(),

        skill:
          codingForm.skill.trim(),

        marks:
          Number(codingForm.marks) || 9,

        explanation:
          codingForm.explanation.trim(),

        payload: {
          problem_statement:
            codingForm.problem_statement.trim(),

          input_format:
            codingForm.input_format.trim(),

          output_format:
            codingForm.output_format.trim(),

          constraints:
            codingForm.constraints.trim(),

          examples: [],

          starter_code: {
            python:
              codingForm.starter_python,

            java:
              codingForm.starter_java,

            cpp:
              codingForm.starter_cpp,

            javascript:
              codingForm.starter_javascript,
          },

          allowed_languages: [
            'python',
            'java',
            'cpp',
            'javascript',
          ],

          visible_test_cases: [],

          hidden_test_cases: [],

          input_pattern:
            inputPattern,

          output_pattern:
            outputPattern,
        },
      };
    }

    // ========================================================
    // SAVE
    // ========================================================

    setSaving(true);

    try {
      console.log(
        'Question payload being sent:',
        payload
      );

      const {
        ok,
        status,
        data,
      } = await postQuestionRaw(payload);

      // ======================================================
      // SUCCESS
      // ======================================================

      if (ok) {
        setShowAddForm(false);

        resetAddForm();

        await load();

        return;
      }

      // ======================================================
      // DUPLICATE
      // ======================================================

      if (status === 409) {
        const detail =
          data?.detail || data;

        setDuplicateConflict(
          detail
        );

        return;
      }

      // ======================================================
      // 404
      // ======================================================

      if (status === 404) {
        setError(
          'Question API was not found. Please make sure the backend is running and the API URL is correct.'
        );

        console.error(
          '404 while creating question:',
          {
            url: `${QUESTION_API_BASE}/questions`,
            response: data,
          }
        );

        return;
      }

      // ======================================================
      // 401 / 403
      // ======================================================

      if (
        status === 401 ||
        status === 403
      ) {
        setError(
          'You are not authorized to create questions. Please log in again as a recruiter.'
        );

        return;
      }

      // ======================================================
      // VALIDATION ERROR
      // ======================================================

      if (status === 422) {
        setError(
          getReadableError(
            data,
            'The question data is invalid. Please check all required fields.'
          )
        );

        console.error(
          'Validation error:',
          data
        );

        return;
      }

      // ======================================================
      // OTHER ERROR
      // ======================================================

      setError(
        getReadableError(
          data,
          `Could not save question. Server returned ${status}.`
        )
      );
    } catch (e) {
      console.error(
        'Create question request failed:',
        e
      );

      setError(
        e.message ||
        'Could not connect to the backend. Make sure the FastAPI server is running.'
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================================
  // DON'T RENDER WHEN CLOSED
  // ==========================================================

  if (!open) {
    return null;
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div
      className="qbank-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Question Bank"
    >
      <style>{`

        /* =====================================================
           TOKENS
           ===================================================== */

        .qbank-overlay {
          --qb-bg: #0a0e1c;
          --qb-panel: #0d1428;
          --qb-panel-2: #101a34;
          --qb-surface: #121b32;
          --qb-surface-2: #0b1120;
          --qb-border: rgba(255, 255, 255, 0.08);
          --qb-border-strong: rgba(255, 255, 255, 0.14);
          --qb-text: #eef1fb;
          --qb-text-dim: #9aa5c0;
          --qb-text-faint: #6b7794;
          --qb-violet: #8b5cf6;
          --qb-violet-soft: rgba(139, 92, 246, 0.14);
          --qb-orange: #f97316;
          --qb-accent-grad: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 45%, #f97316 100%);
          --qb-teal: #2dd4bf;
          --qb-danger: #f43f5e;
          --qb-danger-soft: rgba(244, 63, 94, 0.12);
          --qb-warning: #f59e0b;
          --qb-radius-lg: 20px;
          --qb-radius-md: 12px;
          --qb-radius-sm: 8px;
          --qb-shadow-lg: 0 30px 80px -20px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255,255,255,0.03);
          --qb-font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          --qb-mono: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
        }

        /* =====================================================
           OVERLAY
           ===================================================== */

        .qbank-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: clamp(10px, 3vw, 32px);

          background:
            radial-gradient(circle at 20% 0%, rgba(139,92,246,0.10), transparent 55%),
            radial-gradient(circle at 100% 100%, rgba(249,115,22,0.06), transparent 45%),
            rgba(3, 5, 14, 0.86);

          backdrop-filter: blur(8px) saturate(120%);
          -webkit-backdrop-filter: blur(8px) saturate(120%);

          font-family: var(--qb-font);

          animation: qbFadeIn 0.18s ease-out;
        }

        @keyframes qbFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes qbPanelIn {
          from { opacity: 0; transform: translateY(10px) scale(0.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes qbSpin {
          to { transform: rotate(360deg); }
        }

        /* =====================================================
           MAIN PANEL
           ===================================================== */

        .qbank-panel {
          width: min(920px, 100%);

          max-height: calc(100vh - 48px);

          display: flex;
          flex-direction: column;

          border: 1px solid var(--qb-border);
          border-radius: var(--qb-radius-lg);

          background:
            linear-gradient(180deg, var(--qb-panel-2) 0%, var(--qb-panel) 100%);

          color: var(--qb-text);

          box-shadow: var(--qb-shadow-lg);

          animation: qbPanelIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);

          overflow: hidden;
        }

        .qbank-panel-scroll {
          overflow-y: auto;
          overflow-x: hidden;
          padding: 22px 28px 30px;
          scrollbar-width: thin;
          scrollbar-color: rgba(139,92,246,0.35) transparent;
        }

        .qbank-panel-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .qbank-panel-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .qbank-panel-scroll::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.28);
          border-radius: 8px;
        }

        .qbank-panel-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.45);
        }

        /* =====================================================
           HEADER
           ===================================================== */

        .qbank-head {
          position: sticky;
          top: 0;
          z-index: 5;

          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;

          padding: 22px 28px 18px;

          background: linear-gradient(180deg, var(--qb-panel-2) 70%, rgba(16,26,52,0));
          border-bottom: 1px solid var(--qb-border);
        }

        .qbank-head-titlewrap {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .qbank-head-icon {
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--qb-accent-grad);
          box-shadow: 0 8px 20px -6px rgba(139, 92, 246, 0.55);
        }

        .qbank-head-icon svg {
          width: 20px;
          height: 20px;
          color: #fff;
        }

        .qbank-title {
          margin: 0;
          font-size: clamp(17px, 2.4vw, 21px);
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.25;
        }

        .qbank-sub {
          margin: 3px 0 0;
          color: var(--qb-text-dim);
          font-size: 12.5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .qbank-close {
          flex-shrink: 0;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          border: 1px solid var(--qb-border);
          background: var(--qb-surface);
          color: var(--qb-text-dim);
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size:20px;
        }

        .qbank-close svg {
          width: 17px;
          height: 17px;
        }

        .qbank-close:hover {
          color: #ffffff;
          background: var(--qb-danger-soft);
          border-color: rgba(244, 63, 94, 0.4);
          transform: translateY(-1px);
        }

        .qbank-close:active {
          transform: translateY(0);
        }

        /* =====================================================
           TOOLBAR
           ===================================================== */

        .qbank-toolbar {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
          margin: 18px 0 16px;
        }

        .qbank-select-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
        }

        .qbank-select-wrap svg.select-lead {
          position: absolute;
          left: 11px;
          width: 14px;
          height: 14px;
          color: var(--qb-text-faint);
          pointer-events: none;
        }

        .qbank-select-wrap svg.select-chevron {
          position: absolute;
          right: 10px;
          width: 14px;
          height: 14px;
          color: var(--qb-text-faint);
          pointer-events: none;
        }

        .qbank-toolbar select {
          appearance: none;
          -webkit-appearance: none;
          background: var(--qb-surface);
          border: 1px solid var(--qb-border-strong);
          color: var(--qb-text);
          padding: 9px 30px 9px 32px;
          border-radius: var(--qb-radius-sm);
          font-size: 12.5px;
          font-weight: 500;
          outline: none;
          cursor: pointer;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        }

        .qbank-toolbar select:hover {
          border-color: rgba(139, 92, 246, 0.4);
        }

        .qbank-toolbar select:focus-visible {
          border-color: rgba(139, 92, 246, 0.6);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.14);
        }

        .qbank-add-btn {
          margin-left: auto;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 18px;
          border-radius: var(--qb-radius-sm);
          background: var(--qb-accent-grad);
          background-size: 160% 160%;
          border: none;
          color: #fff;
          font-weight: 600;
          font-size: 12.5px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 6px 18px -6px rgba(139, 92, 246, 0.45);
        }

        .qbank-add-btn svg {
          width: 15px;
          height: 15px;
        }

        .qbank-add-btn:hover {
          transform: translateY(-1px);
          background-position: 100% 0;
          box-shadow: 0 10px 26px -6px rgba(139, 92, 246, 0.55);
        }

        .qbank-add-btn:active {
          transform: translateY(0);
        }

        /* =====================================================
           ERROR
           ===================================================== */

        .qbank-error {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin: 12px 0;
          border: 1px solid rgba(239, 68, 68, 0.28);
          background: rgba(239, 68, 68, 0.08);
          color: #fca5a5;
          padding: 11px 13px;
          border-radius: 10px;
          font-size: 12.5px;
          line-height: 1.5;
        }

        .qbank-error svg {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          margin-top: 1px;
          color: #f87171;
        }

        /* =====================================================
           QUESTION LIST
           ===================================================== */

        .qbank-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .qbank-row {
          border: 1px solid var(--qb-border);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.018);
          padding: 15px 17px;
          transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }

        .qbank-row:hover {
          border-color: rgba(139, 92, 246, 0.28);
          background: rgba(139, 92, 246, 0.03);
          transform: translateY(-1px);
          box-shadow: 0 10px 24px -14px rgba(0,0,0,0.6);
        }

        .qbank-row-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
        }

        .qbank-row-text {
          font-size: 13.5px;
          font-weight: 600;
          color: #f1f5f9;
          line-height: 1.45;
        }

        .qbank-badges {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .qbank-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font: 600 10.5px/1 var(--qb-mono);
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid var(--qb-border-strong);
          color: var(--qb-text-dim);
          background: rgba(255,255,255,0.02);
        }

        .qbank-badge svg {
          width: 11px;
          height: 11px;
        }

        .qbank-badge.type {
          color: #c4b5fd;
          border-color: rgba(139, 92, 246, 0.35);
          background: rgba(139, 92, 246, 0.08);
        }

        .qbank-badge.src-ai {
          color: #7dd3fc;
          border-color: rgba(56, 189, 248, 0.35);
          background: rgba(56, 189, 248, 0.07);
        }

        .qbank-badge.src-recruiter {
          color: #86efac;
          border-color: rgba(74, 222, 128, 0.35);
          background: rgba(74, 222, 128, 0.07);
        }

        .qbank-row-actions {
          display: flex;
          gap: 7px;
          flex-shrink: 0;
        }

        .qbank-mini-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 7px 11px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid var(--qb-border-strong);
          background: var(--qb-surface);
          color: #cbd5e1;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .qbank-mini-btn svg {
          width: 13px;
          height: 13px;
        }

        .qbank-mini-btn:hover {
          border-color: rgba(139, 92, 246, 0.4);
          color: #fff;
          transform: translateY(-1px);
        }

        .qbank-mini-btn.danger {
          border-color: rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }

        .qbank-mini-btn.danger:hover {
          border-color: rgba(239, 68, 68, 0.65);
          background: rgba(239, 68, 68, 0.1);
          color: #fecaca;
        }

        .qbank-mini-btn.icon-only {
          padding: 7px;
        }

        /* =====================================================
           TEST CASES
           ===================================================== */

        .qbank-tc-panel {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--qb-border);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .qbank-tc-row {
          display: flex;
          gap: 9px;
          align-items: center;
          font-size: 11.5px;
          font-family: var(--qb-mono);
          background: rgba(0, 0, 0, 0.28);
          padding: 9px 11px;
          border-radius: 9px;
          border: 1px solid rgba(255,255,255,0.04);
        }

        .qbank-tc-row .tc-io {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #cbd5e1;
        }

        .qbank-tc-add {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
          padding-top: 2px;
        }

        .qbank-tc-add input[type="text"] {
          flex: 1;
          min-width: 140px;
          background: var(--qb-surface-2);
          border: 1px solid var(--qb-border-strong);
          color: var(--qb-text);
          padding: 8px 11px;
          border-radius: 8px;
          font-size: 12px;
          font-family: var(--qb-mono);
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .qbank-tc-add input[type="text"]:focus-visible {
          border-color: rgba(139, 92, 246, 0.55);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .qbank-tc-public-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: var(--qb-text-dim);
          margin: 0;
          white-space: nowrap;
        }

        .qbank-tc-public-label input[type="checkbox"] {
          width: 15px;
          height: 15px;
          accent-color: var(--qb-violet);
          cursor: pointer;
        }

        /* =====================================================
           FORM
           ===================================================== */

        .qbank-form {
          margin-top: 18px;
          border: 1px solid rgba(139, 92, 246, 0.25);
          border-radius: 16px;
          padding: 20px;
          background:
            linear-gradient(180deg, rgba(139, 92, 246, 0.05), rgba(139, 92, 246, 0.015));
          animation: qbPanelIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .qbank-form label {
          display: flex;
          align-items: center;
          gap: 6px;
          font: 600 10.5px/1.2 var(--qb-mono);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--qb-text-dim);
          margin: 14px 0 7px;
        }

        .qbank-form label svg {
          width: 12px;
          height: 12px;
          color: var(--qb-violet);
        }

        .qbank-form input[type="text"],
        .qbank-form input[type="number"],
        .qbank-form textarea,
        .qbank-form select {
          width: 100%;
          background: var(--qb-surface-2);
          border: 1px solid var(--qb-border-strong);
          color: var(--qb-text);
          padding: 10px 13px;
          border-radius: 9px;
          font-size: 12.5px;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          font-family: var(--qb-font);
        }

        .qbank-form select {
          appearance: none;
          -webkit-appearance: none;
          background-image: none;
        }

        .qbank-form input:hover,
        .qbank-form textarea:hover,
        .qbank-form select:hover {
          border-color: rgba(255, 255, 255, 0.18);
        }

        .qbank-form input:focus-visible,
        .qbank-form textarea:focus-visible,
        .qbank-form select:focus-visible {
          border-color: rgba(139, 92, 246, 0.6);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
          background: rgba(139, 92, 246, 0.02);
        }

        .qbank-form textarea {
          resize: vertical;
          font-family: var(--qb-mono);
          line-height: 1.55;
        }

        .qbank-select-field {
          position: relative;
        }

        .qbank-select-field svg {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 14px;
          height: 14px;
          color: var(--qb-text-faint);
          pointer-events: none;
        }

        /* =====================================================
           QUESTION TYPE TABS
           ===================================================== */

        .qbank-type-tabs {
          display: flex;
          gap: 7px;
        }

        .qbank-type-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 10px 8px;
          border-radius: 10px;
          text-align: center;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid var(--qb-border-strong);
          background: var(--qb-surface);
          color: var(--qb-text-dim);
          transition: all 0.18s ease;
        }

        .qbank-type-tab svg {
          width: 15px;
          height: 15px;
          flex-shrink: 0;
        }

        .qbank-type-tab:hover {
          border-color: rgba(139, 92, 246, 0.3);
          color: #d8dff0;
        }

        .qbank-type-tab.active {
          border-color: rgba(139, 92, 246, 0.5);
          background: rgba(139, 92, 246, 0.16);
          color: #d8b4fe;
          box-shadow: inset 0 0 24px rgba(139, 92, 246, 0.06);
        }

        /* =====================================================
           MCQ OPTIONS
           ===================================================== */

        .qbank-opt-row {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 7px;
        }

        .qbank-opt-row input {
          flex: 1;
        }

        /* =====================================================
           TWO COLUMN
           ===================================================== */

        .qbank-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        /* =====================================================
           FORM ACTIONS
           ===================================================== */

        .qbank-form-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .qbank-form-actions button {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 12px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 12.5px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .qbank-form-actions button svg {
          width: 15px;
          height: 15px;
        }

        .qbank-cancel-btn {
          background: var(--qb-surface);
          border: 1px solid var(--qb-border-strong);
          color: #cbd5e1;
        }

        .qbank-cancel-btn:hover {
          border-color: rgba(255, 255, 255, 0.22);
          color: #fff;
        }

        .qbank-save-btn {
          background: var(--qb-accent-grad);
          background-size: 160% 160%;
          border: none;
          color: #fff;
          box-shadow: 0 8px 24px -8px rgba(139, 92, 246, 0.4);
        }

        .qbank-save-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          background-position: 100% 0;
          box-shadow: 0 12px 30px -8px rgba(139, 92, 246, 0.55);
        }

        .qbank-save-btn:disabled {
          opacity: 0.65;
          cursor: default;
          transform: none;
        }

        .qbank-save-btn .spin {
          animation: qbSpin 0.85s linear infinite;
        }

        /* =====================================================
           DUPLICATE NOTICE
           ===================================================== */

        .qbank-dup-notice {
          margin-top: 16px;
          border: 1px solid rgba(245, 158, 11, 0.35);
          background: rgba(245, 158, 11, 0.08);
          border-radius: 12px;
          padding: 13px 15px;
          font-size: 12.5px;
          color: #fde68a;
          line-height: 1.5;
        }

        .qbank-dup-notice-head {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .qbank-dup-notice-head svg {
          width: 15px;
          height: 15px;
          color: #fbbf24;
          flex-shrink: 0;
        }

        .qbank-dup-notice strong {
          color: #fbbf24;
        }

        .qbank-dup-notice.info {
          border-color: rgba(139, 92, 246, 0.3);
          background: rgba(139, 92, 246, 0.06);
          color: #c4b5fd;
        }

        .qbank-dup-notice.info svg {
          color: var(--qb-violet);
        }

        /* =====================================================
           EMPTY / LOADING
           ===================================================== */

        .qbank-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          text-align: center;
          padding: 44px 10px;
          color: var(--qb-text-faint);
          font-size: 13px;
        }

        .qbank-empty svg {
          width: 26px;
          height: 26px;
          color: var(--qb-text-faint);
          opacity: 0.7;
        }

        .qbank-empty.loading svg {
          color: var(--qb-violet);
          animation: qbSpin 0.85s linear infinite;
        }

        /* =====================================================
           SCROLLBARS FOR TEXTAREAS
           ===================================================== */

        .qbank-form textarea::-webkit-scrollbar {
          width: 7px;
        }

        .qbank-form textarea::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.25);
          border-radius: 8px;
        }

        /* =====================================================
           TABLET
           ===================================================== */

        @media (max-width: 860px) {
          .qbank-panel {
            width: 100%;
          }

          .qbank-two-col {
            gap: 12px;
          }
        }

        /* =====================================================
           MOBILE
           ===================================================== */

        @media (max-width: 700px) {

          .qbank-overlay {
            padding: 0;
            align-items: flex-end;
          }

          .qbank-panel {
            width: 100%;
            max-height: 94vh;
            border-radius: 20px 20px 0 0;
            border-bottom: none;
          }

          .qbank-head {
            padding: 18px 18px 14px;
          }

          .qbank-panel-scroll {
            padding: 16px 16px 24px;
          }

          .qbank-two-col {
            grid-template-columns: 1fr;
          }

          .qbank-row-top {
            flex-direction: column;
          }

          .qbank-row-actions {
            width: 100%;
          }

          .qbank-row-actions button {
            flex: 1;
            justify-content: center;
          }

          .qbank-add-btn {
            margin-left: 0;
            width: 100%;
            justify-content: center;
          }

          .qbank-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .qbank-select-wrap,
          .qbank-toolbar select {
            width: 100%;
          }

          .qbank-type-tabs {
            flex-direction: column;
          }

          .qbank-form-actions {
            flex-direction: column;
          }

          .qbank-tc-add input[type="text"] {
            min-width: 100%;
          }

          .qbank-sub {
            white-space: normal;
          }
        }

        @media (max-width: 420px) {
          .qbank-title {
            font-size: 16.5px;
          }

          .qbank-head-icon {
            width: 36px;
            height: 36px;
          }
        }

        /* =====================================================
           REDUCED MOTION
           ===================================================== */

        @media (prefers-reduced-motion: reduce) {
          .qbank-overlay,
          .qbank-panel,
          .qbank-form,
          .qbank-save-btn .spin,
          .qbank-empty.loading svg {
            animation: none !important;
          }

          .qbank-add-btn:hover,
          .qbank-save-btn:hover:not(:disabled),
          .qbank-mini-btn:hover,
          .qbank-row:hover {
            transform: none;
          }
        }

        /* =====================================================
           FOCUS VISIBILITY (ACCESSIBILITY)
           ===================================================== */

        .qbank-overlay button:focus-visible,
        .qbank-overlay [role="button"]:focus-visible {
          outline: 2px solid rgba(139, 92, 246, 0.7);
          outline-offset: 2px;
        }

      `}</style>

      {/* ========================================================
          PANEL
          ======================================================== */}

      <div className="qbank-panel">

        {/* ======================================================
            HEADER
            ====================================================== */}

        <div className="qbank-head">

          <div className="qbank-head-titlewrap">

            <div className="qbank-head-icon">
              <Sparkles />
            </div>

            <div style={{ minWidth: 0 }}>
              <h2 className="qbank-title">
                Question Bank
              </h2>

              <p className="qbank-sub">
                {jobTitle}
              </p>
            </div>

          </div>

          <button
            className="qbank-close"
            onClick={onClose}
            aria-label="Close"
            type="button"
          > ×
            <X />
          </button>

        </div>

        <div className="qbank-panel-scroll">

        {/* ======================================================
            TOOLBAR
            ====================================================== */}

        <div className="qbank-toolbar">

          <div className="qbank-select-wrap">
            <SlidersHorizontal className="select-lead" />
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value)
              }
            >
              <option value="">
                All types
              </option>

              <option value="mcq">
                MCQ
              </option>

              <option value="fill_blank">
                Fill in the blank
              </option>

              <option value="coding">
                Coding
              </option>
            </select>
            <ChevronDown className="select-chevron" />
          </div>

          <div className="qbank-select-wrap">
            <UserRound className="select-lead" />
            <select
              value={filterSource}
              onChange={(e) =>
                setFilterSource(e.target.value)
              }
            >
              <option value="">
                All sources
              </option>

              <option value="ai">
                AI-generated
              </option>

              <option value="recruiter">
                Recruiter-created
              </option>
            </select>
            <ChevronDown className="select-chevron" />
          </div>

          <button
            type="button"
            className="qbank-add-btn"
            onClick={() => {
              setShowAddForm((p) => !p);
              resetAddForm();
            }}
          >
            {showAddForm
              ? (<><X />Close form</>)
              : (<><Plus />Add question</>)}
          </button>

        </div>

        {/* ======================================================
            ERROR
            ====================================================== */}

        {error && (
          <div className="qbank-error">
            <AlertTriangle />
            <span>{error}</span>
          </div>
        )}

        {/* ======================================================
            ADD FORM
            ====================================================== */}

        {showAddForm && (

          <div className="qbank-form">

            {/* ==================================================
                TYPE TABS
                ================================================== */}

            <div className="qbank-type-tabs">

              {[
                'mcq',
                'fill_blank',
                'coding',
              ].map((t) => {
                const Meta = TYPE_META[t];
                const TabIcon = Meta.Icon;

                return (
                  <div
                    key={t}
                    className={
                      `qbank-type-tab ${addType === t
                        ? 'active'
                        : ''
                      }`
                    }
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setAddType(t);
                      setDuplicateConflict(null);
                      setError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setAddType(t);
                        setDuplicateConflict(null);
                        setError('');
                      }
                    }}
                  >
                    <TabIcon />
                    {Meta.label}
                  </div>
                );
              })}

            </div>

            {/* ==================================================
                MCQ
                ================================================== */}

            {addType === 'mcq' && (

              <>
                <label>
                  <PenLine />
                  Question text
                </label>

                <textarea
                  rows={2}
                  value={
                    mcqForm.question_text
                  }
                  onChange={(e) =>
                    setMcqForm({
                      ...mcqForm,
                      question_text:
                        e.target.value,
                    })
                  }
                />

                <label>
                  <ListChecks />
                  Options
                </label>

                {mcqForm.options.map(
                  (opt, idx) => (

                    <div
                      className="qbank-opt-row"
                      key={idx}
                    >

                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {

                          const next =
                            [
                              ...mcqForm.options,
                            ];

                          next[idx] =
                            e.target.value;

                          setMcqForm({
                            ...mcqForm,
                            options: next,
                          });
                        }}
                        placeholder={
                          `Option ${idx + 1}`
                        }
                      />

                      {mcqForm.options
                        .length > 2 && (

                          <button
                            type="button"
                            className="qbank-mini-btn danger icon-only"
                            aria-label={`Remove option ${idx + 1}`}
                            onClick={() => {

                              const next =
                                mcqForm.options
                                  .filter(
                                    (_, i) =>
                                      i !== idx
                                  );

                              setMcqForm({
                                ...mcqForm,

                                options:
                                  next,

                                correct_answer:
                                  mcqForm.correct_answer ===
                                    opt
                                    ? ''
                                    : mcqForm.correct_answer,
                              });
                            }}
                          >
                            <Trash2 />
                          </button>

                        )}

                    </div>

                  )
                )}

                {mcqForm.options.length < 6 && (

                  <button
                    type="button"
                    className="qbank-mini-btn"
                    onClick={() =>
                      setMcqForm({
                        ...mcqForm,

                        options: [
                          ...mcqForm.options,
                          '',
                        ],
                      })
                    }
                  >
                    <Plus />
                    Add option
                  </button>

                )}

                <label>
                  <CircleCheck />
                  Correct answer
                </label>

                <div className="qbank-select-field">
                  <select
                    value={
                      mcqForm.correct_answer
                    }
                    onChange={(e) =>
                      setMcqForm({
                        ...mcqForm,

                        correct_answer:
                          e.target.value,
                      })
                    }
                  >
                    <option value="">
                      Select the correct option
                    </option>

                    {mcqForm.options
                      .filter(
                        (o) => o.trim()
                      )
                      .map((o) => (

                        <option
                          value={o}
                          key={o}
                        >
                          {o}
                        </option>

                      ))}
                  </select>
                  <ChevronDown />
                </div>
              </>

            )}

            {/* ==================================================
                FILL BLANK
                ================================================== */}

            {addType === 'fill_blank' && (

              <>
                <label>
                  <PenLine />
                  Question text
                  (use ______ for the blank)
                </label>

                <textarea
                  rows={2}
                  value={
                    fbForm.question_text
                  }
                  onChange={(e) =>
                    setFbForm({
                      ...fbForm,

                      question_text:
                        e.target.value,
                    })
                  }
                />

                <label>
                  <CircleCheck />
                  Expected answer
                </label>

                <input
                  type="text"
                  value={
                    fbForm.expected_answer
                  }
                  onChange={(e) =>
                    setFbForm({
                      ...fbForm,

                      expected_answer:
                        e.target.value,
                    })
                  }
                />

                <label>
                  <ListChecks />
                  Also accept
                  (comma-separated, optional)
                </label>

                <input
                  type="text"
                  value={
                    fbForm.accepted_answers
                  }
                  onChange={(e) =>
                    setFbForm({
                      ...fbForm,

                      accepted_answers:
                        e.target.value,
                    })
                  }
                  placeholder="synonym, alternate casing, ..."
                />
              </>

            )}

            {/* ==================================================
                CODING
                ================================================== */}

            {addType === 'coding' && (

              <>
                <label>
                  <PenLine />
                  Title
                </label>

                <input
                  type="text"
                  value={
                    codingForm.question_text
                  }
                  onChange={(e) =>
                    setCodingForm({
                      ...codingForm,

                      question_text:
                        e.target.value,
                    })
                  }
                />

                <label>
                  <Code2 />
                  Problem statement
                </label>

                <textarea
                  rows={5}
                  value={
                    codingForm.problem_statement
                  }
                  onChange={(e) =>
                    setCodingForm({
                      ...codingForm,

                      problem_statement:
                        e.target.value,
                    })
                  }
                />

                <label>
                  <SlidersHorizontal />
                  Input/output shape
                  (must match one exactly)
                </label>

                <div className="qbank-select-field">
                  <select
                    value={
                      codingForm.io_pattern
                    }
                    onChange={(e) =>
                      setCodingForm({
                        ...codingForm,

                        io_pattern:
                          e.target.value,
                      })
                    }
                  >

                    {CODING_IO_PATTERNS.map(
                      (p) => (

                        <option
                          value={p.value}
                          key={p.value}
                        >
                          {p.label}
                        </option>

                      )
                    )}

                  </select>
                  <ChevronDown />
                </div>

                <div className="qbank-two-col">

                  <div>

                    <label>
                      Input format
                    </label>

                    <textarea
                      rows={3}
                      value={
                        codingForm.input_format
                      }
                      onChange={(e) =>
                        setCodingForm({
                          ...codingForm,

                          input_format:
                            e.target.value,
                        })
                      }
                      placeholder={
                        CODING_IO_PATTERNS.find(
                          (p) =>
                            p.value ===
                            codingForm.io_pattern
                        )?.input
                      }
                    />

                  </div>

                  <div>

                    <label>
                      Output format
                    </label>

                    <textarea
                      rows={3}
                      value={
                        codingForm.output_format
                      }
                      onChange={(e) =>
                        setCodingForm({
                          ...codingForm,

                          output_format:
                            e.target.value,
                        })
                      }
                      placeholder={
                        CODING_IO_PATTERNS.find(
                          (p) =>
                            p.value ===
                            codingForm.io_pattern
                        )?.output
                      }
                    />

                  </div>

                </div>

                <label>
                  Constraints
                </label>

                <textarea
                  rows={3}
                  value={
                    codingForm.constraints
                  }
                  onChange={(e) =>
                    setCodingForm({
                      ...codingForm,

                      constraints:
                        e.target.value,
                    })
                  }
                />

                <label>
                  <Code2 />
                  Starter code — Python
                  (required)
                </label>

                <textarea
                  rows={6}
                  value={
                    codingForm.starter_python
                  }
                  onChange={(e) =>
                    setCodingForm({
                      ...codingForm,

                      starter_python:
                        e.target.value,
                    })
                  }
                  placeholder={
                    `def solve():\n    pass`
                  }
                />

                <label>
                  <Code2 />
                  Starter code — Java
                  (optional)
                </label>

                <textarea
                  rows={6}
                  value={
                    codingForm.starter_java
                  }
                  onChange={(e) =>
                    setCodingForm({
                      ...codingForm,

                      starter_java:
                        e.target.value,
                    })
                  }
                />

                <label>
                  <Code2 />
                  Starter code — C++
                  (optional)
                </label>

                <textarea
                  rows={6}
                  value={
                    codingForm.starter_cpp
                  }
                  onChange={(e) =>
                    setCodingForm({
                      ...codingForm,

                      starter_cpp:
                        e.target.value,
                    })
                  }
                />

                <label>
                  <Code2 />
                  Starter code — JavaScript
                  (optional)
                </label>

                <textarea
                  rows={6}
                  value={
                    codingForm.starter_javascript
                  }
                  onChange={(e) =>
                    setCodingForm({
                      ...codingForm,

                      starter_javascript:
                        e.target.value,
                    })
                  }
                />

                <div className="qbank-dup-notice info">
                  <div className="qbank-dup-notice-head">
                    <FlaskConical />
                    <span>
                      Add test cases after saving
                      this question, using the
                      "Test cases" button on it
                      in the list below.
                    </span>
                  </div>
                </div>

              </>

            )}

            {/* ==================================================
                DIFFICULTY + SKILL
                ================================================== */}

            <div
              className="qbank-two-col"
              style={{
                marginTop: 14,
              }}
            >

              <div>

                <label>
                  Difficulty
                </label>

                <div className="qbank-select-field">
                  <select
                    value={
                      (
                        addType === 'mcq'
                          ? mcqForm
                          : addType === 'fill_blank'
                            ? fbForm
                            : codingForm
                      ).difficulty
                    }
                    onChange={(e) => {

                      const v =
                        e.target.value;

                      if (addType === 'mcq') {

                        setMcqForm({
                          ...mcqForm,
                          difficulty: v,
                        });

                      } else if (
                        addType === 'fill_blank'
                      ) {

                        setFbForm({
                          ...fbForm,
                          difficulty: v,
                        });

                      } else {

                        setCodingForm({
                          ...codingForm,
                          difficulty: v,
                        });

                      }

                    }}
                  >

                    <option value="easy">
                      Easy
                    </option>

                    <option value="medium">
                      Medium
                    </option>

                    <option value="hard">
                      Hard
                    </option>

                  </select>
                  <ChevronDown />
                </div>

              </div>

              <div>

                <label>
                  Skill tag
                </label>

                <input
                  type="text"
                  value={
                    (
                      addType === 'mcq'
                        ? mcqForm
                        : addType === 'fill_blank'
                          ? fbForm
                          : codingForm
                    ).skill
                  }
                  onChange={(e) => {

                    const v =
                      e.target.value;

                    if (addType === 'mcq') {

                      setMcqForm({
                        ...mcqForm,
                        skill: v,
                      });

                    } else if (
                      addType === 'fill_blank'
                    ) {

                      setFbForm({
                        ...fbForm,
                        skill: v,
                      });

                    } else {

                      setCodingForm({
                        ...codingForm,
                        skill: v,
                      });

                    }

                  }}
                  placeholder="e.g. python, sql, react"
                />

              </div>

            </div>

            {/* ==================================================
                DUPLICATE CONFLICT
                ================================================== */}

            {duplicateConflict && (

              <div className="qbank-dup-notice">

                <div className="qbank-dup-notice-head">
                  <AlertTriangle />
                  <strong>
                    Similar question already exists:
                  </strong>
                </div>

                <div
                  style={{
                    marginTop: 6,
                  }}
                >
                  {duplicateConflict.existing_question_text ||
                    duplicateConflict.message ||
                    'A similar question already exists.'}
                </div>

                <div
                  style={{
                    marginTop: 8,
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >

                  <button
                    type="button"
                    className="qbank-mini-btn"
                    onClick={() => {
                      setShowAddForm(false);
                      resetAddForm();
                    }}
                  >
                    <CircleCheck />
                    Use existing question
                  </button>

                  <button
                    type="button"
                    className="qbank-mini-btn"
                    onClick={() =>
                      setDuplicateConflict(null)
                    }
                  >
                    <PenLine />
                    Edit and try again
                  </button>

                </div>

              </div>

            )}

            {/* ==================================================
                ACTION BUTTONS
                ================================================== */}

            <div className="qbank-form-actions">

              <button
                type="button"
                className="qbank-cancel-btn"
                onClick={() => {
                  setShowAddForm(false);
                  resetAddForm();
                }}
              >
                <X />
                Cancel
              </button>

              <button
                type="button"
                className="qbank-save-btn"
                onClick={submitAddForm}
                disabled={saving}
              >
                {saving
                  ? (<><Loader2 className="spin" />Saving...</>)
                  : (<><Save />Save question</>)}
              </button>

            </div>

          </div>

        )}

        {/* ======================================================
            QUESTION LIST
            ====================================================== */}

        <div
          className="qbank-list"
          style={{
            marginTop: 18,
          }}
        >

          {/* LOADING */}

          {questions === null && (
            <div className="qbank-empty loading">
              <Loader2 />
              Loading...
            </div>
          )}

          {/* EMPTY */}

          {questions &&
            questions.length === 0 && (
              <div className="qbank-empty">
                <Inbox />
                No questions in the bank
                yet for this job.
              </div>
            )}

          {/* QUESTIONS */}

          {questions &&
            questions.map((q) => {
              const TypeIcon =
                TYPE_META[q.question_type]?.Icon || ListChecks;

              const SourceIcon =
                SOURCE_META[q.source]?.Icon || UserRound;

              return (

              <div
                className="qbank-row"
                key={q.id}
              >

                <div className="qbank-row-top">

                  <div
                    style={{
                      minWidth: 0,
                      flex: 1,
                    }}
                  >

                    <div className="qbank-row-text">
                      {q.question_text}
                    </div>

                    <div className="qbank-badges">

                      <span className="qbank-badge type">
                        <TypeIcon />
                        {q.question_type}
                      </span>

                      <span
                        className={
                          `qbank-badge src-${q.source}`
                        }
                      >
                        <SourceIcon />
                        {q.source}
                      </span>

                      <span className="qbank-badge">
                        {q.difficulty}
                      </span>

                      <span className="qbank-badge">
                        {q.marks} marks
                      </span>

                      {q.skill && (
                        <span className="qbank-badge">
                          {q.skill}
                        </span>
                      )}

                    </div>

                  </div>

                  <div className="qbank-row-actions">

                    {q.question_type ===
                      'coding' && (

                        <button
                          type="button"
                          className="qbank-mini-btn"
                          onClick={() =>
                            toggleTestCases(q.id)
                          }
                        >
                          <FlaskConical />
                          {expandedTestCasesFor ===
                            q.id
                            ? 'Hide tests'
                            : 'Test cases'}
                        </button>

                      )}

                    <button
                      type="button"
                      className="qbank-mini-btn danger"
                      onClick={() =>
                        deleteQuestion(q.id)
                      }
                    >
                      <Trash2 />
                      Delete
                    </button>

                  </div>

                </div>

                {/* ==================================================
                    TEST CASE PANEL
                    ================================================== */}

                {q.question_type === 'coding' &&
                  expandedTestCasesFor ===
                  q.id && (

                    <div className="qbank-tc-panel">

                      {(testCases[q.id] || [])
                        .map((tc) => (

                          <div
                            className="qbank-tc-row"
                            key={tc.id}
                          >

                            <span
                              className="qbank-badge"
                              style={{
                                flexShrink: 0,
                              }}
                            >
                              {tc.is_public
                                ? 'public'
                                : 'private'}
                            </span>

                            <span className="tc-io">
                              in: {tc.input}
                              {' → '}
                              out: {
                                tc.expected_output
                              }
                            </span>

                            <button
                              type="button"
                              className="qbank-mini-btn danger icon-only"
                              style={{
                                flexShrink: 0,
                              }}
                              aria-label="Delete test case"
                              onClick={() =>
                                deleteTestCase(
                                  q.id,
                                  tc.id
                                )
                              }
                            >
                              <X />
                            </button>

                          </div>

                        ))}

                      {/* ADD TEST CASE */}

                      <div className="qbank-tc-add">

                        <input
                          type="text"
                          placeholder="input"
                          value={
                            newTestCase.input
                          }
                          onChange={(e) =>
                            setNewTestCase({
                              ...newTestCase,

                              input:
                                e.target.value,
                            })
                          }
                        />

                        <input
                          type="text"
                          placeholder="expected output"
                          value={
                            newTestCase.expected_output
                          }
                          onChange={(e) =>
                            setNewTestCase({
                              ...newTestCase,

                              expected_output:
                                e.target.value,
                            })
                          }
                        />

                        <label className="qbank-tc-public-label">

                          <input
                            type="checkbox"
                            checked={
                              newTestCase.is_public
                            }
                            onChange={(e) =>
                              setNewTestCase({
                                ...newTestCase,

                                is_public:
                                  e.target.checked,
                              })
                            }
                          />

                          Public
                          (visible to candidate)

                        </label>

                        <button
                          type="button"
                          className="qbank-mini-btn"
                          onClick={() =>
                            addTestCase(q.id)
                          }
                        >
                          <Plus />
                          Add
                        </button>

                      </div>

                    </div>

                  )}

              </div>

              );
            })}

        </div>

        </div>

      </div>

    </div>
  );
}


