import React, { useState } from 'react';
import { 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView
} from 'react-native';
import { Lock, Eye, EyeOff, ChevronLeft, CheckCircle2, Circle } from 'lucide-react-native';

export default function ResetPasswordMobile() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains a special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 40, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          
          {/* Top Logo & Header */}
          <View className="items-center mb-10">
            <View className="mb-10">
               <Text className="text-2xl font-bold text-[#0F172A]">
                 Concour<Text className="text-[#3014B8]">Doctora</Text>
               </Text>
            </View>
            
            <Text className="text-2xl font-extrabold text-[#1E293B] text-center mb-2">
              Set a New Password
            </Text>
            <Text className="text-sm text-slate-500 text-center px-5 leading-5">
              Please choose a password you haven't used before.
            </Text>
          </View>

          {/* Form Fields */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-slate-600 mb-2 mt-4 uppercase tracking-wider">
              New Password
            </Text>
            <View className="flex-row items-center bg-slate-100 rounded-xl px-4 h-14">
              <Lock size={20} color="#94A3B8" className="mr-3" />
              <TextInput
                className="flex-1 text-base text-[#1E293B]"
                placeholder="Enter new password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={20} color="#94A3B8" /> : <Eye size={20} color="#94A3B8" />}
              </TouchableOpacity>
            </View>

            <Text className="text-sm font-semibold text-slate-600 mb-2 mt-4 uppercase tracking-wider">
              Confirm Password
            </Text>
            <View className="flex-row items-center bg-slate-100 rounded-xl px-4 h-14">
              <Lock size={20} color="#94A3B8" className="mr-3" />
              <TextInput
                className="flex-1 text-base text-[#1E293B]"
                placeholder="Confirm password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPass}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            {/* Validation Checklist */}
            <View className="bg-slate-50 rounded-2xl p-5 mt-8 border border-slate-100">
              {requirements.map((req, index) => (
                <View key={index} className="flex-row items-center mb-3 last:mb-0">
                  {req.met ? (
                    <CheckCircle2 size={18} color="#3014B8" />
                  ) : (
                    <Circle size={18} color="#CBD5E1" />
                  )}
                  <Text className={`ml-3 text-sm ${req.met ? 'text-[#1E293B] font-medium' : 'text-slate-400'}`}>
                    {req.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="mt-5">
            <TouchableOpacity 
              activeOpacity={0.8}
              className="bg-[#3014B8] h-14 rounded-2xl justify-center items-center shadow-md shadow-[#3014B8]/40"
            >
              <Text className="text-white text-base font-bold">Reset Password</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-center mt-8 py-2">
              <ChevronLeft size={18} color="#3014B8" />
              <Text className="text-[#3014B8] text-base font-bold ml-1">
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-center text-[#94A3B8] text-[10px] mt-12 tracking-widest uppercase">
            © 2026 ESI-SBA. ALL RIGHTS RESERVED.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}