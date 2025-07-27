import React, { useState } from 'react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const FirestoreTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const addResult = (result: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `${timestamp}: ${result}`]);
  };

  const runTests = async () => {
    if (!user) {
      addResult('❌ No user authenticated');
      return;
    }

    setIsLoading(true);
    setTestResults([]);
    addResult('Starting Firestore connection test...');

    try {
      addResult(`✅ User authenticated: ${user.email}`);
      addResult(`✅ User UID: ${user.uid}`);

      addResult('Testing write operation...');
      const docRef = await addDoc(collection(db, 'test'), {
        userId: user.uid,
        message: 'Test message',
        timestamp: new Date()
      });
      addResult(`✅ Write successful! Document ID: ${docRef.id}`);

      addResult('Testing read operation...');
      const q = query(collection(db, 'test'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      addResult(`✅ Read successful! Found ${querySnapshot.size} documents`);

      addResult('Testing playlists collection...');
      const playlistsQuery = query(collection(db, 'playlists'), where('userId', '==', user.uid));
      const playlistsSnapshot = await getDocs(playlistsQuery);
      addResult(`✅ Playlists collection accessible! Found ${playlistsSnapshot.size} playlists`);

      addResult('Testing recentlyPlayed collection...');
      const recentQuery = query(collection(db, 'recentlyPlayed'), where('userId', '==', user.uid));
      const recentSnapshot = await getDocs(recentQuery);
      addResult(`✅ Recently played collection accessible! Found ${recentSnapshot.size} tracks`);

      addResult('🎉 All Firestore tests passed!');
    } catch (error: any) {
      addResult(`❌ Firestore test failed: ${error.message}`);
      addResult(`Error details: ${error.message}`);
      addResult(`Error stack: ${error}`);
      if (error.code) {
        addResult(`Firebase error code: ${error.code}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Firestore Connection Test</h2>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={runTests}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Running Tests...' : 'Run Firestore Test'}
          </button>
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Clear Results
          </button>
        </div>

        <div className="bg-gray-100 rounded p-4 max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          {testResults.length === 0 ? (
            <p className="text-gray-500">No test results yet. Click "Run Firestore Test" to start.</p>
          ) : (
            <div className="space-y-1">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirestoreTest; 