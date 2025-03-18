export const log = (...args: string[]): void => {
  console.log(`[LOG] ${new Date().toISOString()}: ${args.join(" ")}`);
};
