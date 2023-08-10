export default async function () {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log('[TASK] bye');
      resolve();
    }, 100);
  });
}
