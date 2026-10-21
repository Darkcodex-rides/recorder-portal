
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
  });

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Automatically notify AuthContext when JWT is invalid/expired
  if (response.status === 401) {
    window.dispatchEvent(new Event("auth:expired"));
  }

  return response;
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

export async function renameRecording(id, name) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/recordings/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to rename recording");
  }

  return response.json();
}


export async function getTrashedRecordings() {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/recordings/trash`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch trashed recordings");
  }

  return response.json();
}

export async function restoreRecording(id) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/recordings/${id}/restore`,
    {
      method: "PATCH",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to restore recording");
  }

  return response.json();
}


export async function convertRecording(id, format) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/recordings/${id}/convert`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ format }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to convert recording"
    );
  }

  return result;
}


export async function trimRecording(id, startTime, endTime) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/recordings/${id}/trim`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startTime: Number(startTime),
        endTime: Number(endTime),
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to trim recording"
    );
  }

  return result;
}



export async function transcribeRecording(id) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/recordings/${id}/transcribe`,
    {
      method: "POST",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to transcribe recording"
    );
  }

  return result;
}

export async function getRecordingTranscript(id) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/recordings/${id}/transcript`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to fetch transcript"
    );
  }

  return result;
}

export async function getRecordingSummary(id) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/recordings/${id}/summary`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to load saved summary"
    );
  }

  return result;
}

export async function summarizeRecording(id) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/recordings/${id}/summarize`,
    {
      method: "POST",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to generate AI summary"
    );
  }

  return result;
}


export async function getMeetingInsights(id) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/recordings/${id}/insights`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to load saved meeting insights"
    );
  }

  return result;
}

export async function generateMeetingInsights(id) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/recordings/${id}/insights/generate`,
    {
      method: "POST",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to generate meeting insights"
    );
  }

  return result;
}



export async function analyzeRecordingAudio(id) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/recordings/${id}/analyze-audio`,
    {
      method: "POST",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to analyze recording audio"
    );
  }

  return result;
}

export async function getRecordingAudioAnalysis(id) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/recordings/${id}/audio-analysis`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to load audio analysis"
    );
  }

  return result;
}
