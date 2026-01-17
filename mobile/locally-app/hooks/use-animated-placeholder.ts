import { useEffect, useState } from 'react';

const defaultWords = ['neighbors', 'skills', 'items'];

export const useAnimatedPlaceholder = (
  words: string[] = defaultWords,
  prefix = 'Search for '
) => {
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('');

  useEffect(() => {
    let isMounted = true;

    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const animate = async () => {
      while (isMounted) {
        let currentText = '';
        for (let i = 0; i <= prefix.length; i++) {
          if (!isMounted) return;
          currentText = prefix.slice(0, i);
          setAnimatedPlaceholder(currentText);
          await sleep(60);
        }

        for (let index = 0; index < words.length; index++) {
          const word = words[index];

          for (let i = 1; i <= word.length; i++) {
            if (!isMounted) return;
            setAnimatedPlaceholder(prefix + word.slice(0, i));
            await sleep(60);
          }

          await sleep(1500);

          if (index < words.length - 1) {
            for (let i = word.length - 1; i >= 0; i--) {
              if (!isMounted) return;
              setAnimatedPlaceholder(prefix + word.slice(0, i));
              await sleep(30);
            }
            await sleep(150);
          }
        }

        const fullText = prefix + words[words.length - 1];
        for (let i = fullText.length - 1; i >= 0; i--) {
          if (!isMounted) return;
          setAnimatedPlaceholder(fullText.slice(0, i));
          await sleep(30);
        }

        await sleep(400);
      }
    };

    void animate();

    return () => {
      isMounted = false;
    };
  }, [prefix, words]);

  return animatedPlaceholder;
};
