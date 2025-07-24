import React from 'react';

const Profile: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="mb-6 mt-0">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Profile
          </h1>
        </div>
        <p className="text-gray-400 mt-2 ml-5">Kelola data dan keamanan akun Anda.</p>
      </div>
      <hr className="border-gray-700 mb-8" />
      <div className="flex flex-col items-center mb-8">
        <img
          src="https://randomuser.me/api/portraits/men/1.jpg"
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border-4 border-gray-700 shadow-lg mb-4"
        />
      </div>
      <form className="space-y-6">
        <div>
          <label className="block text-white mb-1 font-semibold">Name</label>
          <input
            type="text"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none"
            value=""
            readOnly
          />
        </div>
        <div>
          <label className="block text-white mb-1 font-semibold">Email</label>
          <input
            type="email"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none"
            value=""
            readOnly
          />
        </div>
        <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-semibold">Update Profile</button>
      </form>
      <hr className="my-8 border-gray-700" />
      <form className="space-y-6">
        <div>
          <label className="block text-white mb-1 font-semibold">Current Password</label>
          <input
            type="password"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-white mb-1 font-semibold">New Password</label>
          <input
            type="password"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-white mb-1 font-semibold">Confirm New Password</label>
          <input
            type="password"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none"
          />
        </div>
        <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-semibold">Update Password</button>
      </form>
      <button type="button" className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded font-semibold mt-6">Delete Account</button>
    </div>
  );
};

export default Profile;
