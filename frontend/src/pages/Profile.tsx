import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../components/utility';
import { useAuth } from '../contexts/AuthContext';
import { formatDateTime } from '../utils/formatUtils';

/**
 * Profile interface for type safety
 */
interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  joinDate: string; // ISO date string
  bio: string;
  location: string;
  twitterHandle: string;
  linkedinProfile: string;
  experience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

/**
 * Profile page component - Displays user information and profile settings
 */
const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // In a real app, you would fetch this from an API
        // For now, we'll simulate an API call with a timeout
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock profile data
        const mockProfileData: UserProfile = {
          id: 'elf782',
          username: user?.username || 'trader123',
          email: user?.email || 'trader@example.com',
          fullName: 'Alex Johnson',
          avatarUrl: 'https://i.pravatar.cc/300',
          joinDate: '2023-03-15T10:30:00Z',
          bio: 'Passionate trader with 5+ years of experience in stock markets. Focused on tech and renewable energy sectors.',
          location: 'San Francisco, CA',
          twitterHandle: '@trader123',
          linkedinProfile: 'linkedin.com/in/alexjohnson',
          experience: 'advanced',
        };

        setProfile(mockProfileData);
        setFormData(mockProfileData);
      } catch (err) {
        setError('Failed to load profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // In a real app, you would send this to an API
      // For now, we'll simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 800));

      // Update local state
      setProfile(prev => (prev ? { ...prev, ...formData } : null));
      setIsEditing(false);

      // Show success notification (in a real app)
      console.log('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading && !profile) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Error state
  if (error && !profile) {
    return (
      <div className="space-y-6">
        <div className="p-4 mt-4 text-red-700 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900 dark:text-red-200 dark:border-red-800">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">User Profile</h1>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        {profile && !isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Information */}
            <div className="col-span-1 flex flex-col items-center space-y-4">
              <div className="relative">
                <img
                  src={profile.avatarUrl || 'https://i.pravatar.cc/300'}
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover border-4 border-blue-500"
                />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {profile.fullName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{profile.username}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Member since {formatDateTime(profile.joinDate).split(',')[0]}
              </p>
            </div>

            {/* Profile Details */}
            <div className="col-span-2 space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                  About Me
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {profile.bio || 'No bio available'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Email
                  </h3>
                  <p className="text-gray-800 dark:text-gray-200">{profile.email}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Location
                  </h3>
                  <p className="text-gray-800 dark:text-gray-200">
                    {profile.location || 'Not specified'}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Experience Level
                  </h3>
                  <p className="text-gray-800 dark:text-gray-200 capitalize">
                    {profile.experience || 'Not specified'}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Social Links
                  </h3>
                  <div className="flex space-x-3">
                    {profile.twitterHandle && (
                      <a
                        href={`https://twitter.com/${profile.twitterHandle.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Twitter
                      </a>
                    )}
                    {profile.linkedinProfile && (
                      <a
                        href={`https://www.${profile.linkedinProfile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile editing form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="experience"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Trading Experience
                  </label>
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Biography
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={formData.bio || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  ></textarea>
                </div>

                <div>
                  <label
                    htmlFor="twitterHandle"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Twitter Handle
                  </label>
                  <input
                    type="text"
                    id="twitterHandle"
                    name="twitterHandle"
                    value={formData.twitterHandle || ''}
                    onChange={handleInputChange}
                    placeholder="@username"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="linkedinProfile"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    LinkedIn Profile
                  </label>
                  <input
                    type="text"
                    id="linkedinProfile"
                    name="linkedinProfile"
                    value={formData.linkedinProfile || ''}
                    onChange={handleInputChange}
                    placeholder="linkedin.com/in/username"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="avatarUrl"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Profile Picture URL
                  </label>
                  <input
                    type="text"
                    id="avatarUrl"
                    name="avatarUrl"
                    value={formData.avatarUrl || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData(profile || {});
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                disabled={loading}
              >
                {loading && (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
