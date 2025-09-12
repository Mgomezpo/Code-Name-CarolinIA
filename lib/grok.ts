export async function grokGenerate(planId: string) {
  const apiUrl = process.env.GROK_API_URL
  const apiKey = process.env.GROK_API_KEY

  if (apiUrl && apiKey) {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ planId }),
    })
    if (!res.ok) {
      throw new Error("Failed to call Grok")
    }
    return res.json()
  }

  return Array.from({ length: 7 }).map((_, i) => ({
    day: i + 1,
    action: `Acción ${i + 1} para plan ${planId}`,
  }))
}
