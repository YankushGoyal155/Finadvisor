import urllib.request
import json

GPT55_ENDPOINT = 'https://yanku-mptr6fe7-eastus2.cognitiveservices.azure.com/openai/responses?api-version=2025-04-01-preview'
GPT55_API_KEY = ''

payload = {
    'model': 'gpt-5.5',
    'input': 'Hello',
}

headers = {
    'Content-Type': 'application/json',
    'api-key': GPT55_API_KEY,
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(GPT55_ENDPOINT, data=data, headers=headers, method='POST')

try:
    with urllib.request.urlopen(req, timeout=60) as resp:
        print('SUCCESS:', resp.read().decode('utf-8'))
except Exception as e:
    if hasattr(e, 'read'):
        print('ERROR:', e.read().decode('utf-8'))
    else:
        print('ERROR:', e)
