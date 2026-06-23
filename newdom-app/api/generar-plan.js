// Esta función vive en el SERVIDOR de Vercel, nunca en el navegador del usuario.
// La API Key se lee de una variable de entorno configurada en el panel de Vercel,
// por lo que nunca aparece en el código que el público puede ver.

export default async function handler(req, res) {
  // Solo aceptar peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'La API Key no está configurada en el servidor. Ve a Vercel → Settings → Environment Variables y agrega ANTHROPIC_API_KEY.'
    });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Falta el prompt en la petición.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'Error al contactar la API de Anthropic.'
      });
    }

    // Devolvemos solo el texto generado al navegador del cliente
    return res.status(200).json({ content: data.content });

  } catch (err) {
    return res.status(500).json({ error: 'Error de conexión con la API: ' + err.message });
  }
}
