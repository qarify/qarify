export default async function () {
  return new Promise<void>((resolve) => {
      setTimeout(() => {
          console.log('[TASK] hello');
          resolve();
      }, 1000);
  });
}
