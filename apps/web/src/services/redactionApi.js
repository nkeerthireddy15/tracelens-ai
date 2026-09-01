const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000/api/v1'

export async function previewRedaction(log) {
  let response

  try {
    response = await fetch(
      `${API_BASE_URL}/redactions/preview`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ log })
      }
    )
  } catch {
    throw new Error(
      'Unable to connect to the TraceLens API. Check that the backend is running.'
    )
  }

  let responseBody

  try {
    responseBody = await response.json()
  } catch {
    throw new Error('The API returned an invalid response.')
  }

  if (!response.ok) {
    const validationMessage =
      responseBody.errors?.[0]?.message

    throw new Error(
      validationMessage ||
        responseBody.message ||
        'Redaction preview failed.'
    )
  }

  return responseBody.data
}