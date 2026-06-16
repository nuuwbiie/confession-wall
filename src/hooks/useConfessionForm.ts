"use client";

import { useReducer, useEffect, useCallback } from "react";
import {
  type ConfessionFont,
  DRAFT_STORAGE_KEY,
  CONFESSION_MIN_CHARS,
  CONFESSION_MAX_CHARS,
} from "@/lib/constants";

export type FormStatus = "idle" | "submitting" | "success" | "error";

interface FormState {
  content: string;
  font: ConfessionFont;
  isPublic: boolean;
  allowReplies: boolean;
  isAnonymous: boolean;
  status: FormStatus;
  errorMessage: string;
  showPreview: boolean;
}

type FormAction =
  | { type: "SET_CONTENT"; payload: string }
  | { type: "SET_FONT"; payload: ConfessionFont }
  | { type: "SET_IS_PUBLIC"; payload: boolean }
  | { type: "SET_ALLOW_REPLIES"; payload: boolean }
  | { type: "SET_IS_ANONYMOUS"; payload: boolean }
  | { type: "SET_STATUS"; payload: FormStatus }
  | { type: "SET_ERROR"; payload: string }
  | { type: "TOGGLE_PREVIEW" }
  | { type: "LOAD_DRAFT"; payload: Partial<FormState> }
  | { type: "RESET" };

const initialState: FormState = {
  content: "",
  font: "sans",
  isPublic: true,
  allowReplies: true,
  isAnonymous: true,
  status: "idle",
  errorMessage: "",
  showPreview: false,
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_CONTENT":
      return { ...state, content: action.payload, status: "idle" };
    case "SET_FONT":
      return { ...state, font: action.payload };
    case "SET_IS_PUBLIC":
      return { ...state, isPublic: action.payload };
    case "SET_ALLOW_REPLIES":
      return { ...state, allowReplies: action.payload };
    case "SET_IS_ANONYMOUS":
      return { ...state, isAnonymous: action.payload };
    case "SET_STATUS":
      return { ...state, status: action.payload, errorMessage: "" };
    case "SET_ERROR":
      return { ...state, status: "error", errorMessage: action.payload };
    case "TOGGLE_PREVIEW":
      return { ...state, showPreview: !state.showPreview };
    case "LOAD_DRAFT":
      return { ...state, ...action.payload };
    case "RESET":
      return { ...initialState };
    default:
      return state;
  }
}

export function useConfessionForm() {
  const [state, dispatch] = useReducer(formReducer, initialState);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: "LOAD_DRAFT", payload: parsed });
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Auto-save draft to localStorage on content change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            content: state.content,
            font: state.font,
            isPublic: state.isPublic,
            allowReplies: state.allowReplies,
          })
        );
      } catch {
        // Ignore storage errors
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [state.content, state.font, state.isPublic, state.allowReplies]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore
    }
    dispatch({ type: "RESET" });
  }, []);

  // Validation
  const validationError = (() => {
    if (state.content.trim().length > 0 && state.content.trim().length < CONFESSION_MIN_CHARS) {
      return `Minimal ${CONFESSION_MIN_CHARS} karakter (${state.content.trim().length}/${CONFESSION_MIN_CHARS})`;
    }
    if (state.content.length > CONFESSION_MAX_CHARS) {
      return `Maksimal ${CONFESSION_MAX_CHARS} karakter (${state.content.length}/${CONFESSION_MAX_CHARS})`;
    }
    return null;
  })();

  const isSubmitDisabled =
    state.status === "submitting" ||
    state.content.trim().length < CONFESSION_MIN_CHARS ||
    state.content.length > CONFESSION_MAX_CHARS;

  const charProgress = Math.min(
    (state.content.length / CONFESSION_MAX_CHARS) * 100,
    100
  );
  const charWarning = state.content.length > CONFESSION_MAX_CHARS * 0.85;
  const charDanger = state.content.length > CONFESSION_MAX_CHARS;

  return {
    state,
    dispatch,
    validationError,
    isSubmitDisabled,
    charProgress,
    charWarning,
    charDanger,
    clearDraft,
    hasDraft: state.content.length > 0,
  };
}