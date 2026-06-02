// app/(client)/create-project/components/StepIndicator.tsx
/**
 * @fileoverview Visual step indicator showing progress through wizard
 * Displays 5 steps with icons, active/inactive states, and completion status
 */

import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

interface Step {
  number: number;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepPress?: (step: number) => void;
}

export default function StepIndicator({ steps, currentStep, onStepPress }: StepIndicatorProps) {
  return (
    <View
      style={{
        backgroundColor: COLORS.SURFACE,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.BORDER_LIGHT,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 8,
        }}
      >
        {steps.map((step, index) => {
          const isActive = currentStep === index;
          const isCompleted = currentStep > index;
          
          return (
            <Pressable
              key={step.number}
              onPress={() => onStepPress?.(index)}
              disabled={!isCompleted && !isActive}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 24,
                backgroundColor: isActive 
                  ? COLORS.PRIMARY_LIGHT 
                  : isCompleted 
                    ? `${COLORS.SUCCESS}15` 
                    : COLORS.MUTED,
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: isActive 
                    ? COLORS.PRIMARY 
                    : isCompleted 
                      ? COLORS.SUCCESS 
                      : COLORS.TEXT_LIGHT,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={16} color="#FFF" />
                ) : (
                  <Text style={{ color: '#FFF', fontSize: 14, fontWeight: 'bold' }}>
                    {step.number}
                  </Text>
                )}
              </View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: isActive ? 'bold' : '500',
                  color: isActive 
                    ? COLORS.PRIMARY 
                    : isCompleted 
                      ? COLORS.SUCCESS 
                      : COLORS.TEXT_SECONDARY,
                }}
              >
                {step.title}
              </Text>
              {index < steps.length - 1 && (
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={COLORS.TEXT_LIGHT}
                  style={{ marginLeft: 4 }}
                />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}