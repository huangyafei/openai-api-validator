import React, { useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';

function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateApi = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const responses = await Promise.all(Array(3).fill().map(sendApiRequest));

      const fingerprintResults = responses.map(r => 'system_fingerprint' in r.data);
      const allHaveFingerprint = fingerprintResults.every(Boolean);
      const noneHaveFingerprint = fingerprintResults.every(result => !result);

      if (allHaveFingerprint) {
        setResult({ isValid: true, reason: '官方 API' });
      } else if (noneHaveFingerprint) {
        setResult({ isValid: false, reason: '逆向 API' });
      } else {
        setResult({ isValid: false, reason: '掺假 API' });
      }
    } catch (error) {
      setResult({ isValid: false, reason: '请求失败: ' + error.message });
    }

    setLoading(false);
  };

  const sendApiRequest = () => {
    return axios.post(
      `${apiBaseUrl}/v1/chat/completions`,
      {
        messages: [{ role: 'user', content: '写一个10个字的笑话' }],
        seed: 1,
        model: 'gpt-4o-mini'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <Helmet>
        <title>OpenAI API 验证器</title>
        <meta name="description" content="验证 OpenAI API 的真实性" />
      </Helmet>
      <div className="max-w-xl w-full mx-auto">
        <div className="bg-white shadow-lg rounded-lg px-8 pt-8 pb-10 mb-4 min-h-[400px] flex flex-col">
          <div className="flex-grow">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">API 验证器</h1>
            <div className="space-y-6">
              <div>
                <label htmlFor="api-base-url" className="block text-sm font-medium text-gray-700 mb-1">
                  API Base URL
                </label>
                <input
                  id="api-base-url"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://api.openai.com"
                  value={apiBaseUrl}
                  onChange={(e) => setApiBaseUrl(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  id="api-key"
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Your API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <button
                className="w-full bg-indigo-600 text-white px-4 py-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                onClick={validateApi}
                disabled={loading}
              >
                {loading ? '验证中...' : '验证 API'}
              </button>
            </div>
          </div>
          {result && (
            <div className={`mt-8 p-4 rounded-md ${result.isValid ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className="text-lg font-semibold">{result.isValid ? '有效的 API' : '无效的 API'}</p>
              <p className="mt-1">{result.reason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
