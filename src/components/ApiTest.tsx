'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ApiTest() {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testHelloEndpoint = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/framino/hello');
      const text = await res.text();
      setResponse(text);
    } catch {
      setResponse('Error: Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-gray-300 shadow-sm bg-white dark:bg-gray-900 max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">Test API Connection</CardTitle>
        <CardDescription>
          Try our simple API endpoint to verify everything is working
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testHelloEndpoint} 
          disabled={loading}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white"
        >
          {loading ? 'Testing...' : 'Test /api/framino/hello'}
        </Button>
        {response && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
            <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
              {response}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
