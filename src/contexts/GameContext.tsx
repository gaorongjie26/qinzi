'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import {
  GameState,
  GameSettings,
  ChatMessage,
  ChildCharacter,
  Scenario,
} from '@/lib/game-types';

// 初始状态
const initialState: GameState = {
  phase: 'setup',
  settings: {
    selectedCharacter: null,
    scenario: null,
    customScenario: '',
  },
  messages: [],
  currentRound: 0,
  maxRounds: 10,
  score: 20,
  initialScore: 20,
  winScore: 80,
  loseScore: -50,
  isLoading: false,
  lastScoreChange: 0,
};

// Action类型
type GameAction =
  | { type: 'SET_CHARACTER'; payload: ChildCharacter }
  | { type: 'SET_SCENARIO'; payload: Scenario | null }
  | { type: 'SET_CUSTOM_SCENARIO'; payload: string }
  | { type: 'START_GAME' }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SELECT_OPTION'; payload: { messageId: string; optionId: string; scoreChange: number } }
  | { type: 'INCREMENT_ROUND' }
  | { type: 'UPDATE_SCORE'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_GAME_PHASE'; payload: GameState['phase'] }
  | { type: 'SET_LAST_SCORE_CHANGE'; payload: number }
  | { type: 'RESET_GAME' };

// Reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_CHARACTER':
      return {
        ...state,
        settings: { ...state.settings, selectedCharacter: action.payload },
      };
    case 'SET_SCENARIO':
      return {
        ...state,
        settings: { ...state.settings, scenario: action.payload },
      };
    case 'SET_CUSTOM_SCENARIO':
      return {
        ...state,
        settings: { ...state.settings, customScenario: action.payload },
      };
    case 'START_GAME':
      return {
        ...state,
        phase: 'playing',
        currentRound: 1,
        messages: [],
        score: state.initialScore,
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case 'SELECT_OPTION':
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.messageId
            ? { ...msg, selectedOptionId: action.payload.optionId }
            : msg
        ),
        score: state.score + action.payload.scoreChange,
        lastScoreChange: action.payload.scoreChange,
        currentRound: state.currentRound + 1,
      };
    case 'INCREMENT_ROUND':
      return {
        ...state,
        currentRound: state.currentRound + 1,
      };
    case 'UPDATE_SCORE':
      return {
        ...state,
        score: Math.max(state.loseScore, Math.min(100, action.payload)),
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_GAME_PHASE':
      return {
        ...state,
        phase: action.payload,
      };
    case 'SET_LAST_SCORE_CHANGE':
      return {
        ...state,
        lastScoreChange: action.payload,
      };
    case 'RESET_GAME':
      return {
        ...initialState,
        settings: state.settings,
      };
    default:
      return state;
  }
}

// Context
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  setCharacter: (character: ChildCharacter) => void;
  setScenario: (scenario: Scenario | null) => void;
  setCustomScenario: (scenario: string) => void;
  startGame: () => void;
  addMessage: (message: ChatMessage) => void;
  selectOption: (messageId: string, optionId: string, scoreChange: number) => void;
  setLoading: (loading: boolean) => void;
  setGamePhase: (phase: GameState['phase']) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider组件
export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const setCharacter = useCallback((character: ChildCharacter) => {
    dispatch({ type: 'SET_CHARACTER', payload: character });
  }, []);

  const setScenario = useCallback((scenario: Scenario | null) => {
    dispatch({ type: 'SET_SCENARIO', payload: scenario });
  }, []);

  const setCustomScenario = useCallback((scenario: string) => {
    dispatch({ type: 'SET_CUSTOM_SCENARIO', payload: scenario });
  }, []);

  const startGame = useCallback(() => {
    dispatch({ type: 'START_GAME' });
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  }, []);

  const selectOption = useCallback((messageId: string, optionId: string, scoreChange: number) => {
    dispatch({ type: 'SELECT_OPTION', payload: { messageId, optionId, scoreChange } });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setGamePhase = useCallback((phase: GameState['phase']) => {
    dispatch({ type: 'SET_GAME_PHASE', payload: phase });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        setCharacter,
        setScenario,
        setCustomScenario,
        startGame,
        addMessage,
        selectOption,
        setLoading,
        setGamePhase,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

// Hook
export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
