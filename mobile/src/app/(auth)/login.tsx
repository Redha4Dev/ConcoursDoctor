import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { useAuth } from '../../../providers/AuthProvider';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      // Success redirection is handled automatically by your RootLayoutNav logic
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Invalid credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F6FA]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerClassName="flex-grow px-6 justify-center py-6" 
          showsVerticalScrollIndicator={false}
        >
          
          {/* Header & Logo */}
          <View className="items-center mb-8 mt-4">
            <Image 
              source={require('@/assets/images/Logo.png')} 
              className="w-[240px] h-[60px] mb-2"
              resizeMode="contain"
            />
            <Text className="text-[#6B7280] text-[13px] font-medium">
              Administrator Secure Access Portal
            </Text>
          </View>

          {/* Form Container */}
          <View className="w-full">
            
            {/* Username/Email Input */}
            <Text className="text-[14px] font-semibold text-[#111827] mb-2">Username or Email</Text>
            <View className="flex-row items-center bg-white border border-[#E5E7EB] rounded-lg mb-4 h-[50px] px-3">
              <Ionicons name="person-outline" size={20} color="#6B7280" className="mr-2" />
              <TextInput
                className="flex-1 h-full text-[#111827] text-[15px]"
                placeholder="Enter your credentials"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                editable={!isSubmitting}
              />
            </View>

            {/* Password Input */}
            <Text className="text-[14px] font-semibold text-[#111827] mb-2">Password</Text>
            <View className="flex-row items-center bg-white border border-[#E5E7EB] rounded-lg mb-4 h-[50px] px-3">
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" className="mr-2" />
              <TextInput
                className="flex-1 h-full text-[#111827] text-[15px]"
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!passwordVisible}
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
                editable={!isSubmitting}
              />
              <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} className="p-1">
                <Ionicons 
                  name={passwordVisible ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
            </View>

            {/* Options Row */}
            <View className="flex-row justify-between items-center mb-6">
              <TouchableOpacity 
                className="flex-row items-center" 
                onPress={() => setRememberMe(!rememberMe)}
                disabled={isSubmitting}
                activeOpacity={0.7}
              >
                <Checkbox
                  className="w-[18px] h-[18px] rounded border-[#D1D5DB]"
                  value={rememberMe}
                  onValueChange={setRememberMe}
                  color={rememberMe ? '#3B1BBF' : undefined}
                />
                <Text className="ml-2 text-[14px] text-[#6B7280]">Remember me</Text>
              </TouchableOpacity>
              
              <TouchableOpacity disabled={isSubmitting}>
                <Text className="text-[#3B1BBF] text-[14px] font-semibold">Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity 
              className={`rounded-lg h-[50px] justify-center items-center mb-8 ${isSubmitting ? 'bg-indigo-400' : 'bg-[#3B1BBF]'}`}
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-[16px] font-semibold">Log In</Text>
              )}
            </TouchableOpacity>
            
          </View>

          {/* Footer */}
          <View className="items-center mt-auto">
            <View className="flex-row items-center mb-4">
              <Ionicons name="shield-checkmark-outline" size={14} color="#6B7280" />
              <Text className="text-[#6B7280] text-[12px] font-semibold tracking-wider ml-1.5">
                ENCRYPTED SESSION
              </Text>
            </View>
            <Text className="text-[#9CA3AF] text-[12px] mb-2">© 2026 Esi-SBA. All rights reserved.</Text>
            <View className="flex-row items-center">
              <TouchableOpacity><Text className="text-[#9CA3AF] text-[12px]">Privacy Policy</Text></TouchableOpacity>
              <Text className="text-[#9CA3AF] text-[12px] mx-1.5">|</Text>
              <TouchableOpacity><Text className="text-[#9CA3AF] text-[12px]">Terms of Service</Text></TouchableOpacity>
              <Text className="text-[#9CA3AF] text-[12px] mx-1.5">|</Text>
              <TouchableOpacity><Text className="text-[#9CA3AF] text-[12px]">Support</Text></TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}