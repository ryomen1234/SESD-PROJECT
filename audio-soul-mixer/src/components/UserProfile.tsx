import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Calendar, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FirestoreTest from './FirestoreTest';

const UserProfile: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Not Signed In</CardTitle>
            <CardDescription>Please sign in to view your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>User Profile</span>
            </CardTitle>
            <CardDescription>Your account information and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture and Basic Info */}
            <div className="flex items-center space-x-4">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
              )}
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  {user?.displayName || 'User'}
                </h3>
                <p className="text-gray-600 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {user?.email}
                </p>
                {user?.metadata?.creationTime && (
                  <p className="text-gray-500 flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Member since {new Date(user.metadata.creationTime).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Debug Information */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Debug Information</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>UID:</strong> {user?.uid}</p>
                <p><strong>Photo URL:</strong> {user?.photoURL || 'None'}</p>
                <p><strong>Email Verified:</strong> {user?.emailVerified ? 'Yes' : 'No'}</p>
                <p><strong>Provider:</strong> {user?.providerData[0]?.providerId || 'Unknown'}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <Button onClick={handleLogout} variant="outline" className="flex-1">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
              <Button onClick={() => navigate('/')} className="flex-1">
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Firestore Test Card */}
        <FirestoreTest />
      </div>
    </div>
  );
};

export default UserProfile; 