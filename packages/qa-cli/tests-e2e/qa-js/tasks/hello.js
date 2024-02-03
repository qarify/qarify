export default async function () {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('[TASK] hello');
      resolve();
    }, 100);
  });
}
