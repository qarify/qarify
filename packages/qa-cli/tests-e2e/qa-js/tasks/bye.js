export default async function () {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('[TASK] bye');
      resolve();
    }, 100);
  });
}
