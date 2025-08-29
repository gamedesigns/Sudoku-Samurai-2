
import { Theme } from './types';

export const lightTheme: Theme = {
  bg: 'bg-amber-50',
  text: 'text-gray-800',
  cardBg: 'bg-white',
  cellBg: 'bg-white',
  cellEmpty: 'bg-amber-100',
  cellSelected: 'bg-red-400',
  cellHighlight: 'bg-red-100',
  border: 'border-amber-300',
  borderThick: 'border-amber-600',
  button: 'bg-amber-200 hover:bg-amber-300',
  numberButton: 'bg-red-500 hover:bg-red-600',
  modal: 'bg-white border-amber-300',
  originalText: 'text-gray-900',
  userText: 'text-blue-600',
  toggleBg: 'bg-gray-300',
  toggleBgActive: 'bg-red-500'
};

export const darkTheme: Theme = {
  bg: 'bg-gray-900',
  text: 'text-white',
  cardBg: 'bg-gray-800',
  cellBg: 'bg-gray-700',
  cellEmpty: 'bg-gray-600',
  cellSelected: 'bg-blue-600',
  cellHighlight: 'bg-blue-900',
  border: 'border-gray-500',
  borderThick: 'border-gray-300',
  button: 'bg-gray-700 hover:bg-gray-600',
  numberButton: 'bg-blue-600 hover:bg-blue-700',
  modal: 'bg-gray-800 border-gray-600',
  originalText: 'text-white',
  userText: 'text-cyan-400',
  toggleBg: 'bg-gray-500',
  toggleBgActive: 'bg-blue-500'
};
