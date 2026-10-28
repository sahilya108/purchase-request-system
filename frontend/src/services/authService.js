
const API_BASE_URL = "http://localhost:8080/api";

export async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const text = await response.text();

  if (!response.ok) {
    let message = "Login failed. Please try again.";

    try {
      const errorData = JSON.parse(text);
      message = errorData.error || errorData.message || message;
    } catch {
      if (text.trim()) message = text;
    }

    throw new Error(message);
  }

  // Support a raw JWT token or a JSON response.
  let data = text.trim();

  try {
    data = JSON.parse(data);
  } catch {
    // The backend returned plain text, such as a raw JWT.
  }

  if (typeof data === "string" && data.length > 0) {
    return data;
  }

  if (data && typeof data === "object") {
    const token = data.token || data.jwt || data.accessToken;

    if (typeof token === "string" && token.length > 0) {
      return token;
    }
  }

  throw new Error("No valid JWT token was returned by the server.");
}



export async function getMyRequests(employeeId) {
    const token = localStorage.getItem("token");
  
    const response = await fetch(
      `${API_BASE_URL}/requests/employee/${employeeId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(data.error || "Failed to load purchase requests");
    }
  
    return data;
  }
  