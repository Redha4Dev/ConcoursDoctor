import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useAuth } from "../../../providers/AuthProvider"; 

const Welcome = () => {
  const { user, logout } = useAuth();

  return (
    <View className="flex-1 bg-[#F5F6FA] items-center justify-center px-6">
      
      {/* Card */}
      <View className="w-full bg-white rounded-2xl p-6 shadow-md items-center">
        
        {/* Title */}
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Welcome 👋
        </Text>

        {/* User Info */}
        <Text className="text-gray-600 text-sm mb-1">
          {user?.firstName} {user?.lastName}
        </Text>
        <Text className="text-gray-500 text-xs mb-4">
          {user?.email}
        </Text>

        {/* Role Badge */}
        <View className="bg-indigo-100 px-3 py-1 rounded-full mb-6">
          <Text className="text-indigo-700 text-xs font-semibold">
            {user?.role}
          </Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={logout}
          className="w-full bg-red-500 py-3 rounded-lg items-center active:opacity-80"
        >
          <Text className="text-white font-semibold text-base">
            Log Out
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
};

export default Welcome;
