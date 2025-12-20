export type ThemeName = 'warm' | 'cool' | 'neutral'

export interface ThemeColors {
  background: string
  foreground: string
  primary: string
  'primary-foreground': string
  secondary: string
  'secondary-foreground': string
  muted: string
  'muted-foreground': string
  destructive: string
  'destructive-foreground': string
  accent: string
  'accent-foreground': string
  border: string
  input: string
  ring: string
  card: string
  'card-foreground': string
}

export interface Theme {
  name: ThemeName
  label: string
  description: string
  light: ThemeColors
  dark: ThemeColors
}

export const themes: Record<ThemeName, Theme> = {
  warm: {
    name: 'warm',
    label: 'Linear Warm',
    description: 'Warm, approachable, and friendly',
    light: {
      background: '45 10% 97%',
      foreground: '30 10% 20%',
      primary: '180 65% 50%',
      'primary-foreground': '0 0% 98%',
      secondary: '30 8% 90%',
      'secondary-foreground': '30 10% 25%',
      muted: '30 8% 92%',
      'muted-foreground': '30 8% 45%',
      destructive: '0 72% 51%',
      'destructive-foreground': '0 0% 98%',
      accent: '40 12% 93%',
      'accent-foreground': '30 10% 25%',
      border: '30 8% 88%',
      input: '30 8% 88%',
      ring: '180 65% 50%',
      card: '0 0% 100%',
      'card-foreground': '30 10% 20%',
    },
    dark: {
      background: '30 15% 12%',
      foreground: '40 10% 92%',
      primary: '180 65% 55%',
      'primary-foreground': '30 15% 12%',
      secondary: '30 10% 20%',
      'secondary-foreground': '40 10% 92%',
      muted: '30 10% 20%',
      'muted-foreground': '35 8% 60%',
      destructive: '0 72% 55%',
      'destructive-foreground': '40 10% 92%',
      accent: '30 12% 22%',
      'accent-foreground': '40 10% 92%',
      border: '30 10% 22%',
      input: '30 10% 22%',
      ring: '180 65% 55%',
      card: '30 15% 12%',
      'card-foreground': '40 10% 92%',
    },
  },
  cool: {
    name: 'cool',
    label: 'Modern Blue',
    description: 'Cool, tech-forward, and modern',
    light: {
      background: '220 15% 98%',
      foreground: '220 20% 12%',
      primary: '217 91% 60%',
      'primary-foreground': '0 0% 98%',
      secondary: '220 13% 91%',
      'secondary-foreground': '220 20% 25%',
      muted: '220 13% 91%',
      'muted-foreground': '220 10% 46%',
      destructive: '0 72% 51%',
      'destructive-foreground': '0 0% 98%',
      accent: '220 13% 94%',
      'accent-foreground': '220 20% 25%',
      border: '220 13% 91%',
      input: '220 13% 91%',
      ring: '217 91% 60%',
      card: '0 0% 100%',
      'card-foreground': '220 20% 12%',
    },
    dark: {
      background: '222 47% 11%',
      foreground: '213 31% 91%',
      primary: '217 91% 60%',
      'primary-foreground': '222 47% 11%',
      secondary: '217 33% 17.5%',
      'secondary-foreground': '213 31% 91%',
      muted: '217 33% 17.5%',
      'muted-foreground': '215 20% 65%',
      destructive: '0 72% 55%',
      'destructive-foreground': '213 31% 91%',
      accent: '217 33% 17.5%',
      'accent-foreground': '213 31% 91%',
      border: '217 33% 17.5%',
      input: '217 33% 17.5%',
      ring: '217 91% 60%',
      card: '222 47% 11%',
      'card-foreground': '213 31% 91%',
    },
  },
  neutral: {
    name: 'neutral',
    label: 'Professional Gray',
    description: 'Neutral, serious, and enterprise-ready',
    light: {
      background: '0 0% 98%',
      foreground: '220 13% 18%',
      primary: '231 48% 48%',
      'primary-foreground': '0 0% 98%',
      secondary: '220 13% 88%',
      'secondary-foreground': '220 13% 25%',
      muted: '220 13% 91%',
      'muted-foreground': '220 9% 46%',
      destructive: '0 72% 51%',
      'destructive-foreground': '0 0% 98%',
      accent: '220 13% 93%',
      'accent-foreground': '220 13% 25%',
      border: '220 13% 88%',
      input: '220 13% 88%',
      ring: '231 48% 48%',
      card: '0 0% 100%',
      'card-foreground': '220 13% 18%',
    },
    dark: {
      background: '222 47% 11%',
      foreground: '213 31% 91%',
      primary: '231 48% 55%',
      'primary-foreground': '222 47% 11%',
      secondary: '217 33% 17.5%',
      'secondary-foreground': '213 31% 91%',
      muted: '217 33% 17.5%',
      'muted-foreground': '215 20% 65%',
      destructive: '0 72% 55%',
      'destructive-foreground': '213 31% 91%',
      accent: '217 33% 17.5%',
      'accent-foreground': '213 31% 91%',
      border: '217 33% 17.5%',
      input: '217 33% 17.5%',
      ring: '231 48% 55%',
      card: '222 47% 11%',
      'card-foreground': '213 31% 91%',
    },
  },
}

export const defaultTheme: ThemeName = 'warm'

