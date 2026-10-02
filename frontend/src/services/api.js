const API_BASE_URL = "http://localhost:5000/api";

export async function uploadRecording(
  blob,
  name,
  duration
) {
  const formData = new FormData();

  formData.append("audio", blob, `${name}.webm`);
  formData.append("name", name);
  formData.append("duration", duration);

  const response = await fetch(
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
  const response = await fetch(
    "http://localhost:5000/api/recordings"
  );

  if (!response.ok) {
    throw new Error("Failed to fetch recordings");
  }

  return response.json();
}

export async function deleteRecording(id) {
  const response = await fetch(
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