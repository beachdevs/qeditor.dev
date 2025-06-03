const APIDEF = {
    'kvpost': 'POST\nhttps://digplan-kv.deno.dev/?type=$type&key=$key\nContent-Type:application/json\n$obj',
    'kvget': "GET\nhttps://digplan-kv.deno.dev/?type=$type&key=$key\nContent-Type:application/json",
    'kvdel': "DELETE\nhttps://digplan-kv.deno.dev/?type=$type&key=$key\nContent-Type:application/json",
    'kvall': "GET\nhttps://digplan-kv.deno.dev/?type=$type&key=*\nContent-Type:application/json",
    'chatgpt': 'POST\nhttps://api.openai.com/v1/chat/completions\nContent-Type:application/json,Authorization:Bearer $API_KEY_CHATGPT\n{"model":"$model","messages":["$messages"]}',
    'huggingface': 'POST\nhttps://router.huggingface.co/fireworks-ai/inference/v1/chat/completions\nContent-Type:application/json,Authorization:Bearer $API_KEY_HF\n{"messages":[{"role":"user","content":"$prompt"}],"model":"accounts/fireworks/models/qwen3-235b-a22b","stream":false}',
    'gemini': 'POST\nhttps://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$API_KEY_GEMINI\nContent-Type:application/json\n{"contents": [{ "parts": [{ "text": "$prompt" }] }]}',
    'geminilistmodels': 'GET\nhttps://generativelanguage.googleapis.com/v1beta/models\nContent-Type:application/json,x-goog-api-key:$API_KEY_GEMINI',
    'emailbrevo': 'POST\nhttps://api.brevo.com/v3/smtp/email\nContent-Type:application/json,api-key:$BREVO\n{"sender":{"email":"$from"},"to":[{"email":"$to"}],"subject":"$subject","htmlContent":"$htmlContent"}'
}

export default APIDEF;
