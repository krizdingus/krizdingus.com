/**
 * Shows a progress bar using ASCII characters
 * @param progressSpan - Where to show the progress
 * @param duration - How long the animation should take
 * @param onComplete - Optional callback when animation finishes
 */
export function animateAsciiProgress(
  progressSpan: HTMLElement,
  duration: number,
  onComplete?: () => void
) {
  // Randomize steps between 4 and 25
  const steps = Math.floor(Math.random() * (25 - 4 + 1)) + 4;
  const chars = { filled: '▓', empty: '▒' };
  let current = 0;
  const interval = duration / steps;

  function update() {
    current++;
    const filled = chars.filled.repeat(current);
    const empty = chars.empty.repeat(steps - current);
    // Calculate percent, round to nearest 5%
    const percent = Math.round((current / steps) * 100 / 5) * 5;
    progressSpan.textContent = `[${filled}${empty}] ${percent}%`;
    if (current < steps) {
      setTimeout(update, interval);
    } else {
      onComplete?.();
    }
  }
  // Start with empty bar and 0%
  progressSpan.textContent = `[${chars.empty.repeat(steps)}] 0%`;
  setTimeout(update, interval);
}

/**
 * Types text out character by character
 * @param element - Where to type the text
 * @param text - What to type
 * @param onComplete - Optional callback when typing is done
 */
export function animateTyping(
  element: HTMLElement,
  text: string,
  onComplete?: () => void
) {
  let currentIndex = 0;
  const typingSpeed = 50 + Math.random() * 30; // 50-80ms per character

  function typeNextChar() {
    if (currentIndex < text.length) {
      element.textContent = text.slice(0, currentIndex + 1);
      currentIndex++;
      setTimeout(typeNextChar, typingSpeed);
    } else if (onComplete) {
      onComplete();
    }
  }

  typeNextChar();
}

/**
 * Shows loading dots animation
 * @param element - Where to show the dots
 * @param baseText - The text before the dots
 * @param duration - How long to animate
 * @param onComplete - Optional callback when animation finishes
 */
export function animateDots(
  element: HTMLElement,
  baseText: string,
  duration: number,
  onComplete?: () => void
) {
  const maxDots = 5;
  let currentDots = 0;
  const interval = duration / (maxDots + 1);

  function updateDots() {
    if (currentDots < maxDots) {
      currentDots++;
      element.textContent = baseText + '.'.repeat(currentDots);
      setTimeout(updateDots, interval);
    } else if (onComplete) {
      onComplete();
    }
  }

  element.textContent = baseText;
  setTimeout(updateDots, interval);
}
