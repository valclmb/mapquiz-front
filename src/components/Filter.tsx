"use client";

import { Toggle } from "./ui/toggle";

const continents = [
  "Afrique",
  "Amérique du Nord",
  "Amérique du Sud",
  "Asie",
  "Europe",
  "Océanie",
];

type FilterProps = {
  filter: string[];
  setFilter: any;
};

export const Filter = ({ setFilter }: FilterProps) => {
  const handleChange = (continent: string) => {
    setFilter((curr: string[]) => {
      if (curr.includes(continent)) {
        return curr.filter((c) => c !== continent);
      }
      return [...curr, continent];
    });
  };

  return (
    <nav className="flex gap-3 z-50 p-1 absolute right-1/2 top-3 translate-x-1/2  rounded-sm   ">
      {continents.map((continent) => (
        <div key={continent} className="flex items-center gap-1">
          <Toggle
            defaultPressed
            // value={continent}
            onPressedChange={() => handleChange(continent)}
          >
            {continent}
          </Toggle>
        </div>
      ))}
    </nav>
  );
};
