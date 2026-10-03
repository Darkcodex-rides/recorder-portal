const API_BASE_URL = "http://localhost:5000/api";

async function authenticatedFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  console.log("Authenticated request:", {
    url,
    hasToken: !!token,
    headers,
  });

  return fetch(url, {
    ...options,
    headers,
  });
}

export async function uploadRecording(blob, name, duration) {
  const formData = new FormData();

  formData.append("audio", blob, `${name}.webm`);
  formData.append("name", name);
  formData.append("duration", duration);

  const response = await authenticatedFetch(
    `${API_BASE_URL}/recordings/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to upload recording");
  }

  return response.json();
}

export async function getRecordings() {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/recordings`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch recordings");
  }

  return response.json();
}

export async function deleteRecording(id) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/recordings/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete recording");
  }

  return response.json();
}