"use client";

import { GameContext } from "@/context/GameContext";
import { useContext, useEffect, useRef } from "react";

export const Score = () => {
  const gameContext = useContext(GameContext);

  if (!gameContext) throw new Error("Game context not defined");
  const { score, activeCountries, incorrectCountries, validatedCountries } =
    gameContext;
  const scoreRef = useRef<HTMLDivElement>(null);

  // Calculer le nombre de questions répondues (correctes + incorrectes)
  const answeredQuestions =
    validatedCountries.length + incorrectCountries.length;

  useEffect(() => {
    if (scoreRef.current) {
      scoreRef.current.classList.remove("hidden");

      setTimeout(() => {
        if (scoreRef.current) {
          scoreRef.current.classList.add("hidden");
        }
      }, 1000);
    }
  }, [score]);

  return (
    <div className="w-max bg-secondary border border-secondary py-2 px-4 backdrop-blur-md  rounded-lg text-lg ">
      <div className="flex items-center gap-2">
        <span>
          {answeredQuestions}/{activeCountries.length}
        </span>
        {incorrectCountries.length > 0 && (
          <span className="text-red-500">❌{incorrectCountries.length}</span>
        )}
        {validatedCountries.length > 0 && (
          <span className="text-green-500">✅{validatedCountries.length}</span>
        )}
      </div>
      <div
        ref={scoreRef}
        className="hidden animate-ping absolute content-[''] bg-gradient-to-r from-violet-100 to-fuchsia-100 inset-0 w-50 h-50 rounded-full transition-all"
      ></div>
    </div>
  );
};
