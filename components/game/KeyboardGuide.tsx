'use client';

interface KeyboardGuideProps {
  highlightKey?: string;
}

export function KeyboardGuide({ highlightKey }: KeyboardGuideProps) {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ];

  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-kids shadow-lg">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-2">
          {row.map((key) => (
            <div
              key={key}
              className={`
                w-12 h-12 flex items-center justify-center font-bold rounded-lg
                transition-all duration-200
                ${
                  highlightKey?.toUpperCase() === key
                    ? 'bg-kids-yellow text-white scale-110 shadow-lg'
                    : 'bg-gray-100 text-gray-700'
                }
              `}
            >
              {key}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
