// /* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
// /* eslint-disable no-restricted-globals */
// /* eslint-disable @typescript-eslint/no-misused-promises */
// import { getUserBalanceBySecret, getUserReceiptsBySecret } from 'opact-sdk'

// self.addEventListener("message", async (event: any) => {
//   try {
//     const { secret } = event.data.input as any;

//     const receipts = await getUserReceiptsBySecret(secret)
//     const treeBalances = await getUserBalanceBySecret(secret)

//     self.postMessage(
//       {
//         type: "done",
//         payload: {
//           receipts,
//           treeBalances
//         }
//       } as any
//     );
//   } catch (e) {
//     console.warn('[Retry] Compute data error: ', e)

//     self.postMessage(
//       {
//         type: "error",
//         payload: {
//           e
//         }
//       } as any
//     );
//   }
// });

// export {};
