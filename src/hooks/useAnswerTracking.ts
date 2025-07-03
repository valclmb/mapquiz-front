import { useState } from "react";

export function useAnswerTracking() {
  const [lastAnswerTime, setLastAnswerTime] = useState<number | null>(null);
  const [, setConsecutiveCorrect] = useState<number>(0);

  const trackCorrectAnswer = () => {
    const currentTime = Date.now();
    const answerTime = lastAnswerTime ? currentTime - lastAnswerTime : null;
    setLastAnswerTime(currentTime);
    setConsecutiveCorrect((prev) => prev + 1);

    return {
      answerTime: answerTime || 5000, // Valeur par défaut si c'est la première réponse
      isConsecutiveCorrect: true,
    };
  };

  const trackIncorrectAnswer = () => {
    setConsecutiveCorrect(0);
    setLastAnswerTime(Date.now());

    return {
      isConsecutiveCorrect: false,
    };
  };

  return {
    trackCorrectAnswer,
    trackIncorrectAnswer,
  };
}
