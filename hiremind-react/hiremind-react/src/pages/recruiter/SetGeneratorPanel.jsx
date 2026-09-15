


// import {
//   useState,
//   useEffect,
//   useCallback,
// } from "react";

// import { apiRequest } from "../../api";

// /*
// |--------------------------------------------------------------------------
// | SetGeneratorPanel
// |--------------------------------------------------------------------------
// | Recruiter panel for:
// |
// | 1. Selecting an assessment
// | 2. Selecting number of sets
// | 3. Selecting questions per type
// | 4. Checking question-bank availability
// | 5. Generating assessment sets
// | 6. Handling insufficient-question errors
// | 7. Allowing controlled reuse
// | 8. Displaying generated sets
// |--------------------------------------------------------------------------
// */

// export default function SetGeneratorPanel({
//   jobId,
//   jobTitle,
//   requiredSkills,
//   open,
//   onClose,
// }) {
//   /*
//   |--------------------------------------------------------------------------
//   | ASSESSMENTS
//   |--------------------------------------------------------------------------
//   */

//   const [assessments, setAssessments] =
//     useState(null);

//   const [
//     selectedAssessmentId,
//     setSelectedAssessmentId,
//   ] = useState("");

//   /*
//   |--------------------------------------------------------------------------
//   | SET CONFIGURATION
//   |--------------------------------------------------------------------------
//   */

//   const [numSets, setNumSets] = useState(10);

//   const [mcqCount, setMcqCount] = useState(1);

//   const [fbCount, setFbCount] = useState(1);

//   const [codingCount, setCodingCount] =
//     useState(1);

//   /*
//   |--------------------------------------------------------------------------
//   | AVAILABILITY
//   |--------------------------------------------------------------------------
//   */

//   const [availability, setAvailability] =
//     useState(null);

//   const [checking, setChecking] =
//     useState(false);

//   /*
//   |--------------------------------------------------------------------------
//   | GENERATION
//   |--------------------------------------------------------------------------
//   */

//   const [generating, setGenerating] =
//     useState(false);

//   const [
//     insufficientError,
//     setInsufficientError,
//   ] = useState(null);

//   /*
//   |--------------------------------------------------------------------------
//   | EXISTING SETS
//   |--------------------------------------------------------------------------
//   */

//   const [sets, setSets] = useState(null);

//   /*
//   |--------------------------------------------------------------------------
//   | UI MESSAGES
//   |--------------------------------------------------------------------------
//   */

//   const [error, setError] = useState("");

//   const [success, setSuccess] = useState("");

//   /*
//   |--------------------------------------------------------------------------
//   | LOAD ASSESSMENTS
//   |--------------------------------------------------------------------------
//   */

//   const loadAssessments = useCallback(
//     async () => {
//       if (!jobId) {
//         setAssessments([]);
//         setSelectedAssessmentId("");
//         return;
//       }

//       try {
//         setError("");
//         setAssessments(null);

//         console.log(
//           "[SetGenerator] Loading assessments for job:",
//           jobId
//         );

//         const data = await apiRequest(
//           `/assessments/job/${jobId}`
//         );

//         const list = Array.isArray(data)
//           ? data
//           : [];

//         console.log(
//           "[SetGenerator] Assessments:",
//           list
//         );

//         setAssessments(list);

//         setSelectedAssessmentId(
//           (previous) => {
//             if (previous) {
//               const exists = list.some(
//                 (assessment) =>
//                   String(assessment.id) ===
//                   String(previous)
//               );

//               if (exists) {
//                 return previous;
//               }
//             }

//             return list.length > 0
//               ? String(list[0].id)
//               : "";
//           }
//         );
//       } catch (e) {
//         console.error(
//           "[SetGenerator] Failed to load assessments:",
//           e
//         );

//         setAssessments([]);

//         setSelectedAssessmentId("");

//         setError(
//           e?.message ||
//             "Could not load assessments."
//         );
//       }
//     },
//     [jobId]
//   );

//   /*
//   |--------------------------------------------------------------------------
//   | LOAD EXISTING SETS
//   |--------------------------------------------------------------------------
//   */

//   const loadSets = useCallback(
//     async () => {
//       if (!selectedAssessmentId) {
//         setSets(null);
//         return;
//       }

//       try {
//         setSets(null);

//         console.log(
//           "[SetGenerator] Loading sets:",
//           selectedAssessmentId
//         );

//         const data = await apiRequest(
//           `/assessments/${selectedAssessmentId}/sets`
//         );

//         const list = Array.isArray(data)
//           ? data
//           : [];

//         console.log(
//           "[SetGenerator] Existing sets:",
//           list
//         );

//         setSets(list);
//       } catch (e) {
//         console.error(
//           "[SetGenerator] Failed to load generated sets:",
//           e
//         );

//         /*
//          * Don't hide the error completely.
//          */
//         setSets([]);

//         setError(
//           e?.message ||
//             "Could not load generated sets."
//         );
//       }
//     },
//     [selectedAssessmentId]
//   );

//   /*
//   |--------------------------------------------------------------------------
//   | OPEN PANEL
//   |--------------------------------------------------------------------------
//   */

//   useEffect(() => {
//     if (!open) {
//       return;
//     }

//     setError("");
//     setSuccess("");
//     setAvailability(null);
//     setInsufficientError(null);

//     loadAssessments();
//   }, [
//     open,
//     loadAssessments,
//   ]);

//   /*
//   |--------------------------------------------------------------------------
//   | LOAD SETS WHEN ASSESSMENT CHANGES
//   |--------------------------------------------------------------------------
//   */

//   useEffect(() => {
//     if (!open) {
//       return;
//     }

//     loadSets();
//   }, [
//     open,
//     loadSets,
//   ]);

//   /*
//   |--------------------------------------------------------------------------
//   | CURRENT REQUEST BODY
//   |--------------------------------------------------------------------------
//   */

//   function currentBody() {
//     return {
//       job_id: Number(jobId),

//       required_skills:
//         Array.isArray(requiredSkills)
//           ? requiredSkills
//           : [],

//       num_sets:
//         Number(numSets) || 0,

//       mcq_count:
//         Number(mcqCount) || 0,

//       fill_blank_count:
//         Number(fbCount) || 0,

//       coding_count:
//         Number(codingCount) || 0,
//     };
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | VALIDATE FORM
//   |--------------------------------------------------------------------------
//   */

//   function validateConfiguration() {
//     const setsValue =
//       Number(numSets);

//     const mcqValue =
//       Number(mcqCount);

//     const fillBlankValue =
//       Number(fbCount);

//     const codingValue =
//       Number(codingCount);

//     if (!selectedAssessmentId) {
//       return "Please select an assessment.";
//     }

//     if (
//       !Number.isInteger(setsValue) ||
//       setsValue < 1 ||
//       setsValue > 50
//     ) {
//       return (
//         "Number of sets must be between 1 and 50."
//       );
//     }

//     if (
//       !Number.isInteger(mcqValue) ||
//       !Number.isInteger(fillBlankValue) ||
//       !Number.isInteger(codingValue)
//     ) {
//       return (
//         "Question counts must be whole numbers."
//       );
//     }

//     if (
//       mcqValue < 0 ||
//       fillBlankValue < 0 ||
//       codingValue < 0
//     ) {
//       return (
//         "Question counts cannot be negative."
//       );
//     }

//     const totalPerSet =
//       mcqValue +
//       fillBlankValue +
//       codingValue;

//     if (totalPerSet <= 0) {
//       return (
//         "At least one question type must be greater than 0."
//       );
//     }

//     return "";
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | CHECK AVAILABILITY
//   |--------------------------------------------------------------------------
//   */

//   async function checkAvailability() {
//     const validationError =
//       validateConfiguration();

//     if (validationError) {
//       setError(validationError);
//       return;
//     }

//     setError("");
//     setSuccess("");
//     setInsufficientError(null);
//     setChecking(true);

//     try {
//       const body = currentBody();

//       const endpoint =
//         `/assessments/${selectedAssessmentId}/sets/check-availability`;

//       console.log(
//         "[SetGenerator] Checking availability"
//       );

//       console.log(
//         "[SetGenerator] Endpoint:",
//         endpoint
//       );

//       console.log(
//         "[SetGenerator] Payload:",
//         body
//       );

//       const data =
//         await apiRequest(
//           endpoint,
//           {
//             method: "POST",
//             body,
//           }
//         );

//       console.log(
//         "[SetGenerator] Availability response:",
//         data
//       );

//       setAvailability(data);

//       setSuccess(
//         "Question availability checked successfully."
//       );
//     } catch (e) {
//       console.error(
//         "[SetGenerator] Availability check failed:",
//         e
//       );

//       setAvailability(null);

//       setError(
//         e?.message ||
//           "Could not check question availability."
//       );
//     } finally {
//       setChecking(false);
//     }
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | GENERATE SETS
//   |--------------------------------------------------------------------------
//   */

//   async function generateSets(
//     allowControlledReuse = false
//   ) {
//     const validationError =
//       validateConfiguration();

//     if (validationError) {
//       setError(validationError);
//       return;
//     }

//     setError("");
//     setSuccess("");
//     setInsufficientError(null);
//     setGenerating(true);

//     try {
//       const body = {
//         ...currentBody(),

//         allow_controlled_reuse:
//           Boolean(
//             allowControlledReuse
//           ),
//       };

//       const endpoint =
//         `/assessments/${selectedAssessmentId}/sets/generate`;

//       console.log(
//         "================================================"
//       );

//       console.log(
//         "[SetGenerator] GENERATING SETS"
//       );

//       console.log(
//         "[SetGenerator] Endpoint:",
//         endpoint
//       );

//       console.log(
//         "[SetGenerator] Payload:",
//         body
//       );

//       console.log(
//         "[SetGenerator] API_BASE should be:",
//         "http://localhost:8000/api"
//       );

//       console.log(
//         "================================================"
//       );

//       /*
//        * IMPORTANT:
//        *
//        * Do NOT use:
//        *
//        * /api/assessments/...
//        *
//        * here because API_BASE already contains /api.
//        *
//        * apiRequest() creates:
//        *
//        * http://localhost:8000/api/assessments/...
//        */

//       const data =
//         await apiRequest(
//           endpoint,
//           {
//             method: "POST",
//             body,
//           }
//         );

//       console.log(
//         "[SetGenerator] Generation response:",
//         data
//       );

//       /*
//       |--------------------------------------------------------------------------
//       | SUCCESS
//       |--------------------------------------------------------------------------
//       */

//       const createdSets =
//         Array.isArray(data?.sets)
//           ? data.sets
//           : [];

//       const setsCreated =
//         data?.sets_created ??
//         createdSets.length;

//       setSuccess(
//         `Successfully generated ${setsCreated} assessment set${
//           setsCreated === 1
//             ? ""
//             : "s"
//         }.`
//       );

//       setAvailability(null);

//       setInsufficientError(null);

//       /*
//        * Refresh generated sets.
//        */
//       await loadSets();

//       /*
//        * Also reload assessments so any
//        * updated assessment information
//        * appears immediately.
//        */
//       await loadAssessments();
//     } catch (e) {
//       console.error(
//         "================================================"
//       );

//       console.error(
//         "[SetGenerator] GENERATION FAILED"
//       );

//       console.error(
//         "[SetGenerator] Error:",
//         e
//       );

//       console.error(
//         "[SetGenerator] Message:",
//         e?.message
//       );

//       console.error(
//         "[SetGenerator] Status:",
//         e?.status
//       );

//       console.error(
//         "[SetGenerator] Response:",
//         e?.response
//       );

//       console.error(
//         "[SetGenerator] URL:",
//         e?.url
//       );

//       console.error(
//         "================================================"
//       );

//       /*
//       |--------------------------------------------------------------------------
//       | INSUFFICIENT QUESTION ERROR
//       |--------------------------------------------------------------------------
//       */

//       if (
//         e?.status === 409
//       ) {
//         const detail =
//           e?.response?.detail ??
//           e?.message ??
//           e?.response;

//         setInsufficientError(
//           detail
//         );

//         return;
//       }

//       /*
//       |--------------------------------------------------------------------------
//       | OTHER BACKEND ERRORS
//       |--------------------------------------------------------------------------
//       */

//       let message =
//         e?.message ||
//         "Could not generate assessment sets.";

//       if (
//         e?.response?.detail
//       ) {
//         if (
//           typeof e.response.detail ===
//           "string"
//         ) {
//           message =
//             e.response.detail;
//         } else if (
//           typeof e.response.detail
//             ?.message === "string"
//         ) {
//           message =
//             e.response.detail.message;
//         }
//       }

//       setError(message);
//     } finally {
//       setGenerating(false);
//     }
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | HALF NUMBER OF SETS
//   |--------------------------------------------------------------------------
//   */

//   function halveSets() {
//     setNumSets(
//       (previous) => {
//         const current =
//           Number(previous) || 1;

//         return Math.max(
//           1,
//           Math.floor(
//             current / 2
//           )
//         );
//       }
//     );

//     setAvailability(null);
//     setInsufficientError(null);
//     setError("");
//     setSuccess("");
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | REDUCE QUESTIONS
//   |--------------------------------------------------------------------------
//   */

//   function reduceQuestions() {
//     setMcqCount(
//       (previous) =>
//         Math.max(
//           0,
//           Math.floor(
//             Number(previous) / 2
//           )
//         )
//     );

//     setFbCount(
//       (previous) =>
//         Math.max(
//           0,
//           Math.floor(
//             Number(previous) / 2
//           )
//         )
//     );

//     setCodingCount(
//       (previous) =>
//         Math.max(
//           0,
//           Math.floor(
//             Number(previous) / 2
//           )
//         )
//     );

//     setAvailability(null);
//     setInsufficientError(null);
//     setError("");
//     setSuccess("");
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | ASSESSMENT CHANGE
//   |--------------------------------------------------------------------------
//   */

//   function handleAssessmentChange(
//     event
//   ) {
//     const value =
//       event.target.value;

//     setSelectedAssessmentId(
//       value
//     );

//     setAvailability(null);
//     setInsufficientError(null);
//     setError("");
//     setSuccess("");
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | INPUT CHANGE HELPER
//   |--------------------------------------------------------------------------
//   */

//   function clearMessages() {
//     setAvailability(null);
//     setInsufficientError(null);
//     setError("");
//     setSuccess("");
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | TOTAL QUESTIONS
//   |--------------------------------------------------------------------------
//   */

//   const totalNeeded =
//     (Number(numSets) || 0) *
//     (
//       (Number(mcqCount) || 0) +
//       (Number(fbCount) || 0) +
//       (Number(codingCount) || 0)
//     );

//   /*
//   |--------------------------------------------------------------------------
//   | CLOSE
//   |--------------------------------------------------------------------------
//   */

//   function handleClose() {
//     setError("");
//     setSuccess("");
//     setAvailability(null);
//     setInsufficientError(null);

//     if (onClose) {
//       onClose();
//     }
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | DON'T RENDER
//   |--------------------------------------------------------------------------
//   */

//   if (!open) {
//     return null;
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | UI
//   |--------------------------------------------------------------------------
//   */

//   return (
//     <div
//       className="setgen-overlay"
//       role="dialog"
//       aria-modal="true"
//       aria-label="Generate Assessment Sets"
//     >
//       <style>{`
//         * {
//           box-sizing: border-box;
//         }

//         .setgen-overlay {
//           position: fixed;
//           inset: 0;
//           z-index: 99999;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           padding: 20px;
//           background: rgba(2, 5, 16, 0.86);
//           backdrop-filter: blur(10px);
//           overflow-y: auto;
//         }

//         .setgen-panel {
//           width: min(860px, 100%);
//           max-height: calc(100vh - 40px);
//           overflow-y: auto;
//           border: 1px solid rgba(139, 92, 246, 0.28);
//           border-radius: 24px;
//           background: linear-gradient(
//             145deg,
//             #0d1428,
//             #10182e
//           );
//           color: #e8ecf8;
//           box-shadow:
//             0 30px 90px
//             rgba(0, 0, 0, 0.60);
//           padding: 30px;
//         }

//         .setgen-panel::-webkit-scrollbar {
//           width: 7px;
//         }

//         .setgen-panel::-webkit-scrollbar-track {
//           background: rgba(
//             255,
//             255,
//             255,
//             0.02
//           );
//         }

//         .setgen-panel::-webkit-scrollbar-thumb {
//           background: rgba(
//             139,
//             92,
//             246,
//             0.35
//           );
//           border-radius: 20px;
//         }

//         .setgen-head {
//           display: flex;
//           justify-content: space-between;
//           align-items: flex-start;
//           gap: 18px;
//         }

//         .setgen-title {
//           margin: 0;
//           font-size: 28px;
//           font-weight: 800;
//           letter-spacing: -0.03em;
//         }

//         .setgen-sub {
//           margin: 7px 0 0;
//           color: #8190b0;
//           font-size: 14px;
//         }

//         .setgen-close {
//           width: 48px;
//           height: 48px;
//           flex: 0 0 48px;
//           border: 1px solid
//             rgba(255, 255, 255, 0.10);
//           border-radius: 14px;
//           background: #121b32;
//           color: #8d98b2;
//           font-size: 25px;
//           font-weight: 700;
//           cursor: pointer;
//           transition: 0.2s ease;
//           box-shadow:
//             0 10px 35px
//             rgba(80, 50, 180, 0.18);
//         }

//         .setgen-close:hover {
//           color: #ffffff;
//           border-color:
//             rgba(139, 92, 246, 0.55);
//           transform: translateY(-1px);
//         }

//         .setgen-section {
//           margin-top: 24px;
//         }

//         .setgen-label {
//           display: block;
//           font:
//             600 11px/1.2 monospace;
//           text-transform: uppercase;
//           letter-spacing: 0.07em;
//           color: #9aa5c0;
//           margin-bottom: 8px;
//         }

//         .setgen-section select,
//         .setgen-section
//           input[type="number"] {
//           width: 100%;
//           height: 46px;
//           background: #121b32;
//           border: 1px solid
//             rgba(255, 255, 255, 0.10);
//           color: #e8ecf8;
//           padding: 0 14px;
//           border-radius: 11px;
//           font-size: 14px;
//           outline: none;
//           transition: 0.2s ease;
//         }

//         .setgen-section select:focus,
//         .setgen-section
//           input[type="number"]:focus {
//           border-color:
//             rgba(139, 92, 246, 0.70);

//           box-shadow:
//             0 0 0 3px
//             rgba(139, 92, 246, 0.10);
//         }

//         .setgen-section select option {
//           background: #121b32;
//           color: #ffffff;
//         }

//         .setgen-grid {
//           display: grid;
//           grid-template-columns:
//             repeat(4, 1fr);
//           gap: 12px;
//         }

//         .setgen-total-input {
//           opacity: 0.85;
//           cursor: not-allowed;
//         }

//         .setgen-btn-row {
//           display: flex;
//           gap: 11px;
//           margin-top: 24px;
//           flex-wrap: wrap;
//         }

//         .setgen-btn {
//           min-height: 44px;
//           padding: 10px 17px;
//           border-radius: 11px;
//           font-size: 13px;
//           font-weight: 750;
//           cursor: pointer;
//           border: 1px solid
//             rgba(255, 255, 255, 0.10);
//           background: #121b32;
//           color: #cbd5e1;
//           transition: 0.2s ease;
//         }

//         .setgen-btn:hover:not(:disabled) {
//           border-color:
//             rgba(139, 92, 246, 0.55);
//           color: #ffffff;
//           transform: translateY(-1px);
//         }

//         .setgen-btn.primary {
//           background:
//             linear-gradient(
//               135deg,
//               #8b5cf6,
//               #f97316
//             );
//           border: none;
//           color: #ffffff;
//           box-shadow:
//             0 12px 30px
//             rgba(139, 92, 246, 0.22);
//         }

//         .setgen-btn.primary:hover:not(:disabled) {
//           box-shadow:
//             0 16px 36px
//             rgba(139, 92, 246, 0.30);
//         }

//         .setgen-btn:disabled {
//           opacity: 0.55;
//           cursor: not-allowed;
//         }

//         .setgen-success {
//           margin-top: 18px;
//           border:
//             1px solid
//             rgba(74, 222, 128, 0.30);
//           background:
//             rgba(74, 222, 128, 0.07);
//           color: #86efac;
//           padding: 13px 15px;
//           border-radius: 11px;
//           font-size: 13px;
//         }

//         .setgen-error {
//           margin-top: 18px;
//           border:
//             1px solid
//             rgba(239, 68, 68, 0.35);
//           background:
//             rgba(239, 68, 68, 0.08);
//           color: #fca5a5;
//           padding: 13px 15px;
//           border-radius: 11px;
//           font-size: 13px;
//           line-height: 1.5;
//           white-space: pre-wrap;
//           word-break: break-word;
//         }

//         .setgen-avail {
//           margin-top: 18px;
//           display: flex;
//           flex-direction: column;
//           gap: 9px;
//         }

//         .setgen-avail-title {
//           font-size: 12px;
//           font-weight: 700;
//           color: #aeb9d0;
//           text-transform: uppercase;
//           letter-spacing: 0.06em;
//           margin-bottom: 2px;
//         }

//         .setgen-avail-row {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           gap: 15px;
//           padding: 12px 14px;
//           border-radius: 10px;
//           border:
//             1px solid
//             rgba(255, 255, 255, 0.08);
//           background:
//             rgba(255, 255, 255, 0.025);
//           font-size: 12.5px;
//           font-family: monospace;
//         }

//         .setgen-avail-row.missing {
//           border-color:
//             rgba(245, 158, 11, 0.40);
//           background:
//             rgba(245, 158, 11, 0.06);
//           color: #fde68a;
//         }

//         .setgen-avail-row.ok {
//           border-color:
//             rgba(74, 222, 128, 0.30);
//           color: #86efac;
//         }

//         .setgen-insufficient {
//           margin-top: 18px;
//           border:
//             1px solid
//             rgba(245, 158, 11, 0.38);
//           background:
//             rgba(245, 158, 11, 0.075);
//           border-radius: 12px;
//           padding: 16px;
//           font-size: 13px;
//           color: #fde68a;
//           line-height: 1.6;
//           white-space: pre-wrap;
//         }

//         .setgen-insufficient strong {
//           color: #ffffff;
//         }

//         .setgen-insufficient-opts {
//           display: flex;
//           gap: 9px;
//           flex-wrap: wrap;
//           margin-top: 13px;
//         }

//         .setgen-sets-list {
//           margin-top: 12px;
//           display: flex;
//           flex-direction: column;
//           gap: 9px;
//         }

//         .setgen-set-row {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           gap: 15px;
//           padding: 13px 15px;
//           border-radius: 10px;
//           border:
//             1px solid
//             rgba(255, 255, 255, 0.07);
//           background:
//             rgba(255, 255, 255, 0.025);
//           font-size: 12.5px;
//           font-family: monospace;
//           color: #cbd5e1;
//         }

//         .setgen-set-number {
//           color: #c4b5fd;
//           font-weight: 700;
//         }

//         .setgen-empty {
//           text-align: center;
//           padding: 20px;
//           color: #77849f;
//           font-size: 13px;
//           line-height: 1.6;
//           border:
//             1px dashed
//             rgba(255, 255, 255, 0.08);
//           border-radius: 11px;
//           background:
//             rgba(255, 255, 255, 0.015);
//         }

//         @media (max-width: 720px) {
//           .setgen-overlay {
//             padding: 10px;
//           }

//           .setgen-panel {
//             padding: 22px;
//             border-radius: 18px;
//             max-height:
//               calc(100vh - 20px);
//           }

//           .setgen-title {
//             font-size: 23px;
//           }

//           .setgen-grid {
//             grid-template-columns:
//               repeat(2, 1fr);
//           }

//           .setgen-avail-row,
//           .setgen-set-row {
//             flex-direction: column;
//             align-items: flex-start;
//           }
//         }

//         @media (max-width: 430px) {
//           .setgen-grid {
//             grid-template-columns: 1fr;
//           }

//           .setgen-btn {
//             width: 100%;
//           }

//           .setgen-insufficient-opts {
//             flex-direction: column;
//           }
//         }
//       `}</style>

//       <div className="setgen-panel">

//         {/* HEADER */}

//         <div className="setgen-head">
//           <div>
//             <h2 className="setgen-title">
//               Generate Assessment Sets
//             </h2>

//             <p className="setgen-sub">
//               {jobTitle ||
//                 "Assessment"}
//             </p>
//           </div>

//           <button
//             className="setgen-close"
//             onClick={handleClose}
//             aria-label="Close"
//             type="button"
//           >
//             ×
//           </button>
//         </div>

//         {/* ASSESSMENT */}

//         <div className="setgen-section">
//           <label className="setgen-label">
//             Assessment
//           </label>

//           {assessments === null ? (
//             <div className="setgen-empty">
//               Loading assessments...
//             </div>
//           ) : assessments.length === 0 ? (
//             <div className="setgen-empty">
//               No assessment exists yet
//               for this job.
//               <br />
//               Create an assessment first
//               and then generate question
//               sets.
//             </div>
//           ) : (
//             <select
//               value={
//                 selectedAssessmentId
//               }
//               onChange={
//                 handleAssessmentChange
//               }
//             >
//               {assessments.map(
//                 (assessment) => (
//                   <option
//                     value={
//                       assessment.id
//                     }
//                     key={
//                       assessment.id
//                     }
//                   >
//                     {assessment.title ||
//                       "Untitled Assessment"}{" "}
//                     (
//                     {
//                       Array.isArray(
//                         assessment.questions
//                       )
//                         ? assessment
//                             .questions
//                             .length
//                         : 0
//                     }{" "}
//                     base questions)
//                   </option>
//                 )
//               )}
//             </select>
//           )}
//         </div>

//         {/* NUMBER OF SETS */}

//         <div className="setgen-section">
//           <label className="setgen-label">
//             Number of sets (1–50)
//           </label>

//           <input
//             type="number"
//             min="1"
//             max="50"
//             value={numSets}
//             onChange={(e) => {
//               setNumSets(
//                 e.target.value
//               );

//               clearMessages();
//             }}
//           />
//         </div>

//         {/* QUESTIONS PER SET */}

//         <div className="setgen-section">
//           <label className="setgen-label">
//             Questions per set
//           </label>

//           <div className="setgen-grid">

//             {/* MCQ */}

//             <div>
//               <label
//                 className="setgen-label"
//                 style={{
//                   marginBottom: 6,
//                 }}
//               >
//                 MCQ
//               </label>

//               <input
//                 type="number"
//                 min="0"
//                 value={mcqCount}
//                 onChange={(e) => {
//                   setMcqCount(
//                     e.target.value
//                   );

//                   clearMessages();
//                 }}
//               />
//             </div>

//             {/* FILL BLANK */}

//             <div>
//               <label
//                 className="setgen-label"
//                 style={{
//                   marginBottom: 6,
//                 }}
//               >
//                 Fill blank
//               </label>

//               <input
//                 type="number"
//                 min="0"
//                 value={fbCount}
//                 onChange={(e) => {
//                   setFbCount(
//                     e.target.value
//                   );

//                   clearMessages();
//                 }}
//               />
//             </div>

//             {/* CODING */}

//             <div>
//               <label
//                 className="setgen-label"
//                 style={{
//                   marginBottom: 6,
//                 }}
//               >
//                 Coding
//               </label>

//               <input
//                 type="number"
//                 min="0"
//                 value={codingCount}
//                 onChange={(e) => {
//                   setCodingCount(
//                     e.target.value
//                   );

//                   clearMessages();
//                 }}
//               />
//             </div>

//             {/* TOTAL */}

//             <div>
//               <label
//                 className="setgen-label"
//                 style={{
//                   marginBottom: 6,
//                 }}
//               >
//                 Total needed
//               </label>

//               <input
//                 className="setgen-total-input"
//                 type="number"
//                 value={totalNeeded}
//                 readOnly
//               />
//             </div>

//           </div>
//         </div>

//         {/* BUTTONS */}

//         <div className="setgen-btn-row">

//           <button
//             className="setgen-btn"
//             onClick={
//               checkAvailability
//             }
//             disabled={
//               checking ||
//               generating ||
//               !selectedAssessmentId
//             }
//             type="button"
//           >
//             {checking
//               ? "Checking..."
//               : "Check availability"}
//           </button>

//           <button
//             className="setgen-btn primary"
//             onClick={() =>
//               generateSets(false)
//             }
//             disabled={
//               generating ||
//               checking ||
//               !selectedAssessmentId
//             }
//             type="button"
//           >
//             {generating
//               ? "Generating..."
//               : "Generate sets"}
//           </button>

//         </div>

//         {/* SUCCESS */}

//         {success && (
//           <div className="setgen-success">
//             ✓ {success}
//           </div>
//         )}

//         {/* ERROR */}

//         {error && (
//           <div className="setgen-error">
//             {error}
//           </div>
//         )}

//         {/* AVAILABILITY */}

//         {availability && (
//           <div className="setgen-avail">

//             <div className="setgen-avail-title">
//               Question bank availability
//             </div>

//             {availability.detail &&
//             typeof availability.detail ===
//               "object" ? (
//               Object.entries(
//                 availability.detail
//               ).map(
//                 ([
//                   questionType,
//                   details,
//                 ]) => {
//                   const available =
//                     Number(
//                       details?.available_estimate
//                     ) || 0;

//                   const required =
//                     Number(
//                       details?.required
//                     ) || 0;

//                   const missing =
//                     Number(
//                       details?.missing_estimate
//                     ) || 0;

//                   return (
//                     <div
//                       className={
//                         `setgen-avail-row ${
//                           missing > 0
//                             ? "missing"
//                             : "ok"
//                         }`
//                       }
//                       key={
//                         questionType
//                       }
//                     >
//                       <span>
//                         {
//                           questionType
//                         }
//                       </span>

//                       <span>
//                         {available} /{" "}
//                         {required}{" "}
//                         available

//                         {missing > 0 &&
//                           ` — ${missing} will need generating`}
//                       </span>
//                     </div>
//                   );
//                 }
//               )
//             ) : (
//               <div className="setgen-empty">
//                 Availability
//                 information is
//                 unavailable.
//               </div>
//             )}

//           </div>
//         )}

//         {/* INSUFFICIENT QUESTION ERROR */}

//         {insufficientError && (
//           <div className="setgen-insufficient">

//             <div>

//               {typeof insufficientError ===
//                 "object" &&
//               insufficientError?.question_type ? (
//                 <>
//                   Not enough unique{" "}
//                   <strong>
//                     {
//                       insufficientError.question_type
//                     }
//                   </strong>{" "}
//                   questions.

//                   <br />

//                   Needed:{" "}
//                   <strong>
//                     {
//                       insufficientError.required
//                     }
//                   </strong>

//                   {" | "}

//                   Available:{" "}
//                   <strong>
//                     {
//                       insufficientError.available
//                     }
//                   </strong>

//                   {" | "}

//                   Short by:{" "}
//                   <strong>
//                     {
//                       insufficientError.missing
//                     }
//                   </strong>
//                 </>
//               ) : (
//                 <>
//                   <strong>
//                     Not enough questions
//                     available.
//                   </strong>

//                   <br />

//                   {typeof insufficientError ===
//                   "string"
//                     ? insufficientError
//                     : JSON.stringify(
//                         insufficientError
//                       )}
//                 </>
//               )}

//             </div>

//             <div className="setgen-insufficient-opts">

//               {/* CONTROLLED REUSE */}

//               {typeof insufficientError ===
//                 "object" &&
//               Array.isArray(
//                 insufficientError?.options
//               ) &&
//               insufficientError.options.includes(
//                 "Allow Controlled Reuse"
//               ) && (
//                 <button
//                   className="setgen-btn"
//                   onClick={() =>
//                     generateSets(true)
//                   }
//                   disabled={
//                     generating
//                   }
//                   type="button"
//                 >
//                   {generating
//                     ? "Generating..."
//                     : "Allow controlled reuse"}
//                 </button>
//               )}

//               {/* HALF SETS */}

//               <button
//                 className="setgen-btn"
//                 onClick={halveSets}
//                 disabled={
//                   generating
//                 }
//                 type="button"
//               >
//                 Halve number of sets
//               </button>

//               {/* REDUCE QUESTIONS */}

//               <button
//                 className="setgen-btn"
//                 onClick={
//                   reduceQuestions
//                 }
//                 disabled={
//                   generating
//                 }
//                 type="button"
//               >
//                 Reduce questions per set
//               </button>

//             </div>
//           </div>
//         )}

//         {/* EXISTING SETS */}

//         <div className="setgen-section">

//           <label className="setgen-label">
//             Existing sets
//           </label>

//           {sets === null ? (
//             <div className="setgen-empty">
//               Loading generated
//               sets...
//             </div>
//           ) : sets.length === 0 ? (
//             <div className="setgen-empty">
//               No sets generated yet
//               for this assessment.
//               <br />
//               Configure the questions
//               above and click{" "}
//               <strong>
//                 Generate sets
//               </strong>.
//             </div>
//           ) : (
//             <div className="setgen-sets-list">

//               {sets.map((set) => (
//                 <div
//                   className="setgen-set-row"
//                   key={set.id}
//                 >
//                   <span className="setgen-set-number">
//                     Set{" "}
//                     {set.set_number}
//                   </span>

//                   <span>
//                     {
//                       set.question_count
//                     }{" "}
//                     questions
//                     {" · "}
//                     {
//                       set.total_marks
//                     }{" "}
//                     marks
//                   </span>
//                 </div>
//               ))}

//             </div>
//           )}

//         </div>

//       </div>
//     </div>
//   );
// }








import {
  useState,
  useEffect,
  useCallback,
} from "react";

import { apiRequest } from "../../api";

export default function SetGeneratorPanel({
  jobId,
  jobTitle,
  requiredSkills,
  open,
  onClose,
}) {
  const [assessments, setAssessments] = useState(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [numSets, setNumSets] = useState(10);
  const [mcqCount, setMcqCount] = useState(1);
  const [fbCount, setFbCount] = useState(1);
  const [codingCount, setCodingCount] = useState(1);
  const [availability, setAvailability] = useState(null);
  const [checking, setChecking] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deletingSetId, setDeletingSetId] = useState(null);
  const [insufficientError, setInsufficientError] = useState(null);
  const [sets, setSets] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* State for viewing a specific set's questions */
  const [selectedSetModal, setSelectedSetModal] = useState(null);
  const [setQuestionsLoading, setSetQuestionsLoading] = useState(false);
  const [activeSetQuestions, setActiveSetQuestions] = useState([]);

  const loadAssessments = useCallback(async () => {
    if (!jobId) {
      setAssessments([]);
      setSelectedAssessmentId("");
      return;
    }

    try {
      setError("");
      setAssessments(null);

      const data = await apiRequest(`/assessments/job/${jobId}`);
      const list = Array.isArray(data) ? data : [];
      setAssessments(list);

      setSelectedAssessmentId((previous) => {
        if (previous) {
          const exists = list.some((assessment) => String(assessment.id) === String(previous));
          if (exists) return previous;
        }
        return list.length > 0 ? String(list[0].id) : "";
      });
    } catch (e) {
      setAssessments([]);
      setSelectedAssessmentId("");
      setError(e?.message || "Could not load assessments.");
    }
  }, [jobId]);

  const loadSets = useCallback(async () => {
    if (!selectedAssessmentId) {
      setSets(null);
      return;
    }

    try {
      setSets(null);
      const data = await apiRequest(`/assessments/${selectedAssessmentId}/sets`);
      const list = Array.isArray(data) ? data : [];
      setSets(list);
    } catch (e) {
      setSets([]);
      setError(e?.message || "Could not load generated sets.");
    }
  }, [selectedAssessmentId]);

  useEffect(() => {
    if (!open) return;
    setError("");
    setSuccess("");
    setAvailability(null);
    setInsufficientError(null);
    setSelectedSetModal(null);
    loadAssessments();
  }, [open, loadAssessments]);

  useEffect(() => {
    if (!open) return;
    loadSets();
  }, [open, loadSets]);

  function currentBody() {
    return {
      job_id: Number(jobId),
      required_skills: Array.isArray(requiredSkills) ? requiredSkills : [],
      num_sets: Number(numSets) || 0,
      mcq_count: Number(mcqCount) || 0,
      fill_blank_count: Number(fbCount) || 0,
      coding_count: Number(codingCount) || 0,
    };
  }

  function validateConfiguration() {
    const setsValue = Number(numSets);
    const mcqValue = Number(mcqCount);
    const fillBlankValue = Number(fbCount);
    const codingValue = Number(codingCount);

    if (!selectedAssessmentId) return "Please select an assessment.";
    if (!Number.isInteger(setsValue) || setsValue < 1 || setsValue > 50) return "Number of sets must be between 1 and 50.";
    if (!Number.isInteger(mcqValue) || !Number.isInteger(fillBlankValue) || !Number.isInteger(codingValue)) return "Question counts must be whole numbers.";
    if (mcqValue < 0 || fillBlankValue < 0 || codingValue < 0) return "Question counts cannot be negative.";
    if (mcqValue + fillBlankValue + codingValue <= 0) return "At least one question type must be greater than 0.";
    return "";
  }

  async function checkAvailability() {
    const validationError = validateConfiguration();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSuccess("");
    setInsufficientError(null);
    setChecking(true);

    try {
      const body = currentBody();
      const endpoint = `/assessments/${selectedAssessmentId}/sets/check-availability`;
      const data = await apiRequest(endpoint, { method: "POST", body });
      setAvailability(data);
      setSuccess("Question availability checked successfully.");
    } catch (e) {
      setAvailability(null);
      setError(e?.message || "Could not check question availability.");
    } finally {
      setChecking(false);
    }
  }

  async function generateSets(allowControlledReuse = false) {
    const validationError = validateConfiguration();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSuccess("");
    setInsufficientError(null);
    setGenerating(true);

    try {
      const body = {
        ...currentBody(),
        allow_controlled_reuse: Boolean(allowControlledReuse),
      };

      const endpoint = `/assessments/${selectedAssessmentId}/sets/generate`;
      const data = await apiRequest(endpoint, { method: "POST", body });

      const createdSets = Array.isArray(data?.sets) ? data.sets : [];
      const setsCreated = data?.sets_created ?? createdSets.length;

      setSuccess(`Successfully generated ${setsCreated} assessment set${setsCreated === 1 ? "" : "s"}.`);
      setAvailability(null);
      setInsufficientError(null);

      await loadSets();
      await loadAssessments();
    } catch (e) {
      if (e?.status === 409) {
        const detail = e?.response?.detail ?? e?.message ?? e?.response;
        setInsufficientError(detail);
        return;
      }

      let message = e?.message || "Could not generate assessment sets.";
      if (e?.response?.detail) {
        if (typeof e.response.detail === "string") {
          message = e.response.detail;
        } else if (typeof e.response.detail?.message === "string") {
          message = e.response.detail.message;
        }
      }
      setError(message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleDeleteSet(e, setId, setName) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const confirmed = window.confirm(`Are you sure you want to delete ${setName || 'this assessment set'}?`);
    if (!confirmed) return;

    setDeletingSetId(setId);
    setError("");
    setSuccess("");

    try {
      await apiRequest(`/assessments/${selectedAssessmentId}/sets/${setId}`, {
        method: "DELETE",
      });

      setSets((prev) => (Array.isArray(prev) ? prev.filter((s) => s.id !== setId) : []));
      if (selectedSetModal?.id === setId) {
        setSelectedSetModal(null);
      }
      setSuccess(`${setName || 'Set'} deleted successfully.`);
      await loadSets();
    } catch (err) {
      setError(err?.message || "Failed to delete set.");
    } finally {
      setDeletingSetId(null);
    }
  }

  function halveSets() {
    setNumSets((previous) => Math.max(1, Math.floor((Number(previous) || 1) / 2)));
    setAvailability(null);
    setInsufficientError(null);
    setError("");
    setSuccess("");
  }

  function reduceQuestions() {
    setMcqCount((previous) => Math.max(0, Math.floor(Number(previous) / 2)));
    setFbCount((previous) => Math.max(0, Math.floor(Number(previous) / 2)));
    setCodingCount((previous) => Math.max(0, Math.floor(Number(previous) / 2)));
    setAvailability(null);
    setInsufficientError(null);
    setError("");
    setSuccess("");
  }

  function handleAssessmentChange(event) {
    setSelectedAssessmentId(event.target.value);
    setAvailability(null);
    setInsufficientError(null);
    setError("");
    setSuccess("");
  }

  function clearMessages() {
    setAvailability(null);
    setInsufficientError(null);
    setError("");
    setSuccess("");
  }

  /* Full Question Details Fetch & Resolving Embedded Data */
  async function handleOpenSetDetail(setObj) {
    setSelectedSetModal(setObj);
    setSetQuestionsLoading(true);

    try {
      const data = await apiRequest(`/assessments/${selectedAssessmentId}/sets/${setObj.id}`);
      let questionsList = Array.isArray(data?.questions) ? data.questions : Array.isArray(data) ? data : [];

      if (!questionsList.length && Array.isArray(setObj.questions)) {
        questionsList = setObj.questions;
      }

      const enrichedQuestions = questionsList.map((q) => {
        const payload = q.payload || {};
        let testCases = q.test_cases || payload.test_cases || q.visible_test_cases || payload.visible_test_cases || [];

        if (!testCases.length && (payload.visible_test_cases || payload.hidden_test_cases)) {
          testCases = [
            ...(payload.visible_test_cases || []).map((tc) => ({ ...tc, is_public: true })),
            ...(payload.hidden_test_cases || []).map((tc) => ({ ...tc, is_public: false })),
          ];
        }

        return {
          ...q,
          resolved_test_cases: testCases,
        };
      });

      setActiveSetQuestions(enrichedQuestions);
    } catch {
      const fallbackList = Array.isArray(setObj.questions) ? setObj.questions : [];
      setActiveSetQuestions(fallbackList);
    } finally {
      setSetQuestionsLoading(false);
    }
  }

  const totalNeeded =
    (Number(numSets) || 0) *
    ((Number(mcqCount) || 0) + (Number(fbCount) || 0) + (Number(codingCount) || 0));

  function handleClose() {
    setError("");
    setSuccess("");
    setAvailability(null);
    setInsufficientError(null);
    setSelectedSetModal(null);
    if (onClose) onClose();
  }

  function formatShortOption(title, questionsCount) {
    const cleanTitle = (title || "Untitled Assessment").trim();
    return `${cleanTitle} (${questionsCount} Qs)`;
  }

  if (!open) return null;

  return (
    <div className="sgp-overlay" role="dialog" aria-modal="true" aria-label="Generate Assessment Sets">
      <style>{`
        *, *::before, *::after {
          box-sizing: border-box;
        }

        .sgp-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(3, 6, 18, 0.88);
          backdrop-filter: blur(14px);
          animation: sgpFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          overflow-x: hidden;
        }

        @keyframes sgpFadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }

        .sgp-panel {
          width: 100%;
          max-width: 920px;
          max-height: calc(100vh - 32px);
          overflow-y: auto;
          overflow-x: hidden;
          border: 1.5px solid rgba(139, 92, 246, 0.45);
          border-radius: 28px;
          background: radial-gradient(circle at 50% 0%, rgba(32, 20, 78, 0.6) 0%, rgba(8, 11, 24, 0.98) 75%);
          color: #f8fafc;
          box-shadow: 0 35px 100px rgba(0, 0, 0, 0.9), inset 0 0 35px rgba(139, 92, 246, 0.06);
          padding: 28px 30px 30px;
          position: relative;
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-sizing: border-box;
        }

        .sgp-panel::-webkit-scrollbar { width: 6px; }
        .sgp-panel::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.35);
          border-radius: 10px;
        }

        /* Top Header */
        .sgp-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 22px;
          width: 100%;
        }

        .sgp-head-left {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
          flex: 1;
        }

        .sgp-brain-icon-box {
          width: 50px;
          height: 50px;
          border-radius: 15px;
          background: linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%);
          border: 1px solid rgba(196, 181, 253, 0.4);
          box-shadow: 0 0 25px rgba(124, 58, 237, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          flex-shrink: 0;
        }

        .sgp-title-group {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .sgp-title {
          margin: 0;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #ffffff;
          font-family: var(--font-display, sans-serif);
          line-height: 1.2;
        }

        .sgp-title-hl {
          background: linear-gradient(135deg, #c084fc, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sgp-job-name {
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
          margin-top: 3px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sgp-sub-caption {
          font-size: 11.5px;
          color: #94a3b8;
          margin-top: 2px;
          line-height: 1.4;
        }

        .sgp-head-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .sgp-ai-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(99, 102, 241, 0.15) 100%);
          border: 1px solid rgba(168, 85, 247, 0.45);
          color: #ffffff;
          white-space: nowrap;
        }

        .sgp-ai-spark {
          color: #c084fc;
          font-size: 14px;
        }

        .sgp-ai-badge-text {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
        }

        .sgp-ai-title {
          font-size: 11.5px;
          font-weight: 700;
          color: #ffffff;
        }

        .sgp-ai-sub {
          font-size: 9.5px;
          color: #94a3b8;
          font-family: var(--font-mono, monospace);
        }

        .sgp-close-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #11172a;
          color: #94a3b8;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .sgp-close-btn:hover {
          color: #ffffff;
          background: rgba(244, 63, 94, 0.25);
          border-color: rgba(244, 63, 94, 0.4);
          transform: translateY(-1px);
        }

        /* Glass Sections */
        .sgp-card-section {
          background: linear-gradient(135deg, rgba(14, 19, 40, 0.85) 0%, rgba(9, 12, 26, 0.95) 100%);
          border: 1.5px solid rgba(139, 92, 246, 0.28);
          border-radius: 18px;
          padding: 16px 20px;
          margin-bottom: 14px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
          overflow: hidden;
        }

        .sgp-section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .sgp-icon-chip {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: rgba(139, 92, 246, 0.18);
          border: 1px solid rgba(139, 92, 246, 0.4);
          color: #c084fc;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sgp-section-title-wrap {
          display: flex;
          flex-direction: column;
          min-width: 0;
          flex: 1;
        }

        .sgp-section-heading {
          font-size: 14px;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
        }

        .sgp-section-helper {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 1px;
        }

        .sgp-select-custom {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          height: 44px;
          background: rgba(10, 14, 30, 0.9);
          border: 1.5px solid rgba(139, 92, 246, 0.35);
          color: #f8fafc;
          padding: 0 14px;
          border-radius: 12px;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
          cursor: pointer;
          transition: all 0.2s ease;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sgp-select-custom option {
          background: #090e1e;
          color: #ffffff;
          font-size: 12.5px;
        }

        .sgp-select-custom:focus {
          border-color: #a855f7;
          box-shadow: 0 0 18px rgba(168, 85, 247, 0.3);
        }

        .sgp-counter-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 12px;
          box-sizing: border-box;
        }

        .sgp-stepper-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(10, 14, 30, 0.9);
          border: 1.5px solid rgba(139, 92, 246, 0.35);
          border-radius: 12px;
          padding: 4px 8px;
          flex-shrink: 0;
        }

        .sgp-step-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(139, 92, 246, 0.2);
          border: 1px solid rgba(139, 92, 246, 0.4);
          color: #ffffff;
          font-size: 16px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sgp-step-btn:hover {
          background: rgba(168, 85, 247, 0.4);
          border-color: #c084fc;
        }

        .sgp-stepper-val {
          font-family: var(--font-mono, monospace);
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
          min-width: 28px;
          text-align: center;
        }

        /* Metrics Grid */
        .sgp-metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          width: 100%;
          box-sizing: border-box;
        }

        .sgp-metric-card {
          background: rgba(10, 14, 30, 0.85);
          border: 1.5px solid rgba(139, 92, 246, 0.25);
          border-radius: 14px;
          padding: 8px 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          min-width: 0;
          box-sizing: border-box;
          transition: border-color 0.2s ease;
        }

        .sgp-metric-card:hover {
          border-color: rgba(168, 85, 247, 0.5);
        }

        .sgp-metric-card.active-coding {
          border-color: rgba(168, 85, 247, 0.6);
        }

        .sgp-metric-left {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
          flex: 1;
        }

        .badge-mcq { background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.4); color: #60a5fa; }
        .badge-fill { background: rgba(45, 212, 191, 0.15); border: 1px solid rgba(45, 212, 191, 0.4); color: #2dd4bf; }
        .badge-code { background: rgba(168, 85, 247, 0.18); border: 1px solid rgba(168, 85, 247, 0.45); color: #c084fc; }
        .badge-total { background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; }

        .sgp-metric-badge {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .sgp-metric-name {
          font-size: 12px;
          font-weight: 700;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sgp-metric-input {
          width: 44px;
          min-width: 36px;
          height: 34px;
          background: #060914;
          border: 1px solid rgba(139, 92, 246, 0.35);
          border-radius: 8px;
          color: #ffffff;
          font-family: var(--font-mono, monospace);
          font-size: 13.5px;
          font-weight: 700;
          text-align: center;
          outline: none;
          padding: 0 2px;
          flex-shrink: 0;
          box-sizing: border-box;
          -moz-appearance: textfield;
        }

        .sgp-metric-input::-webkit-outer-spin-button,
        .sgp-metric-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .sgp-metric-input:focus {
          border-color: #a855f7;
        }

        .sgp-metric-input.total-box {
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(255, 255, 255, 0.1);
          color: #38bdf8;
        }

        /* Action Buttons */
        .sgp-actions-row {
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          gap: 12px;
          margin: 18px 0;
          width: 100%;
          box-sizing: border-box;
        }

        .sgp-btn-check {
          min-height: 52px;
          padding: 8px 16px;
          background: rgba(139, 92, 246, 0.12);
          border: 1.5px solid rgba(139, 92, 246, 0.4);
          border-radius: 14px;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
          width: 100%;
          box-sizing: border-box;
        }

        .sgp-btn-check:hover:not(:disabled) {
          background: rgba(139, 92, 246, 0.22);
          border-color: rgba(168, 85, 247, 0.7);
          transform: translateY(-1px);
        }

        .sgp-btn-check-title {
          font-size: 13.5px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          line-height: 1.2;
        }

        .sgp-btn-icon-svg {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          display: block;
        }

        .sgp-btn-check-sub {
          font-size: 10.5px;
          color: #94a3b8;
          margin-top: 3px;
          line-height: 1.2;
        }

        .sgp-btn-generate {
          min-height: 52px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #7c3aed 0%, #d946ef 50%, #f97316 100%);
          border: none;
          border-radius: 14px;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 22px rgba(168, 85, 247, 0.45);
          transition: all 0.2s ease;
          width: 100%;
          box-sizing: border-box;
        }

        .sgp-btn-generate:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(249, 115, 22, 0.55);
          filter: brightness(1.05);
        }

        .sgp-btn-generate:disabled,
        .sgp-btn-check:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .sgp-btn-gen-title {
          font-size: 14px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          line-height: 1.2;
        }

        .sgp-btn-gen-sub {
          font-size: 10.5px;
          color: rgba(255, 255, 255, 0.85);
          margin-top: 3px;
          line-height: 1.2;
        }

        /* Availability Breakdown Panel */
        .sgp-avail-panel {
          margin: 16px 0;
          border: 1.5px solid rgba(139, 92, 246, 0.35);
          border-radius: 16px;
          padding: 16px 18px;
          background: linear-gradient(135deg, rgba(20, 16, 42, 0.95) 0%, rgba(10, 12, 26, 0.98) 100%);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45);
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-sizing: border-box;
          animation: sgpFadeIn 0.2s ease;
        }

        .sgp-avail-title {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          font-weight: 700;
          color: #c084fc;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
        }

        .sgp-avail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.025);
          font-size: 12px;
          font-family: var(--font-mono, monospace);
        }

        .sgp-avail-row.ok {
          border-color: rgba(45, 212, 191, 0.35);
          color: #2dd4bf;
        }

        .sgp-avail-row.missing {
          border-color: rgba(245, 158, 11, 0.4);
          background: rgba(245, 158, 11, 0.06);
          color: #fde68a;
        }

        .sgp-insufficient-panel {
          margin: 16px 0;
          border: 1.5px solid rgba(245, 158, 11, 0.4);
          background: rgba(245, 158, 11, 0.08);
          border-radius: 16px;
          padding: 16px 18px;
          font-size: 12.5px;
          color: #fde68a;
          line-height: 1.5;
          box-sizing: border-box;
          animation: sgpFadeIn 0.2s ease;
        }

        .sgp-insufficient-opts {
          display: flex;
          gap: 8px;
          margin-top: 10px;
          flex-wrap: wrap;
        }

        .sgp-opt-btn {
          height: 34px;
          padding: 0 14px;
          border-radius: 10px;
          border: 1px solid rgba(245, 158, 11, 0.45);
          background: rgba(245, 158, 11, 0.15);
          color: #ffffff;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sgp-opt-btn:hover {
          background: rgba(245, 158, 11, 0.3);
          border-color: #fbbf24;
          transform: translateY(-1px);
        }

        /* Existing Sets List */
        .sgp-existing-container {
          background: linear-gradient(135deg, rgba(14, 19, 40, 0.85) 0%, rgba(9, 12, 26, 0.95) 100%);
          border: 1.5px solid rgba(139, 92, 246, 0.28);
          border-radius: 18px;
          padding: 18px 22px;
          width: 100%;
          box-sizing: border-box;
        }

        .sgp-existing-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .sgp-sets-count-badge {
          font-family: var(--font-mono, monospace);
          font-size: 11.5px;
          font-weight: 700;
          color: #c084fc;
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.35);
          padding: 4px 10px;
          border-radius: 8px;
        }

        .sgp-sets-list {
          display: flex;
          flex-direction: column;
          gap: 9px;
          max-height: 240px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .sgp-set-row-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 16px;
          border-radius: 12px;
          background: rgba(10, 14, 30, 0.85);
          border: 1px solid rgba(139, 92, 246, 0.22);
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .sgp-set-row-item:hover {
          border-color: rgba(168, 85, 247, 0.65);
          background: rgba(22, 16, 48, 0.95);
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.2);
        }

        .sgp-set-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .sgp-set-file-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: rgba(139, 92, 246, 0.18);
          color: #c084fc;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sgp-set-name-text {
          font-size: 13.5px;
          font-weight: 700;
          color: #ffffff;
          white-space: nowrap;
        }

        .sgp-set-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .sgp-set-meta-text {
          font-family: var(--font-mono, monospace);
          font-size: 12px;
          color: #94a3b8;
          white-space: nowrap;
        }

        .sgp-set-delete-btn {
          height: 30px;
          padding: 0 10px;
          border-radius: 8px;
          border: 1px solid rgba(244, 63, 94, 0.35);
          background: rgba(244, 63, 94, 0.1);
          color: #fda4af;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s ease;
        }

        .sgp-set-delete-btn:hover {
          background: rgba(244, 63, 94, 0.24);
          border-color: rgba(244, 63, 94, 0.7);
          color: #ffffff;
          transform: translateY(-1px);
        }

        .sgp-set-chevron {
          color: #a78bfa;
          font-size: 14px;
          font-weight: 800;
          transition: transform 0.2s ease;
        }

        .sgp-set-row-item:hover .sgp-set-chevron {
          transform: translateX(3px);
          color: #ffffff;
        }

        /* Detail Modal */
        .sgp-detail-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 100050;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(3, 5, 14, 0.88);
          backdrop-filter: blur(14px);
          animation: sgpFadeIn 0.2s ease-out;
        }

        .sgp-detail-card {
          width: min(840px, 100%);
          max-height: calc(100vh - 48px);
          overflow-y: auto;
          background: linear-gradient(145deg, #0d1226 0%, #060914 100%);
          border: 1.5px solid rgba(139, 92, 246, 0.45);
          border-radius: 24px;
          box-shadow: 0 35px 100px rgba(0, 0, 0, 0.95), inset 0 0 30px rgba(139, 92, 246, 0.06);
          padding: 26px 30px 30px;
          box-sizing: border-box;
          color: #f8fafc;
        }

        .sgp-detail-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 16px;
          margin-bottom: 18px;
          gap: 16px;
        }

        .sgp-detail-title {
          font-size: 21px;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .sgp-detail-sub {
          font-size: 12.5px;
          color: #94a3b8;
          font-family: var(--font-mono, monospace);
          margin-top: 4px;
        }

        .sgp-detail-chart-bar {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .sgp-chart-pill {
          background: rgba(10, 14, 30, 0.85);
          border: 1.5px solid rgba(139, 92, 246, 0.25);
          border-radius: 16px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .sgp-chart-label {
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 700;
        }

        .sgp-chart-val {
          font-size: 18px;
          font-weight: 800;
          color: #ffffff;
        }

        .sgp-q-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-height: 440px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .sgp-q-item-card {
          background: linear-gradient(135deg, rgba(14, 18, 38, 0.95) 0%, rgba(9, 12, 26, 0.98) 100%);
          border: 1.5px solid rgba(139, 92, 246, 0.28);
          border-radius: 16px;
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
        }

        .sgp-q-item-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .sgp-q-item-title {
          font-size: 15px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.35;
        }

        .sgp-q-type-badge {
          font-family: var(--font-mono, monospace);
          font-size: 10.5px;
          font-weight: 800;
          padding: 3px 10px;
          border-radius: 7px;
          text-transform: uppercase;
          flex-shrink: 0;
        }

        .sgp-q-type-badge.coding { background: rgba(139, 92, 246, 0.2); border: 1px solid rgba(139, 92, 246, 0.45); color: #c084fc; }
        .sgp-q-type-badge.mcq { background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.45); color: #60a5fa; }
        .sgp-q-type-badge.fill_blank { background: rgba(45, 212, 191, 0.2); border: 1px solid rgba(45, 212, 191, 0.45); color: #2dd4bf; }

        .sgp-q-statement {
          font-size: 13px;
          color: #e2e8f0;
          line-height: 1.55;
          background: rgba(0, 0, 0, 0.35);
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          white-space: pre-wrap;
          word-break: break-word;
        }

        .sgp-mcq-options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 4px;
        }

        .sgp-mcq-opt-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 12px;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 12px;
          color: #94a3b8;
        }

        .sgp-mcq-opt-item.is-correct {
          background: rgba(45, 212, 191, 0.12);
          border-color: rgba(45, 212, 191, 0.5);
          color: #2dd4bf;
          font-weight: 700;
        }

        .sgp-fb-answer-box {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #94a3b8;
          margin-top: 4px;
        }

        .sgp-fb-pill {
          padding: 3px 8px;
          border-radius: 6px;
          background: rgba(45, 212, 191, 0.15);
          border: 1px solid rgba(45, 212, 191, 0.4);
          color: #2dd4bf;
          font-family: var(--font-mono, monospace);
          font-weight: 700;
        }

        .sgp-coding-tc-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 4px;
        }

        .sgp-coding-tc-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.06);
          font-family: var(--font-mono, monospace);
          font-size: 11.5px;
        }

        .sgp-tc-left-badge {
          font-size: 9.5px;
          padding: 2px 6px;
          border-radius: 5px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .sgp-tc-left-badge.public {
          background: rgba(45, 212, 191, 0.15);
          color: #2dd4bf;
          border: 1px solid rgba(45, 212, 191, 0.35);
        }

        .sgp-tc-left-badge.private {
          background: rgba(139, 92, 246, 0.15);
          color: #c084fc;
          border: 1px solid rgba(139, 92, 246, 0.35);
        }

        .sgp-msg-box {
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 12.5px;
          margin-bottom: 12px;
        }
        .sgp-msg-success { background: rgba(45, 212, 191, 0.1); border: 1px solid rgba(45, 212, 191, 0.35); color: #2dd4bf; }
        .sgp-msg-error { background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.35); color: #fda4af; }

        @media (max-width: 680px) {
          .sgp-overlay { padding: 8px !important; }
          .sgp-panel { padding: 18px 14px 22px !important; border-radius: 20px !important; max-height: calc(100vh - 16px) !important; }
          .sgp-head { flex-direction: column !important; gap: 14px !important; }
          .sgp-head-left { width: 100% !important; align-items: flex-start !important; gap: 10px !important; }
          .sgp-head-right { width: 100% !important; justify-content: space-between !important; }
          .sgp-ai-badge { flex: 1 !important; padding: 6px 10px !important; }
          .sgp-card-section { padding: 14px 12px !important; }
          .sgp-counter-row { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .sgp-stepper-wrap { width: 100% !important; justify-content: space-between !important; }
          .sgp-metrics-grid { grid-template-columns: 1fr 1fr !important; gap: 6px !important; }
          .sgp-metric-card { padding: 6px 8px !important; gap: 4px !important; }
          .sgp-metric-name { font-size: 11px !important; }
          .sgp-metric-input { width: 36px !important; min-width: 34px !important; height: 30px !important; font-size: 12.5px !important; }
          .sgp-actions-row { grid-template-columns: 1fr !important; gap: 8px !important; }
          .sgp-existing-container { padding: 14px 12px !important; }
          .sgp-set-row-item { padding: 8px 10px !important; }
          .sgp-set-meta-text { font-size: 10.5px !important; }
          .sgp-detail-chart-bar { grid-template-columns: 1fr !important; }
          .sgp-mcq-options-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="sgp-panel">
        {/* Header */}
        <div className="sgp-head">
          <div className="sgp-head-left">
            <div className="sgp-brain-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z" />
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z" />
              </svg>
            </div>
            <div className="sgp-title-group">
              <h2 className="sgp-title">
                Generate <span className="sgp-title-hl">Assessment Sets</span>
              </h2>
              <div className="sgp-job-name">{jobTitle}</div>
              <div className="sgp-sub-caption">Create high-quality, role-specific assessment sets with AI-powered precision.</div>
            </div>
          </div>

          <div className="sgp-head-right">
            <div className="sgp-ai-badge">
              <span className="sgp-ai-spark">✦</span>
              <div className="sgp-ai-badge-text">
                <span className="sgp-ai-title">AI Powered</span>
                <span className="sgp-ai-sub">Smarter Assessments</span>
              </div>
            </div>

            <button className="sgp-close-btn" onClick={handleClose} type="button" aria-label="Close">
              ×
            </button>
          </div>
        </div>

        {success && <div className="sgp-msg-box sgp-msg-success">✓ {success}</div>}
        {error && <div className="sgp-msg-box sgp-msg-error">{error}</div>}

        {/* Section 1: Assessment Template */}
        <div className="sgp-card-section">
          <div className="sgp-section-header">
            <div className="sgp-icon-chip">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              </svg>
            </div>
            <div className="sgp-section-title-wrap">
              <h3 className="sgp-section-heading">Assessment</h3>
              <span className="sgp-section-helper">Choose the assessment template or role.</span>
            </div>
          </div>

          {assessments === null ? (
            <div style={{ color: '#94a3b8', fontSize: 13 }}>Loading assessments...</div>
          ) : assessments.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: 13 }}>No assessment exists yet for this job.</div>
          ) : (
            <select className="sgp-select-custom" value={selectedAssessmentId} onChange={handleAssessmentChange}>
              {assessments.map((a) => (
                <option value={a.id} key={a.id}>
                  {formatShortOption(a.title, Array.isArray(a.questions) ? a.questions.length : 2)}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Section 2: Number of Sets */}
        <div className="sgp-card-section">
          <div className="sgp-counter-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
              <div className="sgp-icon-chip">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <div className="sgp-section-title-wrap">
                <h3 className="sgp-section-heading">Number of Sets <span style={{ color: '#94a3b8', fontWeight: 500 }}>(1–50)</span></h3>
                <span className="sgp-section-helper">How many unique sets do you want to generate?</span>
              </div>
            </div>

            <div className="sgp-stepper-wrap">
              <button
                type="button"
                className="sgp-step-btn"
                onClick={() => {
                  setNumSets((p) => Math.max(1, (Number(p) || 1) - 1));
                  clearMessages();
                }}
              >
                -
              </button>
              <span className="sgp-stepper-val">{numSets}</span>
              <button
                type="button"
                className="sgp-step-btn"
                onClick={() => {
                  setNumSets((p) => Math.min(50, (Number(p) || 1) + 1));
                  clearMessages();
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Questions per Set */}
        <div className="sgp-card-section">
          <div className="sgp-section-header">
            <div className="sgp-icon-chip">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div className="sgp-section-title-wrap">
              <h3 className="sgp-section-heading">Questions per Set</h3>
              <span className="sgp-section-helper">Configure the breakdown for each set.</span>
            </div>
          </div>

          <div className="sgp-metrics-grid">
            {/* MCQ */}
            <div className="sgp-metric-card">
              <div className="sgp-metric-left">
                <span className="sgp-metric-badge badge-mcq">?</span>
                <span className="sgp-metric-name">MCQ</span>
              </div>
              <input
                type="number"
                min="0"
                className="sgp-metric-input"
                value={mcqCount}
                onChange={(e) => {
                  setMcqCount(e.target.value);
                  clearMessages();
                }}
              />
            </div>

            {/* Fill Blank */}
            <div className="sgp-metric-card">
              <div className="sgp-metric-left">
                <span className="sgp-metric-badge badge-fill">≡</span>
                <span className="sgp-metric-name">Fill Blank</span>
              </div>
              <input
                type="number"
                min="0"
                className="sgp-metric-input"
                value={fbCount}
                onChange={(e) => {
                  setFbCount(e.target.value);
                  clearMessages();
                }}
              />
            </div>

            {/* Coding */}
            <div className="sgp-metric-card active-coding">
              <div className="sgp-metric-left">
                <span className="sgp-metric-badge badge-code">&lt;/&gt;</span>
                <span className="sgp-metric-name">Coding</span>
              </div>
              <input
                type="number"
                min="0"
                className="sgp-metric-input"
                value={codingCount}
                onChange={(e) => {
                  setCodingCount(e.target.value);
                  clearMessages();
                }}
              />
            </div>

            {/* Total Needed */}
            <div className="sgp-metric-card">
              <div className="sgp-metric-left">
                <span className="sgp-metric-badge badge-total">⏱</span>
                <span className="sgp-metric-name">Total Needed</span>
              </div>
              <input
                type="number"
                className="sgp-metric-input total-box"
                value={totalNeeded}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sgp-actions-row">
          <button
            type="button"
            className="sgp-btn-check"
            onClick={checkAvailability}
            disabled={checking || generating || !selectedAssessmentId}
          >
            <div className="sgp-btn-check-title">
              <svg className="sgp-btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>Check Availability</span>
            </div>
            <span className="sgp-btn-check-sub">Verify if enough questions are available</span>
          </button>

          <button
            type="button"
            className="sgp-btn-generate"
            onClick={() => generateSets(false)}
            disabled={generating || checking || !selectedAssessmentId}
          >
            <div className="sgp-btn-gen-title">
              <svg className="sgp-btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"/>
              </svg>
              <span>Generate Sets →</span>
            </div>
            <span className="sgp-btn-gen-sub">Create your assessment sets</span>
          </button>
        </div>

        {/* Availability Breakdown Panel */}
        {availability && (
          <div className="sgp-avail-panel">
            <div className="sgp-avail-title">
              Question Bank Availability
            </div>
            {(() => {
              const breakdownData = availability.detail || availability;
              if (!breakdownData || typeof breakdownData !== "object") return null;

              return Object.entries(breakdownData)
                .filter(([k]) => !['status', 'message', 'success', 'detail'].includes(k))
                .map(([questionType, details]) => {
                  if (!details || typeof details !== "object") return null;
                  const available = Number(details?.available_estimate ?? details?.available ?? 0);
                  const required = Number(details?.required ?? 0);
                  const missing = Number(details?.missing_estimate ?? details?.missing ?? Math.max(0, required - available));

                  return (
                    <div className={`sgp-avail-row ${missing > 0 ? "missing" : "ok"}`} key={questionType}>
                      <span style={{ fontWeight: 700 }}>{questionType.toUpperCase()}</span>
                      <span>
                        {available} / {required} available {missing > 0 ? `(Short by ${missing})` : '(Ready)'}
                      </span>
                    </div>
                  );
                });
            })()}
            {availability.message && (
              <div style={{ fontSize: '12px', color: '#2dd4bf', marginTop: 4 }}>
                {availability.message}
              </div>
            )}
          </div>
        )}

        {/* Insufficient Error / Fallback Controls */}
        {insufficientError && (
          <div className="sgp-insufficient-panel">
            <div>
              <strong>Not enough unique questions available.</strong>
              <div style={{ marginTop: 4 }}>
                {typeof insufficientError === "string"
                  ? insufficientError
                  : insufficientError?.message || "Please choose one of the options below:"}
              </div>
            </div>

            <div className="sgp-insufficient-opts">
              {typeof insufficientError === "object" &&
                Array.isArray(insufficientError?.options) &&
                insufficientError.options.includes("Allow Controlled Reuse") && (
                  <button type="button" className="sgp-opt-btn" onClick={() => generateSets(true)} disabled={generating}>
                    Allow Controlled Reuse
                  </button>
                )}
              <button type="button" className="sgp-opt-btn" onClick={halveSets} disabled={generating}>
                Halve Number of Sets
              </button>
              <button type="button" className="sgp-opt-btn" onClick={reduceQuestions} disabled={generating}>
                Reduce Questions Per Set
              </button>
            </div>
          </div>
        )}

        {/* Section 4: Existing Sets with Delete Actions */}
        <div className="sgp-existing-container">
          <div className="sgp-existing-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="sgp-icon-chip" style={{ width: 30, height: 30 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: '#fff' }}>Existing Sets</h4>
                <div style={{ fontSize: 10.5, color: '#94a3b8' }}>Previously generated assessment sets (click to view details)</div>
              </div>
            </div>

            <span className="sgp-sets-count-badge">{sets?.length || 0} sets</span>
          </div>

          {sets === null ? (
            <div style={{ color: '#94a3b8', fontSize: 12, padding: '10px 0' }}>Loading sets...</div>
          ) : sets.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: 12, padding: '12px 0', textAlign: 'center' }}>
              No sets generated yet. Configure options above and click Generate Sets.
            </div>
          ) : (
            <div className="sgp-sets-list">
              {sets.map((set, idx) => {
                const setName = set.set_name || `Set ${set.set_number || idx + 1}`;
                return (
                  <div
                    className="sgp-set-row-item"
                    key={set.id || idx}
                    onClick={() => handleOpenSetDetail(set)}
                    title="Click to view full set breakdown and questions"
                  >
                    <div className="sgp-set-left">
                      <span className="sgp-set-file-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </span>
                      <span className="sgp-set-name-text">{setName}</span>
                    </div>

                    <div className="sgp-set-right">
                      <span className="sgp-set-meta-text">
                        {set.question_count || (Array.isArray(set.questions) ? set.questions.length : (Number(mcqCount) + Number(fbCount) + Number(codingCount)))} questions · {set.total_marks || 12} marks
                      </span>

                      {/* Delete Set Button */}
                      <button
                        type="button"
                        className="sgp-set-delete-btn"
                        onClick={(e) => handleDeleteSet(e, set.id, setName)}
                        disabled={deletingSetId === set.id}
                        title="Delete this generated set"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                        {deletingSetId === set.id ? "Deleting..." : "Delete"}
                      </button>

                      <span className="sgp-set-chevron">&gt;</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* DETAILED MODAL FOR CLICKED SET (RESOLVES REAL TITLE, QUESTION PROMPT & TEST CASES) */}
      {selectedSetModal && (
        <div className="sgp-detail-modal-overlay" onClick={() => setSelectedSetModal(null)}>
          <div className="sgp-detail-card" onClick={(e) => e.stopPropagation()}>
            <div className="sgp-detail-head">
              <div>
                <h3 className="sgp-detail-title">
                  {selectedSetModal.set_name || `Set ${selectedSetModal.set_number || 1}`} Breakdown
                </h3>
                <div className="sgp-detail-sub">
                  Assessment Set ID: {selectedSetModal.id} · {selectedSetModal.total_marks || 12} Total Marks
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  className="sgp-set-delete-btn"
                  style={{ height: '34px', padding: '0 14px' }}
                  onClick={(e) => handleDeleteSet(e, selectedSetModal.id, selectedSetModal.set_name)}
                  disabled={deletingSetId === selectedSetModal.id}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                  Delete Set
                </button>

                <button
                  className="sgp-close-btn"
                  onClick={() => setSelectedSetModal(null)}
                  type="button"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Set Stats Chart Bar */}
            <div className="sgp-detail-chart-bar">
              <div className="sgp-chart-pill">
                <span className="sgp-chart-label">Total Questions</span>
                <span className="sgp-chart-val" style={{ color: '#38bdf8' }}>
                  {activeSetQuestions.length || selectedSetModal.question_count || 3} Qs
                </span>
              </div>
              <div className="sgp-chart-pill">
                <span className="sgp-chart-label">Total Marks</span>
                <span className="sgp-chart-val" style={{ color: '#2dd4bf' }}>
                  {selectedSetModal.total_marks || 12} Marks
                </span>
              </div>
              <div className="sgp-chart-pill">
                <span className="sgp-chart-label">Set Index</span>
                <span className="sgp-chart-val" style={{ color: '#c084fc' }}>
                  Set #{selectedSetModal.set_number || 1}
                </span>
              </div>
            </div>

            {/* Question List Header */}
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontWeight: 700 }}>
              Included Questions ({activeSetQuestions.length})
            </div>

            {setQuestionsLoading ? (
              <div style={{ padding: '28px', textAlign: 'center', color: '#94a3b8' }}>
                Loading questions for {selectedSetModal.set_name || `Set ${selectedSetModal.set_number}`}...
              </div>
            ) : activeSetQuestions.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 14 }}>
                No question items found inside this generated set record.
              </div>
            ) : (
              <div className="sgp-q-list">
                {activeSetQuestions.map((q, qIdx) => {
                  const qType = q.question_type || q.type || 'coding';
                  const payload = q.payload || {};
                  
                  // Question Title Resolution
                  const displayTitle = 
                    q.title || 
                    payload.title || 
                    q.question || 
                    payload.question || 
                    q.question_text || 
                    payload.question_text || 
                    `Question #${qIdx + 1}`;

                  // Actual Question Statement Prompt Resolution
                  const displayStatement = 
                    q.problem_statement || 
                    payload.problem_statement || 
                    q.question_text || 
                    payload.question_text || 
                    q.question || 
                    payload.question || 
                    "";

                  // MCQ Options Resolution
                  const options = q.options || payload.options || [];
                  const correctAnswer = q.correct_answer || payload.correct_answer || '';
                  const correctOptionIndex = q.correct_option ?? payload.correct_option;

                  // Fill in the Blank Resolution
                  const expectedAnswer = q.expected_answer || payload.expected_answer || '';
                  const acceptedAnswers = q.accepted_answers || payload.accepted_answers || [];

                  // Coding Test Cases Resolution
                  const testCases = q.resolved_test_cases || q.test_cases || payload.test_cases || [];

                  return (
                    <div className="sgp-q-item-card" key={q.id || qIdx}>
                      <div className="sgp-q-item-top">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#818cf8', fontWeight: 800 }}>
                            #{qIdx + 1}
                          </span>
                          <span className="sgp-q-item-title">{displayTitle}</span>
                        </div>
                        <span className={`sgp-q-type-badge ${qType}`}>{qType.replace('_', ' ')}</span>
                      </div>

                      {/* Actual Question Prompt Statement */}
                      {displayStatement && displayStatement !== displayTitle && (
                        <div className="sgp-q-statement">
                          {displayStatement}
                        </div>
                      )}

                      {/* MCQ Options Breakdown */}
                      {qType === 'mcq' && Array.isArray(options) && options.length > 0 && (
                        <div>
                          <div style={{ fontSize: '10.5px', color: '#94a3b8', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', margin: '4px 0 6px', fontWeight: 700 }}>
                            Options & Correct Answer
                          </div>
                          <div className="sgp-mcq-options-grid">
                            {options.map((opt, oIdx) => {
                              const isCorrect = 
                                opt === correctAnswer || 
                                (correctOptionIndex !== undefined && String(oIdx) === String(correctOptionIndex));

                              return (
                                <div key={oIdx} className={`sgp-mcq-opt-item ${isCorrect ? 'is-correct' : ''}`}>
                                  <span>{isCorrect ? '✓' : '•'}</span>
                                  <span>{opt}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Fill in the Blank Expected */}
                      {qType === 'fill_blank' && (expectedAnswer || acceptedAnswers.length > 0) && (
                        <div>
                          <div style={{ fontSize: '10.5px', color: '#94a3b8', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', margin: '4px 0 6px', fontWeight: 700 }}>
                            Expected Answer
                          </div>
                          <div className="sgp-fb-answer-box">
                            <span className="sgp-fb-pill">Target: {expectedAnswer || acceptedAnswers[0]}</span>
                            {acceptedAnswers.length > 1 && (
                              <span style={{ color: '#64748b', fontSize: '11px' }}>
                                (Also accepts: {acceptedAnswers.filter(a => a !== expectedAnswer).join(', ')})
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Coding Question Breakdown & Test Cases */}
                      {qType === 'coding' && (
                        <div>
                          {(q.input_format || payload.input_format || q.output_format || payload.output_format) && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '6px 0' }}>
                              <div style={{ fontSize: '11px', color: '#94a3b8', background: 'rgba(0,0,0,0.2)', padding: '6px 8px', borderRadius: '6px' }}>
                                <strong style={{ color: '#c084fc' }}>Input:</strong> {q.input_format || payload.input_format || 'N/A'}
                              </div>
                              <div style={{ fontSize: '11px', color: '#94a3b8', background: 'rgba(0,0,0,0.2)', padding: '6px 8px', borderRadius: '6px' }}>
                                <strong style={{ color: '#2dd4bf' }}>Output:</strong> {q.output_format || payload.output_format || 'N/A'}
                              </div>
                            </div>
                          )}

                          {Array.isArray(testCases) && testCases.length > 0 ? (
                            <div>
                              <div style={{ fontSize: '10.5px', color: '#94a3b8', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', margin: '6px 0 4px', fontWeight: 700 }}>
                                Test Cases ({testCases.length})
                              </div>
                              <div className="sgp-coding-tc-list">
                                {testCases.map((tc, tcIdx) => (
                                  <div key={tc.id || tcIdx} className="sgp-coding-tc-row">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                      <span className={`sgp-tc-left-badge ${tc.is_public || !tc.is_hidden ? 'public' : 'private'}`}>
                                        {tc.is_public || !tc.is_hidden ? 'Public' : 'Hidden'}
                                      </span>
                                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        in: <strong style={{ color: '#fff' }}>{tc.input}</strong>
                                      </span>
                                    </div>
                                    <div style={{ whiteSpace: 'nowrap', paddingLeft: '8px' }}>
                                      out: <strong style={{ color: '#2dd4bf' }}>{tc.expected_output || tc.expected}</strong>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: '11.5px', color: '#64748b', fontStyle: 'italic', marginTop: 4 }}>
                              No test cases configured for this problem.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Meta Tags */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 5, background: 'rgba(255,255,255,0.04)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.06)' }}>
                          {q.marks || payload.marks || 3} Marks
                        </span>
                        {(q.difficulty || payload.difficulty) && (
                          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 5, background: 'rgba(139,92,246,0.15)', color: '#c084fc', border: '1px solid rgba(139,92,246,0.3)' }}>
                            {(q.difficulty || payload.difficulty).toUpperCase()}
                          </span>
                        )}
                        {(q.topic || payload.topic) && (
                          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 5, background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.06)' }}>
                            {q.topic || payload.topic}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}