

// export const API_BASE = "http://localhost:8000/api";
// export function getToken() {
//   return localStorage.getItem("hiremind_token");
// }
// export function setToken(token) {
//   localStorage.setItem("hiremind_token", token);
// }
// export function clearAuth() {
//   localStorage.removeItem("hiremind_token");
//   localStorage.removeItem("hiremind_user");
// }
// export function getUser() {
//   const raw = localStorage.getItem("hiremind_user");
//   return raw ? JSON.parse(raw) : null;
// }
// export function setUser(user) {
//   localStorage.setItem("hiremind_user", JSON.stringify(user));
// }
// export async function apiRequest(path, { method = "GET", body = null, isForm = false } = {}) {
//   const headers = {};
//   const token = getToken();
//   if (token) headers["Authorization"] = `Bearer ${token}`;
//   if (!isForm && body) headers["Content-Type"] = "application/json";
//   const res = await fetch(`${API_BASE}${path}`, {
//     method,
//     headers,
//     body: isForm ? body : body ? JSON.stringify(body) : undefined,
//   });
//   if (!res.ok) {
//     let detail = "Request failed";
//     try {
//       const errJson = await res.json();
//       detail = errJson.detail || detail;
//     } catch (_) {
//       /* ignore */
//     }
//     throw new Error(detail);
//   }
//   if (res.status === 204) return null;
//   return res.json();
// }
// export function homeRouteForRole(role) {
//   if (role === "recruiter") return "/recruiter";
//   if (role === "admin") return "/admin";
//   return "/candidate";
// }
// // Builds a viewable URL for a file saved under the backend's /uploads
// // static mount (see main.py) -- e.g. a candidate's marksheet or
// // certificate. API_BASE ends in "/api"; the uploads mount is one level up
// // from that, at the host root, so this strips the trailing "/api" rather
// // than assuming a fixed prefix.
// export function fileUrl(filename) {
//   if (!filename) return "";
//   return `${API_BASE.replace(/\/api\/?$/, "")}/uploads/${filename}`;
// }













// // export const API_BASE = "http://localhost:8000/api";
// // const API_BASE = "https://hiremind-ai-xzup.onrender.com/api";

// // export function getToken() {
// //   return localStorage.getItem("hiremind_token");
// // }


// // export const API_BASE = "http://localhost:8000/api";

// const API_BASE = "https://hiremind-ai-xzup.onrender.com/api";

// export function getToken() {
//   return localStorage.getItem("hiremind_token");
// }

// export function setToken(token) {
//   localStorage.setItem("hiremind_token", token);
// }

// export function clearAuth() {
//   localStorage.removeItem("hiremind_token");
//   localStorage.removeItem("hiremind_user");
// }

// export function getUser() {
//   const raw = localStorage.getItem("hiremind_user");
//   return raw ? JSON.parse(raw) : null;
// }

// export function setUser(user) {
//   localStorage.setItem(
//     "hiremind_user",
//     JSON.stringify(user)
//   );
// }

// export async function apiRequest(
//   path,
//   {
//     method = "GET",
//     body = null,
//     isForm = false,
//   } = {}
// ) {
//   /*
//    * API_BASE already contains /api:
//    *
//    * http://localhost:8000/api
//    *
//    * Therefore callers should pass:
//    *
//    * /assessments/1/sets/generate
//    *
//    * and NOT:
//    *
//    * /api/assessments/1/sets/generate
//    */

//   let cleanPath = String(path || "");

//   if (!cleanPath.startsWith("/")) {
//     cleanPath = `/${cleanPath}`;
//   }

//   /*
//    * Protect against accidental /api/api/... URLs.
//    */
//   if (
//     API_BASE.toLowerCase().endsWith("/api") &&
//     cleanPath.toLowerCase().startsWith("/api/")
//   ) {
//     cleanPath = cleanPath.substring(4);
//   }

//   const url = `${API_BASE}${cleanPath}`;

//   console.log("[API] Request:", {
//     method,
//     url,
//   });

//   const headers = {};

//   const token = getToken();

//   if (token) {
//     headers["Authorization"] = `Bearer ${token}`;
//   }

//   if (!isForm && body !== null) {
//     headers["Content-Type"] = "application/json";
//   }

//   let res;

//   try {
//     res = await fetch(url, {
//       method,
//       headers,
//       body: isForm
//         ? body
//         : body !== null
//         ? JSON.stringify(body)
//         : undefined,
//     });
//   } catch (networkError) {
//     console.error(
//       "[API] Network/Fetch error:",
//       networkError
//     );

//     throw new Error(
//       `Failed to connect to backend at ${url}. ` +
//         `Make sure FastAPI is running on http://localhost:8000.`
//     );
//   }

//   const contentType =
//     res.headers.get("content-type") || "";

//   let responseData = null;

//   if (res.status !== 204) {
//     try {
//       if (
//         contentType
//           .toLowerCase()
//           .includes("application/json")
//       ) {
//         responseData = await res.json();
//       } else {
//         const text = await res.text();

//         responseData = text || null;
//       }
//     } catch (parseError) {
//       console.error(
//         "[API] Response parsing error:",
//         parseError
//       );

//       responseData = null;
//     }
//   }

//   console.log("[API] Response:", {
//     status: res.status,
//     ok: res.ok,
//     url,
//     data: responseData,
//   });

//   if (!res.ok) {
//     let detail = "Request failed";

//     if (
//       responseData &&
//       typeof responseData === "object"
//     ) {
//       if (
//         typeof responseData.detail === "string"
//       ) {
//         detail = responseData.detail;
//       } else if (
//         responseData.detail &&
//         typeof responseData.detail === "object"
//       ) {
//         detail =
//           responseData.detail.message ||
//           JSON.stringify(responseData.detail);
//       } else if (
//         typeof responseData.message === "string"
//       ) {
//         detail = responseData.message;
//       }
//     } else if (
//       typeof responseData === "string" &&
//       responseData.trim()
//     ) {
//       detail = responseData;
//     }

//     const error = new Error(detail);

//     /*
//      * Keep backend information available to callers.
//      */
//     error.status = res.status;
//     error.response = responseData;
//     error.url = url;

//     throw error;
//   }

//   if (res.status === 204) {
//     return null;
//   }

//   return responseData;
// }

// export function homeRouteForRole(role) {
//   if (role === "recruiter") {
//     return "/recruiter";
//   }

//   if (role === "admin") {
//     return "/admin";
//   }

//   return "/candidate";
// }

// /*
//  * Builds a viewable URL for a file saved under the backend's
//  * /uploads static mount.
//  *
//  * API_BASE:
//  *
//  * http://localhost:8000/api
//  *
//  * Uploads:
//  *
//  * http://localhost:8000/uploads/filename
//  */
// // export function fileUrl(filename) {
// //   if (!filename) {
// //     return "";
// //   }

// //   const base = API_BASE.replace(
// //     /\/api\/?$/,
// //     ""
// //   );

// //   return `${base}/uploads/${filename}`;
// // }





// export function fileUrl(filename) {
//   if (!filename) {
//     return "";
//   }

//   const base = API_BASE.replace(/\/api\/?$/, "");

//   return `${base}/uploads/${filename}`;
// }



const API_BASE = "https://hiremind-ai-xzup.onrender.com/api";

export function getToken() {
  return localStorage.getItem("hiremind_token");
}

export function setToken(token) {
  localStorage.setItem("hiremind_token", token);
}

export function clearAuth() {
  localStorage.removeItem("hiremind_token");
  localStorage.removeItem("hiremind_user");
}

export function getUser() {
  const raw = localStorage.getItem("hiremind_user");
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user) {
  localStorage.setItem(
    "hiremind_user",
    JSON.stringify(user)
  );
}

export async function apiRequest(
  path,
  {
    method = "GET",
    body = null,
    isForm = false,
  } = {}
) {
  /*
   * API_BASE already contains /api.
   *
   * Correct:
   * /assessments/1/sets/generate
   *
   * Also protects against:
   * /api/assessments/1/sets/generate
   */

  let cleanPath = String(path || "");

  if (!cleanPath.startsWith("/")) {
    cleanPath = `/${cleanPath}`;
  }

  /*
   * Prevent accidental /api/api/... URLs.
   */
  if (
    API_BASE.toLowerCase().endsWith("/api") &&
    cleanPath.toLowerCase().startsWith("/api/")
  ) {
    cleanPath = cleanPath.substring(4);
  }

  const url = `${API_BASE}${cleanPath}`;

  console.log("[API] Request:", {
    method,
    url,
  });

  const headers = {};

  const token = getToken();

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!isForm && body !== null) {
    headers["Content-Type"] = "application/json";
  }

  let res;

  try {
    res = await fetch(url, {
      method,
      headers,
      body: isForm
        ? body
        : body !== null
        ? JSON.stringify(body)
        : undefined,
    });
  } catch (networkError) {
    console.error(
      "[API] Network/Fetch error:",
      networkError
    );

    throw new Error(
      `Failed to connect to backend at ${url}. ` +
        `Make sure the HireMind AI backend is running on Render.`
    );
  }

  const contentType =
    res.headers.get("content-type") || "";

  let responseData = null;

  if (res.status !== 204) {
    try {
      if (
        contentType
          .toLowerCase()
          .includes("application/json")
      ) {
        responseData = await res.json();
      } else {
        const text = await res.text();
        responseData = text || null;
      }
    } catch (parseError) {
      console.error(
        "[API] Response parsing error:",
        parseError
      );

      responseData = null;
    }
  }

  console.log("[API] Response:", {
    status: res.status,
    ok: res.ok,
    url,
    data: responseData,
  });

  if (!res.ok) {
    let detail = "Request failed";

    if (
      responseData &&
      typeof responseData === "object"
    ) {
      if (
        typeof responseData.detail === "string"
      ) {
        detail = responseData.detail;
      } else if (
        responseData.detail &&
        typeof responseData.detail === "object"
      ) {
        detail =
          responseData.detail.message ||
          JSON.stringify(responseData.detail);
      } else if (
        typeof responseData.message === "string"
      ) {
        detail = responseData.message;
      }
    } else if (
      typeof responseData === "string" &&
      responseData.trim()
    ) {
      detail = responseData;
    }

    const error = new Error(detail);

    /*
     * Keep backend information available
     * to components that need it.
     */
    error.status = res.status;
    error.response = responseData;
    error.url = url;

    throw error;
  }

  if (res.status === 204) {
    return null;
  }

  return responseData;
}

export function homeRouteForRole(role) {
  if (role === "recruiter") {
    return "/recruiter";
  }

  if (role === "admin") {
    return "/admin";
  }

  return "/candidate";
}

/*
 * Builds a viewable URL for files saved
 * under the backend's /uploads static mount.
 *
 * API:
 * https://hiremind-ai-xzup.onrender.com/api
 *
 * Uploads:
 * https://hiremind-ai-xzup.onrender.com/uploads/filename
 */

export function fileUrl(filename) {
  if (!filename) {
    return "";
  }

  const base = API_BASE.replace(/\/api\/?$/, "");

  return `${base}/uploads/${filename}`;
}